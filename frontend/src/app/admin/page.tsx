"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  adminListAttempts,
  adminResetAttempt,
  adminListQuizzes,
  adminCreateQuiz,
  adminUpdateQuiz,
  adminDeleteQuiz,
  adminListQuestions,
  adminAddQuestion,
  adminBulkAddQuestions,
  adminDeleteQuestion,
  adminUpdateQuestion,
  adminListUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminUserResults,
  adminListRetakeRequests,
  adminApproveRetake,
  adminDeclineRetake,
  AdminRetakeRequestItem,
} from "@/lib/api";

// ─── TYPES ───────────────────────────────────────────────
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

interface User {
  id: number;
  username: string;
  email?: string;
  createdAt?: string;
  pin?: string;
  attemptCount: number;
  attempts: Array<{
    attemptId: number;
    quizId: number;
    quizTitle: string;
    score: number;
    status: string;
    tabSwitches: number;
    createdAt: string;
  }>;
}

interface UserResults {
  user: { id: number; username: string };
  attempts: Array<{
    attemptId: number;
    quizId: number;
    quizTitle: string;
    timeLimit: number;
    score: number;
    status: string;
    tabSwitches: number;
    startedAt: string;
    answers: Array<{
      questionId: number;
      questionText: string;
      options: string[];
      correctAnswer: number;
      selectedOption: number;
      isCorrect: boolean;
    }>;
  }>;
}

type Tab = "attempts" | "requests" | "quizzes" | "users";

// ─── ICONS ───────────────────────────────────────────────
const Icons = {
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  quiz: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  bulk: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
};

