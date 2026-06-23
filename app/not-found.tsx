import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return <main className="section text-center"><h1 className="text-5xl font-black">Page not found</h1><p className="mt-4 text-slate-300">The page you requested does not exist.</p><div className="mt-8"><ButtonLink href="/">Go home</ButtonLink></div></main>;
}
