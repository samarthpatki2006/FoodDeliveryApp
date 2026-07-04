import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Percent,
  ChevronRight,
  Menu,
  X,
  Smartphone,
  Leaf,
  Quote,
} from "lucide-react";

/* ---------------------------------------------------------
   TIFFIN — food delivery landing page
   Signature motif: three offset circles (the "tiffin stack")
   used as the logo mark, section markers, and loading dots.
   Palette: Ink (stone-900), Cream (stone-50),
            Mango (amber-400), Chili (orange-600), Curry (emerald-600)
   Type: Fraunces (display) + Plus Jakarta Sans (body)
--------------------------------------------------------- */

const CATEGORIES = [
  { name: "Biryani", tag: "biryani,rice" },
  { name: "Pizza", tag: "pizza" },
  { name: "Dosa", tag: "dosa,indian-food" },
  { name: "Chinese", tag: "chinese-food,noodles" },
  { name: "Rolls & Kebabs", tag: "kebab,grill" },
  { name: "Desserts", tag: "dessert,cake" },
  { name: "Healthy", tag: "salad,healthy-food" },
  { name: "Street Food", tag: "streetfood,snacks" },
];

const RESTAURANTS = [
  {
    name: "Karavalli Kitchen",
    cuisine: "South Indian • Coastal",
    rating: 4.6,
    time: "25-30 min",
    cost: "₹400 for two",
    offer: "50% OFF up to ₹100",
    veg: true,
    tag: "south-indian-food,dosa",
  },
  {
    name: "The Biryani House",
    cuisine: "Mughlai • Biryani",
    rating: 4.7,
    time: "30-35 min",
    cost: "₹500 for two",
    offer: "Free delivery",
    veg: false,
    tag: "biryani,indian-food",
  },
  {
    name: "Napoli Corner",
    cuisine: "Italian • Pizza • Pasta",
    rating: 4.5,
    time: "20-25 min",
    cost: "₹450 for two",
    offer: "20% OFF above ₹300",
    veg: true,
    tag: "pizza,italian-food",
  },
  {
    name: "Dragon Wok",
    cuisine: "Chinese • Asian",
    rating: 4.4,
    time: "28-33 min",
    cost: "₹380 for two",
    offer: "Buy 1 Get 1",
    veg: false,
    tag: "chinese-food,noodles",
  },
  {
    name: "Sweet Tooth Co.",
    cuisine: "Desserts • Bakery",
    rating: 4.8,
    time: "15-20 min",
    cost: "₹250 for two",
    offer: "Flat ₹75 OFF",
    veg: true,
    tag: "dessert,pastry",
  },
  {
    name: "Green Bowl Studio",
    cuisine: "Healthy • Salads • Bowls",
    rating: 4.6,
    time: "22-28 min",
    cost: "₹420 for two",
    offer: "10% OFF",
    veg: true,
    tag: "salad,healthy-food",
  },
];

const TESTIMONIALS = [
  {
    initials: "AS",
    name: "Ananya S.",
    city: "Hyderabad",
    quote:
      "Every order this month has arrived hot, on time, and the live tracking actually matches reality. My weeknight dinners are sorted.",
  },
  {
    initials: "RK",
    name: "Rohit K.",
    city: "Pune",
    quote:
      "Found three neighbourhood places I'd never have discovered otherwise. The filters make it stupidly easy to eat healthy on busy days.",
  },
  {
    initials: "MI",
    name: "Meera I.",
    city: "Bengaluru",
    quote:
      "Support actually picks up. Had a mixed-up order once and it was resolved with a refund before my next meeting started.",
  },
];

/* Scroll-reveal hook + wrapper -------------------------------------- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* Signature mark: three offset circles ("the tiffin stack") --------- */
function TiffinMark({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className="shrink-0"
    >
      <circle cx="16" cy="24" r="10" className="fill-amber-400" />
      <circle cx="24" cy="16" r="10" className="fill-orange-600" opacity="0.92" />
      <circle cx="16" cy="16" r="4" className="fill-emerald-600" />
    </svg>
  );
}

