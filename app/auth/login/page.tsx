import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <main className="section max-w-xl"><Card><h1 className="text-3xl font-black">Welcome back</h1><p className="mt-2 text-slate-300">Sign in to manage your projects and services.</p><div className="mt-8"><LoginForm /></div><p className="mt-6 text-sm text-slate-400">No account? <Link href="/auth/register" className="text-cyan-300">Create one</Link></p></Card></main>;
}
