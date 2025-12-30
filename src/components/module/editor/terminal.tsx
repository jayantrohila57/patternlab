import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { useCodeRunner } from "./code-runner.context";
import { showToast } from "@/lib/toast-utils";

export function TerminalSlot() {
  const { output } = useCodeRunner();
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());

  useEffect(() => {
    if (!xtermRef.current) return;

    try {
      console.log("🖥️ Initializing terminal");

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
      console.log("✅ Terminal initialized successfully");

      return () => {
        try {
          console.log("🧹 Disposing terminal");
          term.dispose();
        } catch (error) {
          console.error("❌ Failed to dispose terminal", error);
        }
      };
    } catch (error) {
      console.error("❌ Failed to initialize terminal", error);
      showToast.error("Failed to initialize terminal", error);
    }
  }, []);

  useEffect(() => {
    if (!termRef.current) return;

    try {
      console.log("📝 Updating terminal output", { lines: output.length });

      termRef.current.clear();
      output.forEach((line) => {
        try {
          termRef.current!.writeln(line);
        } catch (lineError) {
          console.error("❌ Failed to write line to terminal", {
            line,
            error: lineError,
          });
        }
      });

      console.log("✅ Terminal output updated successfully");
    } catch (error) {
      console.error("❌ Failed to update terminal output", error);
      showToast.error("Failed to update terminal output", error);
    }
  }, [output]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col overflow-hidden"
    >
      <div className="flex items-center gap-2 bg-muted/30 border-b border-border px-4 py-2">
        <span className="ml-2 text-xs text-muted-foreground">Terminal</span>
      </div>

      <div className="flex flex-col flex-1">
        <div className="space-y-4">
          <div className="relative h-[calc(100vh-40rem)]">
            <div
              ref={xtermRef}
              className="absolute inset-0 overflow-hidden p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
