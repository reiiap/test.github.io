"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerUser } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return <Button className="w-full" disabled={pending}>{pending ? "Creating account..." : "Create account"}</Button>;
}

export function RegisterForm() {
  const [state, action] = useActionState(registerUser, {});
  return <form action={action} className="space-y-4"><label className="block text-sm font-semibold text-slate-200">Name<input name="name" required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300" /></label><label className="block text-sm font-semibold text-slate-200">Email<input name="email" type="email" required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300" /></label><label className="block text-sm font-semibold text-slate-200">Password<input name="password" type="password" required minLength={8} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300" /></label><p className="text-xs text-slate-400">Use at least 8 characters, one number, and one symbol.</p>{state.error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{state.error}</p> : null}<Submit /></form>;
}
