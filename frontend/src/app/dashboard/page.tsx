"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getQuizzes, getDashboard, startQuiz, requestQuizRetake, QuizItem } from "@/lib/api";

interface HistoryEntry {
  quizId: number;
  quizTitle: string;
  score: number;
  percentage: number;
  status: string;
  completedAt: string;
  answers: Array<{
    questionId: number;
    questionText: string;
    options?: string[];
    selectedOption: number;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}

interface UserInfo {
  id: number;
  username: string;
}

// ─── ANIMATED COUNTER HOOK ─────────────────────────────────────
function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// ─── SVG PROGRESS RING ─────────────────────────────────────────
function ProgressRing({
  value,
  size = 64,
  stroke = 5,
  color = "emerald",
  textColor,
  trackColor,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  textColor?: string;
  trackColor?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const formattedValue = Number(value.toFixed(2));

  const colorMap: Record<string, { stroke: string; text: string }> = {
    emerald: { stroke: "stroke-emerald-500", text: "text-emerald-600" },
    blue: { stroke: "stroke-blue-500", text: "text-blue-600" },
    purple: { stroke: "stroke-purple-500", text: "text-purple-600" },
    amber: { stroke: "stroke-amber-500", text: "text-amber-600" },
    white: { stroke: "stroke-white", text: "text-white" },
  };
  const c = colorMap[color] || colorMap.emerald;
  const textCls = textColor || c.text;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackColor || "text-slate-100"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${c.stroke} transition-all duration-1000 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`${
            size < 50 ? "text-xs" : size >= 80 ? "text-base" : "text-sm"
          } font-extrabold ${textCls}`}
        >
          {formattedValue}%
        </span>
      </div>
    </div>
  );
}

// ─── SCORE BAR ─────────────────────────────────────────────────
function ScoreBar({ percentage }: { percentage: number }) {
  const isPassed = percentage >= 75;
  const formattedPercentage = Number(percentage.toFixed(2));
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isPassed
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : "bg-gradient-to-r from-amber-400 to-orange-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-xs font-bold tabular-nums ${
          isPassed ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {formattedPercentage}%
      </span>
    </div>
  );
}

