import { useState, useEffect } from "react";
import { getDeliveryHistory } from "../../api/partner.api.js";
import { History, PackageSearch } from "lucide-react";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUS_STYLES = {
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  in_progress: "bg-blue-100 text-blue-700",
  assigned: "bg-amber-100 text-amber-700",
  picked_up: "bg-blue-100 text-blue-700",
};

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-slate-400 text-xs">—</span>;
  const key = String(status).toLowerCase().replace(/\s+/g, "_");
  const style = STATUS_STYLES[key] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${style}`}
    >
      {String(status).replace(/_/g, " ")}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="border-b border-orange-50">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 w-full max-w-[100px] rounded-full bg-orange-50 animate-pulse" />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────

export default function DeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDeliveryHistory();
        const data = res.data?.data ?? res.data ?? [];
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        // A 400 "No data found" from the backend just means an empty list,
        // not a real failure — treat it as such instead of showing an error.
        if (err?.response?.status === 400) {
          setHistory([]);
        } else {
          setError("Failed to load your delivery history. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Delivery History
            </h1>
            <p className="text-sm text-orange-500 mt-1">
              Every delivery you've completed, in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50/60 border-b border-orange-100">
                  <th className="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider px-4 py-3">
                    Restaurant
                  </th>
                  <th className="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider px-4 py-3">
                    Pickup
                  </th>
                  <th className="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider px-4 py-3">
                    Drop-off
                  </th>
                  <th className="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left font-semibold text-slate-500 uppercase text-xs tracking-wider px-4 py-3">
                    Delivered On
                  </th>
                  <th className="text-right font-semibold text-slate-500 uppercase text-xs tracking-wider px-4 py-3">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <PackageSearch size={28} />
                        <p className="text-sm font-medium">
                          No deliveries yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  history.map((row, i) => (
                    <tr
                      key={row.assignment_id ?? row.order_id ?? i}
                      className="border-b border-orange-50 last:border-0 hover:bg-orange-50/40 transition-colors"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {row.restaurant_name ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {row.source_add
                          ? `${row.source_add}, ${row.source_city ?? ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {row.dest_add
                          ? `${row.dest_add}, ${row.dest_city ?? ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {fmtDate(row.delivered_at ?? row.updated_at)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-amber-600">
                        {fmtAmount(row.earnings)}
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