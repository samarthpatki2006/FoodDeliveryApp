import { useState, useEffect } from "react";
import {
  getDashboardStats,
  togglePartnerAvailability,
} from "../../api/partner.api.js";
import {
  PackageCheck,
  Wallet,
  CalendarClock,
  CalendarRange,
  Building2,
  Power,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) => (n != null ? Number(n).toLocaleString("en-IN") : "—");

// Per-card accent themes so the favorites row isn't monochrome orange
const THEMES = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    rankColors: ["#2563eb", "#60a5fa", "#bfdbfe", "#dbeafe", "#eff6ff"],
    bar: "bg-blue-400",
    barTrack: "bg-blue-50",
    value: "text-blue-600",
  },
};

// ─── Skeletons ─────────────────────────────────────────────────────────────

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-orange-100 p-6 flex flex-col gap-3 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-8 w-32 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-3 w-20 rounded-full bg-orange-50 animate-pulse" />
  </div>
);

const ListSkeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-50 animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 w-3/4 rounded-full bg-orange-50 animate-pulse" />
          <div className="h-2 w-1/3 rounded-full bg-orange-50 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────

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
    <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Ranked List (frequently picked restaurants) ─────────────────────────────

const RankedList = ({
  title,
  subtitle,
  icon,
  data,
  nameKey,
  valueKey,
  valueSuffix,
  theme = "blue",
}) => {
  const t = THEMES[theme] ?? THEMES.blue;
  const max = data.length
    ? Math.max(...data.map((d) => Number(d[valueKey] ?? 0)))
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.iconBg} ${t.iconColor}`}
        >
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>

      {!data.length ? (
        <p className="text-sm text-slate-400">Nothing to show yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((row, i) => {
            const val = Number(row[valueKey] ?? 0);
            const pct = max ? Math.round((val / max) * 100) : 0;
            return (
              <div key={row[nameKey] + i} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{
                    backgroundColor: t.rankColors[i % t.rankColors.length],
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {row[nameKey]}
                    </p>
                    <p className={`text-xs font-bold shrink-0 ${t.value}`}>
                      {fmtCount(val)}
                      {valueSuffix ? ` ${valueSuffix}` : ""}
                    </p>
                  </div>
                  <div
                    className={`h-1.5 rounded-full overflow-hidden mt-1.5 ${t.barTrack}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${t.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PartnerDashboard() {
  const [stats, setStats] = useState({
    totalOrdersDelivered: 0,
    totalMoneyEarned: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    frequentlyPickedRestaurants: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(Boolean(user?.is_active));
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const handleToggleAvailability = async () => {
    const next = !isOnline;
    setToggling(true);
    setToggleError(null);
    try {
      const res = await togglePartnerAvailability(next);
      const confirmed = res.data?.data?.is_active ?? next;
      setIsOnline(confirmed);
    } catch {
      setToggleError("Couldn't update your status. Try again.");
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getDashboardStats();
        const data = res.data?.data ?? res.data ?? {};

        setStats({
          totalOrdersDelivered: Number(data.totalOrdersDelivered ?? 0),
          totalMoneyEarned: Number(data.totalMoneyEarned ?? 0),
          todayRevenue: Number(data.todayRevenue ?? 0),
          monthlyRevenue: Number(data.monthlyRevenue ?? 0),
          frequentlyPickedRestaurants: Array.isArray(
            data.frequentlyPickedRestaurants,
          )
            ? data.frequentlyPickedRestaurants
            : [],
        });
      } catch {
        setError("Failed to load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const {
    totalOrdersDelivered,
    totalMoneyEarned,
    todayRevenue,
    monthlyRevenue,
    frequentlyPickedRestaurants,
  } = stats;

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              Welcome back,
              <span className="ml-2 text-blue-500">{user.full_name}</span>
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-orange-500 mt-1">
              Your deliveries, earnings, and top pickups at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isOnline
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {toggling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Power size={16} />
              )}
              {isOnline ? "Online" : "Offline"}
            </button>
            <div className="text-xs text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg">
              Last updated:{" "}
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
        {toggleError && (
          <p className="text-xs text-red-600 mt-2">{toggleError}</p>
        )}
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
                  label="Orders Delivered"
                  value={fmtCount(totalOrdersDelivered)}
                  sub="Successfully completed"
                  icon={<PackageCheck />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  valueColor="text-green-600"
                />
                <StatCard
                  label="Total Earnings"
                  value={fmtAmount(totalMoneyEarned)}
                  sub="All-time payout"
                  icon={<Wallet />}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  valueColor="text-amber-600"
                />
                <StatCard
                  label="Today's Revenue"
                  value={fmtAmount(todayRevenue)}
                  sub="Earned so far today"
                  icon={<CalendarClock />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  valueColor="text-blue-600"
                />
                <StatCard
                  label="Monthly Revenue"
                  value={fmtAmount(monthlyRevenue)}
                  sub="Earned this month"
                  icon={<CalendarRange />}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  valueColor="text-purple-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Frequently Picked Restaurants ── */}
        <div>
          <h2 className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-4">
            Your Pickups
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <ListSkeleton />
              </div>
            ) : (
              <RankedList
                title="Frequently Picked Restaurants"
                subtitle="Where you pick up from most"
                icon={<Building2 size={16} />}
                data={frequentlyPickedRestaurants}
                nameKey="restaurant_name"
                valueKey="total_orders"
                valueSuffix="orders"
                theme="blue"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}