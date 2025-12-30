import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { showToast } from "@/lib/toast-utils";

type WorkerErrorPayload = {
  name: string;
  message: string;
  stack?: string;
};

type WorkerResponsePayload = {
  runId: string;
  logs: string[];
  success: boolean;
  error?: WorkerErrorPayload;
};

type CodeRunnerContextType = {
  code: string;
  setCode: (code: string) => void;
  output: string[];
  setOutput: (lines: string[]) => void;
  running: boolean;
  run: () => Promise<void>;
  clearOutput: () => void;
};

const CodeRunnerContext = createContext<CodeRunnerContextType | null>(null);

export function CodeRunnerProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string>("console.log('Hello World!');");
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const activeRunIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleSetCode = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const cleanupWorker = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const run = useCallback(async () => {
    clearOutput();
    setRunning(true);

    const runId =
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    activeRunIdRef.current = runId;

    showToast.loading("Running code...", { id: `run-${runId}` });

    // Clean up previous instances before starting
    cleanupWorker();

    try {
      const worker = new Worker(
        new URL("../../../worker/runner.worker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;

      // 1. Timeout Handler
      timeoutRef.current = window.setTimeout(() => {
        if (activeRunIdRef.current !== runId) return;

        setOutput((prev) => [...prev, "[error] Execution timed out (3s)"]);
        showToast.error("Code execution timed out", null, {
          id: `run-${runId}`,
        });

        cleanupWorker();
        setRunning(false);
      }, 3000);

      // 2. Success/Response Handler
      const handleMessage = (e: MessageEvent<WorkerResponsePayload>) => {
        // Only process if this is still the active run
        if (activeRunIdRef.current !== runId) return;

        try {
          if (e.data.success) {
            setOutput((prev) => [...prev, ...e.data.logs]);
            showToast.success("Code executed successfully", {
              id: `run-${runId}`,
            });
          } else {
            setOutput((prev) => [
              ...prev,
              ...e.data.logs,
              e.data.error ? `Error: ${e.data.error.message}` : "Unknown error",
            ]);
            showToast.error(e.data.error?.message || "Execution failed", null, {
              id: `run-${runId}`,
            });
          }
        } finally {
          cleanupWorker();
          setRunning(false);
        }
      };

      // 3. Error/Crash Handler
      const handleError = (error: ErrorEvent | MessageEvent) => {
        if (activeRunIdRef.current !== runId) return;

        const errorMsg =
          (error as ErrorEvent).message || "Worker Communication Error";
        setOutput((prev) => [...prev, `[Worker Error] ${errorMsg}`]);
        showToast.error(errorMsg, null, { id: `run-${runId}` });

        cleanupWorker();
        setRunning(false);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.addEventListener("messageerror", handleError);

      worker.postMessage({ code, runId });
    } catch (error) {
      console.error("Worker Initialization Failed", error);
      setRunning(false);
      showToast.error("Failed to start runner", null, { id: `run-${runId}` });
    }
  }, [code, clearOutput, cleanupWorker]);

  useEffect(() => {
    return () => cleanupWorker();
  }, [cleanupWorker]);

  return (
    <CodeRunnerContext.Provider
      value={{
        code,
        setCode: handleSetCode,
        run,
        output,
        setOutput,
        running,
        clearOutput,
      }}
    >
      {children}
    </CodeRunnerContext.Provider>
  );
}

export function useCodeRunner() {
  const context = useContext(CodeRunnerContext);
  if (!context)
    throw new Error("useCodeRunner must be used within a CodeRunnerProvider");
  return context;
}
