import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

const KB = [
  "מתי מצא 5 כדורי צמר ואז עוד 5 כדורי צמר, והוא ספר אותם ביחד.",
  "מתי אסף 7 מדבקות, ואז חבר נתן לו עוד 3 מדבקות.",
  "למתי היו 12 סוכריות והוא נתן 4 לחבר.",
  "למתי היו 9 בלונים, אחד התפוצץ ועוד שניים עפו.",
  "מתי סידר 3 צלחות ובכל צלחת שם 4 עוגיות.",
  "מתי בנה 5 מגדלי לגו ובכל מגדל 2 קוביות.",
  "למתי היו 12 דגים והוא חילק אותם שווה בשווה בין חברים.",
  "למתי היו 10 עפרונות והוא חילק אותם לשני קלמרים.",
  "מתי אוהב לצייר נקודות כדי לראות כמה יש.",
  "מתי בודק מספרים לאט ובסבלנות.",
  "מתי גר בכפר קטן ומשתמש בדברים יומיומיים כדי להסביר חשבון.",
  "מתי מסביר לחברים בעזרת צעצועים ודוגמאות קטנות.",
];

function chunkText(text, size = 220, overlap = 40) {
  const clean = text.trim().replace(/\s+/g, " ");
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    chunks.push(clean.slice(i, i + size));
    i += size - overlap;
  }
  return chunks.filter(Boolean);
}

