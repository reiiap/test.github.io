export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center"><h3 className="text-lg font-bold text-white">{title}</h3><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}
