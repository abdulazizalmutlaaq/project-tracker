import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { STATUS_STYLES } from "../lib/constants";

export default function ItemsTable({ phase, userId, isAdmin, scopeMine }) {
  const [rows, setRows] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("v_items_full")
      .select("*")
      .eq("phase", phase)
      .order("order_no", { ascending: true });
    if (!error) setRows(data || []);
    setLoading(false);
  }, [phase]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .then(({ data }) => setEngineers(data || []));
  }, [isAdmin]);

  function canEditProgress(row) {
    return isAdmin || row.assigned_to === userId;
  }

  async function updateItem(id, patch) {
    setSavingId(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from("items").update(patch).eq("id", id);
    if (error) load();
    setSavingId(null);
  }

  async function updateProgress(id, patch) {
    setSavingId(id);
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      const row = next.find((r) => r.id === id);
      if (row) {
        const pct = row.total_qty ? Math.round(((row.completed_qty || 0) / row.total_qty) * 1000) / 10 : null;
        row.percent_complete = pct;
        row.status = !row.total_qty ? "غير محدد" : (row.completed_qty || 0) >= row.total_qty ? "مكتمل" : (row.completed_qty || 0) > 0 ? "قيد التنفيذ" : "لم يبدأ";
      }
      return next;
    });
    const { error } = await supabase
      .from("item_progress")
      .update({ ...patch, updated_by: userId, updated_at: new Date().toISOString() })
      .eq("item_id", id);
    if (error) load();
    setSavingId(null);
  }

  const filtered = rows
    .filter((r) => (scopeMine ? r.assigned_to === userId : true))
    .filter((r) => (q ? r.name.includes(q) : true));

  if (loading) {
    return <div className="text-center py-16 text-idle text-sm">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن بند..."
          className="w-64 rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm focus-ring outline-none"
        />
        <p className="text-xs text-idle">{filtered.length} بند</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-50 text-brand-800 text-xs">
              <th className="px-3 py-2.5 text-right font-semibold w-10">#</th>
              <th className="px-3 py-2.5 text-right font-semibold min-w-[220px]">البند</th>
              <th className="px-3 py-2.5 text-right font-semibold">المسؤول</th>
              <th className="px-3 py-2.5 text-right font-semibold">بداية مخططة</th>
              <th className="px-3 py-2.5 text-right font-semibold">المدة (يوم)</th>
              <th className="px-3 py-2.5 text-right font-semibold">نهاية مخططة</th>
              <th className="px-3 py-2.5 text-right font-semibold">الكمية</th>
              <th className="px-3 py-2.5 text-right font-semibold">الوحدة</th>
              <th className="px-3 py-2.5 text-right font-semibold">بداية فعلية</th>
              <th className="px-3 py-2.5 text-right font-semibold">المنجز</th>
              <th className="px-3 py-2.5 text-right font-semibold">النسبة</th>
              <th className="px-3 py-2.5 text-right font-semibold">الحالة</th>
              <th className="px-3 py-2.5 text-right font-semibold min-w-[160px]">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const editableDef = isAdmin;
              const editableProg = canEditProgress(row);
              return (
                <tr key={row.id} className="border-t border-brand-50 hover:bg-brand-50/40">
                  <td className="px-3 py-1.5 text-idle">{row.order_no}</td>
                  <td className="px-3 py-1.5 text-ink">{row.name}</td>
                  <td className="px-3 py-1.5">
                    {editableDef ? (
                      <select
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none"
                        value={row.assigned_to || ""}
                        onChange={(e) => updateItem(row.id, { assigned_to: e.target.value || null })}
                      >
                        <option value="">— غير معيّن —</option>
                        {engineers.map((e) => (
                          <option key={e.id} value={e.id}>{e.full_name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-idle">{row.assigned_to_name || "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {editableDef ? (
                      <input
                        type="date"
                        defaultValue={row.planned_start_date || ""}
                        onBlur={(e) => e.target.value !== (row.planned_start_date || "") && updateItem(row.id, { planned_start_date: e.target.value || null })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-32"
                      />
                    ) : (
                      <span className="text-xs">{row.planned_start_date || "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {editableDef ? (
                      <input
                        type="number"
                        defaultValue={row.duration_days ?? ""}
                        onBlur={(e) => Number(e.target.value || 0) !== (row.duration_days || 0) && updateItem(row.id, { duration_days: e.target.value === "" ? null : Number(e.target.value) })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-16"
                      />
                    ) : (
                      <span className="text-xs">{row.duration_days ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-idle">{row.planned_end_date || "—"}</td>
                  <td className="px-3 py-1.5">
                    {editableDef ? (
                      <input
                        type="number"
                        defaultValue={row.total_qty ?? ""}
                        onBlur={(e) => Number(e.target.value || 0) !== (row.total_qty || 0) && updateItem(row.id, { total_qty: e.target.value === "" ? null : Number(e.target.value) })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-20"
                      />
                    ) : (
                      <span className="text-xs">{row.total_qty ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {editableDef ? (
                      <input
                        type="text"
                        defaultValue={row.unit || ""}
                        onBlur={(e) => e.target.value !== (row.unit || "") && updateItem(row.id, { unit: e.target.value || null })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-16"
                      />
                    ) : (
                      <span className="text-xs">{row.unit || "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {editableProg ? (
                      <input
                        type="date"
                        defaultValue={row.actual_start_date || ""}
                        onBlur={(e) => e.target.value !== (row.actual_start_date || "") && updateProgress(row.id, { actual_start_date: e.target.value || null })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-32"
                      />
                    ) : (
                      <span className="text-xs">{row.actual_start_date || "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    {editableProg ? (
                      <input
                        type="number"
                        defaultValue={row.completed_qty ?? ""}
                        onBlur={(e) => Number(e.target.value || 0) !== (row.completed_qty || 0) && updateProgress(row.id, { completed_qty: e.target.value === "" ? 0 : Number(e.target.value) })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-20"
                      />
                    ) : (
                      <span className="text-xs">{row.completed_qty ?? 0}</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-xs font-medium">{row.percent_complete != null ? `${row.percent_complete}%` : "—"}</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[row.status] || STATUS_STYLES["غير محدد"]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    {editableProg ? (
                      <input
                        type="text"
                        defaultValue={row.notes || ""}
                        onBlur={(e) => e.target.value !== (row.notes || "") && updateProgress(row.id, { notes: e.target.value || null })}
                        className="rounded-md border border-transparent hover:border-brand-100 bg-transparent px-1.5 py-1 text-xs focus-ring outline-none w-full"
                      />
                    ) : (
                      <span className="text-xs text-idle">{row.notes || "—"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
