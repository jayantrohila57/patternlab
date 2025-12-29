import { Logo } from "./logo";

export function Header() {
  return (
    <header className="border-b px-4 h-12 w-full">
      <div className="flex h-12 items-center justify-between gap-4">
        <div className="flex h-full items-center justify-center">
          <Logo size={40} className="h-auto w-full" />
          <span className="text-xl font-medium font-mono">PatternLab</span>
        </div>
        <div className="flex items-center gap-4"></div>
      </div>
    </header>
  );
}
