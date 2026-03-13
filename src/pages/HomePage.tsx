import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import LeafletMap from "@/components/LeafletMap";

const HomePage = () => {
  const { data } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: "🔍" },
    { id: "property", label: "Property", icon: "🏘️" },
    { id: "stays", label: "Stays", icon: "🏨" },
    { id: "vehicles", label: "Vehicles", icon: "🚗" },
    { id: "events", label: "Events", icon: "🎭" },
  ];

  const stats = [
    { value: "12,400+", label: "Properties" },
    { value: "3,200+", label: "Stays" },
    { value: "1,800+", label: "Vehicles" },
    { value: "500+", label: "Events" },
  ];

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
      <section className="bg-gradient-to-br from-obsidian via-slate to-sapphire py-20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.04] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-emerald/[0.06] pointer-events-none" />
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-1.5 bg-primary/15 text-gold-dark text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">🇱🇰 Sri Lanka's #1 Marketplace Platform</div>
            <h1 className="font-display text-pearl font-black leading-tight mb-4" style={{ fontSize: "clamp(36px, 6vw, 64px)" }}>
              Discover <span className="text-primary">Pearl Hub</span>
              <br />
              <span className="italic text-fog" style={{ fontSize: "0.75em" }}>Your Gateway to Sri Lanka</span>
            </h1>
            <p className="text-fog text-lg max-w-[600px] mx-auto mb-10 leading-relaxed">
              Find properties, book stays, rent vehicles, and discover events — all in one trusted platform connecting Sri Lanka.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="max-w-[700px] mx-auto bg-card rounded-xl p-1.5 pl-5 flex items-center gap-2 shadow-2xl mb-8">
              <span className="text-xl">🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search properties, stays, vehicles, events…"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1 border-none outline-none text-base font-body bg-transparent text-foreground" />
              <button onClick={handleSearch} className="bg-primary hover:bg-gold-light text-primary-foreground px-7 py-3 rounded-lg text-base font-bold transition-all">Search</button>
            </div>

            {/* Category Pills */}
            <div className="flex justify-center gap-2 flex-wrap mb-12">
              {categories.map(c => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-all border-none cursor-pointer ${
                    activeCategory === c.id ? "bg-primary text-primary-foreground" : "bg-white/10 text-pearl hover:bg-white/20"
                  }`}>{c.icon} {c.label}</button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center">
                <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-[13px] text-fog">{s.label}</div>
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
