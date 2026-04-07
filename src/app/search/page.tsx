import { SearchClient } from "@/components/search/SearchClient";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="surface p-10 text-center text-[var(--muted)]">
          Loading search…
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
