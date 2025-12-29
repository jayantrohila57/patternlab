import { Header } from "./components/shared/layout/header";
import { Main } from "./components/shared/layout/main";
import { Footer } from "./components/shared/layout/footer";
import { CodeRunnerProvider } from "./components/module/editor/code-runner.context";

export function App() {
  return (
    <CodeRunnerProvider>
      <Header />
      <Main />
      <Footer />
    </CodeRunnerProvider>
  );
}

export default App;
