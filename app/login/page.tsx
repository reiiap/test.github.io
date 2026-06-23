import Link from "next/link";import { AuthForm } from "@/components/auth-form";
export default function Login(){return <main className="section"><AuthForm mode="login"/><p className="mt-6 text-center text-sm text-slate-300">No account? <Link className="text-sky-300" href="/register">Register</Link></p></main>}
