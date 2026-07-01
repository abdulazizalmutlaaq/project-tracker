import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [pmId, setPmId] = useState("");
  const [engineers, setEngineers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*, pm:profiles!projects_pm_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (isAdmin) {
      supabase.from("profiles").select("id, full_name").then(({ data }) => setEngineers(data || []));
    }
  }, [isAdmin]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("اكتب اسم المشروع");
    setBusy(true);
    const { data, error } = await supabase.rpc("create_project", {
      p_name: name.trim(),
      p_pm: pmId || null,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setPmId("");
    setShowForm(false);
    await load();
    if (data) navigate(`/project/${data}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">المشاريع</h2>
          <p className="text-sm text-idle">اختر مشروع للدخول عليه</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm bg-rust-500 hover:bg-rust-600 text-white rounded-lg px-4 py-2 font-medium transition-colors"
          >
            + مشروع جديد
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-brand-100 p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">اسم المشروع</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm focus-ring outline-none"
              placeholder="مثال: مشروع فلل النرجس"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">المسؤول عن المشروع</label>
            <select
              value={pmId}
              onChange={(e) => setPmId(e.target.value)}
              className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm focus-ring outline-none"
            >
              <option value="">— بدون تحديد —</option>
              {engineers.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"
            >
              {busy ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-idle px-4 py-2"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-idle text-sm">جاري التحميل...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/project/${p.id}`)}
              className="text-right bg-white rounded-xl border border-brand-100 p-4 hover:border-rust-500 hover:shadow-sm transition-all"
            >
              <p className="font-semibold text-ink">{p.name}</p>
              <p className="text-xs text-idle mt-1">المسؤول: {p.pm?.full_name || "غير محدد"}</p>
            </button>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-idle col-span-2 text-center py-8">ما فيه مشاريع بعد</p>
          )}
        </div>
      )}
    </div>
  );
}
