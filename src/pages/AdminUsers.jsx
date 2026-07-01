import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
    setProfiles(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(p) {
    const newRole = p.role === "admin" ? "engineer" : "admin";
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, role: newRole } : x)));
    await supabase.from("profiles").update({ role: newRole }).eq("id", p.id);
  }

  if (loading) return <div className="text-center py-16 text-idle text-sm">جاري التحميل...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink mb-1">المستخدمين</h2>
      <p className="text-sm text-idle mb-4">حدّد من هو مدير المشروع (يشوف ويعدّل كل شي) ومن مهندس (يعدّل بنوده بس من صفحة الجدول).</p>

      <div className="rounded-xl border border-brand-100 bg-white divide-y divide-brand-50">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {p.full_name} {p.id === user.id && <span className="text-idle text-xs">(أنت)</span>}
              </p>
              <p className="text-xs text-idle">{p.role === "admin" ? "مدير المشروع" : "مهندس"}</p>
            </div>
            <button
              onClick={() => toggleRole(p)}
              disabled={p.id === user.id}
              className="text-xs rounded-md border border-brand-100 px-3 py-1.5 text-brand-700 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {p.role === "admin" ? "تنزيل لمهندس" : "ترقية لمدير مشروع"}
            </button>
          </div>
        ))}
        {profiles.length === 0 && <p className="px-4 py-8 text-center text-sm text-idle">ما فيه مستخدمين بعد</p>}
      </div>

      <p className="text-xs text-idle mt-3">
        بعد ما ينضم مهندس جديد، روح صفحة "الجدول" ووزّع عليه البنود من عمود "المسؤول".
      </p>
    </div>
  );
}
