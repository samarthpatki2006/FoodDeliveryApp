import { useState, useEffect, useCallback } from "react";
import {
  getNewAssignments,
  acceptOrder,
  updateOrderStatus,
  getCurrentOrderDetails,
} from "../../api/partner.api.js";
import {
  ClipboardList,
  Building2,
  MapPin,
  Wallet,
  User,
  Phone,
  Navigation,
  CreditCard,
  StickyNote,
  PackageCheck,
  Truck,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtDistance = (n) => (n != null ? `${Number(n).toFixed(1)} km` : "—");

// ─── Skeletons ─────────────────────────────────────────────────────────────

const AssignmentSkeleton = () => (
  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm flex flex-col gap-3">
    <div className="h-4 w-1/2 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-3 w-3/4 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-3 w-2/3 rounded-full bg-orange-50 animate-pulse" />
    <div className="h-9 w-full rounded-xl bg-orange-50 animate-pulse mt-2" />
  </div>
);

const DetailsSkeleton = () => (
  <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-sm flex flex-col gap-4">
    <div className="h-5 w-1/3 rounded-full bg-orange-50 animate-pulse" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-3 w-2/3 rounded-full bg-orange-50 animate-pulse" />
    ))}
  </div>
);

// ─── New Assignment Card ─────────────────────────────────────────────────────

const AssignmentCard = ({ order, onAccept, onReject, accepting }) => (
  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Building2 size={18} />
        </span>
        <p className="text-sm font-bold text-slate-800 truncate">
          {order.restaurant_name}
        </p>
      </div>
      <span className="text-sm font-bold text-amber-600 shrink-0">
        {fmtAmount(order.expected_earnings)}
      </span>
    </div>

    <div className="flex flex-col gap-2 text-xs text-slate-500">
      <div className="flex items-start gap-2">
        <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <span>
          <span className="font-semibold text-slate-600">Pickup: </span>
          {order.source_add}, {order.source_city}
        </span>
      </div>
      <div className="flex items-start gap-2">
        <MapPin size={14} className="text-teal-500 mt-0.5 shrink-0" />
        <span>
          <span className="font-semibold text-slate-600">Drop: </span>
          {order.dest_add}, {order.dest_city}
        </span>
      </div>
    </div>

    <div className="flex gap-2 mt-1">
      <button
        type="button"
        onClick={() => onAccept(order)}
        disabled={accepting}
        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {accepting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CheckCircle2 size={16} />
        )}
        Accept
      </button>
      <button
        type="button"
        onClick={() => onReject(order.order_id)}
        disabled={accepting}
        className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <X size={16} />
        Reject
      </button>
    </div>
  </div>
);

// ─── Current Order Details ───────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-700 break-words">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const CurrentOrderCard = ({ order, onAdvance, advancing }) => {
  const status = order.order_status_id === 5 ? "picked_up" : "accepted";
  const isPickedUp = status === "picked_up";

  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
            Current Delivery
          </p>
          <h2 className="text-white text-lg font-bold">
            {order.restaurant_name}
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            isPickedUp
              ? "bg-blue-600 text-white"
              : "bg-white text-orange-600"
          }`}
        >
          {isPickedUp ? "Picked Up" : "Accepted"}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <InfoRow
          icon={<User size={16} />}
          label="Customer"
          value={order.full_name}
        />
        <InfoRow
          icon={<Phone size={16} />}
          label="Phone"
          value={order.phone}
        />
        <InfoRow
          icon={<MapPin size={16} />}
          label="Delivery Address"
          value={`${order.address_line}, ${order.city}, ${order.state} - ${order.pincode}`}
        />
        <InfoRow
          icon={<Navigation size={16} />}
          label="Approx. Distance"
          value={fmtDistance(order.approx_distance_km)}
        />
        <InfoRow
          icon={<CreditCard size={16} />}
          label="Payment Method"
          value={order.payment_method}
        />
        <InfoRow
          icon={<Wallet size={16} />}
          label="Order Total"
          value={fmtAmount(order.total_amount)}
        />
        {order.delivery_instructions && (
          <div className="sm:col-span-2">
            <InfoRow
              icon={<StickyNote size={16} />}
              label="Delivery Instructions"
              value={order.delivery_instructions}
            />
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={() => onAdvance(order.order_id, isPickedUp)}
          disabled={advancing}
          className={`w-full flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            isPickedUp
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {advancing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPickedUp ? (
            <PackageCheck size={16} />
          ) : (
            <Truck size={16} />
          )}
          {isPickedUp ? "Mark as Delivered" : "Mark as Picked Up"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderManagement() {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadCurrentOrder = useCallback(async () => {
  const res = await getCurrentOrderDetails();

  if (!res?.data || res.data.data == null) {
    return null;
  }

  return res.data.data;
}, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await getNewAssignments();
      
      const data = res.data?.data ?? res.data ?? [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      // Backend throws a 400 "No orders found" for an empty pool —
      // treat that as an empty list, not a real failure.
      if (err?.response?.status === 400) return [];
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const active = await loadCurrentOrder();
      if (active) {
        setCurrentOrder(active);
        setAssignments([]);
      } else {
        setCurrentOrder(null);
        setAssignments(await loadAssignments());
      }
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loadCurrentOrder, loadAssignments]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAccept = async (order) => {
    setAcceptingId(order.order_id);
    setActionError(null);
    try {
      await acceptOrder(order.order_id);
      const active = await loadCurrentOrder();
      setCurrentOrder(active);
      setAssignments([]);
    } catch {
      setActionError("Couldn't accept that order — it may already be taken.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = (order_id) => {
    setAssignments((prev) => prev.filter((o) => o.order_id !== order_id));
  };

  const handleAdvance = async (order_id, isPickedUp) => {
    setAdvancing(true);
    setActionError(null);
    const nextStatus = isPickedUp ? "delivered" : "picked_up";
    try {
      const res=await updateOrderStatus(order_id, nextStatus);
      
      if (nextStatus === "delivered") {
        setCurrentOrder(null);
        setAssignments(await loadAssignments());
      } else {
        const active = await loadCurrentOrder();
        setCurrentOrder(active);
      }
    } catch {
      setActionError("Couldn't update the order status. Please try again.");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
            <ClipboardList size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Order Management
            </h1>
            <p className="text-sm text-orange-500 mt-1">
              {currentOrder
                ? "You have an active delivery in progress."
                : "Accept a nearby order to get started."}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-6">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error}
          </div>
        )}
        {actionError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {actionError}
          </div>
        )}

        {loading ? (
          currentOrder === null && assignments.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <AssignmentSkeleton key={i} />
              ))}
            </div>
          ) : (
            <DetailsSkeleton />
          )
        ) : currentOrder ? (
          <CurrentOrderCard
            order={currentOrder}
            onAdvance={handleAdvance}
            advancing={advancing}
          />
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center gap-2 text-slate-400">
            <ClipboardList size={28} />
            <p className="text-sm font-medium">
              No nearby orders right now. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.map((order) => (
              <AssignmentCard
                key={order.order_id}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                accepting={acceptingId === order.order_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}