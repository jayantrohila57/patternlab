import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Loading03Icon,
  PlayIcon,
  Tick02Icon,
  Cancel01Icon,
  CodeIcon,
} from "@hugeicons/core-free-icons";
import { useSidebar } from "./use-sidebar";
import { useCodeRunner } from "@/components/module/editor/code-runner.context";
import {
  usePatternActions,
  usePatternState,
} from "@/components/module/editor/pattern-runner.context";
import { showToast } from "@/lib/toast-utils";

export function Footer() {
  const { state: sidebarState, setActive } = useSidebar();
  const { run, running, clearOutput, setOutput } = useCodeRunner();
  const patternState = usePatternState();
  const patternActions = usePatternActions();

  const inEditor = String(sidebarState.activeItemId) === String("workspace");
  const hasPattern = patternState.currentPattern != null;

// FIX 1: Ensure we check both compilation and comparison status
  // Note: Adjust 'compilation' to whatever key your Pattern State uses
  const isPatternBusy = 
    patternState.comparison?.status === "running" || 
    (patternState as unknown as { compilation: { status: string } }).compilation?.status === "running";

  const busy = running || isPatternBusy;
  const handleRun = async () => {
    try {
      console.log("🚀 Starting run from footer");
      clearOutput();

      if (!inEditor) {
        console.log("📝 Running code in code editor mode");
        await run();
        return;
      }

      if (!hasPattern) {
        console.warn("⚠️ No pattern selected for pattern run");
        setOutput(["[error] No pattern selected"]);
        showToast.warning("No pattern selected");
        return;
      }

      console.log("🎯 Running pattern compilation");
      const compiled = await patternActions.compile();
      const lines: string[] = [];
      compiled.logs.forEach((l) => lines.push(l));
      if (compiled.output.trim().length > 0) {
        lines.push("[output]");
        compiled.output.split("\n").forEach((l) => lines.push(l));
      }
      setOutput(lines);
      console.log("✅ Pattern run completed successfully");
    } catch (error) {
      console.error("❌ Run operation failed", error);
      showToast.error("Run operation failed", error);
      setOutput([
        `[error] ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  };

  const handleCompare = async () => {
    try {
      console.log("🔍 Starting pattern comparison from footer");
      clearOutput();

      if (!hasPattern) {
        console.warn("⚠️ No pattern selected for comparison");
        setOutput(["[error] No pattern selected"]);
        showToast.warning("No pattern selected for comparison");
        return;
      }

      const result = await patternActions.compare();
      const lines: string[] = [];
      lines.push(`[compare] ${result.status}`);

      if (patternState.compiledResult?.output?.trim().length) {
        lines.push("[actual output]");
        patternState.compiledResult.output
          .split("\n")
          .slice(0, 40)
          .forEach((l) => lines.push(l));
      }

      if (result.status === "fail") {
        const failures = result.diff.filter((d) => !d.equal);
        lines.push(`[diff] ${failures.length} line(s) differ`);
        failures.slice(0, 40).forEach((d) => {
          lines.push(`- expected[${d.index + 1}]: ${d.expected}`);
          lines.push(`+ actual  [${d.index + 1}]: ${d.actual}`);
        });
      }

      if (result.status === "error" && result.error) {
        lines.push(`[error] ${result.error.name}: ${result.error.message}`);
      }

      setOutput(lines);
      console.log("✅ Pattern comparison completed");
    } catch (error) {
      console.error("❌ Pattern comparison failed", error);
      showToast.error("Pattern comparison failed", error);
      setOutput([
        `[error] ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  };

  const handleNavigateToProblems = () => {
    try {
      console.log("🔙 Navigating to problems");
      setActive("problems");
    } catch (error) {
      console.error("❌ Failed to navigate to problems", error);
      showToast.error("Failed to navigate", error);
    }
  };

  const handleReset = () => {
    try {
      console.log("🔄 Resetting pattern runner from footer");
      patternActions.reset();
      clearOutput();
      showToast.info("Pattern runner reset");
    } catch (error) {
      console.error("❌ Failed to reset pattern runner", error);
      showToast.error("Failed to reset pattern runner", error);
    }
  };

  return (
    <footer className="h-12 p-1 bg-muted/30 border rounded-md flex items-center gap-2">
      <div className="mr-auto flex items-center gap-2 pr-1">
        <HugeiconsIcon icon={CodeIcon} strokeWidth={2} />
        <span className="text-xs text-foreground/70">
          {patternState.currentPattern?.name ?? "No pattern selected"}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2 pr-1">
        <Button
          variant={"secondary"}
          size={"icon-lg"}
          onClick={handleNavigateToProblems}
          disabled={busy}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
        </Button>

        <Button
          variant={"secondary"}
          size={"icon-lg"}
          onClick={handleRun}
          disabled={busy}
        >
          {busy ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="animate-spin"
            />
          ) : (
            <HugeiconsIcon icon={PlayIcon} strokeWidth={2} />
          )}
        </Button>

        <Button
          variant={"secondary"}
          size={"icon-lg"}
          onClick={handleCompare}
          disabled={busy || !hasPattern}
        >
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
        </Button>

        <Button
          variant={"secondary"}
          size={"icon-lg"}
          onClick={handleReset}
          disabled={busy}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </div>
    </footer>
  );
}
