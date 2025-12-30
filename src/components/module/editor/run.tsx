import { Button } from "@/components/ui/button";
import { useCodeRunner } from "./code-runner.context";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, PlayIcon } from "@hugeicons/core-free-icons";

export function RunSlot() {
  const { run, running } = useCodeRunner();

  return (
    <Button variant={'secondary'} size={"icon-lg"} onClick={run} disabled={running}>
      {running ? (
        <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" />
      ) : (
        <HugeiconsIcon icon={PlayIcon} strokeWidth={2} />
      )}
    </Button>
  );
}
