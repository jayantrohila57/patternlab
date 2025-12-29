/// <reference lib="webworker" />

import * as ts from "typescript";

type WorkerRequestPayload = {
  code: string;
  runId: string;
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
  error?: WorkerErrorPayload;
};

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let lastRunId: string | null = null;

const handleMessage = async (e: MessageEvent<WorkerRequestPayload>) => {
  const logs: string[] = [];
  const runId = e.data.runId;
  lastRunId = runId;

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
    const result = ts.transpileModule(e.data.code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.None,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    });

    const wrappedSource = `"use strict";\nreturn (async () => {\n${result.outputText}\n})();`;
    const execute = new Function("console", "self", wrappedSource) as (
      console: typeof fakeConsole,
      self: DedicatedWorkerGlobalScope
    ) => Promise<unknown>;

    await execute(fakeConsole, ctx);

    ctx.postMessage({
      runId,
      logs,
      success: true,
    } satisfies WorkerResponsePayload);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    fakeConsole.error(error);
    ctx.postMessage({
      runId,
      logs,
      success: false,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    } satisfies WorkerResponsePayload);
  } finally {
    // Don't close the worker to allow reusing it
  }
};

// Handle incoming messages
ctx.addEventListener("message", handleMessage);

// Optional: Handle errors in the worker
ctx.addEventListener("error", (event) => {
  ctx.postMessage({
    runId: lastRunId ?? "unknown",
    logs: [`[Worker Error] ${event.message}`],
    success: false,
    error: {
      name: "WorkerError",
      message: event.message,
      stack: event.filename
        ? `at ${event.filename}:${event.lineno}:${event.colno}`
        : "",
    },
  } satisfies WorkerResponsePayload);
});
