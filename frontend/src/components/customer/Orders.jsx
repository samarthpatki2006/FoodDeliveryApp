import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingBag, ChevronRight, FilterX } from "lucide-react";
import { getMyOrders } from "../../api/customer.api";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "1" },
  { label: "Confirmed", value: "2" },
  { label: "Preparing", value: "3" },
  { label: "Ready For Pickup", value: "4" },
  { label: "Out For Delivery", value: "5" },
  { label: "Delivered", value: "6" },
  {label:"Cancelled",value:"7"},
  {label:"Failed",value:"8"}
];

const STATUS_STYLES = {
  1: {
    label: "Pending",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    dot: "bg-yellow-400",
  },
  2: {
    label: "Confirmed",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
  },
  3: {
    label: "Preparing",
    bg: "bg-orange-50",
    text: "text-orange-500",
    dot: "bg-orange-400",
  },
  4: {
    label: "Ready For Pickup",
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-400",
  },
  5: {
    label: "Out For Delivery",
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-400",
  },
  6: {
    label: "Delivered",
    bg: "bg-green-50",
    text: "text-green-500",
    dot: "bg-green-400",
  },
  7: {
    label: "Cancelled",
    bg: "bg-indigo-50",
    text: "text-indigo-500",
    dot: "bg-indigo-400",
  },
  8: {
    label: "Failed",
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-400",
  },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    fetchOrders(activeFilter);
  }, [activeFilter]);

  const fetchOrders = async (statusId) => {
    setLoading(true);
    try {
      const res = await getMyOrders(statusId);
      if (res?.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      if (err?.response?.status === 400) {
        setOrders([]);
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 font-medium text-orange-500">
            Track and review your past orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeFilter === f.value
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white border border-orange-100 text-gray-500 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="font-medium text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-xs">
            <ShoppingBag className="mx-auto mb-4 text-orange-300" size={48} />
            <p className="font-medium text-gray-500">No orders found</p>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter("")}
                className="mt-3 flex items-center gap-1 mx-auto text-sm text-orange-400 hover:text-orange-600 transition"
              >
                <FilterX size={14} />
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_STYLES[order.order_status_id] || {
                label: "Unknown",
                bg: "bg-gray-50",
                text: "text-gray-500",
                dot: "bg-gray-400",
              };

              return (
                <div
                  key={order.order_id}
                  onClick={() => navigate(`/customer/orders/${order.order_id}`)}
                  className="cursor-pointer rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-orange-200 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-gray-400">
                          Order #{order.order_id}
                        </p>
                        <span className="text-gray-200">·</span>
                        <p className="text-xs text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <p className="font-semibold text-gray-900 truncate">
                        {order.restaurant_name ||
                          `Restaurant #${order.restaurant_id}`}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>
                          Subtotal:{" "}
                          <span className="font-medium text-gray-700">
                            ₹{Number(order.subtotal).toFixed(2)}
                          </span>
                        </span>
                        <span>
                          Total:{" "}
                          <span className="font-semibold text-gray-900">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right: status + chevron */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>

                  {order.special_instructions?.trim() && (
                    <p className="mt-3 rounded-xl border border-orange-50 bg-orange-50/50 px-3 py-2 text-xs text-gray-500 italic">
                      "{order.special_instructions}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