// ─── GREETING HELPER ───────────────────────────────────────────
function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "🌅" };
  if (h < 17) return { text: "Good afternoon", emoji: "☀️" };
  return { text: "Good evening", emoji: "🌙" };
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [startingQuiz, setStartingQuiz] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"quizzes" | "history">("quizzes");

  // Retake modal state
  const [retakeModalQuiz, setRetakeModalQuiz] = useState<QuizItem | null>(null);
  const [retakeCategory, setRetakeCategory] = useState("technical");
  const [retakeReason, setRetakeReason] = useState("");
  const [submittingRetake, setSubmittingRetake] = useState(false);
  const [retakeSuccessNotice, setRetakeSuccessNotice] = useState<string | null>(null);
  const [retakeError, setRetakeError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboard(token);
  }, [router]);

  async function loadDashboard(token: string) {
    try {
      const [quizData, dashData] = await Promise.all([
        getQuizzes(token),
        getDashboard(token),
      ]);
      setQuizzes(quizData);
      setHistory(
        (dashData.history || []).map((h) => ({
          ...h,
          percentage: Number(h.percentage.toFixed(2)),
        }))
      );
      setUser(dashData.user);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    router.push("/");
  }

  async function handleStartQuiz(quizId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setStartingQuiz(quizId);
    try {
      const { attemptId } = await startQuiz(token, quizId);
      router.push(`/quiz/${quizId}?attemptId=${attemptId}`);
    } catch (err) {
      console.error("Failed to start quiz", err);
      setStartingQuiz(null);
    }
  }

  function handleViewHistory(quizId: number) {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  }

  // ─── RETAKE SUBMISSION ───
  async function handleSubmitRetake(e: React.FormEvent) {
    e.preventDefault();
    if (!retakeModalQuiz) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setRetakeError(null);
    setSubmittingRetake(true);

    try {
      const res = await requestQuizRetake(token, retakeModalQuiz.id, retakeCategory, retakeReason);
      setRetakeSuccessNotice(res.message || "2nd chance request submitted successfully!");
      // Reload dashboard
      await loadDashboard(token);
      setTimeout(() => {
        setRetakeModalQuiz(null);
        setRetakeReason("");
        setRetakeSuccessNotice(null);
      }, 2000);
    } catch (err: any) {
      setRetakeError(err?.message || "Failed to submit retake request.");
    } finally {
      setSubmittingRetake(false);
    }
  }

  // ─── COMPUTED STATS ───
  const completedCount = history.length;
  const passedCount = history.filter(
    (h) => h.status === "Passed" || h.percentage >= 75
  ).length;
  const avgScore =
    history.length > 0
      ? history.reduce((sum, h) => sum + h.percentage, 0) / history.length
      : 0;
  const passRate = completedCount > 0 ? (passedCount / completedCount) * 100 : 0;
  const availableQuizzes = quizzes.filter((q) => q.canStart).length;
  const greeting = getGreeting();

  // ─── ANIMATED COUNTERS ───
  const animAvailable = useAnimatedCounter(availableQuizzes, 600);
  const animCompleted = useAnimatedCounter(completedCount, 700);
  const animAvgScore = useAnimatedCounter(Math.round(avgScore), 800);
  const animPassRate = useAnimatedCounter(Math.round(passRate), 900);

  // Word & Character count calculation for retake textarea
  const retakeWords = retakeReason.trim().split(/\s+/).filter(Boolean).length;
  const retakeChars = retakeReason.length;
  const isReasonTooLong = retakeChars > 1000 || retakeWords > 200;

  // ─── LOADING SKELETON ───
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="h-16 bg-white/60 backdrop-blur-sm border-b border-white/30 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 glass border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/quizshield_logo.png"
              alt="QuizShield Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              QuizShield
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:border-emerald-200/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-700">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200/50 transition-all duration-200"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ─── WELCOME HERO ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 sm:p-10 text-white shadow-xl shadow-emerald-600/15">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">
                {greeting.emoji} {greeting.text}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                Welcome back, <span className="text-white/90">{user?.username}</span>
              </h1>
              <p className="text-emerald-100/80 text-sm sm:text-base max-w-md">
                {availableQuizzes > 0
                  ? `You have ${availableQuizzes} assessment${
                      availableQuizzes > 1 ? "s" : ""
                    } waiting for you. Single-attempt rule active.`
                  : "You've completed all current chapter quizzes. Great work! 🎉"}
              </p>
            </div>
            {completedCount > 0 && (
              <div className="flex-shrink-0">
                <ProgressRing
                  value={Math.round(avgScore)}
                  size={80}
                  stroke={6}
                  color="white"
                  textColor="text-white"
                  trackColor="text-white/20"
                />
              </div>
            )}
          </div>
        </div>

        {/* ─── STATS CARDS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Available",
              value: animAvailable,
              suffix: "",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              ),
              gradient: "from-emerald-500 to-teal-500",
              ringColor: "emerald",
            },
            {
              label: "Completed",
              value: animCompleted,
              suffix: "",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              gradient: "from-blue-500 to-indigo-500",
              ringColor: "blue",
            },
            {
              label: "Avg Score",
              value: animAvgScore,
              suffix: "%",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              gradient: "from-purple-500 to-pink-500",
              ringColor: "purple",
            },
            {
              label: "Pass Rate",
              value: animPassRate,
              suffix: "%",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ),
              gradient: "from-amber-500 to-orange-500",
              ringColor: "amber",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md`}
                >
                  {stat.icon}
                </div>
                <div className="w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ProgressRing value={stat.value} size={40} stroke={3} color={stat.ringColor} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800">
                {stat.value}
                {stat.suffix}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ─── TAB NAVIGATION ─── */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-100 w-fit">
          {[
            { key: "quizzes" as const, label: "Assessments", count: availableQuizzes },
            { key: "history" as const, label: "History", count: completedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {activeTab === tab.key && (
                <div className="absolute inset-0 bg-emerald-50 rounded-lg border border-emerald-200/50" />
              )}
              <span className="relative">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`relative inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    activeTab === tab.key
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── QUIZZES TAB ─── */}
        {activeTab === "quizzes" && (
          <section className="animate-fade-in">
            {quizzes.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-100 p-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No assessments yet</h3>
                <p className="text-sm text-slate-500">Check back soon for new assessments</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {quizzes.map((quiz, i) => {
                  const quizHistory = history.find((h) => h.quizId === quiz.id);
                  const attemptScore = quiz.attempt ? quiz.attempt.score : quizHistory?.percentage ?? 0;
                  const hasAttempt = !quiz.canStart || Boolean(quiz.attempt);
                  const retakeStatus = quiz.retakeRequest?.status;

                  return (
                    <div
                      key={quiz.id}
                      className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-emerald-200/60 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {/* Left accent bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          quiz.canStart
                            ? "bg-gradient-to-b from-emerald-400 to-teal-500"
                            : "bg-gradient-to-b from-blue-400 to-indigo-500"
                        }`}
                      />

                      <div className="p-6 pl-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                              quiz.canStart
                                ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/15"
                                : "bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/15"
                            }`}
                          >
                            {quiz.canStart ? (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-lg truncate">{quiz.title}</h3>
                            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {quiz.questionCount} Questions
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {Math.round(quiz.timeLimit / 60)} min
                              </span>
                              {hasAttempt && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                                    attemptScore >= 75
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  Score: {Number(attemptScore.toFixed(1))}%
                                </span>
                              )}
                              {quiz.attempt && quiz.attempt.tabSwitches > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-xs font-bold text-rose-700">
                                  ⚠️ {quiz.attempt.tabSwitches} tab switches
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons & 2nd chance request handling */}
                        <div className="flex-shrink-0 flex items-center gap-3 flex-wrap">
                          {quiz.canStart ? (
                            <button
                              onClick={() => handleStartQuiz(quiz.id)}
                              disabled={startingQuiz === quiz.id}
                              className="group/btn relative inline-flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60"
                            >
                              {startingQuiz === quiz.id ? (
                                <>
                                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                  </svg>
                                  Starting...
                                </>
                              ) : (
                                <>
                                  Start Quiz
                                  <svg
                                    className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                  </svg>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              <ScoreBar percentage={attemptScore} />

                              {/* Retake status badge or Request button */}
                              {retakeStatus === "pending" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                                  <span className="animate-pulse">⏳</span> 2nd Chance Pending Review
                                </span>
                              ) : retakeStatus === "declined" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRetakeModalQuiz(quiz);
                                    setRetakeReason("");
                                    setRetakeError(null);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                >
                                  ❌ Declined · Re-Appeal
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRetakeModalQuiz(quiz);
                                    setRetakeReason("");
                                    setRetakeError(null);
                                  }}
                                  className="group/req inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 shadow-sm hover:shadow transition-all"
                                >
                                  <span>🔄</span> Request 2nd Chance
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── HISTORY TAB ─── */}
        {activeTab === "history" && (
          <section className="animate-fade-in">
            {history.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-100 p-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No history yet</h3>
                <p className="text-sm text-slate-500">Complete an assessment to see your results here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry, i) => {
                  const scorePercentage = Number(entry.percentage.toFixed(2));
                  const isPassed = entry.status === "Passed" || scorePercentage >= 75;
                  const isExpanded = expandedQuiz === entry.quizId;

                  return (
                    <div
                      key={entry.quizId}
                      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200/60 hover:shadow-lg transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div
                        className="p-5 flex items-center justify-between cursor-pointer"
                        onClick={() => handleViewHistory(entry.quizId)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                              isPassed
                                ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/15"
                                : "bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-500/15"
                            }`}
                          >
                            {isPassed ? (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{entry.quizTitle}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {new Date(entry.completedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <ProgressRing
                              value={scorePercentage}
                              size={48}
                              stroke={3}
                              color={isPassed ? "emerald" : "amber"}
                            />
                          </div>
                          <svg
                            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expandable answers */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white p-5 animate-slideDown">
                          <div className="flex items-center gap-2 mb-4">
                            <div
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isPassed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {isPassed ? "✓ Passed" : "✗ Not Passed"}
                            </div>
                            <span className="text-xs text-slate-500">
                              {entry.answers.filter((a) => a.isCorrect).length}/{entry.answers.length} correct
                            </span>
                          </div>
                          <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white divide-y divide-slate-100">
                            {entry.answers.map((ans, idx) => (
                              <div key={ans.questionId} className="px-4 py-3 flex items-start gap-3">
                                <span
                                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    ans.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                                  }`}
                                >
                                  {ans.isCorrect ? "✓" : "✗"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-700 font-medium">
                                    <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                                    {ans.questionText}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {ans.options && ans.options.length > 0 ? (
                                      ans.options.map((opt, oi) => {
                                        const isCorrect = oi + 1 === ans.correctAnswer;
                                        const isSelected = oi + 1 === ans.selectedOption;
                                        return (
                                          <span
                                            key={oi}
                                            className={`text-[11px] px-2 py-0.5 rounded-md ${
                                              isCorrect
                                                ? "bg-emerald-100 text-emerald-700 font-bold"
                                                : isSelected
                                                ? "bg-red-100 text-red-600 font-bold"
                                                : "bg-slate-50 text-slate-400 border border-slate-200"
                                            }`}
                                          >
                                            {["A", "B", "C", "D"][oi] || oi + 1}. {opt}
                                            {isCorrect && " ✓"}
                                            {isSelected && !isCorrect && " ✗"}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span className="text-xs text-slate-500">
                                        Your answer: <span className="font-semibold text-slate-600">{ans.selectedOption}</span>
                                        <span className="mx-1">·</span>
                                        Correct: <span className="font-semibold text-emerald-600">{ans.correctAnswer}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ─── REQUEST 2ND CHANCE MODAL ─── */}
      {retakeModalQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">
                  🔄
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Request 2nd Chance</h3>
                  <p className="text-xs text-slate-500">{retakeModalQuiz.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRetakeModalQuiz(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {retakeSuccessNotice ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <h4 className="text-base font-bold text-slate-800">Request Submitted</h4>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">
                  {retakeSuccessNotice}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRetake} className="mt-4 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  QuizShield enforces 1 attempt per chapter quiz. If you experienced internet disconnectivity, browser failure, or accidental tab switching, please explain below for instructor review.
                </p>

                {/* Category selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Issue Category
                  </label>
                  <select
                    value={retakeCategory}
                    onChange={(e) => setRetakeCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="connectivity">Internet / WiFi Disconnection</option>
                    <option value="technical">Technical Glitch / Device Crash</option>
                    <option value="interrupted">Accidental Tab Switch / Disturbance</option>
                    <option value="other">Other Exceptional Reason</option>
                  </select>
                </div>

                {/* Reason textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Explanation (Optional)
                    </label>
                    <span
                      className={`text-xs ${
                        isReasonTooLong ? "text-rose-600 font-bold" : "text-slate-400"
                      }`}
                    >
                      {retakeWords}/200 words · {retakeChars}/1,000 chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={retakeReason}
                    onChange={(e) => setRetakeReason(e.target.value)}
                    placeholder="Briefly state what happened during your attempt..."
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      isReasonTooLong
                        ? "border-rose-400 focus:ring-rose-500/30"
                        : "border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {retakeError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    {retakeError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRetakeModalQuiz(null)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRetake || isReasonTooLong}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-600/20 transition-all"
                  >
                    {submittingRetake ? "Submitting Appeal..." : "Submit 2nd Chance Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
