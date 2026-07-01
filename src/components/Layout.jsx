import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { profile, isAdmin, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F3F5F6]">
      <header className="bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-rust-500 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M8 20l5-6 4 4 7-9" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">نظام متابعة الجدول الزمني</h1>
              <p className="text-[11px] text-brand-400 leading-tight">متابعة تنفيذ البنود الإنشائية</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${location.pathname === "/" ? "bg-brand-700 text-white" : "text-brand-100 hover:bg-brand-800"}`}
            >
              المشاريع
            </Link>
            {isAdmin && (
              <Link
                to="/users"
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${location.pathname === "/users" ? "bg-brand-700 text-white" : "text-brand-100 hover:bg-brand-800"}`}
              >
                المستخدمين
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-xs font-medium leading-tight">{profile?.full_name}</p>
              <p className="text-[10px] text-brand-400 leading-tight">{isAdmin ? "مدير المشروع" : "مهندس"}</p>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-brand-400 hover:text-white border border-brand-700 hover:border-brand-600 rounded-md px-2.5 py-1.5 transition-colors"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
