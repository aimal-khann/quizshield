"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { finishQuiz, getQuizQuestions, getQuizInfo } from "@/lib/api";
import Timer from "@/components/Timer";

interface Question {
  id: number;
  text: string;
  options: string[];
}

const COOLDOWN_SECONDS = 5;
const STORAGE_KEY_PREFIX = "quizshield_quiz_";

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const quizId = Number(resolvedParams.id);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLimit, setTimeLimit] = useState(300);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  // ─── LOCALSTORAGE HELPERS ───
  const storageKey = `${STORAGE_KEY_PREFIX}${quizId}`;

  function saveToStorage(data: {
    answers: Record<number, number>;
    currentIndex: number;
    tabSwitchCount: number;
    timeRemaining: number;
  }) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as {
        answers: Record<number, number>;
        currentIndex: number;
        tabSwitchCount: number;
        timeRemaining: number;
      };
    } catch {
      return null;
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }

  // ─── BUILD BATCH ANSWERS ARRAY ───
  function buildBatchAnswers(): Array<{ questionId: number; selectedOption: number }> {
    const batch: Array<{ questionId: number; selectedOption: number }> = [];
    for (const [qIndex, optionIndex] of Object.entries(answers)) {
      const qIdx = Number(qIndex);
      if (questions[qIdx]) {
        // optionIndex is 0-based, backend expects 1-based
        batch.push({
          questionId: questions[qIdx].id,
          selectedOption: optionIndex + 1,
        });
      }
    }
    return batch;
  }

  // ─── LOAD QUIZ ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (isNaN(quizId) || quizId <= 0) {
      router.push("/dashboard");
      return;
    }
    loadQuizData(token);
  }, [quizId]);

  async function loadQuizData(token: string) {
    try {
      const [quizInfo, quizQuestions] = await Promise.all([
        getQuizInfo(token, quizId),
        getQuizQuestions(token, quizId),
      ]);
      setTimeLimit(quizInfo.timeLimit);
      setQuestions(quizQuestions);
      setQuizTitle(quizInfo.title);

      // Restore from localStorage if available
      const saved = loadFromStorage();
      if (saved && saved.timeRemaining > 0) {
        setAnswers(saved.answers);
        setCurrentIndex(saved.currentIndex);
        setTabSwitchCount(saved.tabSwitchCount);
        setTimeRemaining(saved.timeRemaining);
      } else {
        setTimeRemaining(quizInfo.timeLimit);
      }
    } catch (err) {
      console.error("Failed to load quiz", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  // ─── ANTI-CHEAT: TAB SWITCH HANDLER (LOCAL ONLY) ───
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && !submitted && !locked) {
        handleTabSwitch();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitted, locked, tabSwitchCount]);

  function handleTabSwitch() {
    if (submitted || locked) return;

    const newCount = tabSwitchCount + 1;
    setTabSwitchCount(newCount);

    if (newCount >= 2) {
      // 2nd switch: auto-submit immediately
      setShowWarning(false);
      handleAutoSubmit();
    } else {
      // 1st switch: show warning
      setShowWarning(true);
    }
  }

  // ─── TIMER COUNTDOWN ───
  useEffect(() => {
    if (timeRemaining <= 0 || locked) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked, submitted]);

  // ─── COOLDOWN TIMER ───
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [cooldown > 0]);

  // ─── AUTO-SUBMIT (TAB SWITCH x2 or TIMER EXPIRY) ───
  async function handleAutoSubmit() {
    if (submitted || locked) return;
    setSubmitting(true);
    setShowWarning(false);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const batchAnswers = buildBatchAnswers();
      const res = await finishQuiz(token, quizId, batchAnswers, tabSwitchCount);
      setResult({
        score: res.score,
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions,
      });
      setSubmitted(true);
      setLocked(true);
      clearStorage();
    } catch (err) {
      console.error("Auto-submit error", err);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── NEXT QUESTION (NO API CALL — LOCAL ONLY) ───
  function handleNext() {
    if (cooldown > 0) return;

    if (currentIndex >= questions.length - 1) {
      handleFinish();
      return;
    }

    // Save current progress to localStorage
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCooldown(COOLDOWN_SECONDS);
    saveToStorage({
      answers,
      currentIndex: nextIndex,
      tabSwitchCount,
      timeRemaining,
    });
  }

  // ─── FINISH (BATCH SUBMIT ALL ANSWERS) ───
  async function handleFinish() {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmitting(true);
    try {
      const batchAnswers = buildBatchAnswers();
      const res = await finishQuiz(token, quizId, batchAnswers, tabSwitchCount);
      setResult({
        score: res.score,
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions,
      });
      setSubmitted(true);
      setLocked(true);
      clearStorage();
    } catch (err) {
      console.error("Finish error", err);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── SELECT OPTION (LOCAL ONLY) ───
  function handleSelectOption(optionIndex: number) {
    if (locked) return;
    const newAnswers = { ...answers, [currentIndex]: optionIndex };
    setAnswers(newAnswers);
    // Persist to localStorage on every selection
    saveToStorage({
      answers: newAnswers,
      currentIndex,
      tabSwitchCount,
      timeRemaining,
    });
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const answered = answers[currentIndex] !== undefined;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium">Loading assessment...</p>
        </div>
      </main>
    );
  }

  // ─── NO QUESTION STATE ───
  if (!currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-4">Unable to load quiz</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // ─── RESULT STATE ───
  if (submitted && result) {
    const isPassed = result.score >= 75;
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center animate-fade-in">
          <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
            isPassed
              ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/20"
              : "bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/20"
          }`}>
            {isPassed ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Assessment Complete</h2>
          <p className="text-sm text-slate-500 mb-6">{quizTitle}</p>
          <div className="mb-8">
            <span className={`text-6xl font-extrabold ${isPassed ? "text-emerald-600" : "text-amber-500"}`}>
              {result.score.toFixed(0)}%
            </span>
            <p className="text-sm text-slate-500 mt-2">
              {result.correctCount} of {result.totalQuestions} correct
            </p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
              isPassed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {isPassed ? "Passed ✓" : "Not Passed"}
            </span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // ─── QUIZ ACTIVE STATE ───
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col">
      {/* ─── TAB SWITCH WARNING MODAL ─── */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-amber-200 shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">⚠️ Warning!</h3>
            <p className="text-sm text-slate-600 mb-2">
              Tab switching detected during your assessment.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-bold text-amber-700">
                This is your final warning.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                The next tab switch will automatically submit your exam.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all duration-200"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="glass border-b border-white/30 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-700">{quizTitle}</span>
              <p className="text-xs text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {tabSwitchCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Warning {tabSwitchCount}/2
              </span>
            )}
            <Timer timeLimit={timeLimit} initialRemaining={timeRemaining} />
            <button
              onClick={() => {
                if (confirm("Are you sure you want to exit? Your selected answers will still be submitted.")) {
                  handleFinish();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-200/50 hover:bg-red-100 hover:border-red-300 transition-all"
            >
              Exit Quiz
            </button>
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/50 p-6 sm:p-8 animate-fade-in">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Progress</span>
              <span className="text-xs font-bold text-emerald-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question number badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Question {currentIndex + 1}
          </div>

          {/* Question text */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={locked}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 group ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-50/80 text-emerald-800 shadow-sm shadow-emerald-500/10"
                      : "border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50/50"
                  } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}>
                    {isSelected ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Next / Submit button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!answered || submitting || locked || cooldown > 0}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : cooldown > 0 ? (
                <>
                  Next ({cooldown}s)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              ) : isLastQuestion ? (
                <>
                  Submit Assessment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : (
                <>
                  Next Question
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
