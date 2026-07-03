import { useState, useEffect } from "react";
import {
  getOrderStats,
  getMoneyStats,
  getRestaurantStats,
  getItemStats,
  getCuisineStats,
} from "../../api/customer.api.js";
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  Building2,
  UtensilsCrossed,
  Soup,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) => (n != null ? Number(n).toLocaleString("en-IN") : "—");

const RANK_COLORS = ["#f97316", "#fb923c", "#fdba74"];

// Per-card accent themes so the favorites row isn't monochrome orange
const THEMES = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    rankColors: ["#2563eb", "#60a5fa", "#bfdbfe"],
    bar: "bg-blue-400",
    barTrack: "bg-blue-50",
    value: "text-blue-600",
  },
  teal: {
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    rankColors: ["#0d9488", "#2dd4bf", "#99f6e4"],
    bar: "bg-teal-400",
    barTrack: "bg-teal-50",
    value: "text-teal-600",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    rankColors: ["#7c3aed", "#a78bfa", "#ddd6fe"],
    bar: "bg-violet-400",
    barTrack: "bg-violet-50",
    value: "text-violet-600",
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

// ─── Ranked List (top restaurants / items / cuisines) ────────────────────────

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

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    deliveredOrders: 0,
    failedOrders: 0,
    totalSpent: null,
    avgOrderValue: null,
    topRestaurants: [],
    topItems: [],
    topCuisines: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [orderRes, moneyRes, restaurantRes, itemRes, cuisineRes] =
          await Promise.all([
            getOrderStats(),
            getMoneyStats(),
            getRestaurantStats(),
            getItemStats(),
            getCuisineStats(),
          ]);

        const extract = (res) => res.data?.data ?? res.data ?? {};

        const orderStats = extract(orderRes) || {};

        // getMoneyStats currently returns the raw grouped row(s), not a
        // pre-shaped object, so normalize whether it comes back as an
        // array or a single object.
        const moneyRaw = extract(moneyRes);
        const moneyRow = Array.isArray(moneyRaw) ? moneyRaw[0] : moneyRaw;

        const topRestaurants = extract(restaurantRes) || [];
        const topItems = extract(itemRes) || [];
        const topCuisines = extract(cuisineRes) || [];

        setStats({
          activeOrders: Number(orderStats.active ?? 0),
          deliveredOrders: Number(
            orderStats.deliverd ?? orderStats.delivered ?? 0,
          ),
          failedOrders: Number(orderStats.failed ?? 0),
          totalSpent: Number(moneyRow?.total_amount_spent ?? 0),
          avgOrderValue: Number(moneyRow?.average_order_value ?? 0),
          topRestaurants: Array.isArray(topRestaurants) ? topRestaurants : [],
          topItems: Array.isArray(topItems) ? topItems : [],
          topCuisines: Array.isArray(topCuisines) ? topCuisines : [],
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
    activeOrders,
    deliveredOrders,
    failedOrders,
    totalSpent,
    avgOrderValue,
    topRestaurants,
    topItems,
    topCuisines,
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
              Your orders, spending, and favorites at a glance.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Active Orders"
                  value={fmtCount(activeOrders)}
                  sub="Currently in progress"
                  icon={<ShoppingBag />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  valueColor="text-blue-600"
                />
                <StatCard
                  label="Delivered"
                  value={fmtCount(deliveredOrders)}
                  sub="Successfully completed"
                  icon={<CheckCircle2 />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  valueColor="text-green-600"
                />
                <StatCard
                  label="Failed / Cancelled"
                  value={fmtCount(failedOrders)}
                  sub="Did not go through"
                  icon={<XCircle />}
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                  valueColor="text-red-600"
                />
                <StatCard
                  label="Total Spent"
                  value={fmtAmount(totalSpent)}
                  sub="On completed orders"
                  icon={<Wallet />}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  valueColor="text-amber-600"
                />
                <StatCard
                  label="Avg. Order Value"
                  value={fmtAmount(avgOrderValue)}
                  sub="Per completed order"
                  icon={<TrendingUp />}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  valueColor="text-purple-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Favorites ── */}
        <div>
          <h2 className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-4">
            Your Favorites
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                  <ListSkeleton />
                </div>
              ))
            ) : (
              <>
                <RankedList
                  title="Top Restaurants"
                  subtitle="Where you order from most"
                  icon={<Building2 size={16} />}
                  data={topRestaurants}
                  nameKey="restaurant_name"
                  valueKey="count"
                  valueSuffix="orders"
                  theme="blue"
                />
                <RankedList
                  title="Top Items"
                  subtitle="Your most-ordered dishes"
                  icon={<UtensilsCrossed size={16} />}
                  data={topItems}
                  nameKey="item_name"
                  valueKey="total_orders"
                  theme="teal"
                />
                <RankedList
                  title="Top Cuisines"
                  subtitle="What you crave the most"
                  icon={<Soup size={16} />}
                  data={topCuisines}
                  nameKey="category_name"
                  valueKey="total_orders"
                  theme="violet"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
