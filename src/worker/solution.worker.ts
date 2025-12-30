/// <reference lib="webworker" />

import * as ts from "typescript";

type WorkerRequestPayload = {
  code: string;
  runId: string;
  input: unknown;
};

type WorkerErrorPayload = {
  name: string;
  message: string;
  stack?: string;
};

type WorkerResponsePayload = {
  runId: string;
  logs: string[];
  success: boolean;
  output: string;
  error?: WorkerErrorPayload;
};

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let lastRunId: string | null = null;

const normalizeOutput = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return (value as string[]).join("\n");
  }
  if (typeof value === "undefined") return "";
  if (value === null) return "";
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

type Callable = (input: unknown) => unknown | Promise<unknown>;

const extractCallable = (candidate: unknown): Callable | null => {
  if (typeof candidate === "function") {
    return candidate as Callable;
  }

  if (candidate && typeof candidate === "object") {
    const obj = candidate as Record<string, unknown>;
    const preferredKeys = ["default", "solve", "run", "main"];

    for (const key of preferredKeys) {
      if (typeof obj[key] === "function") {
        return obj[key] as Callable;
      }
    }

    for (const value of Object.values(obj)) {
      if (typeof value === "function") {
        return value as Callable;
      }
    }
  }

  return null;
};

const validateTypeScriptCode = (code: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check for required function signature
    if (
      !code.includes("function solve") &&
      !code.includes("export function solve")
    ) {
      errors.push(
        "Missing required function: solve(input: SolveInput): string"
      );
    }

    // Check for proper export
    if (!code.includes("export") && !code.includes("module.exports")) {
      warnings.push("Consider using export for better module compatibility");
    }

    // Basic syntax checks
    if (code.split("{").length !== code.split("}").length) {
      errors.push("Unmatched braces in code");
    }

    if (code.split("(").length !== code.split(")").length) {
      errors.push("Unmatched parentheses in code");
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout/,
      /setInterval/,
      /XMLHttpRequest/,
      /fetch\s*\(/,
      /import\s+.*\s+from/,
      /require\s*\(/,
    ];

    dangerousPatterns.forEach((pattern) => {
      if (pattern.test(code)) {
        warnings.push(`Potentially unsafe pattern detected: ${pattern.source}`);
      }
    });

    // TypeScript compilation check
    const compileResult = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        noLib: true,
        skipLibCheck: true,
      },
    });

    if (compileResult.diagnostics && compileResult.diagnostics.length > 0) {
      compileResult.diagnostics.forEach((diagnostic) => {
        if (diagnostic.category === ts.DiagnosticCategory.Error) {
          errors.push(`TypeScript Error: ${diagnostic.messageText}`);
        } else {
          warnings.push(`TypeScript Warning: ${diagnostic.messageText}`);
        }
      });
    }
  } catch (error) {
    errors.push(
      `Validation error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

const handleMessage = async (e: MessageEvent<WorkerRequestPayload>) => {
  const logs: string[] = [];
  const runId = e.data.runId;
  lastRunId = runId;

  // First validate the code
  const validation = validateTypeScriptCode(e.data.code);

  if (!validation.valid) {
    logs.push("[validation] Code validation failed:");
    validation.errors.forEach((error) => logs.push(`[error] ${error}`));

    ctx.postMessage({
      runId,
      logs,
      success: false,
      output: "",
      error: {
        name: "ValidationError",
        message: "Code validation failed",
        stack: validation.errors.join("\n"),
      },
    } as WorkerResponsePayload);
    return;
  }

  if (validation.warnings.length > 0) {
    logs.push("[validation] Warnings detected:");
    validation.warnings.forEach((warning) => logs.push(`[warn] ${warning}`));
  }

  logs.push("[validation] Code validation passed");

  const formatArg = (arg: unknown) => {
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
    }

    if (typeof arg === "string") return arg;
    if (
      typeof arg === "number" ||
      typeof arg === "boolean" ||
      typeof arg === "bigint"
    ) {
      return String(arg);
    }
    if (typeof arg === "undefined") return "undefined";
    if (arg === null) return "null";

    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  };

  const push = (prefix: string | null, args: unknown[]) => {
    const message = args.map(formatArg).join(" ");
    logs.push(prefix ? `${prefix} ${message}` : message);
  };

  const fakeConsole = {
    log: (...args: unknown[]) => push(null, args),
    info: (...args: unknown[]) => push("[info]", args),
    warn: (...args: unknown[]) => push("[warn]", args),
    error: (...args: unknown[]) => push("[error]", args),
  };

  try {
    // Transpile TypeScript to JavaScript with CommonJS modules
    const result = ts.transpileModule(e.data.code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS, // Use CommonJS for better compatibility
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    });

    // Enhanced input validation
    const validateInput = (
      input: unknown
    ): { valid: boolean; error?: string } => {
      if (!input || typeof input !== "object") {
        return { valid: false, error: "Input must be an object" };
      }

      const obj = input as Record<string, unknown>;

      if (typeof obj.rows !== "number" || obj.rows <= 0 || obj.rows > 50) {
        return { valid: false, error: "Rows must be a positive number (1-50)" };
      }

      if (typeof obj.symbol !== "string") {
        return { valid: false, error: "Symbol must be a string" };
      }

      return { valid: true };
    };

    const inputValidation = validateInput(e.data.input);
    if (!inputValidation.valid) {
      logs.push(`[error] Input validation failed: ${inputValidation.error}`);
      ctx.postMessage({
        runId,
        logs,
        success: false,
        output: "",
        error: {
          name: "InputValidationError",
          message: inputValidation.error || "Invalid input",
        },
      } as WorkerResponsePayload);
      return;
    }

    // Create a function that will contain the user's code
    const userCode = new Function(
      "module",
      "exports",
      "require",
      "console",
      "input",
      `
      // Add the user's code
      ${result.outputText}
      
      // If the code didn't export anything, try to find a function to call
      if (module.exports && typeof module.exports === 'object' && Object.keys(module.exports).length === 0) {
        // Look for a function in the global scope
        const funcs = Object.getOwnPropertyNames(this)
          .filter(key => typeof this[key] === 'function' && key !== 'eval');
        
        if (funcs.length > 0) {
          // Use the first function found
          module.exports = this[funcs[0]];
        }
      }
      
      return module.exports;
      `
    );

    // Execute the user's code in a try-catch to handle any errors
    let solution;
    try {
      // Create a module-like environment
      const module = { exports: {} };
      const exports = module.exports;

      // Create a simple require function
      const require = (mod: string) => {
        throw new Error(`Require not supported in worker: ${mod}`);
      };

      // Execute the user's code
      solution = userCode(module, exports, require, fakeConsole, e.data.input);

      // Resolve a callable export and execute it with the provided input
      const callable =
        extractCallable(solution) ??
        extractCallable(module.exports) ??
        (module.exports !== exports
          ? extractCallable(exports)
          : extractCallable(exports));

      let result;
      if (callable) {
        result = await callable(e.data.input);
      } else if (solution !== undefined) {
        result = solution;
      } else if (module.exports && module.exports !== exports) {
        result = module.exports;
      } else if (Object.keys(exports).length > 0) {
        result = exports;
      } else {
        throw new Error("No valid function or export found to execute");
      }

      const outputString = normalizeOutput(result);
      if (outputString.length > 0) {
        outputString.split("\n").forEach((line) => logs.push(line));
      } else {
        logs.push("(no output)");
      }

      // Send success response
      ctx.postMessage({
        runId,
        logs,
        success: true,
        output: outputString,
      } as WorkerResponsePayload);
      return;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw error; // Re-throw to be caught by the outer catch
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    fakeConsole.error(error);
    ctx.postMessage({
      runId,
      logs,
      success: false,
      output: "",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    } as WorkerResponsePayload);
  }
};

ctx.addEventListener("message", handleMessage);

ctx.addEventListener("error", (event) => {
  ctx.postMessage({
    runId: lastRunId ?? "unknown",
    logs: [`[Worker Error] ${event.message}`],
    success: false,
    output: "",
    error: {
      name: "WorkerError",
      message: event.message,
      stack: event.filename
        ? `at ${event.filename}:${event.lineno}:${event.colno}`
        : "",
    },
  } satisfies WorkerResponsePayload);
});
