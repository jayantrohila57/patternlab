import { useCodeRunner } from "./code-runner.context";
import {
  usePatternActions,
  usePatternState,
  type DiffLine,
} from "./pattern-runner.context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent,  } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Cancel01Icon,
  LeftToRightListDashIcon,
  Loading03Icon,
  PlayIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

const renderDiffLine = (line: DiffLine, index: number) => {
  const isAdded = line.expected === "" && line.actual !== "";
  const isRemoved = line.actual === "" && line.expected !== "";
  const isModified = !line.equal && !isAdded && !isRemoved;

  return (
    <div
      key={index}
      className="group flex border-b border-border/30 last:border-0 hover:bg-muted/30"
    >
      <div className="flex w-9 flex-none select-none flex-col items-center justify-start border-r border-border/40 bg-muted/30 py-0.5 text-[10px] text-muted-foreground/50 font-mono">
        {line.index + 1}
      </div>

      <div
        className={cn(
          "flex-1 px-2 py-0.5 font-mono text-[12px] leading-5 whitespace-pre border-r border-border/20 overflow-hidden text-ellipsis",
          isRemoved || isModified
            ? "bg-red-500/10 text-red-700 dark:text-red-400/90"
            : "opacity-80"
        )}
      >
        {line.expected || <span className="opacity-10">·</span>}
      </div>

      <div
        className={cn(
          "flex-1 px-2 py-0.5 font-mono text-[12px] leading-5 whitespace-pre overflow-hidden text-ellipsis",
          isAdded || isModified
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400/90"
            : "opacity-80"
        )}
      >
        {line.actual || <span className="opacity-10">·</span>}
      </div>
    </div>
  );
};

const renderMessageList = (
  items: string[],
  title: string,
  accent: "destructive" | "secondary"
) => (
  <div className="rounded-md border border-border/70">
    <div className="border-b border-border/60 px-1 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {title}
    </div>
    <ScrollArea className="max-h-32">
      <div className="space-y-1.5 p-1">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground/80">
            Nothing to report.
          </div>
        ) : (
          items.map((message, idx) => (
            <Alert
              key={`${title}-${idx}`}
              variant={accent === "destructive" ? "destructive" : "default"}
              className="border-border/60 bg-muted"
            >
              <AlertDescription className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                {message}
              </AlertDescription>
            </Alert>
          ))
        )}
      </div>
    </ScrollArea>
  </div>
);

