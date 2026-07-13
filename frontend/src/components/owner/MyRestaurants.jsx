import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Pencil,
  Store,
} from "lucide-react";
import {
  getMyRestaurantImages,
  getMyRestaurants,
} from "../../api/owner.api.js";

function MyRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantImages, setRestaurantImages] =
    useState({});
  const [loading, setLoading] = useState(true);

  // fallback images
  const DEFAULT_BANNER =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";

  const DEFAULT_LOGO =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop";

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        const response =
          await getMyRestaurants();

        const fetchedRestaurants =
          response?.data?.data || [];

        setRestaurants(
          fetchedRestaurants
        );

        // fetch images for all restaurants
        const imageMap = {};

        await Promise.all(
          fetchedRestaurants.map(
            async (restaurant) => {
              try {
                const response =
                  await getMyRestaurantImages(
                    restaurant.restaurant_id
                  );

                const images =
                  response?.data?.data ||
                  [];

                imageMap[
                  restaurant.restaurant_id
                ] = {
                  banner:
                    images.find(
                      (img) =>
                        img.image_type ===
                        "banner"
                    )?.image_url ||
                    DEFAULT_BANNER,

                  logo:
                    images.find(
                      (img) =>
                        img.image_type ===
                        "logo"
                    )?.image_url ||
                    DEFAULT_LOGO,
                };
              } catch (err) {
                imageMap[
                  restaurant.restaurant_id
                ] = {
                  banner:
                    DEFAULT_BANNER,
                  logo:
                    DEFAULT_LOGO,
                };
              }
            }
          )
        );

        setRestaurantImages(
          imageMap
        );
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/40 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          My Restaurants
        </h1>

        <p className="text-slate-500 mt-1">
          View and manage all your
          restaurant listings
        </p>
      </div>

      {/* Empty state */}
      {restaurants.length ===
      0 ? (
        <div className="bg-white border border-orange-100 rounded-[32px] shadow-sm p-10 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center">
            <Store className="text-orange-500" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-700">
            No Restaurants Found
          </h2>

          <p className="text-slate-500 mt-2">
            Start by creating your
            first restaurant.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {restaurants.map(
            (res) => {
              const images =
                restaurantImages[
                  res.restaurant_id
                ] || {
                  banner:
                    DEFAULT_BANNER,
                  logo:
                    DEFAULT_LOGO,
                };

              return (
                <div
                  key={
                    res.restaurant_id
                  }
                  className="group bg-white rounded-[32px] overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Banner */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        images.banner
                      }
                      alt="Restaurant Banner"
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Logo */}
                    <div className="absolute bottom-5 left-5">
                      <img
                        src={
                          images.logo
                        }
                        alt="Restaurant Logo"
                        className="w-22 h-22 rounded-[26px] border-4 border-white shadow-lg object-cover bg-white"
                      />
                    </div>

                    {/* Edit button */}
                    <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-md hover:bg-orange-500 hover:text-white transition-all">
                      <Pencil size={18} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* title */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                          {
                            res.restaurant_name
                          }
                        </h2>

                        <p className="text-slate-500 mt-1 line-clamp-2">
                          {
                            res.description
                          }
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-5">
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                        <Star
                          size={
                            15
                          }
                          fill="currentColor"
                        />
                        {Number(
                          res.rating_avg ||
                            0
                        ).toFixed(
                          1
                        )}
                      </div>

                      <span className="text-slate-500 text-sm">
                        (
                        {res.rating_count ||
                          0}{" "}
                        reviews)
                      </span>
                    </div>

                    {/* Info */}
                    <div className="mt-5 space-y-4 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <MapPin
                          size={
                            18
                          }
                          className="text-orange-500 shrink-0"
                        />

                        <span>
                          {
                            res.city
                          }
                          ,{" "}
                          {
                            res.state
                          }{" "}
                          -{" "}
                          {
                            res.pincode
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone
                          size={
                            18
                          }
                          className="text-orange-500 shrink-0"
                        />

                        <span>
                          {
                            res.phone
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail
                          size={
                            18
                          }
                          className="text-orange-500 shrink-0"
                        />

                        <span className="break-all">
                          {
                            res.email
                          }
                        </span>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 mt-7">
                      <button className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold hover:shadow-lg hover:shadow-orange-200 transition-all duration-300">
                        Manage Restaurant
                      </button>

                      <button className="px-5 rounded-2xl border border-orange-200 text-orange-500 font-medium hover:bg-orange-50 transition">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default MyRestaurants;