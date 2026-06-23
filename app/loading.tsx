import { SkeletonCard } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="section grid gap-6 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></main>;
}
