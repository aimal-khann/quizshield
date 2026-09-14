"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, registerUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Sign In state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(username, pin);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.userId));
      localStorage.setItem("username", data.username);
      if (data.email) {
        localStorage.setItem("email", data.email);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid username or PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");

    const trimmedEmail = regEmail.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@gmail.com")) {
      setRegError("Only valid @gmail.com addresses are supported for community registration.");
      return;
    }

    setRegLoading(true);
    try {
      const res = await registerUser(regUsername.trim(), trimmedEmail);
      setRegSuccessMessage(
        res.message ||
          `Registration successful! Your 5-digit PIN has been emailed to ${trimmedEmail}.`
      );
      setUsername(regUsername.trim()); // Pre-fill login username
    } catch (err: any) {
      setRegError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* ─── LEFT PANEL — Decorative ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-600">
        {/* Mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(255,255,255,0.08),transparent_60%)]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Floating shapes */}
        <div className="absolute top-16 left-12 w-20 h-20 rounded-2xl bg-white/10 rotate-12 animate-float" />
        <div className="absolute bottom-24 right-16 w-16 h-16 rounded-full bg-white/10 animate-float-slow" />
        <div className="absolute top-1/3 right-20 w-10 h-10 rounded-xl bg-white/8 rotate-6 animate-float" />
        <div className="absolute bottom-1/3 left-20 w-8 h-8 rounded-full bg-white/10 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-12 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>

          <div className="space-y-6">
            <img
              src="/quizshield_logo.png"
              alt="QuizShield Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-2xl mb-2 border border-white/20"
            />

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Community
              <br />
              QuizShield
            </h1>

            <p className="text-emerald-100/80 text-lg leading-relaxed max-w-md">
              Secure exam platform with automated Gmail verification, single-attempt fairness, and appeal workflows.
            </p>

            {/* Feature bullets */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Automated 5-digit PIN sent directly to your Gmail
              </div>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Strict 1 attempt per chapter quiz
              </div>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                2nd Chance Appeal System for connection issues
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Auth Form ─── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile-only back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-8 transition-colors lg:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-6">
            <img
              src="/quizshield_logo.png"
              alt="QuizShield Logo"
              className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-emerald-500/20 mb-4"
            />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === "login" ? "Sign in to QuizShield" : "Join the Community"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {activeTab === "login"
                ? "Enter your registered username and 5-digit PIN"
                : "Register with your Gmail to receive your auto-generated PIN"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/70">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "login"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setRegError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "register"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
            {activeTab === "login" ? (
              /* ─── SIGN IN FORM ─── */
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setUsername(e.target.value)
                      }
                      placeholder="e.g. ali or teststudent"
                      required
                      autoComplete="username"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* PIN field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    5-Digit PIN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={pin}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPin(e.target.value)
                      }
                      placeholder="Enter 5-digit PIN"
                      required
                      maxLength={5}
                      autoComplete="current-password"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            ) : (
              /* ─── REGISTER FORM ─── */
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Choose Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. john_doe"
                      required
                      autoComplete="username"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email (@gmail.com strictly) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      required
                      autoComplete="email"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                    <span>✉️</span> Must be a valid <strong>@gmail.com</strong> address.
                  </p>
                </div>

                {/* Info Note */}
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 leading-relaxed">
                  Upon registration, a <strong>random 5-digit PIN</strong> will be automatically generated and emailed to your Gmail. You will use this PIN to log in.
                </div>

                {/* Error */}
                {regError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {regError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {regLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering & Sending PIN...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Register & Receive 5-Digit PIN
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Registration Success Modal */}
          {regSuccessMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                  📬
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Check Your Gmail!</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {regSuccessMessage}
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-500 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-emerald-500">✓</span> A secure 5-digit PIN was sent to your email.
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-emerald-500">✓</span> Check your inbox and spam / promotions folder.
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-emerald-500">✓</span> Enter your PIN in the Sign In form to log in.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRegSuccessMessage(null);
                    setActiveTab("login");
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
                >
                  Proceed to Sign In &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <p className="mt-6 text-xs text-center text-slate-400">
            Protected by anti-cheat measures. All activity is monitored.
          </p>
        </div>
      </div>
    </main>
  );
}
