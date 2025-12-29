import TextEditor from "@/components/module/editor/editor";
import { Terminal } from "@/components/module/terminal/terminal";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function Main() {
  return (
    <main className="h-[calc(100vh-3rem)] bg-background w-full">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="w-full p-2">
            <TextEditor />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={30}>
          <div className="w-full h-full p-2">
            <Terminal />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
