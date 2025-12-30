import { usePatternState, type DiffLine } from "./pattern-runner.context";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  AlertCircleIcon,
  Cancel01Icon,
  LeftToRightListDashIcon,
} from "@hugeicons/core-free-icons";

export function ComparisonPanel() {
  const { comparison, expectedOutput, compiledResult } = usePatternState();

  if (!expectedOutput || !compiledResult) return null;

  const statusMeta = (() => {
    switch (comparison.status) {
      case "pass":
        return {
          label: "Pass",
          variant: "default" as const,
          icon: Tick02Icon,
          color: "text-emerald-500",
        };
      case "fail":
        return {
          label: "Fail",
          variant: "destructive" as const,
          icon: Cancel01Icon,
          color: "text-red-500",
        };
      case "error":
        return {
          label: "Error",
          variant: "destructive" as const,
          icon: AlertCircleIcon,
          color: "text-red-500",
        };
      default:
        return {
          label: "Pending",
          variant: "secondary" as const,
          icon: LeftToRightListDashIcon,
          color: "text-muted-foreground",
        };
    }
  })();

  const renderDiffLine = (line: DiffLine, index: number) => {
    const isAdded = line.expected === "" && line.actual !== "";
    const isRemoved = line.actual === "" && line.expected !== "";
    const isModified = !line.equal && !isAdded && !isRemoved;

    return (
      <div
        key={index}
        className="group flex border-b border-border/30 last:border-0 hover:bg-muted/30"
      >
        {/* Gutter / Line Numbers */}
        <div className="flex w-9 flex-none select-none flex-col items-center justify-start border-r border-border/40 bg-muted/30 py-0.5 text-[10px] text-muted-foreground/50 font-mono">
          {line.index + 1}
        </div>

        {/* Expected Side */}
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

        {/* Actual Side */}
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

  const stats = {
    total: comparison.diff.length,
    matching: comparison.diff.filter((l) => l.equal).length,
    diffs: comparison.diff.filter((l) => !l.equal).length,
  };

  return (
    <Card className="flex gap-0 flex-col h-full rounded-md border-border/50 shadow-none overflow-hidden bg-card">
      <CardHeader className=" border-b bg-muted/10">
        <CardTitle className="text-xs font-bold tracking-tight uppercase text-muted-foreground/80">
          Comparison
        </CardTitle>
        <CardAction>
          <Badge variant={statusMeta.variant}>
            <HugeiconsIcon
              icon={statusMeta.icon}
              className="size-3"
              strokeWidth={2}
            />
            {statusMeta.label}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        {/* Compact Metadata Strip */}
        <div className="flex items-center gap-4 p-2 bg-muted/5 border-b border-border/30  font-medium text-muted-foreground">
          <span className="flex items-center gap-2 border border-border bg-muted/30 p-1 px-2 rounded-md">
            <div className="w-4 h-4 rounded-sm bg-border" /> Lines:
            <b className="text-foreground">{stats.total}</b>
          </span>
          <span className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-1 px-2 rounded-sm">
            <div className="w-4 h-4 rounded-sm bg-emerald-500" /> Match:
            <b className="text-foreground">{stats.matching}</b>
          </span>
          <span className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-1 px-2 rounded-sm">
            <div className="w-4 h-4 rounded-sm bg-red-500" /> Diffs:
            <b className="text-foreground">{stats.diffs}</b>
          </span>
        </div>

        {/* Diff Table Headers */}
        <div className="flex bg-muted/20 py-1 border-b border-border/40 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
          <div className="w-9 flex-none border-r border-border/40" />
          <div className="flex-1 px-2 py-0.5 border-r border-border/20">
            Reference
          </div>
          <div className="flex-1 px-2 py-0.5">Output</div>
        </div>

        {/* Scrollable Diff Area */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col min-w-full overflow-visible">
            {comparison.diff.length === 0 ? (
              <div className="p-6 text-center text-[11px] text-muted-foreground italic">
                No output to compare.
              </div>
            ) : (
              comparison.diff.map((line, index) => renderDiffLine(line, index))
            )}
          </div>
        </ScrollArea>

        {/* Error Footer */}
        {comparison.error && (
          <div className="p-2 bg-red-500/5 border-t border-red-500/20">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-3"
                strokeWidth={2}
              />
              <span className="text-[10px] font-bold uppercase">
                Runtime Error
              </span>
            </div>
            <pre className="text-[11px] font-mono text-red-600/90 dark:text-red-400/90 leading-tight">
              {comparison.error.message}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
