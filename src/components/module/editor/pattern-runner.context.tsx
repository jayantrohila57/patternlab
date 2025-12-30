import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as ts from "typescript";

import type { PatternData } from "@/components/formula/constants";
import { generatePattern } from "@/components/formula/formula";
import { showToast } from "@/lib/toast-utils";

export type ValidationSummary = {
  isValid: boolean;
  hasWarnings: boolean;
  errors: string[];
  warnings: string[];
  compilationErrors: string[];
};

export type PatternComparisonStatus =
  | "idle"
  | "running"
  | "pass"
  | "fail"
  | "error";

export type PatternRunnerError = {
  name: string;
  message: string;
  stack?: string;
};

export type CompiledResult = {
  runId: string;
  logs: string[];
  success: boolean;
  output: string;
  error?: PatternRunnerError;
  validation?: ValidationSummary;
  executionTime?: number;
};

export type SolutionVersion = {
  id: string;
  name: string;
  createdAt: string;
  userCode: string;
  runInput: string;
};

export type DiffLine = {
  index: number;
  expected: string;
  actual: string;
  equal: boolean;
};

export type ComparisonResult = {
  status: PatternComparisonStatus;
  passed: boolean | null;
  diff: DiffLine[];
  error?: PatternRunnerError;
  validation?: ValidationSummary;
  performanceMetrics?: {
    compilationTime: number;
    executionTime: number;
    memoryUsage?: number;
  };
};

export type PatternRunnerState = {
  currentPattern: PatternData | null;
  userCode: string;
  runInput: string;
  versions: SolutionVersion[];
  activeVersionId: string | null;
  compiledResult: CompiledResult | null;
  expectedOutput: string | null;
  comparison: ComparisonResult;
  lastValidation?: ValidationSummary;
  isCompiling: boolean;
};

export type PatternRunnerActions = {
  selectPattern: (pattern: PatternData) => void;
  updateUserCode: (code: string) => void;
  updateRunInput: (input: string) => void;
  saveVersion: (name?: string) => void;
  loadVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;
  compile: () => Promise<CompiledResult>;
  generateExpected: () => string;
  compare: () => Promise<ComparisonResult>;
  reset: () => void;
  validateCode: (code: string) => ValidationSummary;
  getValidationSummary: () => ValidationSummary | null;
};

const initialComparison: ComparisonResult = {
  status: "idle",
  passed: null,
  diff: [],
};

const initialState: PatternRunnerState = {
  currentPattern: null,
  userCode: "",
  runInput: "",
  versions: [],
  activeVersionId: null,
  compiledResult: null,
  expectedOutput: null,
  comparison: initialComparison,
  lastValidation: undefined,
  isCompiling: false,
};

const storageKeyForPattern = (patternId: string) =>
  `patternlab:solutionVersions:${patternId}`;

const safeParseVersions = (raw: string | null): SolutionVersion[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is SolutionVersion => {
      if (!v || typeof v !== "object") return false;
      const obj = v as Record<string, unknown>;
      return (
        typeof obj.id === "string" &&
        typeof obj.name === "string" &&
        typeof obj.createdAt === "string" &&
        typeof obj.userCode === "string" &&
        typeof obj.runInput === "string"
      );
    });
  } catch {
    return [];
  }
};

export const PatternStateContext = createContext<PatternRunnerState | null>(
  null
);

export const PatternActionsContext = createContext<PatternRunnerActions | null>(
  null
);

// type WorkerRequestPayload = {
//   code: string;
//   runId: string;
//   input: unknown;
// };

type WorkerResponsePayload = {
  runId: string;
  logs: string[];
  success: boolean;
  output: string;
  error?: PatternRunnerError;
};

type PatternRunnerProviderProps = {
  children: ReactNode;
  defaultUserCode?: string;
};

const normalizeOutput = (value: string): string => {
  return value.replace(/\r\n/g, "\n").trimEnd();
};

const buildLineDiff = (expected: string, actual: string): DiffLine[] => {
  const e = normalizeOutput(expected).split("\n");
  const a = normalizeOutput(actual).split("\n");
  const max = Math.max(e.length, a.length);

  const diff: DiffLine[] = [];
  for (let i = 0; i < max; i++) {
    const expectedLine = e[i] ?? "";
    const actualLine = a[i] ?? "";
    diff.push({
      index: i,
      expected: expectedLine,
      actual: actualLine,
      equal: expectedLine === actualLine,
    });
  }
  return diff;
};

