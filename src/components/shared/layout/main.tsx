import TextEditor from "@/components/module/editor/editor";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useSidebar } from "./use-sidebar";
import { List } from "@/components/module/listing/list";
import { ProblemPanel } from "@/components/module/workspace/problem-panel";
import { EvaluationPanel } from "@/components/module/editor/evaluation-panel";

export function Main() {
  const { state } = useSidebar();
  return (
    <main className="h-[calc(100vh-7rem)] w-full">
      {String(state.activeItemId) === String("problems") ? (
        <div className="w-full pl-1">
          <List />
        </div>
      ) : (
        <div className="w-full">
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={30}>
              <div className="w-full pl-1">
                <ProblemPanel />
              </div>
            </ResizablePanel>
            <ResizablePanel defaultSize={45}>
              <div className="w-full px-1">
                <TextEditor />
              </div>
            </ResizablePanel>
            <ResizablePanel defaultSize={30}>
              <div className="h-full px-1">
                <EvaluationPanel />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </main>
  );
}
