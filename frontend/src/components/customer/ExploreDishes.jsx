import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingCart,
  Zap,
  Leaf,
  Drumstick,
  Loader2,
  SlidersHorizontal,
  X,
  ImageOff,
} from "lucide-react";
import { getMenuItems, addItemToCart } from "../../api/customer.api";

/* ── helpers ── */
const Badge = ({ children, variant = "default" }) => {
  const styles = {
    veg: "bg-white/95 text-green-700 border border-green-200",
    nonveg: "bg-white/95 text-red-700 border border-red-200",
    cuisine: "bg-orange-50 text-orange-600 border border-orange-100",
    unavailable: "bg-gray-100 text-gray-400 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${styles[variant] ?? "bg-gray-100 text-gray-500"}`}
    >
      {children}
    </span>
  );
};

// Fallback food photos, keyed by cuisine/category keywords — used only when
// the API doesn't return an image_url for a dish. Ordered most → least specific.
const FOOD_IMAGE_FALLBACKS = [
  { keywords: ["pizza"], url: "https://images.unsplash.com/photo-1513104890138-7c749659a591" },
  { keywords: ["burger"], url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" },
  { keywords: ["biryani", "tandoor"],
  url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7"},
  { keywords: ["chinese", "noodle", "chow"], url: "https://images.unsplash.com/photo-1585032226651-759b368d7246" },
  { keywords: ["japanese", "sushi", "ramen"], url: "https://images.unsplash.com/photo-1553621042-f6e147245754" },
  { keywords: ["mexican", "taco", "burrito"], url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b" },
  { keywords: ["thai"], url: "https://images.unsplash.com/photo-1559314809-0f31657def5e" },
  { keywords: ["italian", "pasta"], url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141" },
  { keywords: ["dessert", "cake", "sweet", "ice cream"], url: "https://images.unsplash.com/photo-1551024506-0bccd828d307" },
  { keywords: ["beverage", "drink", "juice", "shake"], url: "https://images.unsplash.com/photo-1544145945-f90425340c7e" },
  { keywords: ["salad", "healthy"], url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
  { keywords: ["breakfast"], url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666" },
  { keywords: ["seafood", "Fish","fish", "prawn", "shrimp"], url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62" },
];

const GENERIC_FOOD_FALLBACK =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836";

const getDishImage = (item) => {
  if (item.image_url) return item.image_url;

  const haystack = [item.cuisine_name, item.category_name, item.item_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const match = FOOD_IMAGE_FALLBACKS.find(({ keywords }) =>
    keywords.some((k) => haystack.includes(k))
  );

  const base = match?.url ?? GENERIC_FOOD_FALLBACK;
  return `${base}?auto=format&fit=crop&w=480&q=80`;
};

const FILTER_OPTIONS = ["All", "Veg", "Non-Veg"];

/* ── main component ── */
const ExploreDishes = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [addingId, setAddingId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await getMenuItems();
        if (res?.data?.success) setMenuItems(res.data.data);
      } catch {
        toast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const cuisines = useMemo(() => {
    const all = [...new Set(menuItems.map((i) => i.cuisine_name).filter(Boolean))];
    return ["All", ...all];
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch =
        item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchVeg =
        filter === "All" ||
        (filter === "Veg" && item.is_veg) ||
        (filter === "Non-Veg" && !item.is_veg);
      const matchCuisine =
        cuisineFilter === "All" || item.cuisine_name === cuisineFilter;
      return matchSearch && matchVeg && matchCuisine;
    });
  }, [menuItems, search, filter, cuisineFilter]);

  const handleAddToCart = async (item) => {
    setAddingId(item.menu_item_id);
    try {
      const res = await addItemToCart({
        menu_item_id: item.menu_item_id,
        restaurant_id: item.restaurant_id,
        quantity: 1,
      });
      if (res?.data?.success || res?.status < 300) {
        toast.success(`${item.item_name} added to cart!`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleOrderNow = (item) => {
    navigate("/customer/checkout-item", {
      state: { menuItem: item },
    });
  };

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Dishes</h1>
            <p className="mt-0.5 font-medium text-orange-500">
              Find something you'll love
            </p>
          </div>

          {/* Compact search — expands on focus, stays out of the way otherwise */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className={`w-full rounded-full border bg-white py-2.5 pl-9 pr-9 text-sm text-gray-700 placeholder:text-gray-500 outline-none transition ${
                searchOpen
                  ? "border-orange-300 ring-2 ring-orange-100"
                  : "border-gray-300"
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter bar — single compact row, no dedicated card */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-orange-100 bg-white/70 px-3 py-2.5">
          <span className="flex items-center gap-1.5 pr-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <SlidersHorizontal size={13} />
            Filter
          </span>

          <div className="h-4 w-px bg-orange-100" />

          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
              }`}
            >
              {f}
            </button>
          ))}

          {cuisines.length > 1 && (
            <>
              <div className="h-4 w-px bg-orange-100" />
              <div className="flex flex-wrap gap-2">
                {cuisines
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setCuisineFilter(cuisineFilter === c ? "All" : c)
                      }
                      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                        cuisineFilter === c
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p className="mb-4 text-sm font-medium text-gray-400">
            {filtered.length} dish{filtered.length !== 1 ? "es" : ""} found
          </p>
        )}

        {/* Menu Items */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
            <Loader2 size={18} className="animate-spin text-orange-400" />
            Loading dishes…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
              <Search size={24} className="text-orange-400" />
            </div>
            <p className="font-semibold text-gray-800">No dishes found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.menu_item_id}
                className={`flex flex-col overflow-hidden rounded-3xl border shadow-sm transition ${
                  !item.is_available
                    ? "border-gray-100 bg-gray-50 opacity-60"
                    : "border-orange-100 bg-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                {/* Image */}
                <div className="relative h-40 w-full bg-gray-100">
                  {brokenImages[item.menu_item_id] ? (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <ImageOff size={28} />
                    </div>
                  ) : (
                    <img
                      src={getDishImage(item)}
                      alt={item.item_name}
                      loading="lazy"
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [item.menu_item_id]: true,
                        }))
                      }
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    {item.is_veg ? (
                      <Badge variant="veg">
                        <Leaf size={10} /> Veg
                      </Badge>
                    ) : (
                      <Badge variant="nonveg">
                        <Drumstick size={10} /> Non-Veg
                      </Badge>
                    )}
                    {!item.is_available && (
                      <Badge variant="unavailable">Unavailable</Badge>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 rounded-full bg-white px-2.5 py-1 text-sm font-bold text-gray-900 shadow-sm">
                    ₹{Number(item.price).toFixed(2)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2.5 p-4">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      {item.cuisine_name && (
                        <Badge variant="cuisine">{item.cuisine_name}</Badge>
                      )}
                      {item.category_name && (
                        <span className="text-xs text-gray-400">
                          {item.category_name}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm font-medium text-gray-500">
                      {item.restaurant_name}
                    </p>
                    <p className="truncate text-lg font-bold text-gray-900">
                      {item.item_name}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {item.is_available && (
                    <div className="mt-auto flex gap-2 pt-1">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addingId === item.menu_item_id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-orange-300 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 active:scale-[0.98] disabled:opacity-60"
                      >
                        {addingId === item.menu_item_id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={14} />
                        )}
                        Add
                      </button>
                      <button
                        onClick={() => handleOrderNow(item)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]"
                      >
                        <Zap size={14} />
                        Order now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreDishes;