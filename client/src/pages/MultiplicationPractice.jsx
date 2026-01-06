import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats.jsx";
import useCatUncongrats from "./useCatUncongrats.jsx";

const MULT_STATE_KEY = "multiplication_practice_state_v1";

const LEVEL_TEXT = {
  beginners: {
    title: "מתחילים 😺",
    body:
      "מתי החתול מסביר שכפל זה חיבור שחוזר על עצמו.\n" +
      "בוחרים מספר אחד.\n" +
      "מחברים אותו שוב ושוב.\n" +
      "דוגמה: 3 × 2 זה כמו 3 + 3.\n" +
      "אפשר לצייר עיגולים או להשתמש באצבעות.\n" +
      "טיפ של מתי: לאט וברור זה הכי טוב 😸",
  },
  advanced: {
    title: "מתקדמים 🐾",
    body:
      "מתי החתול כבר יודע לחשב מהר יותר.\n" +
      "משתמשים בלוח הכפל.\n" +
      "זוכרים תרגילים מוכרים.\n" +
      "אם קשה — מפרקים לחלקים.\n" +
      "דוגמה: 6 × 7 → קודם 6 × 5 ואז 6 × 2.\n" +
      "מחברים את התוצאות.\n" +
      "טיפ של מתי: לפרק עושה את זה קל 🐾",
  },
  champs: {
    title: "אלופים 🐯",
    body:
      "זו רמה של אלופים אמיתיים.\n" +
      "מתי החתול כבר מכיר את לוח הכפל טוב.\n" +
      "אפשר להשתמש בטריקים חכמים.\n" +
      "בודקים אם התשובה הגיונית.\n" +
      "דוגמה: 9 × 12 → 10 × 12 ואז מורידים 12.\n" +
      "מהיר וחכם.\n" +
      "טיפ של מתי: לחשוב רגע חוסך טעויות 🧠",
  },
};

const LEVELS = {
  beginners: { label: "מתחילים", min: 0, max: 5 },
  advanced: { label: "מתקדמים", min: 0, max: 10 },
  champs: { label: "אלופים", min: 0, max: 12 },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey];
  const a = randInt(min, max);
  const b = randInt(min, max);
  return { a, b, ans: a * b };
}

export default function PracticeMultiplication() {
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("beginners");
  const [q, setQ] = useState(() => makeQuestion("beginners"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");

  const [scoreM, setScoreM] = useState(null);

  // ✅ הסיפור שחוזר מ-CatStory
  const [story, setStory] = useState("");

  function savePracticeState(next = {}) {
    const payload = { level, q, input, msg, scoreM, ...next };
    sessionStorage.setItem(MULT_STATE_KEY, JSON.stringify(payload));
  }

  function clearPracticeState() {
    sessionStorage.removeItem(MULT_STATE_KEY);
  }

  // ✅ שחזור מצב תרגיל + שחזור סיפור
  useEffect(() => {
    const saved = sessionStorage.getItem(MULT_STATE_KEY);
    if (saved) {
      try {
        const st = JSON.parse(saved);
        if (st?.level) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.scoreM === "number") setScoreM(st.scoreM);
      } catch {}
    }

    const s = sessionStorage.getItem("cat_story_text");
    if (s) {
      setStory(s);
      sessionStorage.removeItem("cat_story_text");
    }
  }, []);

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

  function goStory() {
    // ✅ שלא יחליף שאלה בזמן מעבר לסיפור
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    savePracticeState();

    navigate("/cat-story", { state: { a: q.a, b: q.b, op: "×" } });
  }

  async function incMultiplicationScore() {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const res = await fetch("http://localhost:3000/score/multiplication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        if (typeof data.multiplication === "number") {
          setScoreM(data.multiplication);
          savePracticeState({ scoreM: data.multiplication });
        }
      }
    } catch {
      // שקט
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
      incMultiplicationScore();
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

      <h2>תרגול כפל</h2>

      <p style={{ marginTop: 6, color: "#334155", fontWeight: 700 }}>
        ניקוד : {scoreM ?? "—"}
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
        ?= {q.a} × {q.b}
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
