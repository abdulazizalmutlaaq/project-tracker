import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!fullName.trim()) throw new Error("اكتب الاسم الكامل");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setNotice("تم إنشاء الحساب. تقدر تسجّل دخول الحين، وبانتظار PM يفعّل صلاحياتك.");
        setMode("signin");
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setBusy(false);
    }
  }

  function translateError(msg) {
    if (/already registered/i.test(msg)) return "هذا الإيميل مسجّل مسبقًا";
    if (/invalid login credentials/i.test(msg)) return "الإيميل أو كلمة المرور غير صحيحة";
    if (/password/i.test(msg) && /least/i.test(msg)) return "كلمة المرور لازم تكون 6 أحرف على الأقل";
    return msg;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-rust-500 mb-4">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M8 20l5-6 4 4 7-9" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-brand-50 text-xl font-semibold">نظام متابعة الجدول الزمني</h1>
          <p className="text-brand-400 text-sm mt-1">تسجيل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-xl space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">الاسم الكامل</label>
              <input
                className="w-full rounded-lg border border-brand-100 px-3 py-2.5 text-sm focus-ring outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="محمد العتيبي"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">الإيميل</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-brand-100 px-3 py-2.5 text-sm focus-ring outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-brand-100 px-3 py-2.5 text-sm focus-ring outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {notice && <p className="text-sm text-ok bg-green-50 rounded-lg px-3 py-2">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-700 hover:bg-brand-800 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {busy ? "جاري..." : mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}
            className="w-full text-center text-sm text-brand-600 hover:text-brand-800"
          >
            {mode === "signin" ? "ما عندك حساب؟ سجّل جديد" : "عندك حساب؟ سجّل دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
