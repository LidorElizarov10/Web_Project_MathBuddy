import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats.jsx";
import useCatUncongrats from "./useCatUncongrats.jsx";

const DIV_STATE_KEY = "division_practice_state_v1";

const LEVEL_TEXT = {
  beginners: {
    title: "מתחילים 😺",
    body:
      "מתי החתול מסביר שחילוק זה 'לחלק שווה בשווה'.\n" +
      "לוקחים מספר גדול (עוגיות 🍪).\n" +
      "מחלקים לקבוצות שוות.\n" +
      "סופרים כמה יש בכל קבוצה.\n" +
      "דוגמה: 6 ÷ 2 → 3 לכל ילד.\n" +
      "טיפ של מתי: אפשר לצייר עיגולים ולעשות קבוצות 🟣🟣🟣",
  },
  advanced: {
    title: "מתקדמים 🐾",
    body:
      "מתי החתול כבר יודע שחילוק קשור ללוח הכפל.\n" +
      "שואלים: 'איזה מספר כפול המחלק נותן את המחולק?'\n" +
      "דוגמה: 24 ÷ 6 → מי כפול 6 נותן 24? → 4.\n" +
      "אם קשה — נסה כפולות עד שמגיעים למחולק.\n" +
      "טיפ של מתי: לחשוב על כפל עושה חילוק מהיר 🐾",
  },
  champs: {
    title: "אלופים 🐯",
    body:
      "רמה של אלופים אמיתיים.\n" +
      "מתי החתול משתמש בטריקים חכמים ופירוקים.\n" +
      "דוגמה: 96 ÷ 8 → 80 ÷ 8 = 10 וגם 16 ÷ 8 = 2 → ביחד 12.\n" +
      "בודקים עם כפל: 12 × 8 = 96 ✅\n" +
      "טיפ של מתי: בדיקה בכפל שומרת על 0 טעויות 🧠",
  },
};

const LEVELS = {
  beginners: { label: "מתחילים", minDivisor: 2, maxDivisor: 5, maxAnswer: 10 },
  advanced: { label: "מתקדמים", minDivisor: 2, maxDivisor: 10, maxAnswer: 12 },
  champs: { label: "אלופים", minDivisor: 2, maxDivisor: 12, maxAnswer: 15 },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ✅ מייצר תרגיל חילוק "נקי" בלי שברים:
// בוחרים מחלק d, בוחרים תשובה ans, ואז מחולק a = d * ans
function makeQuestion(levelKey) {
  const { minDivisor, maxDivisor, maxAnswer } = LEVELS[levelKey];
  const b = randInt(minDivisor, maxDivisor); // מחלק
  const ans = randInt(1, maxAnswer);         // תוצאה
  const a = b * ans;                         // מחולק
  return { a, b, ans };
}

export default function PracticeDivision() {
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("beginners");
  const [q, setQ] = useState(() => makeQuestion("beginners"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");

  const [scoreD, setScoreD] = useState(null);

  // ✅ הסיפור שחוזר מ-CatStory
  const [story, setStory] = useState("");

  function savePracticeState(next = {}) {
    const payload = { level, q, input, msg, scoreD, ...next };
    sessionStorage.setItem(DIV_STATE_KEY, JSON.stringify(payload));
  }

  function clearPracticeState() {
    sessionStorage.removeItem(DIV_STATE_KEY);
  }

  // ✅ שחזור מצב תרגיל + שחזור סיפור (כשחוזרים מה-RAG)
  useEffect(() => {
    const saved = sessionStorage.getItem(DIV_STATE_KEY);
    if (saved) {
      try {
        const st = JSON.parse(saved);
        if (st?.level) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.scoreD === "number") setScoreD(st.scoreD);
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

  // ✅ מעבר ל-RAG על התרגיל הנוכחי
  function goStory() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    savePracticeState();

    // op: "÷" כדי שיופיע יפה בסיפור
    navigate("/cat-story", { state: { a: q.a, b: q.b, op: "÷" } });
  }

  async function incDivisionScore() {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const res = await fetch("http://localhost:3000/score/division", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        if (typeof data.division === "number") {
          setScoreD(data.division);
          savePracticeState({ scoreD: data.division });
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
      incDivisionScore();
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

      <h2>תרגול חילוק</h2>

      <p style={{ marginTop: 6, color: "#334155", fontWeight: 700 }}>
        ניקוד : {scoreD ?? "—"}
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
        ?= {q.b} ÷ {q.a}
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