export function PatternRunnerProvider({
  children,
  defaultUserCode = "",
}: PatternRunnerProviderProps) {
  const [state, setState] = useState<PatternRunnerState>(() => ({
    ...initialState,
    userCode: defaultUserCode,
  }));

  const workerRef = useRef<Worker | null>(null);
  const activeRunIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const selectPattern = useCallback((pattern: PatternData) => {
    try {
      console.log("🎯 Selecting pattern:", pattern.name);

      const template = `export type SolveInput = { rows: number; symbol: string };

export function solve(input: SolveInput): string {
  const { rows, symbol } = input;
  const lines: string[] = [];
  // TODO: build the pattern and return the final output as a single string\n\n
  return lines.join("\\n");
}
`;

      const officialInput = {
        rows: pattern.config.defaultRows,
        symbol: pattern.config.symbol,
      };

      const savedVersions = safeParseVersions(
        typeof window !== "undefined"
          ? window.localStorage.getItem(storageKeyForPattern(pattern.id))
          : null
      );

      setState((prev) => ({
        ...prev,
        currentPattern: pattern,
        expectedOutput: null,
        compiledResult: null,
        comparison: initialComparison,
        userCode: prev.userCode.trim().length > 0 ? prev.userCode : template,
        runInput: JSON.stringify(officialInput, null, 2),
        versions: savedVersions,
        activeVersionId: null,
      }));

      showToast.success(`Pattern "${pattern.name}" selected`);
    } catch (error) {
      console.error("❌ Failed to select pattern", error);
      showToast.error("Failed to select pattern", error);
    }
  }, []);

  const updateUserCode = useCallback((code: string) => {
    try {
      setState((prev) => ({
        ...prev,
        userCode: code,
      }));
      console.log("📝 User code updated");
    } catch (error) {
      console.error("❌ Failed to update user code", error);
      showToast.error("Failed to update code", error);
    }
  }, []);

  const updateRunInput = useCallback((input: string) => {
    try {
      setState((prev) => ({
        ...prev,
        runInput: input,
      }));
      console.log("📝 Run input updated");
    } catch (error) {
      console.error("❌ Failed to update run input", error);
      showToast.error("Failed to update input", error);
    }
  }, []);

  const saveVersion = useCallback(
    (name?: string) => {
      try {
        const pattern = state.currentPattern;
        if (!pattern) {
          showToast.warning("No pattern selected to save version");
          return;
        }

        console.log("💾 Saving version:", name || "Untitled");

        const versionName = name?.trim().length ? name.trim() : "Untitled";
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const version: SolutionVersion = {
          id,
          name: versionName,
          createdAt: new Date().toISOString(),
          userCode: state.userCode,
          runInput: state.runInput,
        };

        setState((prev) => {
          const next = [version, ...prev.versions];
          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem(
                storageKeyForPattern(pattern.id),
                JSON.stringify(next)
              );
            } catch (storageError) {
              console.error("❌ Failed to save to localStorage", storageError);
              showToast.error(
                "Failed to save version to storage",
                storageError
              );
              return prev;
            }
          }
          return {
            ...prev,
            versions: next,
            activeVersionId: version.id,
          };
        });

        showToast.success(`Version "${versionName}" saved`);
      } catch (error) {
        console.error("❌ Failed to save version", error);
        showToast.error("Failed to save version", error);
      }
    },
    [state.currentPattern, state.runInput, state.userCode]
  );

  const loadVersion = useCallback((versionId: string) => {
    try {
      console.log("📂 Loading version:", versionId);

      setState((prev) => {
        const found = prev.versions.find((v) => v.id === versionId);
        if (!found) {
          showToast.warning("Version not found");
          return prev;
        }

        console.log("✅ Version loaded:", found.name);
        showToast.success(`Version "${found.name}" loaded`);

        return {
          ...prev,
          userCode: found.userCode,
          runInput: found.runInput,
          activeVersionId: found.id,
          compiledResult: null,
          comparison: initialComparison,
        };
      });
    } catch (error) {
      console.error("❌ Failed to load version", error);
      showToast.error("Failed to load version", error);
    }
  }, []);

  const deleteVersion = useCallback((versionId: string) => {
    try {
      console.log("🗑️ Deleting version:", versionId);

      setState((prev) => {
        const pattern = prev.currentPattern;
        const versionToDelete = prev.versions.find((v) => v.id === versionId);
        const next = prev.versions.filter((v) => v.id !== versionId);

        if (pattern && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              storageKeyForPattern(pattern.id),
              JSON.stringify(next)
            );
          } catch (storageError) {
            console.error("❌ Failed to update localStorage", storageError);
            showToast.error(
              "Failed to delete version from storage",
              storageError
            );
            return prev;
          }
        }

        const activeVersionId =
          prev.activeVersionId === versionId ? null : prev.activeVersionId;

        if (versionToDelete) {
          console.log("✅ Version deleted:", versionToDelete.name);
          showToast.success(`Version "${versionToDelete.name}" deleted`);
        }

        return {
          ...prev,
          versions: next,
          activeVersionId,
        };
      });
    } catch (error) {
      console.error("❌ Failed to delete version", error);
      showToast.error("Failed to delete version", error);
    }
  }, []);

  const getOfficialInput = useCallback((): { rows: number; symbol: string } => {
    const pattern = state.currentPattern;
    return {
      rows: pattern?.config.defaultRows ?? 0,
      symbol: pattern?.config.symbol ?? "",
    };
  }, [state.currentPattern]);

  const validateCode = useCallback((code: string): ValidationSummary => {
    try {
      console.log("🔍 Validating code");

      const errors: string[] = [];
      const warnings: string[] = [];
      const compilationErrors: string[] = [];

      // Basic syntax checks
      if (code.trim().length === 0) {
        errors.push("Code cannot be empty");
        return {
          isValid: false,
          hasWarnings: false,
          errors,
          warnings,
          compilationErrors,
        };
      }

      // Check for required function
      if (
        !code.includes("function solve") &&
        !code.includes("export function solve")
      ) {
        errors.push(
          "Missing required function: solve(input: SolveInput): string"
        );
      }

      // Check for proper return type
      if (!code.includes("return") && !code.includes("=>")) {
        warnings.push("No return statement found in solve function");
      }

      // Check for input parameter usage
      if (
        !code.includes("input.") &&
        !code.includes("const {") &&
        !code.includes("const input")
      ) {
        warnings.push("Input parameter may not be properly destructured");
      }

      // TypeScript compilation check
      try {
        const result = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            strict: true,
            noLib: true,
            skipLibCheck: true,
          },
        });

        if (result.diagnostics && result.diagnostics.length > 0) {
          result.diagnostics.forEach((diagnostic: ts.Diagnostic) => {
            if (diagnostic.category === ts.DiagnosticCategory.Error) {
              compilationErrors.push(`TypeScript: ${diagnostic.messageText}`);
              errors.push(`TypeScript Error: ${diagnostic.messageText}`);
            } else {
              warnings.push(`TypeScript Warning: ${diagnostic.messageText}`);
            }
          });
        }
      } catch (tsError) {
        compilationErrors.push(
          `TypeScript compilation failed: ${
            tsError instanceof Error ? tsError.message : String(tsError)
          }`
        );
      }

      const isValid = errors.length === 0 && compilationErrors.length === 0;
      const hasWarnings = warnings.length > 0;

      const summary: ValidationSummary = {
        isValid,
        hasWarnings,
        errors,
        warnings,
        compilationErrors,
      };

      setState((prev) => ({ ...prev, lastValidation: summary }));
      console.log("✅ Code validation completed", { isValid, hasWarnings });

      return summary;
    } catch (error) {
      console.error("❌ Code validation failed", error);
      const summary: ValidationSummary = {
        isValid: false,
        hasWarnings: false,
        errors: [
          `Validation error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
        warnings: [],
        compilationErrors: [],
      };
      setState((prev) => ({ ...prev, lastValidation: summary }));
      return summary;
    }
  }, []);

  const getValidationSummary = useCallback((): ValidationSummary | null => {
    return state.lastValidation || null;
  }, [state.lastValidation]);

  const parseRunInput = useCallback((): unknown => {
    try {
      const raw = state.runInput.trim();
      if (raw.length === 0) return getOfficialInput();
      const parsed = JSON.parse(raw) as unknown;
      console.log("📊 Run input parsed successfully");
      return parsed;
    } catch (error) {
      console.error("❌ Failed to parse run input", error);
      showToast.error("Invalid JSON in run input", error);
      return getOfficialInput();
    }
  }, [getOfficialInput, state.runInput]);

  const execute = useCallback(
    async (input: unknown): Promise<CompiledResult> => {
      try {
        console.log("🚀 Starting pattern execution");

        // 1. Set status to "running" to trigger UI loading states
        setState((prev) => ({
          ...prev,
          comparison: {
            status: "running",
            passed: null,
            diff: [],
          },
        }));

        const codeText = state.userCode;
        const runId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        activeRunIdRef.current = runId;
        showToast.loading("Compiling pattern...", { id: `compile-${runId}` });

        cleanup();

        const compiled: CompiledResult = await new Promise((resolve) => {
          try {
            const worker = new Worker(
              new URL("../../../worker/solution.worker.ts", import.meta.url),
              { type: "module" }
            );

            workerRef.current = worker;

            timeoutRef.current = window.setTimeout(() => {
              if (activeRunIdRef.current !== runId) return;

              console.error("⏰ Pattern execution timed out");
              showToast.error("Pattern execution timed out", null, {
                id: `compile-${runId}`,
              });

              resolve({
                runId,
                logs: ["[error] Execution timed out"],
                success: false,
                output: "",
                error: { name: "TimeoutError", message: "Execution timed out" },
              });
              cleanup();
            }, 3000);

            const handleMessage = (e: MessageEvent<WorkerResponsePayload>) => {
              if (e.data.runId !== runId) return;

              if (e.data.success) {
                showToast.success("Pattern compiled successfully", {
                  id: `compile-${runId}`,
                });
              } else {
                showToast.error(
                  e.data.error?.message || "Compilation failed",
                  null,
                  { id: `compile-${runId}` }
                );
              }

              resolve({
                runId: e.data.runId,
                logs: e.data.logs,
                success: e.data.success,
                output: e.data.output,
                error: e.data.error,
              });
              cleanup();
            };

            const handleError = (error: ErrorEvent) => {
              if (activeRunIdRef.current !== runId) return;

              showToast.error(`Worker error: ${error.message}`, null, {
                id: `compile-${runId}`,
              });

              resolve({
                runId,
                logs: [`[Worker Error] ${error.message}`],
                success: false,
                output: "",
                error: { name: "WorkerError", message: error.message },
              });
              cleanup();
            };

            worker.addEventListener("message", handleMessage);
            worker.addEventListener("error", handleError);
            worker.postMessage({ code: codeText, runId, input });
          } catch (error) {
            console.error(error);
            resolve({
              runId,
              logs: ["Failed to initialize worker"],
              success: false,
              output: "",
            });
            cleanup();
          }
        });

        // 2. Update state with results AND reset status to stop loading
        setState((prev) => ({
          ...prev,
          compiledResult: compiled,
          comparison: {
            ...prev.comparison,
            status: compiled.success ? "idle" : "error", // RESET HERE
          },
        }));

        return compiled;
      } catch (error) {
        console.error("❌ Pattern execution failed", error);
        const fallbackResult = {
          runId: "error",
          logs: [
            `[error] ${error instanceof Error ? error.message : String(error)}`,
          ],
          success: false,
          output: "",
        };

        setState((prev) => ({
          ...prev,
          compiledResult: fallbackResult,
          comparison: { ...prev.comparison, status: "error" }, // RESET HERE
        }));

        return fallbackResult;
      }
    },
    [cleanup, state.userCode]
  );

  const generateExpected = useCallback((): string => {
    try {
      const pattern = state.currentPattern;

      if (!pattern) {
        console.warn("⚠️ No pattern selected for expected output generation");
        const expectedOutput = "";
        setState((prev) => ({
          ...prev,
          expectedOutput,
        }));
        return expectedOutput;
      }

      console.log("🎯 Generating expected output for pattern:", pattern.name);
      const expectedOutput = generatePattern(pattern).join("\n");
      setState((prev) => ({
        ...prev,
        expectedOutput,
      }));
      console.log("✅ Expected output generated successfully");
      return expectedOutput;
    } catch (error) {
      console.error("❌ Failed to generate expected output", error);
      showToast.error("Failed to generate expected output", error);
      const expectedOutput = "";
      setState((prev) => ({
        ...prev,
        expectedOutput,
      }));
      return expectedOutput;
    }
  }, [state.currentPattern]);

  const compile = useCallback(async (): Promise<CompiledResult> => {
    try {
      console.log("🔧 Starting pattern compilation");
      const input = parseRunInput();
      const result = await execute(input);
      console.log("✅ Pattern compilation completed");
      return result;
    } catch (err) {
      console.error("❌ Pattern compilation failed", err);
      showToast.error("Pattern compilation failed", err);

      const error = err instanceof Error ? err : new Error(String(err));
      const runId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const result: CompiledResult = {
        runId,
        logs: [`[error] ${error.message}`],
        success: false,
        output: "",
        error: {
          name: "InvalidRunInput",
          message: error.message,
        },
      };

      setState((prev) => ({
        ...prev,
        compiledResult: result,
        comparison: {
          status: "error",
          passed: false,
          diff: [],
          error: result.error,
        },
      }));

      return result;
    }
  }, [execute, parseRunInput]);

  const compare = useCallback(async (): Promise<ComparisonResult> => {
    try {
      console.log("🔍 Starting pattern comparison");

      setState((prev) => ({
        ...prev,
        comparison: {
          status: "running",
          passed: null,
          diff: [],
        },
      }));

      const expectedOutput = state.expectedOutput ?? generateExpected();
      const compiled = await execute(getOfficialInput());

      const actualOutput = compiled.output;

      const passed =
        compiled.success &&
        normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

      const diff = buildLineDiff(expectedOutput, actualOutput);

      const result: ComparisonResult = {
        status: passed ? "pass" : "fail",
        passed,
        diff,
      };

      setState((prev) => ({
        ...prev,
        expectedOutput,
        compiledResult: compiled,
        comparison: result,
      }));

      if (passed) {
        console.log("✅ Pattern comparison passed");
        showToast.success("Pattern test passed!");
      } else {
        console.log("❌ Pattern comparison failed");
        showToast.warning("Pattern test failed - check the diff");
      }

      return result;
    } catch (err) {
      console.error("❌ Pattern comparison failed", err);
      showToast.error("Pattern comparison failed", err);

      const error = err instanceof Error ? err : new Error(String(err));
      const result: ComparisonResult = {
        status: "error",
        passed: false,
        diff: [],
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      };

      setState((prev) => ({
        ...prev,
        comparison: result,
      }));

      return result;
    }
  }, [execute, generateExpected, getOfficialInput, state.expectedOutput]);

  const reset = useCallback(() => {
    try {
      console.log("🔄 Resetting pattern runner");
      cleanup();
      setState((prev) => ({
        ...initialState,
        userCode: prev.userCode,
        runInput: prev.runInput,
      }));
      showToast.info("Pattern runner reset");
    } catch (error) {
      console.error("❌ Failed to reset pattern runner", error);
      showToast.error("Failed to reset pattern runner", error);
    }
  }, [cleanup]);

  const actions = useMemo<PatternRunnerActions>(
    () => ({
      selectPattern,
      updateUserCode,
      updateRunInput,
      saveVersion,
      loadVersion,
      deleteVersion,
      compile,
      generateExpected,
      compare,
      reset,
      validateCode,
      getValidationSummary,
    }),
    [
      compile,
      compare,
      generateExpected,
      getValidationSummary,
      reset,
      selectPattern,
      validateCode,
      deleteVersion,
      loadVersion,
      updateRunInput,
      updateUserCode,
      saveVersion,
    ]
  );

  return (
    <PatternStateContext.Provider value={state}>
      <PatternActionsContext.Provider value={actions}>
        {children}
      </PatternActionsContext.Provider>
    </PatternStateContext.Provider>
  );
}

export function usePatternState(): PatternRunnerState {
  const ctx = useContext(PatternStateContext);
  if (!ctx) {
    throw new Error(
      "usePatternState must be used inside PatternRunnerProvider"
    );
  }
  return ctx;
}

export function usePatternActions(): PatternRunnerActions {
  const ctx = useContext(PatternActionsContext);
  if (!ctx) {
    throw new Error(
      "usePatternActions must be used inside PatternRunnerProvider"
    );
  }
  return ctx;
}

export async function runPatternWorkflow(
  actions: PatternRunnerActions,
  pattern: PatternData,
  userCode: string
): Promise<ComparisonResult> {
  actions.selectPattern(pattern);
  actions.updateUserCode(userCode);
  await actions.compile();
  return actions.compare();
}
