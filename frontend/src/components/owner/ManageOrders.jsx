import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import {
  getMyRestaurants,
  getOrders,
  getOrderStatuses,
  updateOrderStatus,
  updateOpenStatus,
} from "../../api/owner.api";

const STATUS_FILTERS = [
  { label: "All", value: "0" },
  { label: "Pending", value: "1" },
  { label: "Confirmed", value: "2" },
  { label: "Preparing", value: "3" },
  { label: "Ready For Pickup", value: "4" },
  { label: "Out For Delivery", value: "5" },
  { label: "Delivered", value: "6" },
  { label: "Cancelled", value: "7" },
  { label: "Failed", value: "8" },
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

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filterOrderStatusId, setFilterOrderStatusId] = useState("0");
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const response = await getMyRestaurants();
      if (response.status < 300) setRestaurants(response.data.data);
    } catch {
      toast.error("No restaurants found");
    }
  };

  const fetchOrders = async (restaurantId, filterOrderStatusId) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const response = await getOrders(restaurantId, filterOrderStatusId);
      setOrders(response.data.data);
    } catch {
      setOrders([]);
      toast.error("No orders found");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatuses = async () => {
    try {
      const response = await getOrderStatuses();
      setOrderStatuses(response.data.data);
    } catch {
      toast.error("Failed to fetch statuses");
    }
  };

  const handleSelectRestaurant = (e) => {
    const value = e.target.value;
    setRestaurantId(value);
    const selected = restaurants.find((r) => String(r.restaurant_id) === value);
    setIsOpen(selected?.is_open === 1 || selected?.is_open === true);
  };

  const handleToggleOpenStatus = async () => {
    try {
      const updatedStatus = !isOpen;
      await updateOpenStatus({
        restaurant_id: restaurantId,
        is_open: updatedStatus,
      });
      setIsOpen(updatedStatus);
      toast.success(updatedStatus ? "Restaurant Opened" : "Restaurant Closed");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleUpdateData = (e, orderId) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [orderId]: e.target.value,
    }));
  };

  const handleUpdateStatus = async (orderId, statusId) => {
    try {
      if (!statusId) return toast.error("Choose a status");
      await updateOrderStatus({ order_id: orderId, order_status_id: statusId });
      toast.success("Order status updated");
      fetchOrders(restaurantId, filterOrderStatusId);
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await updateOrderStatus({ order_id: orderId, order_status_id: 7 });
      toast.success("Order rejected");
      fetchOrders(restaurantId, filterOrderStatusId);
    } catch {
      toast.error("Failed to reject order");
    }
  };

  useEffect(() => {
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [isOpen]);
  useEffect(() => {
    fetchOrders(restaurantId, filterOrderStatusId);
  }, [restaurantId, filterOrderStatusId]);

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
            <p className="mt-1 font-medium text-orange-500">
              View and manage incoming orders
            </p>
          </div>

          {/* Restaurant selector + open toggle */}
          <div className="flex items-center gap-3">
            <select
              value={restaurantId}
              onChange={handleSelectRestaurant}
              className="rounded-full border border-orange-100 bg-white px-4 py-1.5 text-sm font-medium text-gray-500 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
            >
              <option value="">Choose a restaurant</option>
              {restaurants.map((res) => (
                <option key={res.restaurant_id} value={res.restaurant_id}>
                  {res.restaurant_name}
                </option>
              ))}
            </select>

            {restaurantId && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleOpenStatus}
                  className={`relative inline-flex items-center w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${
                    isOpen ? "bg-orange-500" : "bg-gray-200"
                  }`}
                  aria-label={isOpen ? "Open" : "Closed"}
                >
                  <span
                    className={`absolute left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                      isOpen ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${isOpen ? "text-orange-500" : "text-gray-400"}`}
                >
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterOrderStatusId(f.value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filterOrderStatusId === f.value
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white border border-orange-100 text-gray-500 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {!restaurantId ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 text-orange-300" size={48} />
            <p className="font-medium text-gray-500">
              Select a restaurant to view orders
            </p>
          </div>
        ) : loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="font-medium text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 text-orange-300" size={48} />
            <p className="font-medium text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const status = STATUS_STYLES[o.order_status_id] || {
                label: "Unknown",
                bg: "bg-gray-50",
                text: "text-gray-500",
                dot: "bg-gray-400",
              };

              return (
                <div
                  key={o.order_id}
                  className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-sm font-medium text-gray-400">
                      Order #{o.order_id}
                    </p>
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {o.items?.map((oi) => (
                      <div
                        key={oi.order_item_id}
                        className="flex items-center justify-between rounded-2xl border border-orange-50 bg-orange-50/50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {oi.item_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            ₹{oi.item_price}
                          </p>
                        </div>
                        <span className="rounded-xl bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          ×{oi.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex flex-wrap gap-3 mb-5 text-sm text-gray-500">
                    <span>
                      Subtotal:{" "}
                      <span className="font-medium text-gray-700">
                        ₹{Number(o.subtotal).toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Tax:{" "}
                      <span className="font-medium text-gray-700">
                        ₹{Number(o.tax_amount).toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Delivery:{" "}
                      <span className="font-medium text-gray-700">
                        ₹{Number(o.delivery_fee).toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Total:{" "}
                      <span className="font-semibold text-gray-900">
                        ₹
                        {(
                          Number(o.subtotal) +
                          Number(o.tax_amount) +
                          Number(o.delivery_fee)
                        ).toFixed(2)}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleRejectOrder(o.order_id)}
                      className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-300 transition"
                    >
                      Reject order
                    </button>

                    <select
                      onChange={(e) => handleUpdateData(e, o.order_id)}
                      className="flex-1 rounded-full border border-orange-100 bg-white px-4 py-1.5 text-sm font-medium text-gray-500 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                    >
                      <option value="">Choose updated status</option>
                      {orderStatuses.map((os) => (
                        <option
                          key={os.order_status_id}
                          value={os.order_status_id}
                        >
                          {os.status_name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          o.order_id,
                          selectedStatuses[o.order_id],
                        )
                      }
                      className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-600 shadow-sm transition"
                    >
                      Update status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
