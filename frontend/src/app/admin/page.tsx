"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  adminListAttempts,
  adminResetAttempt,
  adminListQuizzes,
  adminCreateQuiz,
  adminDeleteQuiz,
  adminListQuestions,
  adminAddQuestion,
  adminBulkAddQuestions,
  adminDeleteQuestion,
  adminUpdateQuestion,
} from "@/lib/api";

interface Attempt {
  attemptId: number;
  userId: number;
  username: string;
  quizId: number;
  quizTitle: string;
  score: number;
  status: string;
  tabSwitches: number;
  createdAt: string;
}

interface Quiz {
  id: number;
  title: string;
  timeLimit: number;
  questionCount: number;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

type Tab = "attempts" | "quizzes";

export default function AdminPage() {
  const [adminPin, setAdminPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>("attempts");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ─── ATTEMPTS STATE ───
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [resetting, setResetting] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // ─── QUIZZES STATE ───
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTimeLimit, setNewTimeLimit] = useState(30);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<number | null>(null);

  // ─── QUESTIONS STATE ───
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [newQText, setNewQText] = useState("");
  const [newQOptions, setNewQOptions] = useState(["", "", "", ""]);
  const [newQCorrect, setNewQCorrect] = useState(1);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState<"single" | "bulk">("single");
  const [bulkAdding, setBulkAdding] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<number | null>(null);

  // ─── EDIT STATE ───
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState(["", "", "", ""]);
  const [editCorrect, setEditCorrect] = useState(1);
  const [savingEdit, setSavingEdit] = useState(false);

  // ─── AUTH ───
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await adminListAttempts(adminPin);
      setAuthenticated(true);
    } catch {
      setMessage({ type: "error", text: "Invalid admin PIN" });
    } finally {
      setLoading(false);
    }
  }

  // ─── ATTEMPTS ───
  async function loadAttempts() {
    try {
      const data = await adminListAttempts(adminPin);
      setAttempts(data);
    } catch {
      /* ignore */
    }
  }

  async function handleReset(username: string, quizId: number) {
    if (!confirm(`Clear attempt for "${username}" on quiz ${quizId}? They will be able to retake it.`)) return;
    setResetting(`${username}-${quizId}`);
    setMessage(null);
    try {
      const result = await adminResetAttempt(adminPin, username, quizId);
      setMessage({ type: "success", text: result.message });
      const data = await adminListAttempts(adminPin);
      setAttempts(data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reset" });
    } finally {
      setResetting(null);
    }
  }

  const filtered = attempts.filter(
    (a) =>
      a.username.toLowerCase().includes(filter.toLowerCase()) ||
      a.quizTitle.toLowerCase().includes(filter.toLowerCase())
  );

  // ─── QUIZZES ───
  const loadQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    try {
      const data = await adminListQuizzes(adminPin);
      setQuizzes(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load quizzes" });
    } finally {
      setQuizzesLoading(false);
    }
  }, [adminPin]);

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreatingQuiz(true);
    setMessage(null);
    try {
      await adminCreateQuiz(adminPin, newTitle.trim(), newTimeLimit);
      setMessage({ type: "success", text: `Quiz "${newTitle.trim()}" created!` });
      setNewTitle("");
      setNewTimeLimit(30);
      loadQuizzes();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create quiz" });
    } finally {
      setCreatingQuiz(false);
    }
  }

  async function handleDeleteQuiz(quizId: number, title: string) {
    if (!confirm(`Delete quiz "${title}" and ALL its questions? This cannot be undone.`)) return;
    setDeletingQuiz(quizId);
    setMessage(null);
    try {
      await adminDeleteQuiz(adminPin, quizId);
      setMessage({ type: "success", text: `Quiz "${title}" deleted` });
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
        setQuestions([]);
      }
      loadQuizzes();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete quiz" });
    } finally {
      setDeletingQuiz(null);
    }
  }

  // ─── QUESTIONS ───
  async function loadQuestions(quiz: Quiz) {
    setSelectedQuiz(quiz);
    setQuestionsLoading(true);
    setMessage(null);
    try {
      const data = await adminListQuestions(adminPin, quiz.id);
      setQuestions(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load questions" });
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQText.trim() || newQOptions.some((o) => !o.trim()) || !selectedQuiz) return;
    setAddingQuestion(true);
    setMessage(null);
    try {
      await adminAddQuestion(
        adminPin,
        selectedQuiz.id,
        newQText.trim(),
        newQOptions.map((o) => o.trim()),
        newQCorrect
      );
      setMessage({ type: "success", text: "Question added!" });
      setNewQText("");
      setNewQOptions(["", "", "", ""]);
      setNewQCorrect(1);
      loadQuestions(selectedQuiz);
      loadQuizzes();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add question" });
    } finally {
      setAddingQuestion(false);
    }
  }

  async function handleBulkAdd() {
    if (!bulkText.trim() || !selectedQuiz) return;
    setBulkAdding(true);
    setMessage(null);
    try {
      const parsed = parseBulkQuestions(bulkText);
      if (parsed.length === 0) {
        setMessage({ type: "error", text: "No valid questions found. Check the format below." });
        setBulkAdding(false);
        return;
      }
      await adminBulkAddQuestions(adminPin, selectedQuiz.id, parsed);
      setMessage({ type: "success", text: `${parsed.length} questions added!` });
      setBulkText("");
      loadQuestions(selectedQuiz);
      loadQuizzes();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to bulk add" });
    } finally {
      setBulkAdding(false);
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm("Delete this question?")) return;
    setDeletingQuestion(questionId);
    setMessage(null);
    try {
      await adminDeleteQuestion(adminPin, questionId);
      setMessage({ type: "success", text: "Question deleted" });
      if (selectedQuiz) {
        loadQuestions(selectedQuiz);
        loadQuizzes();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete question" });
    } finally {
      setDeletingQuestion(null);
    }
  }

  // ─── EDIT QUESTION ───
  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditText(q.text);
    setEditOptions([...q.options]);
    setEditCorrect(q.correctAnswer);
  }

  async function saveEdit(questionId: number) {
    if (!editText.trim() || editOptions.some((o) => !o.trim())) return;
    setSavingEdit(true);
    setMessage(null);
    try {
      await adminUpdateQuestion(adminPin, questionId, {
        text: editText.trim(),
        options: editOptions.map((o) => o.trim()),
        correctAnswer: editCorrect,
      });
      setMessage({ type: "success", text: "Question updated!" });
      setEditingId(null);
      if (selectedQuiz) loadQuestions(selectedQuiz);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update question" });
    } finally {
      setSavingEdit(false);
    }
  }

  // Load quizzes on tab switch
  useEffect(() => {
    if (authenticated && tab === "quizzes") {
      loadQuizzes();
    }
    if (authenticated && tab === "attempts") {
      loadAttempts();
    }
  }, [authenticated, tab, loadQuizzes]);

  // ─── BULK PARSER ───
  function parseBulkQuestions(text: string): Array<{ text: string; options: string[]; correctAnswer: number }> {
    const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
    const questions: Array<{ text: string; options: string[]; correctAnswer: number }> = [];

    for (const block of blocks) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;

      // First line is the question text (may start with Q: or a number)
      const textLine = lines[0].replace(/^(Q\d*[:.)\s-]+|\d+[.)]\s*)/i, "").trim();

      // Find options (lines starting with A/B/C/D or 1/2/3/4 or a/b/c/d)
      const optionLines: string[] = [];
      let correctLine = "";

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const isOption = /^[A-Da-d][\s).:-]/.test(line) || /^[1-4][\s).:-]/.test(line);
        const isAnswer = /^answer\s*[:=-]/i.test(line);

        if (isAnswer) {
          correctLine = line;
        } else if (isOption) {
          optionLines.push(line.replace(/^([A-Da-d1-4][\s).:-]\s*)/, "").trim());
        }
      }

      if (optionLines.length < 4) continue;

      // Determine correct answer
      let correct = 1;
      if (correctLine) {
        const match = correctLine.match(/[:=-]\s*([A-Da-d1-4])/i);
        if (match) {
          const letter = match[1].toUpperCase();
          correct = letter.charCodeAt(0) - 64; // A=1, B=2, C=3, D=4
        }
      }

      questions.push({
        text: textLine,
        options: optionLines.slice(0, 4),
        correctAnswer: correct,
      });
    }

    return questions;
  }

  // ─── LOGIN SCREEN ───
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">Admin Panel</h1>
            <p className="text-sm text-slate-500 mt-1">Enter admin PIN to manage quizzes and attempts</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            {message && (
              <div className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {message.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin PIN</label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                placeholder="Enter admin PIN"
                autoFocus
                maxLength={100}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !adminPin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Access Admin Panel"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ─── ADMIN DASHBOARD ───
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-800">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-500 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              ← Dashboard
            </Link>
            <button
              onClick={() => {
                setAuthenticated(false);
                setAttempts([]);
                setQuizzes([]);
                setQuestions([]);
                setSelectedQuiz(null);
                setAdminPin("");
                setTab("attempts");
              }}
              className="text-sm font-semibold text-slate-400 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {([["attempts", "Assessments"], ["quizzes", "Quizzes"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === key
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ═══════ ATTEMPTS TAB ═══════ */}
        {tab === "attempts" && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">All Attempts</h2>
                <p className="text-sm text-slate-500 mt-0.5">{attempts.length} total · {attempts.filter(a => a.status === "passed").length} passed</p>
              </div>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by user or quiz..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm w-full sm:w-72 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-sm text-slate-500">No attempts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left px-5 py-3 font-semibold text-slate-600">User</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Quiz</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-600">Score</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-600">Status</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-600">Tab Switches</th>
                        <th className="text-right px-5 py-3 font-semibold text-slate-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((a) => {
                        const isPassed = a.status === "passed" || a.score >= 75;
                        const key = `${a.username}-${a.quizId}`;
                        return (
                          <tr key={a.attemptId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-slate-800">{a.username}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">{a.quizTitle}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="font-bold text-slate-800">{a.score.toFixed(0)}%</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isPassed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {isPassed ? "Passed" : "Not Passed"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`font-bold ${
                                a.tabSwitches >= 2 ? "text-red-600" : a.tabSwitches > 0 ? "text-amber-600" : "text-slate-400"
                              }`}>
                                {a.tabSwitches}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleReset(a.username, a.quizId)}
                                disabled={resetting === key}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg border border-red-200/50 hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50"
                              >
                                {resetting === key ? (
                                  <>
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Resetting...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════ QUIZZES TAB ═══════ */}
        {tab === "quizzes" && (
          <>
            {/* Create Quiz */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-800 mb-4">Create New Quiz</h2>
              <form onSubmit={handleCreateQuiz} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Quiz title (e.g. Mathematics 101)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  maxLength={100}
                  required
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Time:</label>
                  <input
                    type="number"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    min={1}
                    max={300}
                    className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                  <span className="text-sm text-slate-500">min</span>
                </div>
                <button
                  type="submit"
                  disabled={creatingQuiz || !newTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {creatingQuiz ? "Creating..." : "+ Create Quiz"}
                </button>
              </form>
            </div>

            {/* Quiz List */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-extrabold text-slate-800">All Quizzes</h2>
                <p className="text-sm text-slate-500 mt-0.5">{quizzes.length} quizzes</p>
              </div>
              {quizzesLoading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-500 mt-3">Loading quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-sm text-slate-500">No quizzes yet. Create one above!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {quizzes.map((q) => (
                    <div key={q.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800">{q.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-semibold text-slate-500">
                              {q.timeLimit} min
                            </span>
                            <span className="text-xs font-semibold text-emerald-600">
                              {q.questionCount} question{q.questionCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadQuestions(q)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/50 hover:bg-amber-100 transition-all"
                          >
                            Manage Questions
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(q.id, q.title)}
                            disabled={deletingQuiz === q.id}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200/50 hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            {deletingQuiz === q.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ═══════ QUESTION MANAGER ═══════ */}
            {selectedQuiz && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">
                      Questions: {selectedQuiz.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">{questions.length} questions</p>
                  </div>
                  <button
                    onClick={() => { setSelectedQuiz(null); setQuestions([]); }}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Existing Questions */}
                <div className="px-6 py-4 border-b border-slate-100">
                  {questionsLoading ? (
                    <div className="py-8 text-center">
                      <div className="w-6 h-6 border-2 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-slate-500 mt-2">Loading questions...</p>
                    </div>
                  ) : questions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No questions yet. Add some below!</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {questions.map((q, idx) => {
                        const isEditing = editingId === q.id;
                        return (
                          <div key={q.id} className={`p-3 rounded-xl border transition-all ${
                            isEditing ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200/50"
                          }`}>
                            {isEditing ? (
                              /* ── EDIT FORM ── */
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                                  maxLength={500}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  {editOptions.map((opt, oi) => (
                                    <div key={oi} className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                        {["A", "B", "C", "D"][oi]}
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const copy = [...editOptions];
                                          copy[oi] = e.target.value;
                                          setEditOptions(copy);
                                        }}
                                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                                        maxLength={200}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-600">Correct:</span>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4].map((n) => (
                                        <button
                                          key={n}
                                          type="button"
                                          onClick={() => setEditCorrect(n)}
                                          className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                                            editCorrect === n
                                              ? "bg-emerald-500 text-white shadow-sm"
                                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                          }`}
                                        >
                                          {["A", "B", "C", "D"][n - 1]}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => saveEdit(q.id)}
                                      disabled={savingEdit || !editText.trim() || editOptions.some((o) => !o.trim())}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50"
                                    >
                                      {savingEdit ? "Saving..." : "Save"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* ── VIEW MODE ── */
                              <div className="flex items-start gap-3">
                                <span className="text-xs font-bold text-slate-400 mt-1 w-6 shrink-0">
                                  {idx + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">{q.text}</p>
                                  <div className="grid grid-cols-2 gap-1 mt-2">
                                    {q.options.map((opt, oi) => (
                                      <span
                                        key={oi}
                                        className={`text-xs px-2 py-1 rounded-lg ${
                                          oi + 1 === q.correctAnswer
                                            ? "bg-emerald-100 text-emerald-700 font-bold"
                                            : "bg-white text-slate-600 border border-slate-200"
                                        }`}
                                      >
                                        {["A", "B", "C", "D"][oi]}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => startEdit(q)}
                                    className="p-1.5 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                    title="Edit question"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    disabled={deletingQuestion === q.id}
                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                                    title="Delete question"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mode Toggle */}
                <div className="px-6 pt-4 flex gap-2">
                  <button
                    onClick={() => setBulkMode("single")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      bulkMode === "single"
                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    + Add One Question
                  </button>
                  <button
                    onClick={() => setBulkMode("bulk")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      bulkMode === "bulk"
                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    + Bulk Add
                  </button>
                </div>

                {/* Single Question Form */}
                {bulkMode === "single" && (
                  <form onSubmit={handleAddQuestion} className="px-6 pb-6 pt-4 space-y-4">
                    <input
                      type="text"
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      placeholder="Question text"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                      maxLength={500}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {newQOptions.map((opt, i) => (
                        <div key={i} className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {["A", "B", "C", "D"][i]}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const copy = [...newQOptions];
                              copy[i] = e.target.value;
                              setNewQOptions(copy);
                            }}
                            placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                            maxLength={200}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-slate-600">Correct answer:</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNewQCorrect(n)}
                            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                              newQCorrect === n
                                ? "bg-emerald-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {["A", "B", "C", "D"][n - 1]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={addingQuestion || !newQText.trim() || newQOptions.some((o) => !o.trim())}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {addingQuestion ? "Adding..." : "+ Add Question"}
                    </button>
                  </form>
                )}

                {/* Bulk Paste Form */}
                {bulkMode === "bulk" && (
                  <div className="px-6 pb-6 pt-4 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 mb-2">Paste format (double newline between questions):</h3>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
{`What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B

What is the capital of France?
A. London
B. Berlin
C. Paris
D. Madrid
Answer: C`}
                      </pre>
                    </div>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`Paste questions here...\n\nQuestion text\nA. Option 1\nB. Option 2\nC. Option 3\nD. Option 4\nAnswer: B`}
                      className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-y"
                    />
                    <button
                      onClick={handleBulkAdd}
                      disabled={bulkAdding || !bulkText.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {bulkAdding ? "Adding..." : `+ Add All Questions`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
