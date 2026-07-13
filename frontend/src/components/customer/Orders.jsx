import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingBag, ChevronRight, FilterX, Star, X, StarCheck } from "lucide-react";
import { getMyOrders, addReview } from "../../api/customer.api";

const STATUS_FILTERS = [
  { label: "All", value: "" },
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

// Order status id that represents a delivered order.
// The "Add Review" action is only ever shown for orders with this status.
const DELIVERED_STATUS_ID = 6;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState(null); // order object currently being reviewed
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const openReviewModal = (e, order) => {
    e.stopPropagation(); // don't trigger the card's navigate-to-details click
    setReviewOrder(order);
    setReviewRating(0);
    setReviewHoverRating(0);
    setReviewComment("");
  };

  const closeReviewModal = () => {
    if (submittingReview) return;
    setReviewOrder(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await addReview({
        order_id: reviewOrder.order_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res?.data?.success) {
        toast.success("Review submitted successfully");
        setReviewOrder(null);
      } else {
        toast.error(res?.data?.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
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
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {orders.map((order) => {
              const status = STATUS_STYLES[order.order_status_id] || {
                label: "Unknown",
                bg: "bg-gray-50",
                text: "text-gray-500",
                dot: "bg-gray-400",
              };
              const isDelivered = order.order_status_id === DELIVERED_STATUS_ID;

              return (
                <div
                  key={order.order_id}
                  className="cursor-pointer rounded-2xl border border-orange-100 bg-white px-5 py-4 transition hover:border-orange-200 hover:shadow-sm active:scale-[0.99]"
                >
                  {/* Top row: restaurant + status badge */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="font-semibold text-gray-900 truncate">
                      {order.restaurant_name}
                    </p>
                    <span
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </div>

                  {/* Meta row: order id + date */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Amounts row */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Subtotal{" "}
                      <span className="font-medium text-gray-700">
                        ₹{Number(order.subtotal).toFixed(2)}
                      </span>
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-gray-400">
                      Total{" "}
                      <span className="font-semibold text-gray-900">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </span>
                    </span>
                    <ChevronRight size={15} className="text-gray-300 ml-auto" />
                  </div>

                  {/* Special instructions */}
                  {order.special_instructions?.trim() && (
                    <p className="mt-3 rounded-xl bg-orange-50/60 px-3 py-2 text-xs text-gray-400 italic leading-relaxed">
                      "{order.special_instructions}"
                    </p>
                  )}

                  {/* Add Review — delivered orders only */}
                  {isDelivered && (
                    <div className="mt-3 border-t border-orange-50 pt-3">
                      {order.review_id==null ?<button
                        onClick={(e) => openReviewModal(e, order)}
                        className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500 transition hover:bg-orange-100"
                      >
                        <Star size={18} />
                        Add Review
                      </button>
                      : 
                      <button
                        className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500 transition hover:bg-orange-100"
                      >
                        <StarCheck size={18} />
                        Review Submitted
                      </button>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeReviewModal}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Review {reviewOrder.restaurant_name}
              </h2>
              <button
                onClick={closeReviewModal}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Star rating */}
            <div className="mb-4 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHoverRating(star)}
                  onMouseLeave={() => setReviewHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    size={28}
                    className={
                      star <= (reviewHoverRating || reviewRating)
                        ? "fill-orange-400 text-orange-400"
                        : "fill-transparent text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={4}
              className="mb-4 w-full resize-none rounded-2xl border border-orange-100 px-4 py-3 text-sm text-gray-700 outline-none focus:border-orange-300"
            />

            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;