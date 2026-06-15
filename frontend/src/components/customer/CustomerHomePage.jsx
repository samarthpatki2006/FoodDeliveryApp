import { useState, useEffect } from "react";
import {
  getAddresses,
  getRestaurantsInMyCity,
  getRestaurantMenu,
  getNearbyRestaurants,
} from "../../api/customer.api.js";
import {
  MapPin,
  Search,
  Star,
  Clock,
  Phone,
  Navigation,
  Store,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";

const RADIUS_OPTIONS = [1, 2, 3, 5, 10];

/* ── Star rating ── */
const StarRating = ({ rating }) => {
  const r = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={s <= Math.round(r) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-500">{r.toFixed(1)}</span>
    </div>
  );
};

/* ── Small badge pill ── */
const Badge = ({ children, variant = "default" }) => {
  const variants = {
    open:    "bg-green-100 text-green-700",
    closed:  "bg-gray-100 text-gray-500",
    cuisine: "bg-orange-50 text-orange-700",
    veg:     "bg-green-100 text-green-700",
    nonveg:  "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide whitespace-nowrap ${variants[variant]}`}>
      {children}
    </span>
  );
};

/* ── Section wrapper (matches Checkout's <Section>) ── */
const Section = ({ icon, title, children }) => (
  <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2 text-orange-500">
      {icon}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const Home = () => {
  const [addresses, setAddresses]               = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [restaurants, setRestaurants]           = useState([]);
  const [location, setLocation]                 = useState({ latitude: null, longitude: null });
  const [radius, setRadius]                     = useState(5);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [tab, setTab]                           = useState("saved");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems]               = useState([]);
  const [isFetchingAddr, setIsFetchingAddr]     = useState(false);
  const [isFetchingRest, setIsFetchingRest]     = useState(false);
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);
  const [isFetchingMenu, setIsFetchingMenu]     = useState(false);
  const [isGettingLoc, setIsGettingLoc]         = useState(false);
  const [error, setError]                       = useState("");

  useEffect(() => {
    (async () => {
      setIsFetchingAddr(true);
      try {
        const res = await getAddresses();
        if (res.status < 300) setAddresses(res.data.data);
      } catch { /* silently ignore */ }
      finally { setIsFetchingAddr(false); }
    })();
  }, []);

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setIsGettingLoc(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setIsGettingLoc(false);
        setTab("nearby");
      },
      () => { setError("Could not get location. Please allow access."); setIsGettingLoc(false); }
    );
  };

  const handleFetchByAddress = async () => {
    setError(""); setRestaurants([]); setIsFetchingRest(true);
    try {
      const res = await getRestaurantsInMyCity(selectedAddressId || undefined);
      if (res.status < 300) {
        setRestaurants(res.data.data)
        console.log(res.data.data);
      }
      else setError(res.data?.message || "No restaurants found.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fetch restaurants.");
    } finally { setIsFetchingRest(false); }
  };

  const handleFetchNearby = async () => {
    if (!location.latitude) { setError("Get your live location first."); return; }
    setError(""); setNearbyRestaurants([]); setIsFetchingNearby(true);
    try {
      const res = await getNearbyRestaurants(location.latitude, location.longitude, radius);
      if (res.status < 300) setNearbyRestaurants(res.data.data);
      else setError(res.data?.message || "No nearby restaurants found.");
    } catch (e) {
      setError(e?.response?.data?.message || "No restaurants found in this radius.");
    } finally { setIsFetchingNearby(false); }
  };

  const handleOpenRestaurant = async (rest) => {
    setSelectedRestaurant(rest);
    setMenuItems([]);
    setError("");
    setIsFetchingMenu(true);
    try {
      const res = await getRestaurantMenu(rest.restaurant_id);
      if (res.status < 300) setMenuItems(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load menu.");
    } finally { setIsFetchingMenu(false); }
  };

  const handleClosePanel = () => { setSelectedRestaurant(null); setMenuItems([]); setError(""); };

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc.find((i) => i.menu_item_id === item.menu_item_id)) acc.push(item);
    return acc;
  }, []);

  const isVeg = (item) => item.is_veg || item.category?.toLowerCase().includes("veg");
  const activeList = tab === "nearby" ? nearbyRestaurants : restaurants;

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find restaurants</h1>
          <p className="mt-0.5 font-medium text-orange-500">
            Browse by address or discover what&apos;s nearby
          </p>
        </div>

        <div className="space-y-5">

          {/* ── Find section ── */}
          <Section icon={<Search size={18} />} title="Search">

            {/* Tabs */}
            <div className="mb-4 flex gap-2">
              {[
                { id: "saved", label: "By address" },
                { id: "nearby", label: "Nearby" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    tab === t.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "saved" && (
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="min-w-[180px] flex-1 rounded-xl border border-gray-100 bg-white p-3 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  disabled={isFetchingAddr}
                >
                  <option value="">{isFetchingAddr ? "Loading…" : "All saved addresses"}</option>
                  {addresses.map((a) => (
                    <option key={a.address_id} value={a.address_id}>
                      {a.label} · {a.city}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleFetchByAddress}
                  disabled={isFetchingRest}
                  className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
                >
                  {isFetchingRest ? (
                    <><Loader2 size={15} className="animate-spin" /> Searching…</>
                  ) : (
                    <><Search size={15} /> Find restaurants</>
                  )}
                </button>
              </div>
            )}

            {tab === "nearby" && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleGetLiveLocation}
                    disabled={isGettingLoc}
                    className="flex items-center gap-2 rounded-2xl border border-orange-300 bg-white px-4 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isGettingLoc ? (
                      <><Loader2 size={15} className="animate-spin" /> Locating…</>
                    ) : (
                      <><Navigation size={15} /> Get my location</>
                    )}
                  </button>
                  <button
                    onClick={handleFetchNearby}
                    disabled={isFetchingNearby || !location.latitude}
                    className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isFetchingNearby ? (
                      <><Loader2 size={15} className="animate-spin" /> Searching…</>
                    ) : (
                      <><Search size={15} /> Search nearby</>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 whitespace-nowrap">Search radius</span>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  >
                    {RADIUS_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r} km</option>
                    ))}
                  </select>
                  {location.latitude && (
                    <span className="text-xs text-gray-400">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </Section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Restaurant results ── */}
          {activeList.length > 0 && (
            <Section icon={<Store size={18} />} title={`${activeList.length} restaurant${activeList.length !== 1 ? "s" : ""}${tab === "nearby" && location.latitude ? ` within ${radius} km` : ""}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {activeList.map((rest) => (
                  <button
                    key={rest.restaurant_id}
                    onClick={() => handleOpenRestaurant(rest)}
                    className="group w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md active:scale-[0.99]"
                  >
                    <img
                      src={rest.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop"}
                      alt={rest.restaurant_name}
                      className="h-36 w-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop"; }}
                    />
                    <div className="p-3.5">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-900">{rest.restaurant_name}</p>
                        <Badge variant={rest.is_open ? "open" : "closed"}>
                          {rest.is_open ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <p className="mb-2 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        {rest.city}{rest.distance_km != null ? ` · ${rest.distance_km} km away` : ""}
                      </p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <StarRating rating={rest.rating_avg} />
                        {rest.cuisine_type && <Badge variant="cuisine">{rest.cuisine_type}</Badge>}
                      </div>
                      {rest.delivery_time_minutes && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={11} />
                          {rest.delivery_time_minutes} min
                          {rest.min_order_amount ? ` · ₹${rest.min_order_amount} min order` : ""}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ── Empty state ── */}
          {activeList.length === 0 && !isFetchingRest && !isFetchingNearby && (
            <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <Store size={24} className="text-orange-400" />
              </div>
              <p className="font-semibold text-gray-800">Let&apos;s find your food</p>
              <p className="mt-1 text-sm text-gray-400">
                {tab === "saved"
                  ? "Pick a saved address and hit Find restaurants."
                  : "Get your live location, set a radius, then hit Search nearby."}
              </p>
            </div>
          )}

        </div>
      </div>

      {selectedRestaurant && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClosePanel()}
        >
          <div className="flex w-full max-w-[540px] max-h-[90vh] flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="relative flex-shrink-0">
              <img
                src={selectedRestaurant.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop"}
                alt={selectedRestaurant.name}
                className="h-52 w-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop"; }}
              />
              <button
                onClick={handleClosePanel}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-1 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRestaurant.restaurant_name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedRestaurant.city}
                  </p>
                </div>
                <Badge variant={selectedRestaurant.is_open ? "open" : "closed"}>
                  {selectedRestaurant.is_open ? "Open now" : "Closed"}
                </Badge>
              </div>
              <StarRating rating={selectedRestaurant.rating_avg} />

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {selectedRestaurant.distance_km != null && (
                  <InfoChip label="Distance">
                    <MapPin size={12} className="inline mr-1 -mt-0.5" />
                    {selectedRestaurant.distance_km} km away
                  </InfoChip>
                )}
                {selectedRestaurant.min_order_amount && (
                  <InfoChip label="Min order">₹{selectedRestaurant.min_order_amount}</InfoChip>
                )}
                {selectedRestaurant.phone && (
                  <InfoChip label="Phone">
                    <Phone size={12} className="inline mr-1 -mt-0.5" />
                    {selectedRestaurant.phone}
                  </InfoChip>
                )}
                {selectedRestaurant.address && (
                  <InfoChip label="Address" wide>{selectedRestaurant.address_line}</InfoChip>
                )}
              </div>

              <hr className="my-5 border-orange-100" />

              <p className="mb-4 font-bold text-gray-900">Menu</p>

              {isFetchingMenu ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                  <Loader2 size={16} className="animate-spin" /> Loading menu…
                </div>
              ) : groupedMenu.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No menu items available yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {groupedMenu.map((item) => (
                    <div key={item.menu_item_id} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop"}
                        alt={item.name}
                        className="h-24 w-full object-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop"; }}
                      />
                      <div className="p-2.5">
                        <p className="font-bold text-sm text-gray-900">{item.item_name}</p>
                        {item.description && (
                          <p className="mt-0.5 text-[0.71rem] leading-snug text-gray-500 line-clamp-2">{item.description}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-extrabold text-sm text-orange-500">₹{parseFloat(item.price).toFixed(2)}</span>
                          <Badge variant={isVeg(item) ? "veg" : "nonveg"}>
                            {isVeg(item) ? "Veg" : "Non-veg"}
                          </Badge>
                        </div>
                        {item.category && (
                          <div className="mt-1.5">
                            <Badge>{item.category}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const InfoChip = ({ label, children, wide }) => (
  <div className={`rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700 ${wide ? "col-span-2" : ""}`}>
    <p className="mb-0.5 text-[0.63rem] font-bold uppercase tracking-wider text-gray-400">{label}</p>
    {children}
  </div>
);

export default Home;