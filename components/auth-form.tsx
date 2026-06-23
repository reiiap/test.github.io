"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ApiResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  devOtp?: string;
};

async function readJsonSafely(response: Response): Promise<ApiResult> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as ApiResult;
  } catch (error) {
    console.error("[auth-form] Server returned non-JSON response", { status: response.status, text, error });
    return { error: "Server returned an invalid response. Please check deployment logs." };
  }
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.get("name"), email, password }),
        });
        const json = await readJsonSafely(response);
        if (!response.ok) throw new Error(json.error ?? "Registration failed.");
        toast.success(json.message ?? "Account created");
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Invalid email or password");

      toast.success("Welcome back");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8">
      <h1 className="text-3xl font-black">{mode === "login" ? "Welcome back" : "Create your studio account"}</h1>
      <p className="muted mt-2">Secure access with Google OAuth or email credentials.</p>
      <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn btn-primary mt-6 w-full">
        Continue with Google
      </button>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && <input className="input" name="name" placeholder="Name" required minLength={2} />}
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Password" required minLength={8} />
        <button disabled={loading} className="btn btn-secondary w-full">
          {loading ? "Securing session…" : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <PhoneOtp />
    </div>
  );
}

function PhoneOtp() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState("");

  async function requestOtp() {
    const response = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await readJsonSafely(response);
    if (response.ok) {
      setDevOtp(json.devOtp ?? "");
      toast.success("OTP generated");
    } else {
      toast.error(json.error ?? "Failed to generate OTP");
    }
  }

  async function verifyOtp() {
    const result = await signIn("phone-otp", { phone, code, redirect: false });
    if (result?.error) {
      toast.error("OTP is invalid or expired");
    } else {
      toast.success("Phone session started");
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-6">
      <p className="text-sm font-bold">Phone OTP</p>
      <div className="mt-3 grid gap-3">
        <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 0100" />
        <button className="btn btn-secondary" onClick={requestOtp}>
          Send OTP
        </button>
        {devOtp && <p className="text-xs text-amber-300">Development OTP: {devOtp}</p>}
        <input className="input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="6-digit code" />
        <button className="btn btn-primary" onClick={verifyOtp}>
          Verify phone
        </button>
      </div>
    </div>
  );
}
