"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="section"><div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8"><h1 className="text-3xl font-black">Something went wrong</h1><p className="mt-3 text-rose-100">Please retry the request. If the issue persists, contact support.</p><Button className="mt-6" onClick={reset}>Try again</Button></div></main>;
}
