import TextEditor from "@/components/module/editor/editor";
import { Terminal } from "@/components/module/terminal/terminal";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useSidebar } from "./use-sidebar";
import { List } from "@/components/module/listing/list";

export function Main() {
  const { state } = useSidebar();
  return (
    <main className="h-[calc(100vh-7rem)] w-full">
      {String(state.activeItemId) === String("1") ? (
        <div className="w-full pl-1">
          <List />
        </div>
      ) : (
        <div className="w-full">
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={70}>
              <div className="w-full px-1">
                <TextEditor />
              </div>
            </ResizablePanel>
            <ResizablePanel defaultSize={30}>
              <div className="w-full h-full">
                <Terminal />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </main>
  );
}
