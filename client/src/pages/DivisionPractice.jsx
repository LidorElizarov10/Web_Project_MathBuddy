import React, { useState, useRef } from "react";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";

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

function randNice(min, max) {
  let x = randInt(min, max);
  if ((x === 0 || x === 1) && max >= 6) {
    if (Math.random() < 0.7) x = randInt(Math.max(2, min), max);
  }
  return x;
}

// תמיד יוצא תרגיל עם תשובה שלמה: dividend ÷ divisor = answer
function makeQuestion(levelKey) {
  const L = LEVELS[levelKey];
  const divisor = randNice(L.minDivisor, L.maxDivisor);
  const answer = randNice(2, L.maxAnswer);
  const dividend = divisor * answer;
  return { dividend, divisor, ans: answer };
}

export default function DivisionPracticeK() {
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const timerRef = useRef(null);

  const [level, setLevel] = useState("beginners");
  const [q, setQ] = useState(() => makeQuestion("beginners"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");

  function checkAnswer() {
    const val = Number(input);
    if (input.trim() === "" || !Number.isFinite(val)) {
      setMsg("הקלד מספר");
      return;
    }

    if (val === q.ans) {
      setMsg("✅ נכון");
      triggerCatFx();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setQ(makeQuestion(level));
        setInput("");
        setMsg("");
      }, 1000);
    } else {
      triggerBadCatFx();
      setMsg("❌ לא נכון");
    }
  }

  function changeLevel(newLevel) {
    setLevel(newLevel);
    setQ(makeQuestion(newLevel));
    setInput("");
    setMsg("");
  }

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 420, margin: "40px auto", direction: "rtl", textAlign: "right" }}>
      <CatCongrats />
      <CatUncongrats />

      <h2>תרגול חילוק</h2>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>בחר רמה</label>

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
        ? = {q.dividend} ÷ {q.divisor}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="תשובה"
        style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={checkAnswer}>בדוק</button>
      </div>

      {msg && <div style={{ marginTop: 10, fontWeight: 800 }}>{msg}</div>}

      <label style={{ display: "block", marginTop: 14, marginBottom: 8, fontWeight: 700 }}>הסבר לפי רמה</label>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-slate-900">{LEVEL_TEXT[level]?.title ?? "הסבר לרמה"}</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            {LEVELS[level]?.label}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
          {LEVEL_TEXT[level]?.body ?? "בחר רמה כדי לראות הסבר."}
        </p>
      </div>
    </div>
  );
}
