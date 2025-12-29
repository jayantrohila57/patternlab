import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";

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

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const run = useCallback(async () => {
    clearOutput()
    setRunning(true);

    const codeText = code;

    const runId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    activeRunIdRef.current = runId;

    // Terminate any existing worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      // Create a new worker
      const worker = new Worker(
        new URL("../../../worker/runner.worker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;

      timeoutRef.current = window.setTimeout(() => {
        if (activeRunIdRef.current !== runId) return;

        setOutput((prev) => [...prev, "[error] Execution timed out"]);

        if (workerRef.current === worker) {
          worker.terminate();
          workerRef.current = null;
        }
        setRunning(false);
      }, 3000);

      // Set up message handler
      const handleMessage = (e: MessageEvent<WorkerResponsePayload>) => {
        if (e.data.runId !== runId) return;

        if (e.data.success) {
          setOutput((prev) => [...prev, ...e.data.logs]);
        } else {
          setOutput((prev) => [
            ...prev,
            ...e.data.logs,
            e.data.error
              ? `Error: ${e.data.error.message}`
              : "Unknown error occurred",
          ]);
        }

        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (workerRef.current === worker) {
          worker.terminate();
          workerRef.current = null;
        }
        setRunning(false);
      };

      // Set up error handler
      const handleError = (error: ErrorEvent) => {
        if (activeRunIdRef.current !== runId) return;

        setOutput((prev) =>
          [
            ...prev,
            `[Worker Error] ${error.message}`,
            error.filename
              ? `at ${error.filename}:${error.lineno}:${error.colno}`
              : "",
          ].filter(Boolean)
        );

        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (workerRef.current === worker) {
          worker.terminate();
          workerRef.current = null;
        }
        setRunning(false);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);

      // Post message to worker
      worker.postMessage({ code: codeText, runId });
    } catch (error) {
      setOutput((prev) => [
        ...prev,
        "Failed to initialize worker",
        error instanceof Error ? error.message : String(error),
      ]);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setRunning(false);
    }
  }, [code]);

  // Cleanup worker on unmount
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

  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <CodeRunnerContext.Provider
      value={{ code, setCode, run, output, running, clearOutput }}
    >
      {children}
    </CodeRunnerContext.Provider>
  );
}

export function useCodeRunner() {
  const context = useContext(CodeRunnerContext);
  if (!context) {
    throw new Error("useCodeRunner must be used within a CodeRunnerProvider");
  }
  return context;
}
