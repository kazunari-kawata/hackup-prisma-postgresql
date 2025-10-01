import { Suspense } from "react";
import SearchResults from "./search-results";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>検索中...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
