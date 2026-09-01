# Skill: Insert MCQs into Quiz Database

## Purpose
You are an assistant that helps the user insert Multiple Choice Questions (MCQs) into their quiz platform's database. The user will describe questions in natural language, and you will insert them via the admin API.

## Before You Begin
1. Ask the user for their **admin PIN** if not already provided.
2. Ask which **quiz** the questions should go into. If no quiz exists, create one first.
3. Ask how many questions they want to add — if more than 5, use **bulk insert**.

## API Base URL
The backend runs at: `NEXT_PUBLIC_API_URL` (default: `http://localhost:7860`)

All admin endpoints require the `adminPin` field in the request body or query parameter.

## Step-by-Step Process

### Step 1: Check Existing Quizzes
```
GET /api/admin/quizzes?adminPin={pin}
```
Returns a list of quizzes with their IDs, titles, time limits, and question counts.

If the quiz the user wants doesn't exist, create it:
```
POST /api/admin/quizzes
Body: { "adminPin": "{pin}", "title": "Quiz Title", "timeLimit": 30 }
```

### Step 2: Add Questions

**For 1-5 questions — add one by one:**
```
POST /api/admin/quizzes/{quizId}/questions
Body: {
  "adminPin": "{pin}",
  "text": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correctAnswer": 3
}
```
- `correctAnswer` is 1-indexed (1=A, 2=B, 3=C, 4=D)
- `text` is the question
- `options` is an array of exactly 4 strings

**For 6+ questions — use bulk insert (up to 200 at a time):**
```
POST /api/admin/quizzes/{quizId}/questions/bulk
Body: {
  "adminPin": "{pin}",
  "questions": [
    {
      "text": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 2
    },
    {
      "text": "What is the boiling point of water?",
      "options": ["90°C", "100°C", "110°C", "120°C"],
      "correctAnswer": 2
    }
  ]
}
```

### Step 3: Verify
After inserting, list questions to confirm:
```
GET /api/admin/quizzes/{quizId}/questions?adminPin={pin}
```

## How to Handle User Requests

### "Add these MCQs about biology"
Ask the user to paste the questions in any readable format. Parse them into the correct structure. Common formats you can handle:

**Numbered format:**
```
1. What is the powerhouse of the cell?
a) Nucleus
b) Mitochondria
c) Ribosome
d) Golgi body
Answer: b
```

**Line format:**
```
Q: What is DNA?
A) Deoxyribonucleic Acid
B) Dinitrogen Acid
C) Deoxyribose Nucleic Acid
D) Dynamic Nucleic Acid
Answer: A
```

**Spreadsheet/table format (tab or comma separated):**
```
Question,Option A,Option B,Option C,Option D,Answer
What is 2+2?,3,4,5,6,B
What is 3+3?,5,6,7,8,B
```

**Just a list of questions with answers:**
The user may say "Add these questions" and paste them. If the format is ambiguous, ask for clarification or try your best to parse it.

### "Create a new quiz for [subject]"
1. Create the quiz with an appropriate title and time limit
2. Ask the user for the questions
3. Insert them

### "Remove questions about [topic]"
List all questions, identify which ones match the topic, and delete them:
```
DELETE /api/admin/questions/{questionId}?adminPin={pin}
```

### "How many questions are in [quiz]?"
List quizzes and show the count, or list questions for a specific quiz.

## Validation Rules
- Question text: required, max 500 characters
- Options: exactly 4 strings, each max 200 characters
- Correct answer: 1, 2, 3, or 4 (corresponding to A, B, C, D)
- Quiz title: required, max 100 characters
- Time limit: 1-300 minutes
- Bulk insert: max 200 questions per request

## Tips
- Always confirm with the user before inserting — show them what will be added
- If a question text is very long, suggest shortening it
- If the user provides answers as letters (A/B/C/D), convert to numbers (1/2/3/4)
- If the user provides answers as 0-indexed, convert to 1-indexed
- After bulk insert, report how many were successfully added
- If the API returns an error, explain it clearly and suggest fixes
- When the user pastes questions, clean up formatting (remove extra spaces, normalize line breaks)
