import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <main className="section max-w-xl"><Card><h1 className="text-3xl font-black">Create your account</h1><p className="mt-2 text-slate-300">Start a secure project workspace with ReiiKajurawa Development Service.</p><div className="mt-8"><RegisterForm /></div><p className="mt-6 text-sm text-slate-400">Already registered? <Link href="/auth/login" className="text-cyan-300">Sign in</Link></p></Card></main>;
}
