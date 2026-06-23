import Link from "next/link";import { AuthForm } from "@/components/auth-form";
export default function Register(){return <main className="section"><AuthForm mode="register"/><p className="mt-6 text-center text-sm text-slate-300">Already registered? <Link className="text-sky-300" href="/login">Login</Link></p></main>}
