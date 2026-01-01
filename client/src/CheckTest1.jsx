import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ אם כבר מחובר – לא מציגים מסך לוגין בכלל
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "1") {
      navigate("/addition", { replace: true });
    }
  }, [navigate]);

  async function check(e) {
    if (e?.preventDefault) e.preventDefault();

    if (loading) return;

    if (username.trim() === "" || password.trim() === "") {
      setMsg("הכנס שם משתמש וסיסמה");
      return;
    }

    setLoading(true);
    setMsg("בודק...");

    try {
      const res = await fetch("http://localhost:3000/check-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.error || "שגיאה");
        return;
      }

      if (data.ok) {
        setMsg("התחברות הצליחה ✅");

        localStorage.setItem("isLoggedIn", "1");
        localStorage.setItem("username", username);

        window.dispatchEvent(new Event("auth-changed")); // מעדכן את התפריט

        navigate("/addition", { replace: true }); // ✅ מעבר ישר
        return;
      }

      if (data.reason === "NO_USER") {
        setMsg("שם משתמש לא קיים ❌");
      } else {
        setMsg("סיסמה לא נכונה ❌");
      }
    } catch {
      setMsg("השרת לא זמין");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>בדיקת התחברות</h2>

      {/* ✅ Enter עובד */}
      <form onSubmit={check}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="שם משתמש"
          style={{ padding: "10px", width: "100%", marginBottom: 10 }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          type="password"
          style={{ padding: "10px", width: "100%", marginBottom: 10 }}
        />

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "בודק..." : "בדוק"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>{msg}</p>
    </div>
  );
}

