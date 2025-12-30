import { Header } from "./components/shared/layout/header";
import { Main } from "./components/shared/layout/main";
import { Footer } from "./components/shared/layout/footer";
import { CodeRunnerProvider } from "./components/module/editor/code-runner.context";
import { PatternRunnerProvider } from "./components/module/editor/pattern-runner.context";
import Sidebar from "./components/shared/layout/sidebar";
import { SidebarProvider } from "./components/shared/layout/sidebar.provider";
import { Toaster } from "./components/ui/sonner";

export function App() {
  return (
    <SidebarProvider defaultActiveId={"problems"}>
      <CodeRunnerProvider>
        <PatternRunnerProvider>
          <div className="p-1">
            <Header />
            <div className="flex flex-row mt-1 bg-background w-full">
              <Sidebar />
              <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
                <Main />
                <div className="pt-1 pl-1">
                  <Footer />
                </div>
              </div>
            </div>
          </div>
          <Toaster />
        </PatternRunnerProvider>
      </CodeRunnerProvider>
    </SidebarProvider>
  );
}

export default App;