function cosineSim(a, b) {
  const n = Math.min(a?.length || 0, b?.length || 0);
  if (!n) return -1;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < n; i++) {
    const av = Number(a[i]) || 0;
    const bv = Number(b[i]) || 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

function normalizeExercise(raw) {
  const s = (raw || "").trim().replace(/\s+/g, "");
  return s.replace("×", "*").replace("÷", "/");
}

// ✅ חדש: מחשבים תוצאה *בצד שלנו*
function computeResult(a, b, op) {
  const A = Number(a);
  const B = Number(b);
  const O = normalizeExercise(op);

  if (!Number.isFinite(A) || !Number.isFinite(B)) return null;

  switch (O) {
    case "+":
      return A + B;
    case "-":
      return A - B;
    case "*":
      return A * B;
    case "/":
      // אם אתה לא רוצה שברים לילדים:
      if (B === 0) return null;
      // אפשר להחזיר רק אם מתחלק יפה:
      if (A % B !== 0) return A / B; // או return null; אם אתה רוצה רק שלמים
      return A / B;
    default:
      return null;
  }
}

// ✅ חדש: בדיקה שהמודל לא “הוסיף מספרים”
function isValidStory(story, q, expected) {
  if (!story) return false;

  const mustLine = `${q} = ${expected}`;
  if (!story.includes(mustLine)) return false;

  // לא מרשים שום מספר אחר חוץ מ-a,b,expected (גם לא “7” פתאום)
  // מוצאים כל המספרים בטקסט:
  const nums = (story.match(/-?\d+(\.\d+)?/g) || []).map(Number);

  // מפרקים את q כדי לדעת מה a,b בפועל
  const m = q.match(/^(-?\d+)([+\-*/])(-?\d+)$/);
  if (!m) return false;
  const A = Number(m[1]);
  const B = Number(m[3]);

  const allowed = new Set([A, B, Number(expected)]);
  return nums.every((n) => allowed.has(n));
}

export default function CatStory() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = useMemo(() => new GoogleGenAI({ apiKey: API_KEY }), [API_KEY]);

  const { state } = useLocation();
  const navigate = useNavigate();

  const a = state?.a;
  const b = state?.b;
  const op = state?.op || "+";

  const docs = useMemo(() => chunkText(KB.join("\n"), 220, 40), []);
  const vecsRef = useRef([]);

  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  const [indexed, setIndexed] = useState(false);
  const didRunRef = useRef(false);

  useEffect(() => {
    (async () => {
      setErr("");
      setIndexed(false);

      if (!API_KEY) {
        setErr("חסר VITE_GEMINI_API_KEY ב-.env/.env.local ואז צריך restart ל-vite");
        setStatus("failed ❌");
        return;
      }

      try {
        setStatus("Indexing (embeddings)...");
        const emb = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: docs,
        });

        vecsRef.current = emb.embeddings.map((e) => e.values);
        setIndexed(true);
        setStatus("ready ✅");
      } catch (e) {
        console.error(e);
        setErr(e?.message || "שגיאה לא ידועה");
        setStatus("failed ❌");
      }
    })();
  }, [API_KEY, ai, docs]);

  useEffect(() => {
    (async () => {
      if (!indexed) return;
      if (didRunRef.current) return;
      if (a == null || b == null) return;

      const q = normalizeExercise(`${a}${op}${b}`);
      const expected = computeResult(a, b, op);

      if (expected == null) {
        setErr("התרגיל לא תקין (אולי חילוק באפס/בעיה במספרים).");
        setStatus("failed ❌");
        return;
      }

      didRunRef.current = true;

      try {
        setStatus("Embedding question...");
        const qEmb = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: q,
        });

        const qVec = qEmb.embeddings?.[0]?.values;
        if (!qVec) throw new Error("Question embedding missing");

        setStatus("Retrieving context...");
        const scored = docs
          .map((text, i) => ({ text, score: cosineSim(qVec, vecsRef.current[i]) }))
          .sort((x, y) => y.score - x.score)
          .slice(0, 4);

        const context = scored
          .map((s, idx) => `Source ${idx + 1}: ${s.text}`)
          .join("\n\n");

        // ✅ פונקציה לנסיון חוזר אם הוא מזייף
        async function generateOnce(strict) {
          const mustLine = `${q} = ${expected}`;

          const prompt = `
אתה "מתי החתול" שמלמד ילדים חשבון. תכתוב בעברית פשוטה לילדים.

חוקים חובה:
- בדיוק 5 עד 7 שורות.
- בלי סיכום/מסקנה/״תשובה״ בסוף.
- שורה אחת חייבת להיות *בדיוק* כך (כולל רווחים): ${mustLine}
- אל תכתוב שום מספר אחר בטקסט (לא ספרות ולא במילים). מותר רק: ${a}, ${b}, ${expected}
- משפט קצר אחד שמסביר מה עושים בפעולה (${q.includes("+") ? "חיבור" : q.includes("-") ? "חיסור" : q.includes("*") ? "כפל" : "חילוק"}).

מקורות (רק השראה לסצנה):
${context}

תרגיל: ${q}

${strict ? "אם אתה לא יכול לעמוד בכללים — תחזיר רק 3 שורות לפי הכללים." : ""}
`.trim();

          // ✅ מורידים יצירתיות כדי שלא “יזייף”
          const res = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            // אם הספרייה שלך תומכת: זה עוזר מאוד
            // generationConfig: { temperature: 0, topP: 0.1 },
            // או לפעמים זה נקרא:
            // config: { temperature: 0, topP: 0.1 },
          });

          return res?.text || "";
        }

        setStatus("Generating story...");
        let storyText = await generateOnce(false);

        // ✅ בדיקה + ניסיון חוזר קשוח
        if (!isValidStory(storyText, q, expected)) {
          storyText = await generateOnce(true);
        }

        // ✅ אם עדיין לא תקין — מתקנים לפחות את שורת המשוואה
        // (ועדיף שתראה שתקין מאשר שקרי)
        if (!isValidStory(storyText, q, expected)) {
          const lines = (storyText || "").split("\n").filter(Boolean);
          const mustLine = `${q} = ${expected}`;
          const fixed = [
            lines[0] || "מתי החתול לומד חשבון עם צעצועים.",
            mustLine,
            lines[2] || "הוא סופר לאט ובודק שלא מתבלבל.",
          ].slice(0, 4);
          storyText = fixed.join("\n");
        }

        sessionStorage.setItem("cat_story_text", storyText);
        sessionStorage.setItem("cat_story_return", "1"); // ✅ דגל שחזרנו מסיפור
        navigate(-1);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "שגיאה לא ידועה");
        setStatus("failed ❌");
      }
    })();
  }, [indexed, a, b, op, ai, docs, navigate]);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", direction: "rtl" }}>
      <h2 style={{ marginTop: 0 }}>מתי החתול מכין סיפור... 🐱📚</h2>
      <div>
        <b>Status:</b> {status}
      </div>
      {err ? <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre> : null}
      <p style={{ marginTop: 10, color: "#475569" }}>עוד רגע מחזיר אותך לתרגיל...</p>
    </div>
  );
}
