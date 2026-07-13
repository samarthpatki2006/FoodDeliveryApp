import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Star,
  MessageSquareText,
  Package,
  Calendar,
  User,
  ChevronDown,
  Store,
} from "lucide-react";
import { getRestaurantReviews, getMyRestaurants } from "../../api/owner.api";

const RestaurantReviews = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchReviews(restaurantId);
    } else {
      setReviews([]);
    }
  }, [restaurantId]);

  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const res = await getMyRestaurants();
      if (res?.data?.success) {
        const list = res.data.data || [];
        setRestaurants(list);
        if (list.length > 0) {
          setRestaurantId(String(list[0].restaurant_id));
        }
      }
    } catch (err) {
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const fetchReviews = async (id) => {
    setLoading(true);
    try {
      const res = await getRestaurantReviews(id);
      if (res?.data?.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      if (err?.response?.status === 400) {
        setReviews([]);
      } else {
        toast.error("Failed to fetch reviews");
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

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating, size = 14) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? "fill-orange-400 text-orange-400"
              : "fill-transparent text-gray-200"
          }
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="mt-1 font-medium text-orange-500">
              See what your customers are saying
            </p>
          </div>

          {!loading && reviews.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-5 py-3 shadow-xs">
              <div className="text-right">
                <p className="text-2xl font-bold leading-none text-gray-900">
                  {averageRating}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="h-9 w-px bg-orange-100" />
              {renderStars(Math.round(averageRating), 18)}
            </div>
          )}
        </div>

        {/* Restaurant selector */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
            Restaurant
          </label>
          <div className="relative max-w-sm">
            <Store
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
            />
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              disabled={loadingRestaurants || restaurants.length === 0}
              className="w-full appearance-none rounded-2xl border border-orange-100 bg-white py-3 pl-11 pr-10 text-sm font-medium text-gray-800 outline-none transition focus:border-orange-300 disabled:opacity-60"
            >
              {loadingRestaurants ? (
                <option>Loading restaurants...</option>
              ) : restaurants.length === 0 ? (
                <option>No restaurants found</option>
              ) : (
                restaurants.map((r) => (
                  <option key={r.restaurant_id} value={r.restaurant_id}>
                    {r.restaurant_name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="font-medium text-gray-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-xs">
            <MessageSquareText className="mx-auto mb-4 text-orange-300" size={48} />
            <p className="font-medium text-gray-500">No reviews yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Reviews from your customers will show up here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="rounded-2xl border border-orange-100 bg-white px-5 py-4 transition hover:border-orange-200 hover:shadow-sm"
              >
                {/* Top row: user + rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                      <User size={16} />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.full_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Comment */}
                {review.comment?.trim() && (
                  <p className="mb-3 rounded-xl bg-orange-50/60 px-3 py-2 text-sm text-gray-600 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {/* Order meta */}
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  Ordered on {formatDate(review.order_date)}
                  <span className="text-gray-200">·</span>
                  <span className="font-medium text-gray-700">
                    ₹{Number(review.total_amount).toFixed(2)}
                  </span>
                </div>

                {/* Ordered items */}
                {review.items?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-orange-50 pt-3 mt-2">
                    <Package size={13} className="text-gray-300" />
                    {review.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500"
                      >
                        {item.item_name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviews;