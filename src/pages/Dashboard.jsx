import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PHASES } from "../lib/constants";
import { supabase } from "../lib/supabase";
import ItemsTable from "../components/ItemsTable";

export default function Dashboard() {
  const { projectId } = useParams();
  const { user, isAdmin } = useAuth();
  const [phase, setPhase] = useState(PHASES[0].key);
  const [scopeMine, setScopeMine] = useState(!isAdmin);
  const [project, setProject] = useState(null);

  useEffect(() => {
    supabase.from("projects").select("*").eq("id", projectId).single().then(({ data }) => setProject(data));
  }, [projectId]);

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-xs text-brand-600 hover:text-brand-800">← كل المشاريع</Link>
        <h2 className="text-lg font-semibold text-ink mt-1">{project?.name || "..."}</h2>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-brand-100">
          {PHASES.map((p) => (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                phase === p.key ? "bg-brand-700 text-white" : "text-brand-700 hover:bg-brand-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={scopeMine}
            onChange={(e) => setScopeMine(e.target.checked)}
            className="rounded"
          />
          بنودي فقط
        </label>
      </div>

      <ItemsTable phase={phase} projectId={projectId} userId={user.id} isAdmin={isAdmin} scopeMine={scopeMine} />
    </div>
  );
}
