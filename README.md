# Expense Tracker - Full-Stack Expense Tracker App

Expense Tracker is a personal finance tracker and expense analyzer built with a MERN stack (MongoDB, Express, React, Node.js) and TypeScript. It includes a dashboard for analytics, an AI Advisor bot integrated server-side with Gemini and Claude APIs, and a mobile-responsive interface.

---

## Technical Stack

*   **Frontend:** React (TypeScript) + Vite, Tailwind CSS
*   **Charts:** Recharts (LineChart & PieChart)
*   **Server State:** TanStack Query (React Query)
*   **Forms & Validation:** React Hook Form + Zod
*   **Backend:** Express (TypeScript)
*   **Database:** MongoDB + Mongoose
*   **Authentication:** JWT + bcryptjs (simplified demo auth)
*   **AI Integration:** Server-Side Gemini API / Anthropic API (supports fallback)

---

## Features

1.  **Demo Auth:** Registers and logs users in. JWT is stored in `localStorage` on the frontend and sent as a Bearer token in the `Authorization` header.
2.  **Onboarding:** New users are redirected to a setup screen to choose their Monthly Income and goal (Tracking / Savings / Habits / Other).
3.  **Expense CRUD:** Log expenditures with fields for name, amount, date, category (dropdown with icons), payment mode (cash/card/upi/other), and notes. Supports editing and deleting items.
4.  **Analytics Summary:** Displays Available Balance, Income, and Expenses cards, a Recharts line chart showing weekly spending trends, and a category distribution donut chart.
5.  **AI Advisor:** An interactive chat bot that analyses your habits and budgets using current and previous month transaction tallies, monthly income, and recent transactions. It constructs a system prompt template server-side and communicates with LLMs.

---

## Installation & Setup

### Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB running locally (e.g. `mongodb://localhost:27017`) or a MongoDB Atlas connection string

### 1. Backend Setup
1.  Navigate to the `/backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create your `.env` configuration file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  Configure your environment variables inside `.env`:
    *   `MONGO_URI`: The connection string for your MongoDB instance (defaults to `mongodb://127.0.0.1:27017/expense-tracker`)
    *   `JWT_SECRET`: A secret string for signing JWT tokens.
    *   `GEMINI_API_KEY`: Your Google Gemini API key.
    *   `ANTHROPIC_API_KEY`: (Optional) Your Anthropic Claude API key.
    *   `PORT`: Port for the Express server (default `5000`).
5.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup
1.  Navigate to the `/frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure the environment file `.env` exists with the api url:
    ```
    VITE_API_BASE_URL=http://localhost:5000/api
    ```
4.  Start the frontend application:
    ```bash
    npm run dev
    ```

---

## Project Structure

```
/backend
  /src
    /models       (User.ts, Expense.ts, ChatMessage.ts)
    /routes       (auth.ts, user.ts, expenses.ts, analytics.ts, ai.ts)
    /middleware   (auth.ts - JWT verification)
    server.ts
  package.json

/frontend
  /src
    /pages        (Login.tsx, Register.tsx, Onboarding.tsx, Home.tsx, Dashboard.tsx, AIAdvisor.tsx, Profile.tsx)
    /components   (ExpenseForm.tsx, ExpenseCard.tsx, FloatingAddButton.tsx, BottomNav.tsx)
    /hooks        (useExpenses.ts, useAuth.tsx, useChat.ts)
    /lib          (api.ts, queryClient.ts)
    /types        (index.ts)
    App.tsx
    main.tsx
  package.json
```

---

## Architecture Overview & Note on Auth
*   **Authentication Flow:** The authentication is a simplified demo implementation appropriate for the assignment scope. No email verification, password reset, or refresh tokens are set up. Passwords are securely hashed with `bcryptjs`.
*   **AI Service Routing:** The AI Advisor calls Google Gemini (`gemini-1.5-flash`) or Anthropic Claude depending on which API key is present in `process.env`. If no key is set, it falls back to mock advisory recommendations detailing your current spending compared to income, meaning the application will remain interactive and operational even without keys.
