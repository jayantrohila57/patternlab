import { usePatternState } from "./pattern-runner.context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ValidationPanel() {
  const { lastValidation } = usePatternState();

  if (!lastValidation) {
    return null;
  }

  const statusMeta = lastValidation.isValid
    ? {
        label: "Ready to run",
        badgeVariant: "default" as const,
      }
    : lastValidation.errors.length > 0
    ? {
        label: "Requires fixes",
        badgeVariant: "destructive" as const,
      }
    : {
        label: "Has warnings",
        badgeVariant: "secondary" as const,
      };

  const metrics = [
    {
      label: "Errors",
      value: lastValidation.errors.length,
      tone: "text-foreground",
    },
    {
      label: "Warnings",
      value: lastValidation.warnings.length,
      tone: "text-foreground",
    },
    {
      label: "TS Issues",
      value: lastValidation.compilationErrors.length,
      tone: "text-foreground",
    },
  ];

  const renderList = (items: string[], emptyLabel: string, accent: string) => (
    <div className="rounded-md border border-border/70">
      <div className="border-b border-border/60 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {emptyLabel}
      </div>
      <ScrollArea className="h-24">
        <div className="space-y-1.5 p-3">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground/80">
              Nothing to report.
            </div>
          ) : (
            items.map((message, index) => (
              <Alert
                key={`${emptyLabel}-${index}`}
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

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Code Validation</CardTitle>
            <p className="text-xs text-muted-foreground">
              Static analysis result for your current solution
            </p>
          </div>
          <Badge variant={statusMeta.badgeVariant} className="text-xs">
            {statusMeta.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 h-full">
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-md border border-border/70 px-3 py-2 text-center"
            >
              <div className={cn("text-lg font-semibold", metric.tone)}>
                {metric.value === 0 ? "0" : metric.value}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {renderList(lastValidation.errors, "Validation Errors", "destructive")}
        {renderList(lastValidation.warnings, "Warnings", "warning")}
        {renderList(
          lastValidation.compilationErrors,
          "TypeScript Diagnostics",
          "destructive"
        )}
      </CardContent>
    </Card>
  );
}
