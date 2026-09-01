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
  return apiFetch<{ token: string; userId: number; username: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, pin }),
    }
  );
}

export async function getQuizzes(token: string) {
  return apiFetch<
    Array<{
      id: number;
      title: string;
      timeLimit: number;
      questionCount: number;
      canStart: boolean;
    }>
  >("/quizzes", {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export async function finishQuiz(token: string, quizId: number) {
  return apiFetch<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    status: string;
  }>(`/quiz/${quizId}/finish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getQuizQuestions(token: string, quizId: number) {
  return apiFetch<
    Array<{
      id: number;
      text: string;
      options: string[];
      correctAnswer: number;
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
  }>>(`/admin/attempts?adminPin=${encodeURIComponent(adminPin)}`);
}

export async function adminResetAttempt(adminPin: string, username: string, quizId: number) {
  return apiFetch<{ success: boolean; message: string }>(
    "/admin/reset-attempt",
    {
      method: "POST",
      body: JSON.stringify({ adminPin, username, quizId }),
    }
  );
}

export async function adminListQuizzes(adminPin: string) {
  return apiFetch<Array<{
    id: number;
    title: string;
    timeLimit: number;
    questionCount: number;
  }>>(`/admin/quizzes?adminPin=${encodeURIComponent(adminPin)}`);
}

export async function adminCreateQuiz(adminPin: string, title: string, timeLimit: number) {
  return apiFetch<{ id: number; title: string; timeLimit: number }>(
    "/admin/quizzes",
    {
      method: "POST",
      body: JSON.stringify({ adminPin, title, timeLimit }),
    }
  );
}

export async function adminDeleteQuiz(adminPin: string, quizId: number) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/quizzes/${quizId}?adminPin=${encodeURIComponent(adminPin)}`,
    { method: "DELETE" }
  );
}

export async function adminListQuestions(adminPin: string, quizId: number) {
  return apiFetch<Array<{
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
  }>>(`/admin/quizzes/${quizId}/questions?adminPin=${encodeURIComponent(adminPin)}`);
}

export async function adminAddQuestion(adminPin: string, quizId: number, text: string, options: string[], correctAnswer: number) {
  return apiFetch<{ id: number; text: string; options: string[]; correctAnswer: number }>(
    `/admin/quizzes/${quizId}/questions`,
    {
      method: "POST",
      body: JSON.stringify({ adminPin, text, options, correctAnswer }),
    }
  );
}

export async function adminBulkAddQuestions(adminPin: string, quizId: number, questions: Array<{ text: string; options: string[]; correctAnswer: number }>) {
  return apiFetch<{ success: boolean; count: number }>(
    `/admin/quizzes/${quizId}/questions/bulk`,
    {
      method: "POST",
      body: JSON.stringify({ adminPin, questions }),
    }
  );
}

export async function adminDeleteQuestion(adminPin: string, questionId: number) {
  return apiFetch<{ success: boolean }>(
    `/admin/questions/${questionId}?adminPin=${encodeURIComponent(adminPin)}`,
    { method: "DELETE" }
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
      body: JSON.stringify({ adminPin, ...data }),
    }
  );
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
        selectedOption: number;
        correctAnswer: number;
        isCorrect: boolean;
      }>;
    }>;
  }>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