// ─── STAT CARD ───────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function AdminPage() {
  const [adminPin, setAdminPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>("attempts");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ATTEMPTS
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [resetting, setResetting] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // QUIZZES
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTimeLimit, setNewTimeLimit] = useState(30);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<number | null>(null);

  // QUESTIONS
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

  // EDIT
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState(["", "", "", ""]);
  const [editCorrect, setEditCorrect] = useState(1);
  const [savingEdit, setSavingEdit] = useState(false);

  // USERS
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPin, setNewUserPin] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userResults, setUserResults] = useState<UserResults | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("");

  // RETAKE / 2ND CHANCE APPEALS
  const [retakeRequests, setRetakeRequests] = useState<AdminRetakeRequestItem[]>([]);
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const [retakeFilter, setRetakeFilter] = useState("");

  // EDIT QUIZ MODAL
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editQuizTitle, setEditQuizTitle] = useState("");
  const [editQuizTimeLimit, setEditQuizTimeLimit] = useState(30);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // EDIT USER MODAL
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPin, setEditUserPin] = useState("");
  const [savingUser, setSavingUser] = useState(false);

  // ─── AUTH ─────────────────────────────────────────────
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

  // ─── LOADERS ──────────────────────────────────────────
  async function loadAttempts() {
    try { setAttempts(await adminListAttempts(adminPin)); } catch { /* ignore */ }
  }

  const loadQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    try { setQuizzes(await adminListQuizzes(adminPin)); }
    catch { setMessage({ type: "error", text: "Failed to load quizzes" }); }
    finally { setQuizzesLoading(false); }
  }, [adminPin]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try { setUsers(await adminListUsers(adminPin)); }
    catch { setMessage({ type: "error", text: "Failed to load users" }); }
    finally { setUsersLoading(false); }
  }, [adminPin]);

  const loadRetakeRequests = useCallback(async () => {
    setRetakeLoading(true);
    try {
      const data = await adminListRetakeRequests(adminPin);
      setRetakeRequests(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load 2nd chance requests" });
    } finally {
      setRetakeLoading(false);
    }
  }, [adminPin]);

  useEffect(() => {
    if (!authenticated) return;
    loadRetakeRequests(); // always load for badge
    if (tab === "attempts") loadAttempts();
    if (tab === "quizzes") loadQuizzes();
    if (tab === "users") loadUsers();
    if (tab === "requests") loadRetakeRequests();
  }, [authenticated, tab, loadQuizzes, loadUsers, loadRetakeRequests]);

  // ─── RETAKE ACTIONS ───────────────────────────────────
  async function handleApproveRetake(requestId: number, username: string, quizTitle: string) {
    if (
      !confirm(
        `Approve 2nd chance for "${username}" on "${quizTitle}"?\n\nThis will clear their previous attempt lock and dispatch an approval email to the student.`
      )
    )
      return;
    setApprovingId(requestId);
    setMessage(null);
    try {
      const res = await adminApproveRetake(adminPin, requestId);
      setMessage({ type: "success", text: res.message });
      await loadRetakeRequests();
      await loadAttempts();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to approve 2nd chance request" });
    } finally {
      setApprovingId(null);
    }
  }

  async function handleDeclineRetake(requestId: number, username: string) {
    const note = prompt(`Optional explanation or feedback for declining ${username}'s appeal:`);
    if (note === null) return;
    setDecliningId(requestId);
    setMessage(null);
    try {
      const res = await adminDeclineRetake(adminPin, requestId, note || undefined);
      setMessage({ type: "success", text: res.message });
      await loadRetakeRequests();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to decline 2nd chance request" });
    } finally {
      setDecliningId(null);
    }
  }

  // ─── ATTEMPTS ─────────────────────────────────────────
  async function handleReset(username: string, quizId: number) {
    if (!confirm(`Clear attempt for "${username}" on quiz ${quizId}?`)) return;
    setResetting(`${username}-${quizId}`);
    setMessage(null);
    try {
      const result = await adminResetAttempt(adminPin, username, quizId);
      setMessage({ type: "success", text: result.message });
      setAttempts(await adminListAttempts(adminPin));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reset" });
    } finally { setResetting(null); }
  }

  const filtered = attempts.filter(
    (a) => a.username.toLowerCase().includes(filter.toLowerCase()) || a.quizTitle.toLowerCase().includes(filter.toLowerCase())
  );

  // ─── QUIZZES ──────────────────────────────────────────
  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreatingQuiz(true);
    setMessage(null);
    try {
      await adminCreateQuiz(adminPin, newTitle.trim(), newTimeLimit * 60);
      setMessage({ type: "success", text: `Quiz "${newTitle.trim()}" created!` });
      setNewTitle(""); setNewTimeLimit(30);
      loadQuizzes();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setCreatingQuiz(false); }
  }

  async function handleDeleteQuiz(quizId: number, title: string) {
    if (!confirm(`Delete "${title}" and ALL its questions?`)) return;
    setDeletingQuiz(quizId);
    try {
      await adminDeleteQuiz(adminPin, quizId);
      setMessage({ type: "success", text: `Quiz "${title}" deleted` });
      if (selectedQuiz?.id === quizId) { setSelectedQuiz(null); setQuestions([]); }
      loadQuizzes();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setDeletingQuiz(null); }
  }

  function startEditQuiz(quiz: Quiz) {
    setEditingQuiz(quiz);
    setEditQuizTitle(quiz.title);
    setEditQuizTimeLimit(Math.round(quiz.timeLimit >= 60 ? quiz.timeLimit / 60 : quiz.timeLimit));
  }

  async function handleUpdateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuiz || !editQuizTitle.trim()) return;
    setSavingQuiz(true);
    setMessage(null);
    try {
      await adminUpdateQuiz(adminPin, editingQuiz.id, {
        title: editQuizTitle.trim(),
        timeLimit: editQuizTimeLimit * 60,
      });
      setMessage({ type: "success", text: `Quiz "${editQuizTitle.trim()}" updated!` });
      setEditingQuiz(null);
      loadQuizzes();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingQuiz(false);
    }
  }

  // ─── QUESTIONS ────────────────────────────────────────
  async function loadQuestions(quiz: Quiz) {
    setSelectedQuiz(quiz);
    setQuestionsLoading(true);
    try { setQuestions(await adminListQuestions(adminPin, quiz.id)); }
    catch { setMessage({ type: "error", text: "Failed to load questions" }); }
    finally { setQuestionsLoading(false); }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQText.trim() || newQOptions.some((o) => !o.trim()) || !selectedQuiz) return;
    setAddingQuestion(true);
    try {
      await adminAddQuestion(adminPin, selectedQuiz.id, newQText.trim(), newQOptions.map((o) => o.trim()), newQCorrect);
      setMessage({ type: "success", text: "Question added!" });
      setNewQText(""); setNewQOptions(["", "", "", ""]); setNewQCorrect(1);
      loadQuestions(selectedQuiz); loadQuizzes();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setAddingQuestion(false); }
  }

  function parseBulkQuestions(text: string): Array<{ text: string; options: string[]; correctAnswer: number }> {
    const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
    const result: Array<{ text: string; options: string[]; correctAnswer: number }> = [];
    for (const block of blocks) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;
      const textLine = lines[0].replace(/^(Q\d*[:.)\s-]+|\d+[.)]\s*)/i, "").trim();
      const optionLines: string[] = [];
      let correctLine = "";
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (/^answer\s*[:=-]/i.test(line)) correctLine = line;
        else if (/^[A-Da-d1-4][\s).:-]/.test(line)) optionLines.push(line.replace(/^([A-Da-d1-4][\s).:-]\s*)/, "").trim());
      }
      if (optionLines.length < 4) continue;
      let correct = 1;
      if (correctLine) {
        const m = correctLine.match(/[:=-]\s*([A-Da-d1-4])/i);
        if (m) correct = m[1].toUpperCase().charCodeAt(0) - 64;
      }
      result.push({ text: textLine, options: optionLines.slice(0, 4), correctAnswer: correct });
    }
    return result;
  }

  async function handleBulkAdd() {
    if (!bulkText.trim() || !selectedQuiz) return;
    setBulkAdding(true);
    try {
      const parsed = parseBulkQuestions(bulkText);
      if (parsed.length === 0) { setMessage({ type: "error", text: "No valid questions found." }); setBulkAdding(false); return; }
      await adminBulkAddQuestions(adminPin, selectedQuiz.id, parsed);
      setMessage({ type: "success", text: `${parsed.length} questions added!` });
      setBulkText(""); loadQuestions(selectedQuiz); loadQuizzes();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setBulkAdding(false); }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm("Delete this question?")) return;
    setDeletingQuestion(questionId);
    try {
      await adminDeleteQuestion(adminPin, questionId);
      setMessage({ type: "success", text: "Question deleted" });
      if (selectedQuiz) { loadQuestions(selectedQuiz); loadQuizzes(); }
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setDeletingQuestion(null); }
  }

  function startEdit(q: Question) {
    setEditingId(q.id); setEditText(q.text); setEditOptions([...q.options]); setEditCorrect(q.correctAnswer);
  }

  async function saveEdit(questionId: number) {
    if (!editText.trim() || editOptions.some((o) => !o.trim())) return;
    setSavingEdit(true);
    try {
      await adminUpdateQuestion(adminPin, questionId, { text: editText.trim(), options: editOptions.map((o) => o.trim()), correctAnswer: editCorrect });
      setMessage({ type: "success", text: "Question updated!" });
      setEditingId(null);
      if (selectedQuiz) loadQuestions(selectedQuiz);
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setSavingEdit(false); }
  }

  // ─── USERS ────────────────────────────────────────────
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUsername.trim() || !newUserPin.trim()) return;
    setCreatingUser(true);
    try {
      await adminCreateUser(adminPin, newUsername.trim(), newUserPin.trim(), newUserEmail.trim() || undefined);
      setMessage({ type: "success", text: `User "${newUsername.trim()}" created!` });
      setNewUsername(""); setNewUserEmail(""); setNewUserPin(""); loadUsers();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setCreatingUser(false); }
  }

  async function handleDeleteUser(userId: number, username: string) {
    if (!confirm(`Delete "${username}" and all their attempts?`)) return;
    setDeletingUser(userId);
    try {
      await adminDeleteUser(adminPin, userId);
      setMessage({ type: "success", text: `User "${username}" deleted` });
      if (selectedUser?.id === userId) { setSelectedUser(null); setUserResults(null); }
      loadUsers();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setDeletingUser(null); }
  }

  function startEditUser(user: User) {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditUserEmail(user.email || "");
    setEditUserPin("");
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser || !editUsername.trim()) return;
    setSavingUser(true);
    setMessage(null);
    try {
      const data: { username?: string; email?: string; pin?: string } = {};
      if (editUsername.trim() !== editingUser.username) {
        data.username = editUsername.trim();
      }
      if (editUserEmail.trim() && editUserEmail.trim() !== editingUser.email) {
        data.email = editUserEmail.trim();
      }
      if (editUserPin.trim()) {
        if (editUserPin.trim().length !== 5) {
          setMessage({ type: "error", text: "PIN must be exactly 5 digits" });
          setSavingUser(false);
          return;
        }
        data.pin = editUserPin.trim();
      }
      if (Object.keys(data).length === 0) {
        setEditingUser(null);
        setSavingUser(false);
        return;
      }
      await adminUpdateUser(adminPin, editingUser.id, data);
      setMessage({ type: "success", text: "User updated!" });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) { setMessage({ type: "error", text: err.message }); }
    finally { setSavingUser(false); }
  }

  async function loadUserResults(user: User) {
    setSelectedUser(user); setResultsLoading(true);
    try { setUserResults(await adminUserResults(adminPin, user.id)); }
    catch { setMessage({ type: "error", text: "Failed to load results" }); }
    finally { setResultsLoading(false); }
  }

  // ─── COMPUTED STATS ───────────────────────────────────
  const totalUsers = users.length;
  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questionCount, 0);
  const passedCount = attempts.filter((a) => a.status === "passed").length;

  // ═══════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-10">
            <img
              src="/quizshield_logo.png"
              alt="QuizShield Logo"
              className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform"
            />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">QuizShield</h1>
            <p className="text-slate-400 mt-2 text-sm">Admin Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            {message && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold ${
                message.type === "error" ? "bg-red-500/10 text-red-300 border border-red-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Admin PIN</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {Icons.lock}
                  </div>
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                    placeholder="Enter your admin PIN"
                    autoFocus
                    maxLength={100}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !adminPin}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : "Access Control Panel"}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 text-xs mt-6">Protected access • All actions are logged</p>
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/quizshield_logo.png"
              alt="QuizShield Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-emerald-500/20"
            />
            <div>
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight">QuizShield</h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <button
              onClick={() => {
                setAuthenticated(false); setAttempts([]); setQuizzes([]); setQuestions([]);
                setSelectedQuiz(null); setSelectedUser(null); setUserResults(null); setAdminPin(""); setTab("attempts");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
            >
              {Icons.lock}
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast */}
        {message && (
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-lg ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200 shadow-red-500/5"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-500/5"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              message.type === "error" ? "bg-red-100" : "bg-emerald-100"
            }`}>
              {message.type === "error" ? Icons.warning : Icons.check}
            </div>
            {message.text}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={totalUsers} icon={Icons.users} color="bg-blue-50 text-blue-600" />
          <StatCard label="Quizzes" value={totalQuizzes} icon={Icons.quiz} color="bg-purple-50 text-purple-600" />
          <StatCard label="Questions" value={totalQuestions} icon={Icons.clipboard} color="bg-amber-50 text-amber-600" />
          <StatCard label="Attempts Passed" value={`${passedCount}/${attempts.length}`} icon={Icons.check} color="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm w-fit flex-wrap">
          {([
            ["attempts", "Assessments", Icons.clipboard],
            ["requests", "2nd Chance Appeals", Icons.refresh],
            ["quizzes", "Quizzes", Icons.quiz],
            ["users", "Users", Icons.users],
          ] as const).map(([key, label, icon]) => {
            const isReq = key === "requests";
            const pendingCount = retakeRequests.filter((r) => r.status === "pending").length;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  tab === key
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {icon}
                <span>{label}</span>
                {isReq && pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══════ ATTEMPTS TAB ═══════ */}
        {tab === "attempts" && (
          <div className="space-y-5">
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</div>
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search by user or quiz..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                />
              </div>
              <button onClick={loadAttempts} className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all" title="Refresh">
                {Icons.refresh}
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    {Icons.clipboard}
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No attempts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left px-6 py-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">User</th>
                        <th className="text-left px-6 py-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Quiz</th>
                        <th className="text-center px-6 py-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Score</th>
                        <th className="text-center px-6 py-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Status</th>
                        <th className="text-center px-6 py-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Tab Switches</th>
                        <th className="text-right px-6 py-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((a) => {
                        const isPassed = a.status === "passed" || a.score >= 70;
                        const key = `${a.username}-${a.quizId}`;
                        return (
                          <tr key={a.attemptId} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                  {a.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-800">{a.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{a.quizTitle}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-xs font-extrabold ${
                                a.score >= 70 ? "bg-emerald-100 text-emerald-700" : a.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                              }`}>
                                {a.score.toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isPassed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                              }`}>
                                {isPassed ? "✓ Passed" : "Not Passed"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {a.tabSwitches > 0 ? (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                  a.tabSwitches >= 2 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                }`}>
                                  {Icons.warning} {a.tabSwitches}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleReset(a.username, a.quizId)}
                                disabled={resetting === key}
                                className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg border border-red-200/50 hover:bg-red-100 transition-all disabled:opacity-50"
                              >
                                {resetting === key ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : Icons.refresh}
                                Reset
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
          </div>
        )}

        {/* ═══════ 2ND CHANCE APPEALS TAB ═══════ */}
        {tab === "requests" && (
          <div className="space-y-5">
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">2nd Chance Retake Appeals</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review student appeals for quiz retakes. Approving clears their attempt record and emails confirmation.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</div>
                  <input
                    type="text"
                    value={retakeFilter}
                    onChange={(e) => setRetakeFilter(e.target.value)}
                    placeholder="Search appeals..."
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 w-64"
                  />
                </div>
                <button
                  onClick={loadRetakeRequests}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                  title="Refresh"
                >
                  {Icons.refresh}
                </button>
              </div>
            </div>

            {/* Requests List */}
            {retakeLoading ? (
              <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : retakeRequests.filter(
                (r) =>
                  r.username.toLowerCase().includes(retakeFilter.toLowerCase()) ||
                  r.userEmail.toLowerCase().includes(retakeFilter.toLowerCase()) ||
                  r.quizTitle.toLowerCase().includes(retakeFilter.toLowerCase()) ||
                  r.reason.toLowerCase().includes(retakeFilter.toLowerCase())
              ).length === 0 ? (
              <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-2xl">
                  📬
                </div>
                <h3 className="text-base font-bold text-slate-700">No appeals in inbox</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Students who experience connection issues or disturbances will appear here when requesting a 2nd chance.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {retakeRequests
                  .filter(
                    (r) =>
                      r.username.toLowerCase().includes(retakeFilter.toLowerCase()) ||
                      r.userEmail.toLowerCase().includes(retakeFilter.toLowerCase()) ||
                      r.quizTitle.toLowerCase().includes(retakeFilter.toLowerCase()) ||
                      r.reason.toLowerCase().includes(retakeFilter.toLowerCase())
                  )
                  .map((item) => {
                    const isPending = item.status === "pending";
                    const isApproved = item.status === "approved";
                    const isDeclined = item.status === "declined";

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border transition-all p-6 ${
                          isPending
                            ? "border-amber-200 shadow-md shadow-amber-500/5 ring-1 ring-amber-200/50"
                            : "border-slate-200 shadow-sm opacity-90"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          {/* Left: Student & Quiz details */}
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                                isPending
                                  ? "bg-amber-100 text-amber-800"
                                  : isApproved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {item.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="font-extrabold text-slate-900 text-base">{item.username}</h3>
                                <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                                  {item.userEmail}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                                    isPending
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : isApproved
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-rose-100 text-rose-800 border border-rose-200"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                                <span>
                                  <strong>Topic:</strong> {item.quizTitle}
                                </span>
                                <span>•</span>
                                <span>
                                  <strong>Category:</strong>{" "}
                                  <span className="capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                                    {item.category}
                                  </span>
                                </span>
                                {item.attempt && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      <strong>Previous Score:</strong> {Number(item.attempt.score.toFixed(1))}%
                                    </span>
                                    <span>•</span>
                                    <span
                                      className={
                                        item.attempt.tabSwitches > 0
                                          ? "text-rose-600 font-bold"
                                          : "text-slate-500"
                                      }
                                    >
                                      <strong>Tab Switches:</strong> {item.attempt.tabSwitches}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="text-slate-400">
                                  {new Date(item.createdAt).toLocaleString()}
                                </span>
                              </div>

                              {/* Student reason */}
                              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 italic leading-relaxed">
                                &ldquo;{item.reason}&rdquo;
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveRetake(item.id, item.username, item.quizTitle)}
                                  disabled={approvingId === item.id || decliningId === item.id}
                                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                  {approvingId === item.id ? (
                                    "Clearing Attempt..."
                                  ) : (
                                    <>
                                      <span>✓</span> Approve 2nd Chance
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineRetake(item.id, item.username)}
                                  disabled={approvingId === item.id || decliningId === item.id}
                                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs transition-colors"
                                >
                                  {decliningId === item.id ? "Declining..." : "Decline"}
                                </button>
                              </>
                            ) : (
                              <div className="text-right text-xs text-slate-400">
                                Resolved on {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : "recently"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ═══════ QUIZZES TAB ═══════ */}
        {tab === "quizzes" && (
          <div className="space-y-5">
            {/* Create Quiz */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  {Icons.plus}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Create New Quiz</h2>
                  <p className="text-xs text-slate-400">Add a new assessment to the platform</p>
                </div>
              </div>
              <form onSubmit={handleCreateQuiz} className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Quiz title (e.g. Mathematics 101)" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" maxLength={100} required />
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">⏱</span>
                  <input type="number" value={newTimeLimit} onChange={(e) => setNewTimeLimit(Number(e.target.value))} min={1} max={180} className="w-20 py-3 bg-transparent text-sm font-bold text-slate-800 focus:outline-none" />
                  <span className="text-xs text-slate-400">min</span>
                </div>
                <button type="submit" disabled={creatingQuiz || !newTitle.trim()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {creatingQuiz ? "Creating..." : "+ Create Quiz"}
                </button>
              </form>
            </div>

            {/* Quiz List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">All Quizzes</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{quizzes.length} quizzes • {totalQuestions} questions total</p>
                </div>
                <button onClick={loadQuizzes} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  {Icons.refresh}
                </button>
              </div>
              {quizzesLoading ? (
                <div className="p-16 text-center">
                  <div className="w-8 h-8 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-500 mt-3">Loading quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">{Icons.quiz}</div>
                  <p className="text-sm font-semibold text-slate-500">No quizzes yet. Create one above!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {quizzes.map((q) => (
                    <div key={q.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-purple-600 font-extrabold text-sm shrink-0">
                            {q.questionCount}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">{q.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-semibold text-slate-400">⏱ {q.timeLimit >= 60 ? Math.round(q.timeLimit / 60) : q.timeLimit} min</span>
                              <span className="text-xs font-semibold text-emerald-600">{q.questionCount} question{q.questionCount !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditQuiz(q)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                            {Icons.edit} Edit
                          </button>
                          <button onClick={() => loadQuestions(q)} className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/50 hover:bg-amber-100 transition-all">
                            Manage
                          </button>
                          <button onClick={() => handleDeleteQuiz(q.id, q.title)} disabled={deletingQuiz === q.id} className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100">
                            {deletingQuiz === q.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : Icons.trash}
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">{Icons.quiz}</div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800">{selectedQuiz.title}</h2>
                      <p className="text-xs text-slate-400">{questions.length} questions</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedQuiz(null); setQuestions([]); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                    {Icons.close}
                  </button>
                </div>

                {/* Questions List */}
                <div className="px-6 py-4 border-b border-slate-100">
                  {questionsLoading ? (
                    <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                  ) : questions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No questions yet. Add some below!</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                      {questions.map((q, idx) => {
                        const isEditing = editingId === q.id;
                        return (
                          <div key={q.id} className={`rounded-xl border transition-all ${isEditing ? "bg-amber-50 border-amber-300 shadow-sm" : "bg-slate-50 border-slate-200/60 hover:border-slate-300"}`}>
                            {isEditing ? (
                              <div className="p-4 space-y-3">
                                <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" maxLength={500} />
                                <div className="grid grid-cols-2 gap-2">
                                  {editOptions.map((opt, oi) => (
                                    <div key={oi} className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{["A", "B", "C", "D"][oi]}</span>
                                      <input type="text" value={opt} onChange={(e) => { const c = [...editOptions]; c[oi] = e.target.value; setEditOptions(c); }} className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" maxLength={200} />
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Answer:</span>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4].map((n) => (
                                        <button key={n} type="button" onClick={() => setEditCorrect(n)} className={`w-7 h-7 rounded-md text-[10px] font-bold transition-all ${editCorrect === n ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                          {["A", "B", "C", "D"][n - 1]}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                                    <button onClick={() => saveEdit(q.id)} disabled={savingEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50">
                                      {savingEdit ? "Saving..." : "Save"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="px-4 py-3 flex items-start gap-3 group/q">
                                <span className="text-[10px] font-bold text-slate-300 mt-1 w-5 shrink-0">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">{q.text}</p>
                                  <div className="grid grid-cols-2 gap-1 mt-2">
                                    {q.options.map((opt, oi) => (
                                      <span key={oi} className={`text-[11px] px-2 py-0.5 rounded-md ${oi + 1 === q.correctAnswer ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-white text-slate-500 border border-slate-200"}`}>
                                        {["A", "B", "C", "D"][oi]}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 shrink-0 opacity-0 group-hover/q:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(q)} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit">{Icons.edit}</button>
                                  <button onClick={() => handleDeleteQuestion(q.id)} disabled={deletingQuestion === q.id} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50" title="Delete">{Icons.trash}</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Question Mode Toggle */}
                <div className="px-6 pt-4 flex gap-2">
                  <button onClick={() => setBulkMode("single")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${bulkMode === "single" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
                    {Icons.plus} Add One
                  </button>
                  <button onClick={() => setBulkMode("bulk")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${bulkMode === "bulk" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}>
                    {Icons.bulk} Bulk Add
                  </button>
                </div>

                {/* Single Form */}
                {bulkMode === "single" && (
                  <form onSubmit={handleAddQuestion} className="px-6 pb-6 pt-4 space-y-4">
                    <input type="text" value={newQText} onChange={(e) => setNewQText(e.target.value)} placeholder="Question text" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" maxLength={500} required />
                    <div className="grid grid-cols-2 gap-3">
                      {newQOptions.map((opt, i) => (
                        <div key={i} className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{["A", "B", "C", "D"][i]}</span>
                          <input type="text" value={opt} onChange={(e) => { const c = [...newQOptions]; c[i] = e.target.value; setNewQOptions(c); }} placeholder={`Option ${["A", "B", "C", "D"][i]}`} className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" maxLength={200} required />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Correct:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <button key={n} type="button" onClick={() => setNewQCorrect(n)} className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${newQCorrect === n ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                            {["A", "B", "C", "D"][n - 1]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={addingQuestion || !newQText.trim() || newQOptions.some((o) => !o.trim())} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      {addingQuestion ? "Adding..." : "+ Add Question"}
                    </button>
                  </form>
                )}

                {/* Bulk Form */}
                {bulkMode === "bulk" && (
                  <div className="px-6 pb-6 pt-4 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="text-xs font-bold text-slate-600 mb-2">Expected format:</h3>
                      <pre className="text-[11px] text-slate-500 whitespace-pre-wrap font-mono leading-relaxed">
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
                    <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={`Paste questions here...\n\nQuestion text\nA. Option 1\nB. Option 2\nC. Option 3\nD. Option 4\nAnswer: B`} className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-y" />
                    <button onClick={handleBulkAdd} disabled={bulkAdding || !bulkText.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      {bulkAdding ? "Adding..." : `+ Add All Questions`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ USERS TAB ═══════ */}
        {tab === "users" && (
          <div className="space-y-5">
            {/* Create User */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  {Icons.plus}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Add New User</h2>
                  <p className="text-xs text-slate-400">Create a new student account</p>
                </div>
              </div>
              <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" maxLength={50} required />
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Gmail address (optional)" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                <input type="text" value={newUserPin} onChange={(e) => setNewUserPin(e.target.value)} placeholder="5-digit PIN" className="w-36 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" maxLength={5} pattern="\d{5}" required />
                <button type="submit" disabled={creatingUser || !newUsername.trim() || !newUserPin.trim()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 shrink-0">
                  {creatingUser ? "Adding..." : "+ Add User"}
                </button>
              </form>
            </div>

            {/* User List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">All Users</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{users.length} registered users</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</div>
                    <input type="text" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-48" />
                  </div>
                  <button onClick={loadUsers} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    {Icons.refresh}
                  </button>
                </div>
              </div>
              {usersLoading ? (
                <div className="p-16 text-center"><div className="w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : users.filter((u) => u.username.toLowerCase().includes(userFilter.toLowerCase()) || (u.email && u.email.toLowerCase().includes(userFilter.toLowerCase()))).length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">{Icons.users}</div>
                  <p className="text-sm font-semibold text-slate-500">No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {users.filter((u) => u.username.toLowerCase().includes(userFilter.toLowerCase()) || (u.email && u.email.toLowerCase().includes(userFilter.toLowerCase()))).map((u) => {
                    const avgScore = u.attempts.length > 0 ? u.attempts.reduce((s, a) => s + a.score, 0) / u.attempts.length : 0;
                    return (
                      <div key={u.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 font-extrabold text-sm shrink-0">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-800">{u.username}</h3>
                                {u.email && (
                                  <span className="text-xs text-slate-400 font-mono">({u.email})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-semibold text-slate-400">
                                  {u.attempts.length} attempt{u.attempts.length !== 1 ? "s" : ""}
                                </span>
                                {u.attempts.length > 0 && (
                                  <span className={`text-xs font-bold ${avgScore >= 70 ? "text-emerald-600" : avgScore >= 50 ? "text-amber-600" : "text-red-500"}`}>
                                    Avg: {avgScore.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => startEditUser(u)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                              {Icons.edit} Edit
                            </button>
                            <button onClick={() => loadUserResults(u)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/50 hover:bg-blue-100 transition-all">
                              {Icons.eye} Results
                            </button>
                            <button onClick={() => handleDeleteUser(u.id, u.username)} disabled={deletingUser === u.id} className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100">
                              {deletingUser === u.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                              ) : Icons.trash}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ═══════ INDIVIDUAL RESULTS ═══════ */}
            {selectedUser && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800">{selectedUser.username}&apos;s Results</h2>
                      <p className="text-xs text-slate-400">{userResults?.attempts.length || 0} quiz attempt{(userResults?.attempts.length || 0) !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedUser(null); setUserResults(null); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                    {Icons.close}
                  </button>
                </div>

                <div className="p-6">
                  {resultsLoading ? (
                    <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                  ) : !userResults || userResults.attempts.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">{Icons.clipboard}</div>
                      <p className="text-sm font-semibold text-slate-500">No quiz attempts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userResults.attempts.map((a) => (
                        <div key={a.attemptId} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <h3 className="font-bold text-slate-800">{a.quizTitle}</h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${a.status === "passed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                                {a.status === "passed" ? "✓" : "✗"} {a.score.toFixed(0)}%
                              </span>
                              {a.tabSwitches > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">{Icons.warning} {a.tabSwitches} switch{a.tabSwitches !== 1 ? "es" : ""}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">{new Date(a.startedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {a.answers.map((ans, idx) => (
                              <div key={ans.questionId} className="px-5 py-3 flex items-start gap-3">
                                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ans.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                                  {ans.isCorrect ? "✓" : "✗"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-700"><span className="text-slate-400 mr-1">{idx + 1}.</span>{ans.questionText}</p>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {ans.options.map((opt, oi) => {
                                      const isCorrect = oi + 1 === ans.correctAnswer;
                                      const isSelected = oi + 1 === ans.selectedOption;
                                      return (
                                        <span key={oi} className={`text-[11px] px-2 py-0.5 rounded-md ${isCorrect ? "bg-emerald-100 text-emerald-700 font-bold" : isSelected ? "bg-red-100 text-red-600 font-bold" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
                                          {["A", "B", "C", "D"][oi]}. {opt}{isCorrect && " ✓"}{isSelected && !isCorrect && " ✗"}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ EDIT QUIZ MODAL ═══════ */}
        {editingQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    {Icons.edit}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Edit Quiz</h3>
                    <p className="text-xs text-slate-400">Update quiz name and time limit</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingQuiz(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {Icons.close}
                </button>
              </div>
              <form onSubmit={handleUpdateQuiz} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={editQuizTitle}
                    onChange={(e) => setEditQuizTitle(e.target.value)}
                    placeholder="e.g. Mathematics 101"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all font-medium text-slate-800"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Limit (minutes)
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">⏱</span>
                    <input
                      type="number"
                      value={editQuizTimeLimit}
                      onChange={(e) => setEditQuizTimeLimit(Number(e.target.value))}
                      min={1}
                      max={180}
                      className="w-full py-2.5 bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
                      required
                    />
                    <span className="text-xs text-slate-400">min</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingQuiz(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuiz || !editQuizTitle.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingQuiz ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════ EDIT USER MODAL ═══════ */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    {Icons.edit}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Edit User</h3>
                    <p className="text-xs text-slate-400">Update username and 5-digit PIN</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {Icons.close}
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-800"
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    placeholder="e.g. student@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New 5-Digit PIN (Optional)
                  </label>
                  <input
                    type="password"
                    value={editUserPin}
                    onChange={(e) => setEditUserPin(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="Leave blank to keep existing PIN"
                    maxLength={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Leave blank to keep current PIN unchanged.</p>
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser || !editUsername.trim() || (editUserPin.length > 0 && editUserPin.length !== 5)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingUser ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
