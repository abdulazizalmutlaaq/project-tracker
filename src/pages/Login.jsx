import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(translateError(error.message));
  }

  function translateError(msg) {
    if (/invalid login credentials/i.test(msg)) return "الإيميل أو كلمة المرور غير صحيحة";
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
              className="w-full rounded-lg border border-brand-100 px-3 py-2.5 text-sm focus-ring outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-700 hover:bg-brand-800 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {busy ? "جاري..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
