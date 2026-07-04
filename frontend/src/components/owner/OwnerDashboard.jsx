import { useState, useEffect } from "react";
import {
  getRestaurantCount,
  getRevenueStats,
  getItemStats,
  getUniqueCustomer,
  getDetailedRevenueStats,
} from "../../api/owner.api.js";
import {
  Store,
  IndianRupee,
  Users,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) => (n != null ? Number(n).toLocaleString("en-IN") : "—");

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

const StatCard = ({ label, value, sub, icon, iconBg, iconColor, valueColor = "text-slate-900" }) => (
  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg} ${iconColor}`}>
        {icon}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-700">{pct}%</span>
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

// ─── Ranked list (top restaurants / top items) ────────────────────────────────

const RankedBarList = ({ items, nameKey, valueKey, formatValue, emptyLabel }) => {
  if (!items.length) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <div className="flex flex-col gap-4">
      {items.slice(0, 5).map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = Math.max((val / max) * 100, 4);
        return (
          <div key={item[nameKey] + i} className="flex items-center gap-3">
            <span className="text-xs font-bold text-orange-400 w-4 shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2 mb-1">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {item[nameKey]}
                </p>
                <p className="text-sm font-bold text-slate-800 shrink-0">
                  {formatValue(val)}
                </p>
              </div>
              <div className="h-1.5 bg-orange-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Daily revenue pulse (bar chart, current month) ───────────────────────────

const RevenuePulse = ({ daily }) => {
  if (!daily.length) {
    return <p className="text-sm text-slate-400">No revenue recorded this month yet.</p>;
  }

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const byDay = new Map(daily.map((d) => [Number(d.day), Number(d.revenue)]));
  const series = Array.from({ length: daysInMonth }, (_, i) => byDay.get(i + 1) || 0);
  const max = Math.max(...series, 1);
  const today = new Date().getDate();

  return (
    <div>
      <div className="flex items-end gap-[3px] h-32">
        {series.map((v, i) => {
          const day = i + 1;
          const h = Math.max((v / max) * 100, v > 0 ? 4 : 2);
          const isToday = day === today;
          return (
            <div
              key={day}
              className="flex-1 group relative flex flex-col justify-end"
              style={{ height: "100%" }}
            >
              <div
                className={`w-full rounded-sm transition-all ${
                  isToday ? "bg-orange-500" : "bg-orange-200 group-hover:bg-orange-300"
                }`}
                style={{ height: `${h}%` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                Day {day}: {fmtAmount(v)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-slate-400">
        <span>1</span>
        <span>Today (Day {today})</span>
        <span>{daysInMonth}</span>
      </div>
    </div>
  );
};

// ─── Restaurant revenue table ──────────────────────────────────────────────────

const RestaurantRevenueTable = ({ rows, columnLabel }) => {
  if (!rows.length) {
    return <p className="text-sm text-slate-400">No restaurants found.</p>;
  }
  return (
    <div className="flex flex-col divide-y divide-orange-50">
      <div className="flex justify-between pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        <span>Restaurant</span>
        <span>{columnLabel}</span>
      </div>
      {rows.map((r) => (
        <div key={r.restaurant_id} className="flex justify-between py-2.5 text-sm">
          <span className="text-slate-700 font-medium truncate pr-3">{r.restaurant_name}</span>
          <span className="text-slate-800 font-bold shrink-0">{fmtAmount(r.revenue)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const [data, setData] = useState({
    totalRestaurants: null,
    totalEarned: 0,
    platformCommission: 0,
    topPerforming: [],
    totalItemsSold: 0,
    totalItemRevenue: 0,
    topItems: [],
    totalUniqueCustomers: 0,
    topRestaurantsByCustomers: [],
    dailyRevenue: [],
    monthlyRevenue: [],
    todayRestaurantRevenue: [],
    monthlyRestaurantRevenue: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [countRes, revenueRes, itemRes, customerRes, detailedRes] =
          await Promise.all([
            getRestaurantCount(),
            getRevenueStats(),
            getItemStats(),
            getUniqueCustomer(),
            getDetailedRevenueStats(),
          ]);

        const extract = (res) => res.data?.data ?? res.data ?? {};

        const countData = extract(countRes);
        const countRow = Array.isArray(countData) ? countData[0] : countData;

        const revenue = extract(revenueRes) || {};
        const items = extract(itemRes) || {};
        const customers = extract(customerRes) || {};
        const detailed = extract(detailedRes) || {};

        setData({
          totalRestaurants: Number(countRow?.count ?? 0),
          totalEarned: Number(revenue.stats?.total_earned ?? 0),
          platformCommission: Number(revenue.stats?.platform_commission ?? 0),
          topPerforming: revenue.topPerforming ?? [],
          totalItemsSold: Number(items.stats?.total_items_sold ?? 0),
          totalItemRevenue: Number(items.stats?.total_item_revenue ?? 0),
          topItems: items.topItems ?? [],
          totalUniqueCustomers: Number(customers.total_unique_customers ?? 0),
          topRestaurantsByCustomers: customers.topRestaurants ?? [],
          dailyRevenue: detailed.dailyRevenue ?? [],
          monthlyRevenue: detailed.monthlyRevenue ?? [],
          todayRestaurantRevenue: detailed.todayRestaurantRevenue ?? [],
          monthlyRestaurantRevenue: detailed.monthlyRestaurantRevenue ?? [],
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
    totalRestaurants,
    totalEarned,
    platformCommission,
    topPerforming,
    totalItemsSold,
    totalItemRevenue,
    topItems,
    totalUniqueCustomers,
    topRestaurantsByCustomers,
    dailyRevenue,
    todayRestaurantRevenue,
    monthlyRestaurantRevenue,
  } = data;

  const grossRevenue = totalEarned + platformCommission;

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-1">
              Owner Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Performance across all restaurants you own.
            </p>
          </div>
          <div className="text-xs text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">
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
                  label="Your Restaurants"
                  value={fmtCount(totalRestaurants)}
                  sub="Registered under your account"
                  icon={<Store />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  valueColor="text-blue-600"
                />
                <StatCard
                  label="Total Earned"
                  value={fmtAmount(totalEarned)}
                  sub="After platform commission"
                  icon={<IndianRupee />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  valueColor="text-green-600"
                />
                <StatCard
                  label="Unique Customers"
                  value={fmtCount(totalUniqueCustomers)}
                  sub="Across all your restaurants"
                  icon={<Users />}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  valueColor="text-purple-600"
                />
                <StatCard
                  label="Items Sold"
                  value={fmtCount(totalItemsSold)}
                  sub={fmtAmount(totalItemRevenue) + " in item revenue"}
                  icon={<UtensilsCrossed />}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  valueColor="text-amber-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Revenue Pulse (signature element) ── */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" />
                Revenue This Month
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily earnings across all your restaurants
              </p>
            </div>
          </div>
          {loading ? (
            <div className="h-32 bg-orange-50 rounded-lg animate-pulse" />
          ) : (
            <RevenuePulse daily={dailyRevenue} />
          )}
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Restaurants */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Top Performing Restaurants</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by earnings</p>
            </div>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-orange-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <RankedBarList
                items={topPerforming}
                nameKey="restaurant_name"
                valueKey="revenue"
                formatValue={fmtAmount}
                emptyLabel="No earnings recorded yet."
              />
            )}
          </div>

          {/* Earnings Split */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Earnings Split</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your share vs. platform commission</p>
            </div>
            {loading ? (
              <div className="flex flex-col gap-5">
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-24 rounded-full bg-orange-50 animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-orange-50 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <ProgressBar
                  label="Your Earnings"
                  value={totalEarned}
                  max={grossRevenue}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Platform Commission"
                  value={platformCommission}
                  max={grossRevenue}
                  color="bg-orange-400"
                />
                <div className="mt-2 pt-4 border-t border-orange-100 grid grid-cols-2 gap-4">
                  <div className="bg-orange-50/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Gross Revenue</p>
                    <p className="text-2xl font-bold text-slate-800">{fmtAmount(grossRevenue)}</p>
                  </div>
                  <div className="bg-orange-50/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Your Earnings</p>
                    <p className="text-2xl font-bold text-green-600">{fmtAmount(totalEarned)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Top Items & Customer Reach ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Best-Selling Items</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by quantity sold</p>
            </div>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-orange-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <RankedBarList
                items={topItems}
                nameKey="item_name"
                valueKey="quantity_sold"
                formatValue={fmtCount}
                emptyLabel="No items sold yet."
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Customer Reach by Restaurant</h2>
              <p className="text-xs text-slate-400 mt-0.5">Unique customers served</p>
            </div>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-orange-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <RankedBarList
                items={topRestaurantsByCustomers}
                nameKey="restaurant_name"
                valueKey="unique_customers"
                formatValue={fmtCount}
                emptyLabel="No customers yet."
              />
            )}
          </div>
        </div>

        {/* ── Restaurant Revenue Tables ── */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-800">Today's Revenue by Restaurant</h2>
              </div>
              <RestaurantRevenueTable rows={todayRestaurantRevenue} columnLabel="Today" />
            </div>
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-800">This Month's Revenue by Restaurant</h2>
              </div>
              <RestaurantRevenueTable rows={monthlyRestaurantRevenue} columnLabel="This Month" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}