export function EvaluationPanel() {
  const { running } = useCodeRunner();
  const {
    comparison,
    compiledResult,
    currentPattern,
    expectedOutput,
    lastValidation,
    userCode,
  } = usePatternState();
  const { validateCode, compile, compare } = usePatternActions();

  const handleRunVerification = async () => {
    const validation = validateCode(userCode);

    if (!validation.isValid) {
      return;
    }

    const compileResult = await compile();

    if (!compileResult.success) {
      return;
    }

    await compare();
  };

  const verificationStatus = (() => {
    if (!currentPattern) {
      return {
        text: "No pattern selected",
        description: "Select a pattern to start verification",
      };
    }

    if (!lastValidation) {
      return {
        text: "Not validated",
        description: "Run validation before verifying your solution",
      };
    }

    if (!compiledResult) {
      return {
        text: "Not compiled",
        description: "Compile your solution before comparison",
      };
    }

    switch (comparison.status) {
      case "pass":
        return {
          text: "All checks passed",
          description: "Code is valid and matches the expected output",
        };
      case "fail":
        return {
          text: "Output mismatch",
          description: "Compilation succeeded but produced incorrect output",
        };
      case "error":
        return {
          text: "Execution error",
          description: "Code failed while executing",
        };
      default:
        return {
          text: "Ready for verification",
          description: "Launch the full verification sequence",
        };
    }
  })();

  const verificationBadge = (() => {
    switch (comparison.status) {
      case "pass":
        return {
          label: "Outputs match",
          variant: "default" as const,
          icon: Tick02Icon,
        };
      case "fail":
        return {
          label: "Differences found",
          variant: "destructive" as const,
          icon: Cancel01Icon,
        };
      case "error":
        return {
          label: "Execution error",
          variant: "destructive" as const,
          icon: AlertCircleIcon,
        };
      case "running":
        return {
          label: "Verification running",
          variant: "secondary" as const,
          icon: Loading03Icon,
        };
      default:
        return {
          label: "Awaiting verification",
          variant: "secondary" as const,
          icon: LeftToRightListDashIcon,
        };
    }
  })();

  const validationMeta = lastValidation
    ? lastValidation.isValid
      ? { label: "Ready to run", variant: "default" as const }
      : lastValidation.errors.length > 0
      ? { label: "Requires fixes", variant: "destructive" as const }
      : { label: "Has warnings", variant: "secondary" as const }
    : { label: "Validation pending", variant: "secondary" as const };

  const validationMetrics = lastValidation
    ? [
        { label: "Errors", value: lastValidation.errors.length },
        { label: "Warnings", value: lastValidation.warnings.length },
        { label: "TS Issues", value: lastValidation.compilationErrors.length },
      ]
    : [];

  const comparisonStats = comparison.diff
    ? {
        total: comparison.diff.length,
        matching: comparison.diff.filter((line) => line.equal).length,
        diffs: comparison.diff.filter((line) => !line.equal).length,
      }
    : null;

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
    <Card className="flex p-0 h-full flex-col overflow-hidden">
      <CardContent className="flex flex-1 flex-col gap-1 overflow-hidden p-1">
        <section className="p-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {verificationStatus.text}
              </p>
              <p className="text-xs text-muted-foreground">
                {verificationStatus.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => validateCode(userCode)}
                disabled={running || !userCode.trim()}
              >
                  Validate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={compile}
                disabled={
                  running || !userCode.trim() || !lastValidation?.isValid
                }
              >
                  Compile
              </Button>
              <Button
                variant={
                  verificationBadge.variant === "default"
                    ? "default"
                    : "secondary"
                }
                size="sm"
                onClick={handleRunVerification}
                disabled={
                  running || !userCode.trim() || !lastValidation?.isValid
                }
              >
                {running ? (
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="animate-spin"
                      strokeWidth={2}
                    />
                    Running...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon icon={PlayIcon} strokeWidth={2} />
                    Run Verification
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {["Pattern selected", "Code validated", "Compiled", "Compared"].map(
              (step, index) => {
                const completed =
                  index === 0
                    ? !!currentPattern
                    : index === 1
                    ? lastValidation?.isValid || false
                    : index === 2
                    ? compiledResult?.success || false
                    : comparison.status === "pass" ||
                      comparison.status === "fail";

                return (
                  <div
                    key={step}
                    className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-0.5 text-xs"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
                      {completed ? "✓" : index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {step}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {completed ? "Complete" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {quickStats.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-border/60 px-1 py-1 text-center"
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
        </section>

        <section className="grid gap-2 p-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Validation Summary
              </p>
            </div>
            <Badge variant={validationMeta.variant} className="text-xs">
              {validationMeta.label}
            </Badge>
          </div>

          {validationMetrics.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {validationMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-border/70 px-1 py-1 text-center"
                >
                  <div className="text-lg font-semibold text-foreground">
                    {metric.value}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              Run validation to see static analysis details.
            </div>
          )}

          {lastValidation && (
            <div className="grid gap-1 lg:grid-cols-1">
              {renderMessageList(
                lastValidation.errors,
                "Validation Errors",
                "destructive"
              )}
              {renderMessageList(
                lastValidation.warnings,
                "Warnings",
                "secondary"
              )}
              {renderMessageList(
                lastValidation.compilationErrors,
                "TypeScript Diagnostics",
                "destructive"
              )}
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-1 py-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Output Comparison
              </p>
            </div>
            {comparisonStats && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
                  <div className="size-2 rounded-sm bg-border" /> Lines{" "}
                  {comparisonStats.total}
                </span>
                <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-600">
                  Match {comparisonStats.matching}
                </span>
                <span className="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-red-600">
                  Diff {comparisonStats.diffs}
                </span>
              </div>
            )}
          </div>

          {!expectedOutput || !compiledResult ? (
            <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-muted-foreground">
              Run compilation to generate comparable output.
            </div>
          ) : (
            <>
              <div className="flex bg-muted/20 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                <div className="w-9 flex-none border-r border-border/40" />
                <div className="flex-1 border-r border-border/20 px-2">
                  Reference
                </div>
                <div className="flex-1 px-2">Output</div>
              </div>
              <ScrollArea className="flex-1">
                <div className="flex flex-col">
                  {comparison.diff.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-muted-foreground italic">
                      No output to compare.
                    </div>
                  ) : (
                    comparison.diff.map((line, index) =>
                      renderDiffLine(line, index)
                    )
                  )}
                </div>
              </ScrollArea>

              {comparison.error && (
                <div className="border-t border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] text-red-600">
                  {comparison.error.name}: {comparison.error.message}
                </div>
              )}
            </>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
