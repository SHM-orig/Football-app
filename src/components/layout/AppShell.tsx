import { Navbar } from "@/components/layout/Navbar";
import { NotifyButton } from "@/components/ui/NotifyButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-[var(--card-border)] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 text-xs text-[var(--muted)] sm:flex-row sm:px-6">
          <NotifyButton />
          <span className="hidden sm:inline">·</span>
          <span>
            Demo data without API key · Firebase for accounts and favorites
          </span>
        </div>
      </footer>
    </div>
  );
}
