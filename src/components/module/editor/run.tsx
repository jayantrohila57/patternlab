import { Button } from "@/components/ui/button";
import { useCodeRunner } from "./code-runner.context";

export function RunSlot() {
  const { run, running } = useCodeRunner();

  return (
    <Button size={'icon'} onClick={run} disabled={running}>
      {running ? "Running..." : "Run"}
    </Button>
  );
}
