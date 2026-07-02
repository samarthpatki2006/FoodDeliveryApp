import { useState, useEffect } from "react";
import {
  getUserCount,
  getTotalRestaurants,
  getRevenueSummary,
  getOrderStatuses,
} from "../../api/admin.api.js";
import { Building, ChartBar, IndianRupee, User } from "lucide-react";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) => (n != null ? Number(n).toLocaleString("en-IN") : "—");

// Orange-forward palette for dynamic per-status slices
const STATUS_COLORS = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#ea580c",
  "#c2410c",
  "#fed7aa",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-orange-100 p-6 flex flex-col gap-3 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-8 w-32 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-3 w-20 rounded-full bg-orange-50 animate-pulse" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  valueColor = "text-slate-900",
}) => (
  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg} ${iconColor}`}
      >
        {icon}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </p>
    <p className={`text-3xl font-bold  tracking-tight ${valueColor}`}>
      {value}
    </p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Donut Chart (dynamic order statuses) ─────────────────────────────────────

const StatusDonut = ({ statuses }) => {
  const total = statuses.reduce((sum, s) => sum + s.total_orders, 0);
  if (!total) return null;

  const r = 54;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;

  let offsetAcc = 0;
  const arcs = statuses.map((s, i) => {
    const pct = s.total_orders / total;
    const dash = pct * circ;
    const arc = {
      ...s,
      color: STATUS_COLORS[i % STATUS_COLORS.length],
      dash,
      offset: circ * 0.25 - offsetAcc,
    };
    offsetAcc += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#fff7ed"
          strokeWidth="18"
        />
        {arcs.map((a) => (
          <circle
            key={a.order_status_id}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="18"
            strokeDasharray={`${a.dash} ${circ - a.dash}`}
            strokeDashoffset={a.offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.7s ease" }}
          />
        ))}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#0f172a"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          orders
        </text>
      </svg>

      <div className="flex flex-col gap-2.5">
        {arcs.map((a) => (
          <div key={a.order_status_id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: a.color }}
            />
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {a.status_name}
              </p>
              <p className="text-sm font-bold  text-slate-800">
                {fmtCount(a.total_orders)}{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({Math.round((a.total_orders / total) * 100)}%)
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs  font-bold text-slate-700">{pct}%</span>
      </div>
      <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: null,
    userRoles: [],
    totalRestaurants: null,
    totalRevenue: null,
    platformRevenue: null,
    partnerRevenue: null,
    totalTax: null,
    orderStatuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [userRes, restaurantRes, revenueRes, orderStatusRes] =
          await Promise.all([
            getUserCount(),
            getTotalRestaurants(),
            getRevenueSummary(),
            getOrderStatuses(),
          ]);

        const extract = (res) => res.data?.data ?? res.data ?? {};

        const userRoles = extract(userRes) || [];
        const restaurantData = extract(restaurantRes);
        const revenue = extract(revenueRes) || {};
        const orderStatuses = extract(orderStatusRes) || [];

        const restaurantRow = Array.isArray(restaurantData)
          ? restaurantData[0]
          : restaurantData;

        setStats({
          totalUsers: Array.isArray(userRoles)
            ? userRoles.reduce((sum, r) => sum + Number(r.count ?? 0), 0)
            : 0,
          userRoles: Array.isArray(userRoles) ? userRoles : [],
          totalRestaurants: Number(restaurantRow?.count ?? 0),
          totalRevenue: Number(revenue.totalRevenue ?? 0),
          platformRevenue: Number(revenue.platformRevenue ?? 0),
          partnerRevenue: Number(revenue.partnerRevenue ?? 0),
          totalTax: Number(revenue.totalTax ?? 0),
          orderStatuses: Array.isArray(orderStatuses)
            ? orderStatuses.map((s) => ({
                ...s,
                total_orders: Number(s.total_orders ?? 0),
              }))
            : [],
        });
      } catch {
        setError("Failed to load dashboard stats. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const {
    totalUsers,
    userRoles,
    totalRestaurants,
    totalRevenue,
    platformRevenue,
    partnerRevenue,
    totalTax,
    orderStatuses,
  } = stats;

  const totalOrders = orderStatuses.reduce((sum, s) => sum + s.total_orders, 0);

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of platform activity, restaurants, and revenue.
            </p>
          </div>
          <div className="text-xs text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">
        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div>
          <h2 className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total Users"
                  value={fmtCount(totalUsers)}
                  sub={`${userRoles.length} role${userRoles.length === 1 ? "" : "s"}`}
                  icon={<User />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  valueColor="text-blue-600"
                />

                <StatCard
                  label="Total Restaurants"
                  value={fmtCount(totalRestaurants)}
                  sub="Registered on the platform"
                  icon={<Building />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  valueColor="text-green-600"
                />

                <StatCard
                  label="Total Revenue"
                  value={fmtAmount(totalRevenue)}
                  sub="From completed orders"
                  icon={<IndianRupee />}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  valueColor="text-amber-600"
                />

                <StatCard
                  label="Platform Revenue"
                  value={fmtAmount(platformRevenue)}
                  sub={
                    totalRevenue
                      ? `${Math.round((platformRevenue / totalRevenue) * 100)}% of total revenue`
                      : "—"
                  }
                  icon={<ChartBar />}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  valueColor="text-purple-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">
                Order Status Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of orders across all statuses
              </p>
            </div>
            {loading ? (
              <div className="flex items-center gap-8">
                <div className="w-36 h-36 rounded-full border-[18px] border-orange-50 animate-pulse" />
                <div className="flex flex-col gap-4">
                  <div className="h-3 w-28 rounded-full bg-orange-50 animate-pulse" />
                  <div className="h-3 w-20 rounded-full bg-orange-50 animate-pulse" />
                </div>
              </div>
            ) : totalOrders ? (
              <StatusDonut statuses={orderStatuses} />
            ) : (
              <p className="text-sm text-slate-400">No orders yet.</p>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">
                Revenue Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                How completed-order revenue is split
              </p>
            </div>
            {loading ? (
              <div className="flex flex-col gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-24 rounded-full bg-orange-50 animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-orange-50 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <ProgressBar
                  label="Platform Revenue"
                  value={platformRevenue}
                  max={totalRevenue}
                  color="bg-orange-500"
                />
                <ProgressBar
                  label="Delivery Partner Payout"
                  value={partnerRevenue}
                  max={totalRevenue}
                  color="bg-orange-300"
                />
                <ProgressBar
                  label="Tax Collected"
                  value={totalTax}
                  max={totalRevenue}
                  color="bg-amber-400"
                />

                <div className="mt-2 pt-4 border-t border-orange-100 grid grid-cols-2 gap-4">
                  <div className="bg-orange-50/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {fmtAmount(totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-orange-50/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Total Tax</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {fmtAmount(totalTax)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── User Roles ── */}
        {!loading && userRoles.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">
                Users by Role
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of registered users
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {userRoles.map((r) => (
                <div
                  key={r.role_id}
                  className="bg-orange-50/60 rounded-xl p-4 text-center"
                >
                  <p className="text-xs text-slate-400 mb-1 capitalize">
                    {r.role_name}
                  </p>
                  <p className="text-xl font-bold  text-orange-600">
                    {fmtCount(r.count)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
