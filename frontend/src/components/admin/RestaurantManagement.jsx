import { useState, useEffect, useMemo } from "react";
import { getAllRestaurants } from "../../api/admin.api.js";
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

// ─── Main Component ────────────────────────────────────────────────────────

export default function RestaurantsManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res = await getAllRestaurants();
        const data = res.data?.data ?? res.data ?? [];
        setRestaurants(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      [
        r.restaurant_name,
        r.city,
        r.state,
        r.address_line,
        r.pincode,
        String(r.restaurant_id),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [restaurants, search]);

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
              Restaurants
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading restaurants…"
                : `${restaurants.length} registered restaurant${restaurants.length === 1 ? "" : "s"}`}
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
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    City / State
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    Pincode
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
                        ? "No restaurants match your search."
                        : "No restaurants found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.restaurant_id}
                      className="border-b border-orange-50 last:border-0 hover:bg-orange-50/40 transition-colors"
                    >
                      <td className="px-4 py-3  text-slate-500">
                        {r.restaurant_id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.restaurant_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.address_line || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3  text-slate-500">
                        {r.pincode || "—"}
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
