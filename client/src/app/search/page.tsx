"use client";

import { Suspense } from "react";
import SearchPageContent from "./components/SearchPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
