import { useState, useEffect, useCallback } from "react";
import {
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  RefreshCw,
  Power,
  Wallet,
  Phone,
  AlertCircle,
  PackageSearch,
} from "lucide-react";
import {
  togglePartnerAvailability,
  getNewAssignments,
  acceptOrder,
  getCurrentOrderDetails,
  updateOrderStatus,
} from "../../api/partner.api.js";

async function call(promise) {
  try {
    const res = await promise;
    return res.data?.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Request failed";
    throw new Error(message);
  }
}

const STAGES = ["accepted", "out_for_delivery", "delivered"];

function StatusStepper({ assignmentStatus }) {
  const activeIndex = STAGES.indexOf(assignmentStatus);
  const labels = ["Accepted", "Out for delivery", "Delivered"];

  return (
    <div className="flex items-center w-full mb-6">
      {labels.map((label, i) => {
        const isComplete = i < activeIndex || (i === activeIndex && assignmentStatus === "delivered");
        const isCurrent = i === activeIndex && assignmentStatus !== "delivered";
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors
                  ${isComplete ? "bg-amber-500 border-amber-500 text-white" : ""}
                  ${isCurrent ? "border-amber-500 text-amber-600 bg-amber-50" : ""}
                  ${!isComplete && !isCurrent ? "border-orange-100 text-slate-400" : ""}`}
              >
                {isComplete ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${isCurrent ? "text-amber-600" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded ${i < activeIndex ? "bg-amber-500" : "bg-orange-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Banner({ message, tone = "error", onDismiss }) {
  if (!message) return null;
  const tones = {
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div className={`flex items-start gap-2 border rounded-lg px-4 py-3 text-sm font-medium mb-6 ${tones[tone]}`}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-xs font-medium opacity-70 hover:opacity-100">
        Dismiss
      </button>
    </div>
  );
}

function NewAssignmentCard({ assignment, onAccept, accepting }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:bg-orange-50/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-orange-400" />
          <span className="font-semibold text-slate-700">{assignment.restaurant_name}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
          <Wallet size={14} />
          ₹{assignment.expected_earnings}
        </div>
      </div>

      <div className="space-y-1.5 mb-4 text-sm text-slate-500">
        <div className="flex gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-orange-400" />
          <span>{assignment.source_add}, {assignment.source_city}</span>
        </div>
        <div className="flex gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <span>{assignment.dest_add}, {assignment.dest_city}</span>
        </div>
      </div>

      <button
        onClick={() => onAccept(assignment.order_id)}
        disabled={accepting === assignment.order_id}
        className="w-full bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
      >
        {accepting === assignment.order_id ? "Accepting..." : "Accept order"}
      </button>
    </div>
  );
}

function CurrentOrderView({ order, onAdvance, advancing }) {
  const nextAction =
    order.assignment_status === "accepted"
      ? { label: "Mark out for delivery", status: "out_for_delivery", icon: Truck }
      : order.assignment_status === "out_for_delivery"
      ? { label: "Mark delivered", status: "delivered", icon: CheckCircle2 }
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <StatusStepper assignmentStatus={order.assignment_status} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-orange-400" />
          <span className="font-semibold text-slate-700">{order.restaurant_name}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-600 font-bold">
          <Wallet size={15} />
          ₹{order.my_earnings}
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-slate-500">
        <div className="flex gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-orange-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pickup</div>
            {order.restaurant_address_line}, {order.restaurant_city}
          </div>
        </div>
        <div className="flex gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Drop-off</div>
            {order.customer_address_line}, {order.customer_city}
            {order.state ? `, ${order.state}` : ""}
          </div>
        </div>
        {order.approx_distance_km != null && (
          <div className="text-xs text-slate-400 pl-6">~{order.approx_distance_km} km total</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-orange-100 pt-3 mb-4">
        <span>{order.method_name} · {order.status_name}</span>
        {order.phone && (
          <span className="flex items-center gap-1">
            <Phone size={12} /> {order.phone}
          </span>
        )}
      </div>

      {order.special_instructions && (
        <div className="bg-orange-50/60 text-orange-700 text-xs rounded-lg px-3 py-2 mb-4 border border-orange-100">
          {order.special_instructions}
        </div>
      )}

      {nextAction && (
        <button
          onClick={() => onAdvance(order.order_id, nextAction.status)}
          disabled={advancing}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          <nextAction.icon size={16} />
          {advancing ? "Updating..." : nextAction.label}
        </button>
      )}
    </div>
  );
}

export default function OrderManagement() {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newAssignments, setNewAssignments] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadCurrentOrder = useCallback(async () => {
    try {
      const data = await call(getCurrentOrderDetails());
      setCurrentOrder(data || null);
      return data || null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const loadNewAssignments = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await call(getNewAssignments());
      setNewAssignments(data || []);
    } catch (err) {
      // Backend throws a 400 when there are simply no orders right now —
      // treat that as an empty list, not a hard error.
      if (/no orders found/i.test(err.message)) {
        setNewAssignments([]);
      } else {
        setError(err.message);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const active = await loadCurrentOrder();
      if (!active) await loadNewAssignments();
      setLoading(false);
    })();
  }, [loadCurrentOrder, loadNewAssignments]);

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    setError(null);
    try {
      await call(acceptOrder(orderId));
      setIsActive(false); // backend flips the partner offline on accept
      setSuccess("Order accepted");
      await loadCurrentOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(null);
    }
  };

  const handleAdvance = async (orderId, nextStatus) => {
    setAdvancing(true);
    setError(null);
    try {
      await call(updateOrderStatus(orderId, nextStatus));
      if (nextStatus === "delivered") {
        setSuccess("Order marked delivered");
        setCurrentOrder(null);
        await loadNewAssignments();
      } else {
        setSuccess("Order marked out for delivery");
        await loadCurrentOrder();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleToggleActive = async () => {
    const next = !isActive;
    setError(null);
    try {
      await call(togglePartnerAvailability(next));
      setIsActive(next);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-orange-100 px-8 py-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deliveries</h1>
            <p className="text-sm text-orange-500 mt-1">
              {currentOrder ? "Your active delivery." : "Orders ready for pickup near you."}
            </p>
          </div>
          {!currentOrder && (
            <button
              onClick={handleToggleActive}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors shrink-0
                ${isActive ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-500"}`}
            >
              <Power size={12} />
              {isActive ? "Online" : "Offline"}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <Banner message={error} tone="error" onDismiss={() => setError(null)} />
        <Banner message={success} tone="success" onDismiss={() => setSuccess(null)} />

        {loading && (
          <div className="flex flex-col items-center gap-2 text-slate-400 py-14">
            <PackageSearch size={28} />
            <p className="text-sm font-medium">Loading...</p>
          </div>
        )}

        {!loading && currentOrder && (
          <CurrentOrderView order={currentOrder} onAdvance={handleAdvance} advancing={advancing} />
        )}

        {!loading && !currentOrder && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available orders</span>
              <button
                onClick={loadNewAssignments}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {newAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col items-center gap-2 text-slate-400 py-14 px-4 text-center">
                  <PackageSearch size={28} />
                  <p className="text-sm font-medium">
                    No orders nearby right now.
                    <br />
                    Tap refresh to check again.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {newAssignments.map((a) => (
                  <NewAssignmentCard
                    key={a.order_id}
                    assignment={a}
                    onAccept={handleAccept}
                    accepting={accepting}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}