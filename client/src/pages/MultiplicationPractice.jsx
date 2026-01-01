import React, { useState, useRef } from "react";
import useCatCongrats from "./useCatCongrats.jsx";
import useCatUncongrats from "./useCatUncongrats.jsx";

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
  advanced:  { label: "מתקדמים", min: 0, max: 10 },
  champs:    { label: "אלופים",  min: 0, max: 12 },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// מוריד סיכוי לקבל 0 או 1 כדי לא לשעמם (ברמות שמעל 5)
function randFactor(min, max) {
  let x = randInt(min, max);
  if ((x === 0 || x === 1) && max >= 6) {
    if (Math.random() < 0.7) x = randInt(Math.max(2, min), max);
  }
  return x;
}

function makeQuestion(levelKey) {
  const { min, max } = LEVELS[levelKey];
  const a = randFactor(min, max);
  const b = randFactor(min, max);
  return { a, b, ans: a * b };
}

export default function PracticeMultiplicationKids() {
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
    <div
      style={{
        fontFamily: "Arial",
        maxWidth: 420,
        margin: "40px auto",
        direction: "rtl",
        textAlign: "right",
      }}
    >

      <CatCongrats />   
      <CatUncongrats />
      <h2>תרגול כפל</h2>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
        בחר רמה
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
         ?={q.b} × {q.a} 
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


       <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
        רמת קושי
      </label>

    {/* טקסט מתעדכן למטה */}
<div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
  <div className="flex items-center justify-between gap-3">
    <p className="text-sm font-extrabold text-slate-900">
      {LEVEL_TEXT[level]?.title ?? "הסבר לרמה"}
    </p>
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
