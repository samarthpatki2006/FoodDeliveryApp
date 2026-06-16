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
  ArrowLeft,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getMenuItems, addItemToCart } from "../../api/customer.api";

/* ── helpers ── */
const Section = ({ icon, title, children }) => (
  <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2 text-orange-500">
      {icon}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    veg: "bg-green-50 text-green-700 border border-green-200",
    nonveg: "bg-red-50 text-red-700 border border-red-200",
    cuisine: "bg-orange-50 text-orange-600 border border-orange-100",
    unavailable: "bg-gray-100 text-gray-400 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant] ?? "bg-gray-100 text-gray-500"}`}
    >
      {children}
    </span>
  );
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
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 shadow-sm transition hover:bg-orange-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Dishes</h1>
            <p className="mt-0.5 font-medium text-orange-500">
              Find something you'll love
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Search & Filters */}
          <Section icon={<SlidersHorizontal size={18} />} title="Filter">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  type="text"
                  placeholder="Search dishes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-white py-3 pl-9 pr-9 text-sm text-gray-700 placeholder:text-gray-300 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
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

              {/* Veg / Non-Veg */}
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                      filter === f
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Cuisine pills — only non-"All" entries, since All is covered above */}
              {cuisines.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {cuisines.filter((c) => c !== "All").map((c) => (
                    <button
                      key={c}
                      onClick={() => setCuisineFilter(cuisineFilter === c ? "All" : c)}
                      className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                        cuisineFilter === c
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Menu Items */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
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
            <Section
              icon={<ShoppingCart size={18} />}
              title={`${filtered.length} dish${filtered.length !== 1 ? "es" : ""}`}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((item) => (
                  <div
                    key={item.menu_item_id}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 transition ${
                      !item.is_available
                        ? "border-gray-100 bg-gray-50 opacity-60"
                        : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {item.is_veg ? (
                            <Badge variant="veg">
                              <Leaf size={10} /> Veg
                            </Badge>
                          ) : (
                            <Badge variant="nonveg">
                              <Drumstick size={10} /> Non-Veg
                            </Badge>
                          )}
                          {item.cuisine_name && (
                            <Badge variant="cuisine">{item.cuisine_name}</Badge>
                          )}
                          {!item.is_available && (
                            <Badge variant="unavailable">Unavailable</Badge>
                          )}
                        </div>
                        <p className="font-bold text-xl text-gray-900">{item.restaurant_name}</p>
                        <p className="font-bold text-md text-gray-900">{item.item_name}</p>
                        {item.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-base font-bold">
                        ₹{Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Category */}
                    {item.category_name && (
                      <p className="text-xs text-gray-400">{item.category_name}</p>
                    )}

                    {/* Actions */}
                    {item.is_available && (
                      <div className="flex gap-2">
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
                          Add to cart
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
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreDishes;