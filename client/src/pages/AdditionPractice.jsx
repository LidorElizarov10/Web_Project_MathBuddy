import React, { useState, useRef } from "react";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";


const LEVEL_TEXT = {
  easy: {
    title: "רמה קלה 😺",
    body:
      "פה אנחנו עושים חיבור כמו שהחתול אוהב: רגוע וברור.\n" +
      "מתחילים מהמספר הראשון.\n" +
      "את המספר השני הופכים לצעדים קדימה וסופרים לאט.\n" +
      "דוגמה: 3 + 2 → 4, 5.\n" +
      "טיפ של חתול: אם יש 0 — לא מוסיפים כלום 😸",
  },

  medium: {
    title: "רמה בינונית 🐾",
    body:
      "כאן החתול כבר משתמש בטריק קטן וחכם.\n" +
      "במקום לספור הרבה צעדים, מגיעים למספר עגול.\n" +
      "קודם משלימים לעשר או לעשרות.\n" +
      "ואז מוסיפים את מה שנשאר.\n" +
      "דוגמה: 28 + 7 → 30 ואז 35.\n" +
      "טיפ של חתול: מספרים עגולים הם הכי נוחים 🐾",
  },

  hard: {
    title: "רמה קשה 🐯",
    body:
      "זו רמה לחתולים רציניים במיוחד.\n" +
      "כדי לא להתבלבל, מפרקים את המספרים לחלקים.\n" +
      "קודם מחברים עשרות או מאות.\n" +
      "אחר כך מחברים יחידות.\n" +
      "בסוף מחברים את הכל יחד.\n" +
      "דוגמה: 146 + 37 → 176 ואז 183.\n" +
      "טיפ של חתול: לפרק לחלקים זה כמו לגו 🧱",
  },
};




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
  const a = randInt(min, max);
  const b = randInt(min, max);
  return { a, b, ans: a + b };
}

export default function PracticeAddition() {
  const timerRef = useRef(null);
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);
  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeQuestion("easy"));
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
        position: "relative", 
      }}
    >
      <CatCongrats />   
      <CatUncongrats />

      <h2>תרגול חיבור</h2>

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
       ?=  {q.a} + {q.b} 
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

  <p className="mt-2 text-sm leading-7 text-slate-700">
    {LEVEL_TEXT[level]?.body ?? "בחר רמה כדי לראות הסבר."}
  </p>
</div>

    </div>
  );
}
