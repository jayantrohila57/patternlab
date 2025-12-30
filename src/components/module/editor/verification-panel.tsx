import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCodeRunner } from "./code-runner.context";
import { usePatternState, usePatternActions } from "./pattern-runner.context";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  CheckCircle,
  Alert02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

export function VerificationPanel() {
  const { running } = useCodeRunner();
  const {
    currentPattern,
    userCode,
    comparison,
    compiledResult,
    lastValidation,
  } = usePatternState();
  const { validateCode, compile, compare } = usePatternActions();

  const handleRunVerification = async () => {
    console.log("🔍 Starting comprehensive verification...");

    // Step 1: Validate code
    const validation = validateCode(userCode);

    if (!validation.isValid) {
      console.log("❌ Code validation failed - aborting verification");
      return;
    }

    // Step 2: Compile code
    console.log("🔧 Compiling code...");
    const compileResult = await compile();

    if (!compileResult.success) {
      console.log("❌ Compilation failed - aborting verification");
      return;
    }

    // Step 3: Compare with expected
    console.log("🔍 Comparing output...");
    const comparisonResult = await compare();

    console.log("✅ Verification completed", comparisonResult);
  };

  const getVerificationStatus = () => {
    if (!currentPattern) {
      return {
        status: "idle",
        text: "No Pattern Selected",
        color: "bg-gray-500",
        icon: null,
        description: "Select a pattern to start verification",
      };
    }

    if (!lastValidation) {
      return {
        status: "warning",
        text: "Not Validated",
        color: "bg-yellow-500",
        icon: Alert02Icon,
        description: "Code must be validated first",
      };
    }

    if (!compiledResult) {
      return {
        status: "warning",
        text: "Not Compiled",
        color: "bg-orange-500",
        icon: Alert02Icon,
        description: "Code must be compiled first",
      };
    }

    switch (comparison.status) {
      case "pass":
        return {
          status: "success",
          text: "✅ All Checks Passed",
          color: "bg-green-500",
          icon: CheckCircle,
          description: "Code is valid and produces correct output",
        };
      case "fail":
        return {
          status: "error",
          text: "❌ Output Mismatch",
          color: "bg-red-500",
          icon: Alert02Icon,
          description: "Code compiles but produces incorrect output",
        };
      case "error":
        return {
          status: "error",
          text: "⚠️ Execution Error",
          color: "bg-red-500",
          icon: Alert02Icon,
          description: "Code failed during execution",
        };
      default:
        return {
          status: "idle",
          text: "Ready",
          color: "bg-blue-500",
          icon: PlayIcon,
          description: "Ready for verification",
        };
    }
  };

  const status = getVerificationStatus();

  const statusMeta = (() => {
    switch (comparison.status) {
      case "pass":
        return {
          label: "Outputs match",
          variant: "default" as const,
        };
      case "fail":
        return {
          label: "Differences found",
          variant: "destructive" as const,
        };
      case "error":
        return {
          label: "Execution error",
          variant: "destructive" as const,
        };
      case "running":
        return {
          label: "Verification in progress",
          variant: "secondary" as const,
        };
      default:
        return {
          label: "Ready for verification",
          variant: "secondary" as const,
        };
    }
  })();

  const progressSteps = [
    { name: "Pattern selected", completed: !!currentPattern },
    { name: "Code validated", completed: lastValidation?.isValid || false },
    { name: "Compiled", completed: compiledResult?.success || false },
    {
      name: "Compared",
      completed: comparison.status === "pass" || comparison.status === "fail",
    },
  ];

  const quickStats = compiledResult
    ? [
        {
          label: "Console logs",
          value: compiledResult.logs.filter((log) => !log.startsWith("[error]"))
            .length,
        },
        {
          label: "Output lines",
          value: compiledResult.output.split("\n").length,
        },
        {
          label: "Exec time",
          value: compiledResult.executionTime
            ? `${compiledResult.executionTime}ms`
            : "N/A",
        },
      ]
    : [];

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Verification Status</CardTitle>
            <p className="text-xs text-muted-foreground">
              Validate, compile, and compare against official output
            </p>
          </div>
          <Badge variant={statusMeta.variant} className="text-xs">
            {statusMeta.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 h-full">
        <div className="rounded-md border border-border/70 px-3 py-2">
          <div className="text-sm font-semibold text-foreground">
            {status.text}
          </div>
          <p className="text-xs text-muted-foreground">
            {status.description ??
              "Kick off verification to ensure your output matches the official reference."}
          </p>
        </div>

        <section className="rounded-md border border-border/70 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Progress
          </p>
          <div className="mt-2 grid gap-1.5">
            {progressSteps.map((step, index) => (
              <div key={step.name} className="flex items-center gap-3">
                <div className="flex size-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
                  {step.completed ? "✓" : index + 1}
                </div>
                <div className="flex-1 text-xs font-medium text-foreground">
                  {step.name}
                </div>
                <div className="text-[11px] text-muted-foreground/80">
                  {step.completed ? "Complete" : "Pending"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => validateCode(userCode)}
            disabled={running || !userCode.trim()}
          >
            🔍 Validate Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={compile}
            disabled={running || !userCode.trim() || !lastValidation?.isValid}
          >
            🔧 Compile Only
          </Button>

          <Button
            variant={status.status === "success" ? "default" : "secondary"}
            size="sm"
            onClick={handleRunVerification}
            disabled={running || !userCode.trim() || !lastValidation?.isValid}
          >
            {running ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="mr-2 animate-spin"
                />
                Running...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={PlayIcon}
                  strokeWidth={2}
                  className="mr-2"
                />
                Run Full Verification
              </>
            )}
          </Button>
        </div>

        {quickStats.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-border/70 px-3 py-2 text-center"
              >
                <div className="text-lg font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {comparison.error && (
          <div className="rounded-md border border-border/70 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Execution error details
            </p>
            <ScrollArea className="mt-2 h-20">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {comparison.error.name}: {comparison.error.message}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
