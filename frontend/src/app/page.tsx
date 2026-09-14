import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/quizshield_logo.png"
              alt="QuizShield Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-md shadow-emerald-500/20"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              QuizShield
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sage-500 to-emerald-600 rounded-xl hover:from-sage-600 hover:to-emerald-700 transition-all duration-200 shadow-md shadow-sage-500/25 hover:shadow-lg hover:-translate-y-0.5"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center mesh-hero">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-[8%] w-72 h-72 bg-gradient-to-br from-sage-400/20 to-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-[10%] w-60 h-60 bg-gradient-to-br from-blue-400/15 to-indigo-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-[20%] w-48 h-48 bg-gradient-to-br from-purple-400/10 to-pink-500/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-[25%] w-56 h-56 bg-gradient-to-br from-sage-300/15 to-teal-400/10 rounded-full blur-3xl animate-float-slow" />

        {/* Geometric decorative shapes */}
        <div className="absolute top-32 right-[15%] hidden lg:block animate-float">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400/30 to-emerald-500/20 border border-sage-300/30 rotate-12 backdrop-blur-sm" />
        </div>
        <div className="absolute bottom-32 left-[12%] hidden lg:block animate-float-slow">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/25 to-indigo-500/15 border border-blue-300/30 backdrop-blur-sm" />
        </div>
        <div className="absolute top-48 left-[5%] hidden lg:block">
          <div className="w-3 h-3 rounded-full bg-sage-400/50 animate-pulse" />
        </div>
        <div className="absolute bottom-48 right-[8%] hidden lg:block">
          <div className="w-2 h-2 rounded-full bg-indigo-400/40 animate-pulse" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-sage-200/50 text-sm font-medium text-sage-700 shadow-lg shadow-sage-500/5 mb-8 animate-fade-in">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Built for focused studying
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-7 animate-fade-in-up">
              <span className="text-slate-900">Assess your</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                knowledge.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Track your progress.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              A secure, distraction-free quiz platform designed for your study
              group. Take assessments with confidence knowing every session is
              fair, focused, and properly evaluated.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white rounded-2xl transition-all duration-300 shadow-xl shadow-sage-500/30 hover:shadow-2xl hover:shadow-sage-500/40 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sage-500 via-emerald-500 to-teal-500 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-r from-sage-600 via-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Attempt Your Exam</span>
                <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-5 text-slate-600 text-lg font-semibold rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 hover:border-slate-300/50 transition-all duration-200 shadow-sm"
              >
                Learn more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 43C384 46 480 62 576 70C672 78 768 78 864 70C960 62 1056 46 1152 43C1248 40 1344 50 1392 55L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── LIVE INTEGRITY & DEFENSE PROTOCOLS BAR ─── */}
      <section className="relative bg-gradient-to-b from-white via-slate-50/50 to-white py-12 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Live System Indicator Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Examination Defense Engine: <span className="text-emerald-600">Active &amp; Monitoring</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
                🔒 Strict 1-Attempt Lock
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold">
                ⚡ Gmail Instant PIN
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold">
                ⚖️ 2nd Chance Appeal System
              </span>
            </div>
          </div>

          {/* 4 Interactive Capability Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1 — Unlimited Question Bank */}
            <div className="group relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Scalable
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Unlimited</p>
              <h3 className="text-sm font-bold text-slate-700 mt-1">Chapter Topic MCQs</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Modular question pools across all examination chapters with randomized options and instant scoring.
              </p>
            </div>

            {/* Card 2 — Gmail PIN */}
            <div className="group relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Automated
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">5-Digit PIN</p>
              <h3 className="text-sm font-bold text-slate-700 mt-1">Instant Gmail Verification</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Random bcrypt-hashed PIN keycards delivered directly to Gmail. Zero password fatigue.
              </p>
            </div>

            {/* Card 3 — Tab-Switch & Anti-Cheat */}
            <div className="group relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  Active Guard
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Real-Time</p>
              <h3 className="text-sm font-bold text-slate-700 mt-1">Tab &amp; Focus Sentinel</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Monitors window focus and tab switches with live violation warnings and auto-submission.
              </p>
            </div>

            {/* Card 4 — 2nd Chance Appeal */}
            <div className="group relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Fairness
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">2nd Chance</p>
              <h3 className="text-sm font-bold text-slate-700 mt-1">Dispute Resolution</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                1-click appeal requests with issue categorization and administrative attempt clearing.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-sage-100 text-sage-700 text-sm font-semibold mb-4">
              Platform Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Everything you need for
              <br />
              <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                fair assessments
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
              Designed with integrity at its core — every feature ensures a
              secure and equitable testing experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 — Secure Environment */}
            <div className="group relative bg-white rounded-3xl border border-slate-100 p-8 hover:border-sage-200/60 transition-all duration-500 hover:shadow-2xl hover:shadow-sage-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sage-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-400 to-emerald-500 mb-6 shadow-lg shadow-sage-500/20 group-hover:shadow-xl group-hover:shadow-sage-500/30 transition-shadow duration-500">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Secure Environment
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Each assessment is protected by strict anti-cheat measures. Switching tabs or
                  minimizing the window auto-submits your quiz, ensuring a fair environment for everyone.
                </p>
              </div>
            </div>

            {/* Feature 2 — Instant Evaluation */}
            <div className="group relative bg-white rounded-3xl border border-slate-100 p-8 hover:border-blue-200/60 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-shadow duration-500">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Instant Evaluation
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Get your score immediately after submission. See which questions you got right
                  and review correct answers to learn from mistakes.
                </p>
              </div>
            </div>

            {/* Feature 3 — Progress Tracking */}
            <div className="group relative bg-white rounded-3xl border border-slate-100 p-8 hover:border-purple-200/60 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-50/50 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 mb-6 shadow-lg shadow-purple-500/20 group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-shadow duration-500">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Progress Tracking
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Track your performance across assessments. Your dashboard shows pass/fail
                  status, score history, and detailed question-by-question reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-50/80 to-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-sage-100/30 to-blue-100/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Three simple steps
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Connecting line */}
            <div className="absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-sage-300 via-blue-300 to-purple-300 hidden md:block opacity-40" />

            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-emerald-500 text-white text-xl font-extrabold mb-6 shadow-lg shadow-sage-500/25 group-hover:shadow-xl group-hover:shadow-sage-500/35 group-hover:-translate-y-1 transition-all duration-300 z-10">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Sign In
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Enter your unique username and PIN to access your personal
                dashboard. No complex passwords to remember.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xl font-extrabold mb-6 shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/35 group-hover:-translate-y-1 transition-all duration-300 z-10">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Take Your Quiz
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Answer questions one at a time with a calm, focused interface.
                A countdown timer keeps you on track.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 text-white text-xl font-extrabold mb-6 shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/35 group-hover:-translate-y-1 transition-all duration-300 z-10">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Review Results
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                See your score instantly. Review each question to understand
                what you got right and where to improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2rem] overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sage-500 via-emerald-500 to-teal-500" />
            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(255,255,255,0.1),transparent_60%)]" />

            {/* Floating shapes */}
            <div className="absolute top-8 left-8 w-20 h-20 rounded-2xl bg-white/10 rotate-12 animate-float" />
            <div className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-white/10 animate-float-slow" />
            <div className="absolute top-1/2 right-[20%] w-6 h-6 rounded-full bg-white/20 animate-pulse" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
                Ready to begin?
              </h2>
              <p className="text-sage-100 text-lg mb-10 max-w-lg mx-auto">
                Log in now and start your assessment. Stay focused, stay calm, and do your best.
              </p>
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-sage-700 text-lg font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-2xl shadow-black/10 hover:shadow-3xl hover:-translate-y-1"
              >
                Attempt Your Exam
                <svg className="w-5 h-5 text-sage-500 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-50 border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/quizshield_logo.png"
                alt="QuizShield Logo"
                className="w-7 h-7 rounded-lg object-cover shadow-sm"
              />
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                QuizShield Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Designed for focused, fair assessments
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