function StarRating({ value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
      <Star size={12} className="fill-white" strokeWidth={0} />
      {value}
    </span>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-stone-50 text-stone-900 antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes tiffin-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-1.5deg); }
        }
        @keyframes tiffin-float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-float { animation: tiffin-float 5s ease-in-out infinite; }
        .animate-float-slow { animation: tiffin-float-slow 6.5s ease-in-out infinite; }
        .animate-marquee { animation: marquee-scroll 32s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* Announcement bar */}
      <div className="bg-stone-900 py-2 text-center font-body text-xs font-medium tracking-wide text-amber-300">
        Free delivery on your first 3 orders — use code{" "}
        <span className="font-bold text-white">FIRSTBITE</span>
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-stone-200 bg-stone-50/95 shadow-sm backdrop-blur"
            : "border-transparent bg-stone-50"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <TiffinMark />
            <span className="font-display text-2xl font-semibold tracking-tight">
              Tiffin
            </span>
          </div>

          <nav className="hidden items-center gap-8 font-body text-sm font-medium text-stone-600 md:flex">
            <a href="#restaurants" className="transition hover:text-stone-900">
              Restaurants
            </a>
            <a href="#how-it-works" className="transition hover:text-stone-900">
              How it works
            </a>
            <a href="#app" className="transition hover:text-stone-900">
              Get the app
            </a>
            <a href="#" className="transition hover:text-stone-900">
              Partner with us
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button className="font-body text-sm font-semibold text-stone-700 transition hover:text-stone-900">
              Sign in
            </button>
            <button className="group flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-orange-600">
              Get the app
              <ChevronRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
          </div>

          <button
            className="text-stone-700 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-stone-200 bg-stone-50 px-6 py-4 font-body md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium text-stone-700">
              <a href="#restaurants">Restaurants</a>
              <a href="#how-it-works">How it works</a>
              <a href="#app">Get the app</a>
              <a href="#">Partner with us</a>
              <button className="mt-2 rounded-full bg-stone-900 py-2.5 font-semibold text-white">
                Get the app
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-stone-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 font-body text-xs font-semibold text-stone-600">
              <TiffinMark size={16} />
              Now delivering in 120+ cities
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
              Your favourite kitchens,
              <br />
              <span className="text-orange-600">delivered hot.</span>
            </h1>
            <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-stone-600">
              From street-cart chaat to five-star biryani — order from 40,000+
              restaurants and watch every step of the journey home.
            </p>

            {/* Address search */}
            <div className="mt-8 flex max-w-md flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg shadow-stone-200/60 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <MapPin size={18} className="shrink-0 text-orange-600" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                  className="w-full bg-transparent font-body text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-orange-700 active:scale-[0.98]">
                <Search size={16} />
                Find food
              </button>
            </div>

            <div className="mt-8 flex items-center gap-6 font-body text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <Star size={15} className="fill-amber-400 text-amber-400" />
                <strong className="text-stone-800">4.6</strong> average rating
              </span>
              <span className="h-4 w-px bg-stone-300" />
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-stone-500" />
                <strong className="text-stone-800">28 min</strong> avg delivery
              </span>
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative mx-auto h-[420px] w-full max-w-md lg:h-[520px] lg:max-w-none">
            <img
              src="https://loremflickr.com/560/680/biryani,indianfood"
              alt="Signature biryani bowl"
              className="absolute right-0 top-0 h-[78%] w-[68%] rounded-[2rem] object-cover shadow-2xl"
            />
            <img
              src="https://loremflickr.com/380/380/pizza"
              alt="Fresh pizza"
              className="animate-float-slow absolute bottom-0 left-0 h-[46%] w-[46%] rounded-[1.75rem] border-4 border-stone-50 object-cover shadow-xl"
            />

            <div className="animate-float absolute -left-2 top-6 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600">
                <Star size={16} className="fill-white text-white" />
              </div>
              <div className="font-body leading-tight">
                <p className="text-sm font-bold text-stone-900">4.8 rating</p>
                <p className="text-xs text-stone-500">2,300+ reviews</p>
              </div>
            </div>

            <div className="animate-float-slow absolute bottom-8 right-2 flex items-center gap-2 rounded-2xl bg-stone-900 px-4 py-3 text-white shadow-xl">
              <Truck size={18} className="text-amber-300" />
              <div className="font-body leading-tight">
                <p className="text-sm font-bold">Out for delivery</p>
                <p className="text-xs text-stone-300">Arriving in 12 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust stats strip */}
        <div className="border-t border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 font-body sm:grid-cols-4">
            {[
              ["40,000+", "Restaurant partners"],
              ["120+", "Cities served"],
              ["28 min", "Average delivery"],
              ["4.6★", "Average rating"],
            ].map(([stat, label]) => (
              <div key={label} className="text-center sm:text-left">
                <p className="font-display text-3xl font-semibold text-stone-900">
                  {stat}
                </p>
                <p className="mt-1 text-sm text-stone-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-14 max-w-xl text-center">
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-orange-600">
              How it works
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-stone-900">
              Three steps between you and dinner
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Browse & choose",
                desc: "Filter by cuisine, rating, or diet and pick from thousands of local menus.",
                icon: <Search size={22} className="text-orange-600" />,
              },
              {
                n: "02",
                title: "Track it live",
                desc: "Watch your order move from the kitchen to your doorstep in real time.",
                icon: <Truck size={22} className="text-orange-600" />,
              },
              {
                n: "03",
                title: "Dig in",
                desc: "Sealed, hot, and on time — rate your meal and reorder in one tap.",
                icon: <Leaf size={22} className="text-orange-600" />,
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <div className="group relative h-full rounded-3xl border border-stone-200 bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/70">
                  <span className="font-display text-5xl font-semibold text-stone-100 transition group-hover:text-amber-100">
                    {step.n}
                  </span>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                    {step.icon}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-stone-500">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES marquee */}
      <section className="border-y border-stone-200 bg-white py-14">
        <Reveal className="mx-auto mb-8 max-w-7xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
            Craving something specific?
          </h2>
        </Reveal>
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-5 px-6">
            {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
              <div
                key={`${cat.name}-${i}`}
                className="group flex w-32 flex-col items-center gap-3"
              >
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-stone-100 shadow-md transition duration-300 group-hover:scale-105 group-hover:border-amber-200">
                  <img
                    src={`https://loremflickr.com/160/160/${cat.tag}`}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-center font-body text-sm font-semibold text-stone-700">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED RESTAURANTS */}
      <section id="restaurants" className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-body text-sm font-semibold uppercase tracking-widest text-orange-600">
                Trending near you
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-stone-900">
                Featured restaurants
              </h2>
            </div>
            <button className="flex items-center gap-1 font-body text-sm font-semibold text-stone-700 transition hover:text-orange-600">
              View all restaurants
              <ChevronRight size={16} />
            </button>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {RESTAURANTS.map((r, i) => (
              <Reveal key={r.name} delay={(i % 3) * 100}>
                <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/70">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={`https://loremflickr.com/500/360/${r.tag}`}
                      alt={r.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 font-body text-xs font-bold text-orange-600 shadow">
                      <Percent size={12} />
                      {r.offer}
                    </span>
                    <span
                      className={`absolute right-3 top-3 h-4 w-4 rounded-[4px] border-2 ${
                        r.veg ? "border-emerald-600" : "border-rose-600"
                      } bg-white flex items-center justify-center`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          r.veg ? "bg-emerald-600" : "bg-rose-600"
                        }`}
                      />
                    </span>
                  </div>
                  <div className="p-5 font-body">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-stone-900">
                        {r.name}
                      </h3>
                      <StarRating value={r.rating} />
                    </div>
                    <p className="mt-1 text-sm text-stone-500">{r.cuisine}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {r.time}
                      </span>
                      <span>{r.cost}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              {
                icon: <Truck size={22} className="text-orange-600" />,
                title: "Live order tracking",
                desc: "Follow your delivery partner on the map from kitchen to door.",
              },
              {
                icon: <ShieldCheck size={22} className="text-orange-600" />,
                title: "Verified hygiene ratings",
                desc: "Every kitchen is inspected and rated before it joins Tiffin.",
              },
              {
                icon: <Percent size={22} className="text-orange-600" />,
                title: "Prices you can trust",
                desc: "No surge pricing. What you see at checkout is what you pay.",
              },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 100} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                  {v.icon}
                </div>
                <div className="font-body">
                  <h3 className="font-display text-lg font-semibold text-stone-900">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section id="app" className="relative overflow-hidden bg-stone-900 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-amber-300">
              Tiffin, in your pocket
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Order faster with the app
            </h2>
            <p className="mt-5 max-w-md font-body text-stone-300">
              Save your addresses, reorder in one tap, and get delivery
              notifications the moment your food leaves the kitchen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-5 py-3 text-white transition hover:border-stone-500">
                <Smartphone size={20} />
                <div className="text-left font-body leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">
                    Download on the
                  </p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-5 py-3 text-white transition hover:border-stone-500">
                <Smartphone size={20} />
                <div className="text-left font-body leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">
                    Get it on
                  </p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </button>
            </div>
          </Reveal>

          {/* CSS phone mockup — no third-party branding */}
          <Reveal delay={150} className="mx-auto">
            <div className="animate-float-slow relative mx-auto h-[440px] w-[230px] rounded-[2.5rem] border-[10px] border-stone-700 bg-stone-800 shadow-2xl">
              <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-stone-700" />
              <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-stone-50 p-3 pt-6">
                <div className="flex items-center gap-2">
                  <TiffinMark size={22} />
                  <span className="font-display text-sm font-bold">Tiffin</span>
                </div>
                <div className="mt-3 h-24 w-full overflow-hidden rounded-xl">
                  <img
                    src="https://loremflickr.com/220/120/foodcourt,indianfood"
                    alt="app preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  {[1, 2, 3].map((k) => (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm"
                    >
                      <div className="h-6 w-16 rounded bg-stone-100" />
                      <div className="h-6 w-6 rounded-full bg-emerald-100" />
                    </div>
                  ))}
                </div>
                <div className="mt-auto rounded-xl bg-orange-600 py-2.5 text-center font-body text-xs font-bold text-white">
                  Reorder last meal
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-14 max-w-xl text-center">
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-orange-600">
              What people are saying
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-stone-900">
              Loved by hungry people, everywhere
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <div className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-7">
                  <Quote size={26} className="text-amber-300" />
                  <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-stone-600">
                    {t.quote}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-body text-sm font-bold text-orange-700">
                      {t.initials}
                    </div>
                    <div className="font-body leading-tight">
                      <p className="text-sm font-semibold text-stone-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-stone-500">{t.city}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-stone-50 px-6 pb-24">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-600 to-amber-500 px-8 py-16 text-center sm:px-16">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Craving something? We've got you.
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-orange-50">
            Order in the next 5 minutes and get it delivered before your
            favourite show ends.
          </p>
          <button className="mt-8 rounded-full bg-stone-900 px-8 py-3.5 font-body text-sm font-semibold text-white transition hover:bg-stone-800 active:scale-[0.98]">
            Order now
          </button>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-950 pt-16 text-stone-400">
        <div className="mx-auto max-w-7xl px-6 pb-10">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <TiffinMark size={28} />
                <span className="font-display text-xl font-semibold text-white">
                  Tiffin
                </span>
              </div>
              <p className="mt-4 font-body text-sm leading-relaxed">
                Local kitchens, delivered with care — one tiffin at a time.
              </p>
            </div>

            {[
              {
                title: "Company",
                links: ["About us", "Careers", "Press", "Blog"],
              },
              {
                title: "For partners",
                links: [
                  "Partner with us",
                  "Deliver with Tiffin",
                  "Restaurant dashboard",
                ],
              },
              {
                title: "Support",
                links: ["Help centre", "Safety", "Terms", "Privacy"],
              },
            ].map((col) => (
              <div key={col.title} className="font-body">
                <p className="text-sm font-semibold text-white">{col.title}</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="transition hover:text-white">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-stone-800">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 font-body text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} Tiffin Technologies Pvt. Ltd.</p>
            <p>Made for people who'd rather eat than cook tonight.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}