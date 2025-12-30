import { Logo } from "./logo";

export function Header() {
  return (
    <header className="border bg-muted/30 rounded-md w-full">
      <div className="flex h-12 items-center px-1.5 justify-start gap-2">
        <div className="flex h-full items-center justify-center">
          <Logo size={32} className="h-auto w-full" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text- font-medium font-mono">PatternLab</span>
        </div>
      </div>
    </header>
  );
}
