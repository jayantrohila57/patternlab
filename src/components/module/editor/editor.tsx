import Editor, { type Monaco } from "@monaco-editor/react";
import { useCodeRunner } from "./code-runner.context";
import { usePatternActions, usePatternState } from "./pattern-runner.context";
import { useSidebar } from "@/components/shared/layout/use-sidebar";
import { Terminal } from "../terminal/terminal";

const TextEditor = () => {
  const { state: sidebarState } = useSidebar();
  const inWorkspace = String(sidebarState.activeItemId) === String("workspace");

  const { code, setCode } = useCodeRunner();
  const patternState = usePatternState();
  const patternActions = usePatternActions();

  const value = inWorkspace ? patternState.userCode : code;
  function handleEditorChange(value: string | undefined) {
    const next = value ?? "";
    if (inWorkspace) {
      patternActions.updateUserCode(next);
    } else {
      setCode(next);
    }
  }
  function handleEditorWillMount(monaco: Monaco) {
    monaco.editor.defineTheme("myCustomTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a9955" },
        { token: "keyword", foreground: "569cd6" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#e5e7eb",
        /* Cursor & Selection */
        "editorCursor.foreground": "#9cdcfe",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#1f2933",
        /* Lines */
        "editor.lineHighlightBackground": "#0f1115",
        "editorLineNumber.foreground": "#5a5a5a",
        "editorLineNumber.activeForeground": "#c5c5c5",
        /* Gutter */
        "editorGutter.background": "#000000",
        /* Scrollbar */
        "scrollbarSlider.background": "#2a2a2a80",
        "scrollbarSlider.hoverBackground": "#3a3a3a80",
        "scrollbarSlider.activeBackground": "#4a4a4a80",
        /* Brackets */
        "editorBracketMatch.background": "#1f2937",
        "editorBracketMatch.border": "#4b5563",
      },
    });
  }
  return (
    <div className="flex h-[calc(100vh-7.3rem)] w-full flex-col overflow-hidden rounded-md border border-border bg-muted/30">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-muted-foreground">Editor</span>
      </div>
      <div className="relative border flex-1 py-2 h-full bg-black">
        <Editor
          height="28rem"
          defaultLanguage={"typescript"}
          onChange={handleEditorChange}
          beforeMount={handleEditorWillMount}
          theme="myCustomTheme"
          value={value}
          options={{
            autoClosingBrackets: "never",
            autoClosingQuotes: "never",
            formatOnType: true,
            formatOnPaste: true,
            trimAutoWhitespace: true,
            fontSize: 12,
            fontFamily: "Fira Code, monospace",
            fontLigatures: true,
            wordWrap: "on",
            renderLineHighlight: "all",
            minimap: {
              enabled: false,
            },
            bracketPairColorization: {
              enabled: true,
            },
            cursorBlinking: "expand",
            suggest: {
              showFields: false,
              showFunctions: false,
            },
          }}
        />
      </div>
      <div className="relative border flex-1 h-full bg-black">
        <Terminal />
      </div>
    </div>
  );
};

export default TextEditor;
