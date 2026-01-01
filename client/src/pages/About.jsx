import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-right" dir="rtl">
      {/* Header / Hero */}
      <div className="bg-white border-b border-slate-100 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-indigo-600 mb-6">
              ללמוד מתמטיקה עם חיוך 😊
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              MathBuddy נולדה כדי להוכיח שכל ילד וילדה יכולים להצליח בחשבון. 
              אנחנו משלבים טכנולוגיה חכמה עם גישה אנושית ומעודדת.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Right Side: Image/Visual Area */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-200 rounded-3xl rotate-3 scale-105 opacity-30"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-indigo-50">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-indigo-900 border-b pb-4">החזון שלנו 🚀</h3>
                  <p className="text-lg text-slate-700 leading-loose italic">
                    "המטרה שלנו היא להחליף את הפחד בביטחון עצמי. כשילד לא מפחד לטעות, הוא מתחיל באמת ללמוד ולהנות מהדרך."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Side: Text and Bullet Points */}
          <div className="order-1 lg:order-2 space-y-8">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              למה הקמנו את האפליקציה?
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              ראינו יותר מדי ילדים שחווים "חרדת מתמטיקה" כבר בכיתות הנמוכות. 
              התרגילים היבשים והלחץ מהטעות גורמים להם לוותר מראש. לכן יצרנו מקום אחר:
            </p>

            <ul className="space-y-6">
              {[
                {
                  title: "הפיכת הטעות ללמידה✨",
                  desc: "אצלנו טעות היא הזדמנות! הבוט מסביר למה זה קרה ואיך להשתפר.",
                },
                {
                  title: "התאמה אישית מלאה🎯",
                  desc: "כל ילד מקבל תרגילים ברמה המדויקת שלו - לא קל מדי ולא קשה מדי.",
                },
                {
                  title: "חיבור הורים ומורים🤝",
                  desc: "דשבורד חכם שנותן לכם הצצה בזמן אמת להצלחות ולקשיים של הילד.",
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      {/* Team / Stats Footer */}
      <div className="bg-indigo-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-8 italic opacity-90">מוכנים להפוך את המתמטיקה להרפתקה?</h3>
        </div>
      </div>
    </div>
  );
}