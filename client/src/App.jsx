import { Routes, Route, NavLink, Navigate } from "react-router-dom";

import CheckTest1 from "./CheckTest1.jsx"; // Login
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";

import Start from "./pages/Start.jsx"; // ✅ הוספנו מסך בית

import AdditionPractice from "./pages/AdditionPractice.jsx";
import SubtractionPractice from "./pages/SubtractionPractice.jsx";
import MultiplicationPractice from "./pages/MultiplicationPractice.jsx";
import DivisionPractice from "./pages/DivisionPractice.jsx";

// ✅ חדש: צ'אט RAG חתול
import CatRagChat from "./pages/CatRagChat.jsx";

// ✅ חדש: CatStory (מייצר סיפור ומחזיר ל-AdditionPractice)
import CatStory from "./pages/CatStory.jsx";

import { useEffect, useState } from "react";

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-extrabold text-rose-600">אופס! 🐾</div>
        <p className="mt-2 text-slate-700">
          הדף לא נמצא. בדוק את הכתובת או חזור לתפריט למעלה.
        </p>
      </div>
    </div>
  );
}

function Tab({ to, emoji, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold",
          "transition active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200",
          isActive
            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
            : "bg-white/60 text-slate-700 hover:bg-white hover:text-slate-900 ring-1 ring-slate-200/60",
        ].join(" ")
      }
    >
      <span className="text-base">{emoji}</span>
      <span className="whitespace-nowrap">{children}</span>
      <span className="ml-1 hidden h-1.5 w-1.5 rounded-full bg-amber-400 group-[.active]:inline-block" />
    </NavLink>
  );
}

function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "1";
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  if (isLoggedIn()) return <Navigate to="/start" replace />; // ✅ אם מחובר — לבית
  return children;
}

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());

  useEffect(() => {
    function onAuthChanged() {
      setAuthed(isLoggedIn());
    }
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-emerald-50 to-amber-50">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200 blur-3xl" />
        <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-emerald-200 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6">
        <header className="mb-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <span className="text-xl">🐱</span>
                </div>

                <div className="leading-tight">
                  <div className="text-lg font-black text-slate-900">
                    חתול־חשבון
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-700">
                      כיף ללמוד!
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {authed
                      ? "מתחילים בבית — ואז בוחרים תרגול 🐾"
                      : "קודם נכנסים / נרשמים — ואז מתחילים לתרגל 😺"}
                  </div>
                </div>
              </div>
            </div>

            {!authed ? (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/login" emoji="🔐">
                  כניסה
                </Tab>
                <Tab to="/register" emoji="📝">
                  הרשמה
                </Tab>
                <Tab to="/about" emoji="ℹ️">
                  אודות
                </Tab>
              </nav>
            ) : (
              <nav className="flex flex-wrap gap-2">
                <Tab to="/start" emoji="🏠">
                  בית
                </Tab>
                <Tab to="/addition" emoji="➕">
                  חיבור
                </Tab>
                <Tab to="/subtraction" emoji="➖">
                  חיסור
                </Tab>
                <Tab to="/multiplication" emoji="✖️">
                  כפל
                </Tab>
                <Tab to="/division" emoji="➗">
                  חילוק
                </Tab>

                {/* ✅ חדש: צ'אט RAG */}
                <Tab to="/cat-rag" emoji="💬">
                  צ׳אט RAG
                </Tab>

                <Tab to="/about" emoji="ℹ️">
                  אודות
                </Tab>
              </nav>
            )}
          </div>
        </header>

        <main className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          <Routes>
            {/* ✅ דף ראשי: מפנה לפי מצב התחברות */}
            <Route
              path="/"
              element={<Navigate to={authed ? "/start" : "/login"} replace />}
            />

            {/* ✅ דפים ציבוריים */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <CheckTest1 />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="/about" element={<About />} />

            {/* ✅ בית (מוגן) */}
            <Route
              path="/start"
              element={
                <ProtectedRoute>
                  <Start />
                </ProtectedRoute>
              }
            />

            {/* ✅ תרגולים (מוגנים) */}
            <Route
              path="/addition"
              element={
                <ProtectedRoute>
                  <AdditionPractice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subtraction"
              element={
                <ProtectedRoute>
                  <SubtractionPractice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/multiplication"
              element={
                <ProtectedRoute>
                  <MultiplicationPractice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/division"
              element={
                <ProtectedRoute>
                  <DivisionPractice />
                </ProtectedRoute>
              }
            />

            {/* ✅ חדש: CatStory (מוגן) — זה הנתיב שחסר לך */}
            <Route
              path="/cat-story"
              element={
                <ProtectedRoute>
                  <CatStory />
                </ProtectedRoute>
              }
            />

            {/* ✅ חדש: צ'אט RAG (מוגן) */}
            <Route
              path="/cat-rag"
              element={
                <ProtectedRoute>
                  <CatRagChat />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="mt-6 text-center text-xs font-semibold text-slate-600">
          טיפ: אם טעית — זה בסדר! חתולים לומדים לאט ובטוח 😺
        </footer>
      </div>
    </div>
  );
}
