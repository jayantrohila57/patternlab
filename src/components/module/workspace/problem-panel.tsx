import { useMemo, useState } from "react";

import {
  usePatternActions,
  usePatternState,
} from "@/components/module/editor/pattern-runner.context";
import { generatePattern } from "@/components/formula/formula";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast-utils";

export function ProblemPanel() {
  const { currentPattern, runInput, comparison, versions, activeVersionId } =
    usePatternState();
  const { updateRunInput, saveVersion, loadVersion, deleteVersion } =
    usePatternActions();
  const [versionName, setVersionName] = useState<string>("");

  const handleSaveVersion = () => {
    try {
      console.log("💾 Saving version from UI:", versionName || "Untitled");
      saveVersion(versionName);
      setVersionName("");
    } catch (error) {
      console.error("❌ Failed to save version from UI", error);
      showToast.error("Failed to save version", error);
    }
  };

  const handleLoadVersion = (versionId: string) => {
    try {
      console.log("📂 Loading version from UI:", versionId);
      loadVersion(versionId);
    } catch (error) {
      console.error("❌ Failed to load version from UI", error);
      showToast.error("Failed to load version", error);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    try {
      console.log("🗑️ Deleting version from UI:", versionId);
      deleteVersion(versionId);
    } catch (error) {
      console.error("❌ Failed to delete version from UI", error);
      showToast.error("Failed to delete version", error);
    }
  };

  const handleUpdateRunInput = (value: string) => {
    try {
      updateRunInput(value);
    } catch (error) {
      console.error("❌ Failed to update run input from UI", error);
      showToast.error("Failed to update input", error);
    }
  };

  const expected = useMemo(() => {
    try {
      if (!currentPattern) return "";
      const result = generatePattern(currentPattern).join("\n");
      console.log("🎯 Expected pattern generated for:", currentPattern.name);
      return result;
    } catch (error) {
      console.error("❌ Failed to generate expected pattern", error);
      showToast.error("Failed to generate expected pattern", error);
      return "";
    }
  }, [currentPattern]);

  if (!currentPattern) {
    return (
      <Card className="flex h-[calc(100vh-7.3rem)] w-full flex-col overflow-hidden rounded-md border border-border bg-muted/30">
        <CardHeader className="border-b border-border px-4">
          <CardTitle className="text-xs text-muted-foreground">
            Problem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-xs text-foreground/70">
          Select a pattern from the list to start.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-7.3rem)] gap-0 w-full flex-col overflow-hidden rounded-md border border-border bg-muted/30">
      <CardHeader className="border-b border-border px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs">{currentPattern.name}</CardTitle>
          <span className="text-[0.65rem] text-foreground/70">
            {comparison.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 gap-2 flex-col overflow-auto">
        <div className="py-4">
          {currentPattern.description ? (
            <div className="text-xs text-foreground/80">
              {currentPattern.description}
            </div>
          ) : null}

          <div className="text-xs text-foreground/70">
            Write a function named <code className="font-mono">solve</code> that
            takes a structured input and returns the pattern output.
          </div>

          <div className="text-xs text-foreground/70">
            Default rows:{" "}
            <span className="font-mono">
              {currentPattern.config.defaultRows}
            </span>
          </div>
        </div>
        <pre className="w-full overflow-auto rounded-md bg-background border p-2 font-mono text-xs leading-4 text-foreground">
          <code className="whitespace-pre tabular-nums">{expected}</code>
        </pre>
        <div className="py-4">
          <div className="space-y-1">
            <Label>Run Input (JSON)</Label>
            <textarea
              className="min-h-28 w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
              value={runInput}
              onChange={(e) => handleUpdateRunInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Rows</Label>
              <Input
                type="number"
                value={currentPattern.config.defaultRows}
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label>Symbol</Label>
              <Input value={currentPattern.config.symbol} disabled />
            </div>
          </div>
        </div>
        <div className="py-4">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label>Version name</Label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g. Attempt 1"
              />
            </div>
            <Button variant={"secondary"} onClick={handleSaveVersion}>
              Save
            </Button>
          </div>

          <div className="space-y-2">
            {versions.length === 0 ? (
              <div className="text-xs text-foreground/70">
                No saved versions yet.
              </div>
            ) : (
              versions.map((v) => (
                <div
                  key={v.id}
                  className={
                    "flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2 py-1"
                  }
                >
                  <div className="min-w-0">
                    <div className="text-xs truncate">
                      {v.name}{" "}
                      {activeVersionId === v.id ? (
                        <span className="text-[0.65rem] text-foreground/60">
                          (active)
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[0.65rem] text-foreground/60 truncate">
                      {new Date(v.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={"secondary"}
                      size={"xs"}
                      onClick={() => handleLoadVersion(v.id)}
                    >
                      Load
                    </Button>
                    <Button
                      variant={"destructive"}
                      size={"xs"}
                      onClick={() => handleDeleteVersion(v.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
