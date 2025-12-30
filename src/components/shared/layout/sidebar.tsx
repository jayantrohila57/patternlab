import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSidebar } from "./use-sidebar";
import { navGroups, type AppRouteId } from "./nav";
import { usePatternState } from "@/components/module/editor/pattern-runner.context";
import { showToast } from "@/lib/toast-utils";

export default function Sidebar() {
  const { state, setActive } = useSidebar();
  const { currentPattern } = usePatternState();
  const workspaceEnabled = currentPattern != null;

  const handleSetActive = (itemId: AppRouteId) => {
    try {
      console.log("🧭 Setting active sidebar item:", itemId);
      setActive(itemId);
    } catch (error) {
      console.error("❌ Failed to set active sidebar item", error);
      showToast.error("Failed to navigate", error);
    }
  };

  return (
    <div className="border h-[calc(100vh-4rem)] p-1 flex gap-2 flex-col w-52 rounded-md bg-muted/30">
      {navGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <div className="px-2 text-[0.65rem] font-medium text-foreground/60">
            {group.label}
          </div>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const enabled =
                item.id === "workspace" ? workspaceEnabled : item.enabled;
              const active = String(state.activeItemId) === String(item.id);

              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "ghost"}
                  className="justify-start gap-2"
                  disabled={!enabled}
                  onClick={() => handleSetActive(item.id satisfies AppRouteId)}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
