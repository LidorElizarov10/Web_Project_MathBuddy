import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCatCongrats from "./useCatCongrats";
import useCatUncongrats from "./useCatUncongrats";

const ADD_STATE_KEY = "addition_practice_state_v1";

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
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const { triggerCatFx, CatCongrats } = useCatCongrats(900);
  const { triggerBadCatFx, CatUncongrats } = useCatUncongrats(900);

  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeQuestion("easy"));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");

  const [scoreA, setScoreA] = useState(null);

  // ✅ הסיפור שחוזר מ-CatStory
  const [story, setStory] = useState("");

  // ✅ שמירת מצב התרגיל (כדי שלא יתאפס כשעוברים ל-RAG וחוזרים)
  function savePracticeState(next = {}) {
    const payload = {
      level,
      q,
      input,
      msg,
      scoreA,
      ...next,
    };
    sessionStorage.setItem(ADD_STATE_KEY, JSON.stringify(payload));
  }

  function clearPracticeState() {
    sessionStorage.removeItem(ADD_STATE_KEY);
  }

  // ✅ שחזור מצב תרגיל + שחזור סיפור כשחוזרים מה-RAG
  useEffect(() => {
    const saved = sessionStorage.getItem(ADD_STATE_KEY);
    if (saved) {
      try {
        const st = JSON.parse(saved);
        if (st?.level) setLevel(st.level);
        if (st?.q) setQ(st.q);
        if (typeof st?.input === "string") setInput(st.input);
        if (typeof st?.msg === "string") setMsg(st.msg);
        if (typeof st?.scoreA === "number") setScoreA(st.scoreA);
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

  // ✅ פונקציה אחת שמייצרת “תרגיל הבא” + מנקה את הישן
  function goNextQuestion(nextLevel = level) {
    // מנקים טיימר קודם אם קיים
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // ✅ זה סט חדש, אז לא צריך לשמר מצב ישן
    clearPracticeState();

    // ✅ מנקים דברים שקשורים לתרגיל הקודם
    setStory("");
    sessionStorage.removeItem("cat_story_text");
    setMsg("");
    setInput("");

    // ✅ מייצרים שאלה חדשה
    setQ(makeQuestion(nextLevel));
  }

  // ✅ שולח את המספרים לדף הסיפור (RAG)
  function goStory() {
    // ✅ שלא יחליף שאלה בזמן שאנחנו עוברים לסיפור
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // ✅ שמירת מצב כדי שכשתחזור - אותו תרגיל יישאר
    savePracticeState();

    navigate("/cat-story", { state: { a: q.a, b: q.b, op: "+" } });
  }

  // ✅ מעלה score
  async function incAdditionScore() {
    const username = localStorage.getItem("username");
    if (!username) return;

    try {
      const res = await fetch("http://localhost:3000/score/addition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        if (typeof data.addition === "number") {
          setScoreA(data.addition);
          // ✅ נשמור גם את הניקוד כדי שלא יתאפס אם הולכים ל-RAG
          savePracticeState({ scoreA: data.addition });
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
      // ✅ נשמור מצב עדכני
      savePracticeState({ msg: "הקלד מספר" });
      return;
    }

    if (val === q.ans) {
      setMsg("✅ נכון");
      incAdditionScore();
      triggerCatFx();

      // ✅ אחרי שנייה עוברים לתרגיל הבא ומנקים את הישן
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        goNextQuestion(level);
      }, 1000);

      // ✅ נשמור את זה (למקרה שהולכים ל-RAG מיד)
      savePracticeState({ msg: "✅ נכון" });
    } else {
      triggerBadCatFx();
      setMsg("❌ לא נכון");
      savePracticeState({ msg: "❌ לא נכון" });
    }
  }

  function changeLevel(newLevel) {
    setLevel(newLevel);
    // ✅ גם כאן: כשמחליפים רמה, זה “סט חדש” => מנקים תרגיל קודם + סיפור קודם
    goNextQuestion(newLevel);
  }

  // ✅ לנקות טיימר ביציאה מהקומפוננטה
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

      <h2>תרגול חיבור</h2>

      <p style={{ marginTop: 6, color: "#334155", fontWeight: 700 }}>
        ניקוד : {scoreA ?? "—"}
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
        ?= {q.a} + {q.b}
      </div>

      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          // ✅ שומרים בזמן הקלדה, כדי שאם הולכים ל-RAG לא נאבד
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

        {/* ✅ כפתור ידני לתרגיל הבא (מוחק סיפור/הודעות של הקודם) */}
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

      {/* הודעה נכון/לא נכון */}
      {msg ? (
        <div style={{ marginTop: 10, fontWeight: 800, color: "#0f172a" }}>
          {msg}
        </div>
      ) : null}

      {/* טקסט הסבר לרמה */}
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

      {/* ✅ הסיפור שחזר */}
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
