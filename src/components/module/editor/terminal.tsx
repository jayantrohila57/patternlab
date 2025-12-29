import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { useCodeRunner } from "./code-runner.context";

export function TerminalSlot() {
  const { output } = useCodeRunner();
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());

  useEffect(() => {
    if (!xtermRef.current) return;

    const term = new Terminal({
      disableStdin: true,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 13,
      theme: {
        background: "#000000",
        foreground: "#e5e7eb",
      },
    });

    term.loadAddon(fitAddon.current);
    term.open(xtermRef.current);
    fitAddon.current.fit();

    termRef.current = term;

    return () => term.dispose();
  }, []);

  useEffect(() => {
    if (!termRef.current) return;

    termRef.current.clear();
    output.forEach((line) => termRef.current!.writeln(line));
  }, [output]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-muted-foreground">
          Terminal
        </span>
      </div>

      {/* Xterm Mount */}
      <div className="relative flex-1 bg-black">
        <div
          ref={xtermRef}
          className="absolute inset-0 p-2"
        />
      </div>
    </div>
  );
}
