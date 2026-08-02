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
    return { error: "Server mengembalikan respons tidak valid. Coba lagi sebentar." };
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
        if (!response.ok) throw new Error(json.error ?? "Pendaftaran gagal.");
        toast.success(json.message ?? "Akun berhasil dibuat");
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Email atau password tidak valid");

      toast.success("Selamat datang kembali");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Autentikasi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8">
      <h1 className="text-3xl font-black">{mode === "login" ? "Selamat datang kembali" : "Buat akun JvsB kamu"}</h1>
      <p className="muted mt-2">Akses aman dengan Google OAuth, email, atau OTP telepon.</p>
      <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn btn-primary mt-6 w-full">
        Lanjutkan dengan Google
      </button>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && <input className="input" name="name" placeholder="Nama" required minLength={2} />}
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Password" required minLength={8} />
        <button disabled={loading} className="btn btn-secondary w-full">
          {loading ? "Mengamankan sesi…" : mode === "login" ? "Login" : "Daftar"}
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
      toast.success("OTP dibuat");
    } else {
      toast.error(json.error ?? "Gagal membuat OTP");
    }
  }

  async function verifyOtp() {
    const result = await signIn("phone-otp", { phone, code, redirect: false });
    if (result?.error) {
      toast.error("OTP tidak valid atau kedaluwarsa");
    } else {
      toast.success("Sesi telepon dimulai");
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-6">
      <p className="text-sm font-bold">OTP Telepon</p>
      <div className="mt-3 grid gap-3">
        <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+62 812 3456 7890" />
        <button className="btn btn-secondary" onClick={requestOtp}>
          Kirim OTP
        </button>
        {devOtp && <p className="text-xs text-amber-300">OTP development: {devOtp}</p>}
        <input className="input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Kode 6 digit" />
        <button className="btn btn-primary" onClick={verifyOtp}>
          Verifikasi telepon
        </button>
      </div>
    </div>
  );
}
