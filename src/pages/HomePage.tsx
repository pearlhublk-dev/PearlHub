import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { useNavigate as useNav } from "react-router-dom";
import LeafletMap from "@/components/LeafletMap";
import heroPropertyImg from "@/assets/hero-property.jpg";

const HomePage = () => {
  const { data } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: "🔍" },
    { id: "property", label: "Property", icon: "🏘️" },
    { id: "stays", label: "Stays", icon: "🏨" },
    { id: "vehicles", label: "Vehicles", icon: "🚗" },
    { id: "events", label: "Events", icon: "🎭" },
  ];

  const locationOptions = [
    { value: "all", label: "All Island" },
    { value: "colombo", label: "Colombo" },
    { value: "kandy", label: "Kandy" },
    { value: "galle", label: "Galle" },
    { value: "negombo", label: "Negombo" },
    { value: "ella", label: "Ella" },
  ];

  const stats = [
    { value: "12.4k+", label: "Properties", icon: "🏘️" },
    { value: "3.2k+", label: "Luxury Stays", icon: "🏨" },
    { value: "1.8k+", label: "Vehicles", icon: "🚗" },
    { value: "500+", label: "Live Events", icon: "🎫" },
  ];

  const trendingTags = ["#Beach Villas", "#Penthouse", "#EV Rentals", "#Live Concerts"];

  const categoryCards = [
    { id: "property", title: "Property", subtitle: "Sale • Rent • Lease", icon: "🏘️", count: "6,240+", colorClass: "text-emerald border-emerald", desc: "Find your perfect property across Sri Lanka. Verified owners and licensed brokers." },
    { id: "stays", title: "Stays", subtitle: "Hotels • Villas • Hostels", icon: "🏨", count: "3,180+", colorClass: "text-sapphire border-sapphire", desc: "From 5-star luxury to boutique lodges. Sri Lanka Tourism Board approved." },
    { id: "vehicles", title: "Rent-a-Vehicle", subtitle: "Cars • Vans • Luxury Coaches", icon: "🚗", count: "1,820+", colorClass: "text-ruby border-ruby", desc: "Self-drive or chauffeured. Cars, vans, jeeps, buses island-wide." },
    { id: "events", title: "Events & Cinema", subtitle: "Tickets • Seats • QR Entry", icon: "🎭", count: "540+", colorClass: "text-indigo border-indigo", desc: "Cinema, concerts, and sports. Real-time seat selection with QR tickets." },
  ];

  const allMarkers = [
    ...data.properties.map(p => ({ lat: p.lat, lng: p.lng, title: p.title, location: p.location, price: p.price, emoji: p.image, type: "property" })),
    ...data.stays.map(s => ({ lat: s.lat, lng: s.lng, title: s.name, location: s.location, price: s.pricePerNight, emoji: s.image, type: "stay", rating: s.rating })),
    ...data.vehicles.map(v => ({ lat: v.lat, lng: v.lng, title: `${v.make} ${v.model}`, location: v.location, price: v.price, emoji: v.image, type: "vehicle" })),
    ...data.events.map(e => ({ lat: e.lat, lng: e.lng, title: e.title, location: e.venue, emoji: e.image, type: "event" })),
  ];

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${activeCategory}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(215 35% 7%) 0%, hsl(210 29% 12%) 50%, hsl(210 53% 18%) 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${heroPropertyImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.04] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-emerald/[0.06] pointer-events-none" />
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-1.5 bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">✨ Sri Lanka's #1 Ecosystem</div>
            <h1 className="font-display text-pearl font-black leading-tight mb-2" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
              The Hub of <span className="italic text-primary">Pure Luxury</span>
            </h1>
            <h2 className="font-display text-fog/60 font-light mb-6" style={{ fontSize: "clamp(20px, 3vw, 40px)" }}>
              Across the Island
            </h2>
            <p className="text-fog text-base max-w-[600px] mx-auto mb-10 leading-relaxed">
              From colonial bungalows in Nuwara Eliya to high-rise apartments in Colombo. PearlHub is your gateway to the finest assets in Sri Lanka.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="max-w-[700px] mx-auto bg-card rounded-xl p-1.5 pl-5 flex items-center gap-2 shadow-2xl mb-6">
              <span className="text-lg">🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="What are you looking for today?"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1 border-none outline-none text-base font-body bg-transparent text-foreground" />
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span className="text-sm">📍</span>
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                  className="border-none outline-none text-sm font-medium bg-transparent text-foreground cursor-pointer">
                  {locationOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <button onClick={handleSearch} className="bg-obsidian hover:bg-slate text-pearl px-7 py-3 rounded-lg text-base font-bold transition-all">Search Hub</button>
            </div>

            {/* Trending Tags */}
            <div className="flex justify-center gap-2 flex-wrap mb-12">
              {trendingTags.map(tag => (
                <button key={tag} onClick={() => { setSearchQuery(tag.replace("#", "")); handleSearch(); }}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold border border-white/15 text-fog/80 hover:text-pearl hover:border-white/30 transition-all uppercase tracking-wider">
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[700px] mx-auto">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-4 rounded-xl" style={{ background: "hsla(210 29% 17% / 0.6)", border: "1px solid hsla(30 33% 96% / 0.08)" }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display text-2xl font-bold text-pearl">{s.value}</div>
                <div className="text-[11px] text-fog uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-2">Explore Sri Lanka with Pearl Hub</h2>
            <p className="text-muted-foreground text-base">Four powerful platforms, one seamless experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryCards.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/${cat.id}`)}
                className="cursor-pointer bg-background rounded-2xl p-7 text-center transition-all hover:-translate-y-1 hover:shadow-xl border-2 border-transparent hover:border-primary/30 group">
                <div className="text-5xl mb-3">{cat.icon}</div>
                <h3 className={`text-xl mb-1 ${cat.colorClass.split(' ')[0]}`}>{cat.title}</h3>
                <div className="text-xs text-muted-foreground font-medium mb-2.5">{cat.subtitle}</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                <div className={`font-display text-2xl font-bold ${cat.colorClass.split(' ')[0]}`}>{cat.count}</div>
                <div className="text-[11px] text-muted-foreground">listings</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-7">
            <h2 className="text-3xl mb-2">Explore on the Map</h2>
            <p className="text-muted-foreground">Properties, stays, vehicles, and events — all on one interactive map</p>
          </div>
          <LeafletMap markers={allMarkers} center={[7.8731, 80.7718]} zoom={8} height="500px" />
          <div className="flex gap-4 justify-center mt-4 flex-wrap">
            {[["bg-emerald","Properties"],["bg-sapphire","Stays"],["bg-ruby","Vehicles"],["bg-primary","Events"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[13px]">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-2">Why Pearl Hub?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🛡️", title: "Verified Listings", desc: "All property owners provide NIC and deed documentation. Brokers require owner consent." },
              { icon: "💎", title: "Transparent Pricing", desc: "Clear commission structure with no hidden fees. Buyers get cashback on owner sales." },
              { icon: "🗺️", title: "Interactive Maps", desc: "Explore all listings on Leaflet-powered interactive maps with real-time data." },
              { icon: "🎫", title: "QR Ticket System", desc: "Tamper-proof QR-coded tickets for cinema, concerts, and sports events." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-5">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="text-base mb-1.5">{item.title}</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
