const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server returned invalid response (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }

  return json;
}

export async function login(username: string, pin: string) {
  return apiFetch<{ token: string; userId: number; username: string; email?: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, pin }),
    }
  );
}

export async function registerUser(username: string, email: string) {
  return apiFetch<{ success: boolean; message: string; username: string; email: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ username, email }),
    }
  );
}

export interface QuizItem {
  id: number;
  title: string;
  timeLimit: number;
  questionCount: number;
  canStart: boolean;
  attempt?: {
    id: number;
    score: number;
    status: string;
    tabSwitches: number;
    createdAt: string;
  } | null;
  retakeRequest?: {
    id: number;
    status: "pending" | "approved" | "declined";
    category: string;
    reason: string;
    createdAt: string;
  } | null;
}

export async function getQuizzes(token: string) {
  return apiFetch<QuizItem[]>("/quizzes", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function requestQuizRetake(
  token: string,
  quizId: number,
  category: string,
  reason: string
) {
  return apiFetch<{ success: boolean; message: string; request: any }>(
    `/quiz/${quizId}/request-retake`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ category, reason }),
    }
  );
}

export async function startQuiz(token: string, quizId: number) {
  return apiFetch<{ attemptId: number }>(`/quiz/${quizId}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitAnswer(
  token: string,
  quizId: number,
  questionId: number,
  selectedOption: number
) {
  return apiFetch("/quiz/" + quizId + "/answer", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ questionId, selectedOption: selectedOption + 1 }),
  });
}

export async function reportTabSwitch(token: string, quizId: number) {
  return apiFetch<{
    tabSwitches: number;
    shouldAutoSubmit: boolean;
  }>(`/quiz/${quizId}/tab-switch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function finishQuiz(
  token: string,
  quizId: number,
  answers?: Array<{ questionId: number; selectedOption: number }>,
  tabSwitches?: number
) {
  return apiFetch<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    status: string;
  }>(`/quiz/${quizId}/finish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers, tabSwitches }),
  });
}

export async function getQuizQuestions(token: string, quizId: number) {
  return apiFetch<
    Array<{
      id: number;
      text: string;
      options: string[];
    }>
  >(`/quiz/${quizId}/questions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getQuizInfo(token: string, quizId: number) {
  return apiFetch<{ id: number; title: string; timeLimit: number }>(
    `/quiz/${quizId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// ─── ADMIN ─────────────────────────────────────────────────────

export async function adminListAttempts(adminPin: string) {
  return apiFetch<Array<{
    attemptId: number;
    userId: number;
    username: string;
    quizId: number;
    quizTitle: string;
    score: number;
    status: string;
    tabSwitches: number;
    createdAt: string;
  }>>("/admin/attempts", {
    headers: { "x-admin-key": adminPin },
  });
}

export async function adminResetAttempt(adminPin: string, username: string, quizId: number) {
  return apiFetch<{ success: boolean; message: string }>(
    "/admin/reset-attempt",
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify({ username, quizId }),
    }
  );
}

export async function adminListQuizzes(adminPin: string) {
  return apiFetch<Array<{
    id: number;
    title: string;
    timeLimit: number;
    questionCount: number;
  }>>("/admin/quizzes", {
    headers: { "x-admin-key": adminPin },
  });
}

export async function adminCreateQuiz(adminPin: string, title: string, timeLimit: number) {
  return apiFetch<{ id: number; title: string; timeLimit: number }>(
    "/admin/quizzes",
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify({ title, timeLimit }),
    }
  );
}

export async function adminUpdateQuiz(
  adminPin: string,
  quizId: number,
  data: { title?: string; timeLimit?: number }
) {
  return apiFetch<{ id: number; title: string; timeLimit: number }>(
    `/admin/quizzes/${quizId}`,
    {
      method: "PATCH",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify(data),
    }
  );
}

export async function adminDeleteQuiz(adminPin: string, quizId: number) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/quizzes/${quizId}`,
    {
      method: "DELETE",
      headers: { "x-admin-key": adminPin },
    }
  );
}

export async function adminListQuestions(adminPin: string, quizId: number) {
  return apiFetch<Array<{
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
  }>>(`/admin/quizzes/${quizId}/questions`, {
    headers: { "x-admin-key": adminPin },
  });
}

export async function adminAddQuestion(adminPin: string, quizId: number, text: string, options: string[], correctAnswer: number) {
  return apiFetch<{ id: number; text: string; options: string[]; correctAnswer: number }>(
    `/admin/quizzes/${quizId}/questions`,
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify({ text, options, correctAnswer }),
    }
  );
}

export async function adminBulkAddQuestions(adminPin: string, quizId: number, questions: Array<{ text: string; options: string[]; correctAnswer: number }>) {
  return apiFetch<{ success: boolean; count: number }>(
    `/admin/quizzes/${quizId}/questions/bulk`,
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify({ questions }),
    }
  );
}

export async function adminDeleteQuestion(adminPin: string, questionId: number) {
  return apiFetch<{ success: boolean }>(
    `/admin/questions/${questionId}`,
    {
      method: "DELETE",
      headers: { "x-admin-key": adminPin },
    }
  );
}

export async function adminUpdateQuestion(
  adminPin: string,
  questionId: number,
  data: { text?: string; options?: string[]; correctAnswer?: number }
) {
  return apiFetch<{ id: number; text: string; options: string[]; correctAnswer: number }>(
    `/admin/questions/${questionId}`,
    {
      method: "PUT",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify(data),
    }
  );
}

export interface AdminRetakeRequestItem {
  id: number;
  userId: number;
  username: string;
  userEmail: string;
  quizId: number;
  quizTitle: string;
  category: string;
  reason: string;
  status: "pending" | "approved" | "declined";
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  attempt?: {
    score: number;
    status: string;
    tabSwitches: number;
    createdAt: string;
  } | null;
}

export async function adminListRetakeRequests(adminPin: string) {
  return apiFetch<AdminRetakeRequestItem[]>("/admin/retake-requests", {
    headers: { "x-admin-key": adminPin },
  });
}

export async function adminApproveRetake(adminPin: string, requestId: number) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/retake-requests/${requestId}/approve`,
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
    }
  );
}

export async function adminDeclineRetake(adminPin: string, requestId: number, note?: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/retake-requests/${requestId}/decline`,
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify({ note }),
    }
  );
}

