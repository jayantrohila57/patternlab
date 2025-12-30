import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { HomeIcon, LeftToRightListStarIcon } from "@hugeicons/core-free-icons";
import { useSidebar } from "./use-sidebar";

export default function Sidebar() {
  const { state, setActive } = useSidebar();

  return (
    <div className="border h-[calc(100vh-4rem)] p-1 flex gap-1 flex-col w-12 rounded-md bg-muted/30">
      {[
        {
          id: 1,
          name: <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />,
        },
        {
          id: 2,
          name: (
            <HugeiconsIcon icon={LeftToRightListStarIcon} strokeWidth={2} />
          ),
        },
      ]?.map((item) => (
        <Button
          variant={
            String(state.activeItemId) === String(item.id) ? "default" : "ghost"
          }
          onClick={() => setActive(String(item.id))}
          size={"icon-lg"}
          key={item.id}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
}
