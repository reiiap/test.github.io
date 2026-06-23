"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

type LoginValues = { email: string; password: string };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginValues>();

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">{params.get("registered") ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">Account created. Sign in to continue.</p> : null}<label className="block text-sm font-semibold text-slate-200">Email<input type="email" required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300" {...register("email", { required: true })} /></label><label className="block text-sm font-semibold text-slate-200">Password<input type="password" required className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300" {...register("password", { required: true })} /></label>{error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}<Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button></form>;
}