export async function adminListUsers(adminPin: string) {
  return apiFetch<Array<{
    id: number;
    username: string;
    email?: string;
    createdAt?: string;
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
  }>>("/admin/users", {
    headers: { "x-admin-key": adminPin },
  });
}

export async function adminCreateUser(adminPin: string, username: string, pin: string, email?: string) {
  return apiFetch<{ id: number; username: string; email?: string }>(
    "/admin/users",
    {
      method: "POST",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify({ username, pin, email }),
    }
  );
}

export async function adminUpdateUser(
  adminPin: string,
  userId: number,
  data: { username?: string; pin?: string; email?: string }
) {
  return apiFetch<{ id: number; username: string; email?: string }>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      headers: { "x-admin-key": adminPin },
      body: JSON.stringify(data),
    }
  );
}

export async function adminDeleteUser(adminPin: string, userId: number) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/users/${userId}`,
    {
      method: "DELETE",
      headers: { "x-admin-key": adminPin },
    }
  );
}

export async function adminUserResults(adminPin: string, userId: number) {
  return apiFetch<{
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
  }>(`/admin/users/${userId}/results`, {
    headers: { "x-admin-key": adminPin },
  });
}

export async function adminGetSecurityLog(adminPin: string) {
  return apiFetch<Array<{
    timestamp: string;
    event: string;
    details: string;
    extra: string;
    ip: string;
    userAgent: string;
  }>>("/admin/security-log", {
    headers: { "x-admin-key": adminPin },
  });
}

export async function getDashboard(token: string) {
  return apiFetch<{
    user: { id: number; username: string };
    history: Array<{
      quizId: number;
      quizTitle: string;
      score: number;
      percentage: number;
      status: string;
      completedAt: string;
      answers: Array<{
        questionId: number;
        questionText: string;
        options: string[];
        selectedOption: number;
        correctAnswer: number;
        isCorrect: boolean;
      }>;
    }>;
  }>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
