import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "../../api/admin.api.js";
import { Search } from "lucide-react";

// ─── Skeleton Row ──────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="border-b border-orange-50">
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 w-full max-w-[120px] rounded-full bg-orange-50 animate-pulse" />
      </td>
    ))}
  </tr>
);

// ─── Status Pill ───────────────────────────────────────────────────────────

const StatusPill = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── Main Component ────────────────────────────────────────────────────────

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getAllUsers();
        const data = res.data?.data ?? res.data ?? [];
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.phone, u.role_name, String(u.user_id)]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [users, search]);

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-1 ">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Users
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading users…"
                : `${users.length} registered user${users.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-5">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error}
          </div>
        )}

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, phone, or role..."
            className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-10 pr-3 text-sm
      text-slate-700 placeholder:text-slate-400 focus:border-orange-300
      focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="max-h-[450px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50/60 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      {search
                        ? "No users match your search."
                        : "No users found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.user_id}
                      className="border-b border-orange-50 last:border-0 hover:bg-orange-50/40 transition-colors"
                    >
                      <td className="px-4 py-3  text-slate-500">
                        {u.user_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize font-medium text-slate-700">
                          {u.role_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{u.email}</td>
                      <td className="px-4 py-3  text-slate-500">
                        {u.phone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill active={!!u.is_active} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
