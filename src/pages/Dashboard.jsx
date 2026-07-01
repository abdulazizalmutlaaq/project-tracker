import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PHASES } from "../lib/constants";
import ItemsTable from "../components/ItemsTable";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [phase, setPhase] = useState(PHASES[0].key);
  const [scopeMine, setScopeMine] = useState(!isAdmin);

  return (
    <div>
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

      <ItemsTable phase={phase} userId={user.id} isAdmin={isAdmin} scopeMine={scopeMine} />
    </div>
  );
}
