import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";

const SUB_STATE_KEY = "subtraction_practice_state_v1";

const LEVELS = {
  easy: { label: "קל (0–10)", min: 0, max: 10 },
  medium: { label: "בינוני (0–50)", min: 0, max: 50 },
  hard: { label: "קשה (0–200)", min: 0, max: 200 },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey];
  let a = randInt(min, max);
  let b = randInt(min, max);

  // ✅ אם יצא הפוך – מחליפים
  if (a < b) [a, b] = [b, a];

  return { a, b, ans: a - b };
}

const LEVEL_TEXT = {
  easy: {
    title: "רמה קלה 😺",
    body:
      "פה החתול לומד חיסור רגוע וברור.\n" +
      "מתחילים מהמספר הגדול.\n" +
      "את המספר השני הופכים לצעדים אחורה.\n" +
      "סופרים לאט לאחור.\n" +
      "דוגמה: 5 − 2 → 4, 3.\n" +
      "טיפ של חתול: אם מחסרים 0 — הכל נשאר אותו דבר 😸",
  },

  medium: {
    title: "רמה בינונית 🐾",
    body:
      "כאן החתול משתמש בטריק חכם של חיסור.\n" +
      "במקום לספור הרבה צעדים אחורה,\n" +
      "מחסרים קודם מספר קטן ונוח.\n" +
      "מגיעים למספר עגול.\n" +
      "ואז מחסרים את מה שנשאר.\n" +
      "דוגמה: 34 − 6 → 30 ואז 28.\n" +
      "טיפ של חתול: מספרים עגולים עושים חיסור קל 🐾",
  },

  hard: {
    title: "רמה קשה 🐯",
    body:
      "זו רמה לחתולים שכבר שולטים בחיסור.\n" +
      "כדי לא להתבלבל, מפרקים את המספר שמחסרים.\n" +
      "קודם מחסרים עשרות.\n" +
      "אחר כך מחסרים יחידות.\n" +
      "בסוף בודקים שהכל הגיוני.\n" +
      "דוגמה: 146 − 37 → 116 ואז 109.\n" +
      "טיפ של חתול: לפרק זה סוד החישוב החכם 🧠",
  },
};

export default function PracticeSubtraction() {
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeQuestion("easy"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");

  const [scoreS, setScoreS] = useState(null);

  // ✅ הסיפור שחוזר מ-CatStory
  const [story, setStory] = useState("");

  // ✅ שמירת מצב התרגיל
  function savePracticeState(next = {}) {
    const payload = {
      level,
      q,
      input,
      msg,
      scoreS,
      ...next,
    };
    sessionStorage.setItem(SUB_STATE_KEY, JSON.stringify(payload));
  }

  function clearPracticeState() {
    sessionStorage.removeItem(SUB_STATE_KEY);
  }

  // ✅ שחזור מצב תרגיל + שחזור סיפור
  useEffect(() => {
    const saved = sessionStorage.getItem(SUB_STATE_KEY);
    if (saved) {
      try {
        const st = JSON.parse(saved);
        if (st?.level) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.scoreS === "number") setScoreS(st.scoreS);
      } catch {
        // ignore
      }
    }

    const s = sessionStorage.getItem("cat_story_text");
    if (s) {
      setStory(s);
      sessionStorage.removeItem("cat_story_text");
    }
  }, []);

  // ✅ תרגיל הבא + ניקוי תרגיל קודם
  function goNextQuestion(nextLevel = level) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    clearPracticeState();

    setStory("");
    sessionStorage.removeItem("cat_story_text");
    setMsg("");
    setInput("");

    setQ(makeQuestion(nextLevel));
  }

  // ✅ מעבר ל-RAG על התרגיל הנוכחי
  function goStory() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    savePracticeState();

    navigate("/cat-story", { state: { a: q.a, b: q.b, op: "-" } });
  }

  // ✅ העלאת ניקוד חיסור
  async function incSubtractionScore() {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const res = await fetch("http://localhost:3000/score/subtraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        // תומך בשתי צורות: subtraction / score
        const newVal =
          typeof data.subtraction === "number"
            ? data.subtraction
            : typeof data.score === "number"
            ? data.score
            : null;

        if (typeof newVal === "number") {
          setScoreS(newVal);
          savePracticeState({ scoreS: newVal });
        }
      }
    } catch {
      // לא מפריעים לילד אם השרת לא זמין
    }
  }

  function checkAnswer() {
    const val = Number(input);
    if (input.trim() === "" || !Number.isFinite(val)) {
      setMsg("הקלד מספר");
      savePracticeState({ msg: "הקלד מספר" });
      return;
    }

    if (val === q.ans) {
      setMsg("✅ נכון");
      incSubtractionScore();
      triggerCatFx();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        goNextQuestion(level);
      }, 1000);

      savePracticeState({ msg: "✅ נכון" });
    } else {
      triggerBadCatFx();
      setMsg("❌ לא נכון");
      savePracticeState({ msg: "❌ לא נכון" });
    }
  }

  function changeLevel(newLevel) {
    setLevel(newLevel);
    goNextQuestion(newLevel);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        maxWidth: 420,
        margin: "40px auto",
        direction: "rtl",
        textAlign: "right",
        position: "relative",
      }}
    >
      <CatCongrats />
      <CatUncongrats />

      <h2>תרגול חיסור</h2>

      <p style={{ marginTop: 6, color: "#334155", fontWeight: 700 }}>
        ניקוד : {scoreS ?? "—"}
      </p>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
        רמת קושי
      </label>

      <select
        value={level}
        onChange={(e) => changeLevel(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
      >
        {Object.entries(LEVELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>

      <div style={{ fontSize: 28, fontWeight: 800, margin: "16px 0" }}>
        ?= {q.b} − {q.a}
      </div>

      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          savePracticeState({ input: e.target.value });
        }}
        placeholder="תשובה"
        style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={checkAnswer}>בדוק</button>

        <button
          onClick={goStory}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "6px 10px",
          }}
          title="מתי החתול יספר סיפור על התרגיל הזה"
        >
          ספר סיפור 😺
        </button>

        <button
          onClick={() => goNextQuestion(level)}
          style={{
            background: "#0f172a",
            color: "white",
            border: "1px solid #0f172a",
            borderRadius: 8,
            padding: "6px 10px",
          }}
          title="עובר לתרגיל הבא ומנקה את הקודם"
        >
          תרגיל הבא ➜
        </button>
      </div>

      {msg ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#0f172a" }}>
          {msg}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-slate-900">
            {LEVEL_TEXT[level]?.title ?? "הסבר לרמה"}
          </p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            {LEVELS[level]?.label}
          </span>
        </div>

        <p className="mt-2 text-sm leading-7 text-slate-700 whitespace-pre-line">
          {LEVEL_TEXT[level]?.body ?? "בחר רמה כדי לראות הסבר."}
        </p>
      </div>

      {story ? (
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-sm font-extrabold text-slate-900">
            הסיפור של מתי 😺
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {story}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
