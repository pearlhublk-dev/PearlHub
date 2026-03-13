import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

const SearchResultsPage = () => {
  const { data } = useAppContext();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = (params.get("q") || "").toLowerCase();
  const category = params.get("category") || "all";

  const results = useMemo(() => {
    const items: { id: string; type: string; title: string; subtitle: string; price: number; priceLabel: string; image: string; location: string; link: string }[] = [];
    if (category === "all" || category === "property") {
      data.properties.forEach(p => {
        if (!query || p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query) || p.subtype.toLowerCase().includes(query))
          items.push({ id: p.id, type: "property", title: p.title, subtitle: `${p.beds} bed • ${p.baths} bath • ${p.area.toLocaleString()} sq.ft`, price: p.price, priceLabel: p.type === "rent" ? "/mo" : "", image: p.image, location: p.location, link: "/property" });
      });
    }
    if (category === "all" || category === "stays") {
      data.stays.forEach(s => {
        if (!query || s.name.toLowerCase().includes(query) || s.location.toLowerCase().includes(query) || s.type.toLowerCase().includes(query))
          items.push({ id: s.id, type: "stay", title: s.name, subtitle: `★ ${s.rating} • ${s.rooms} rooms`, price: s.pricePerNight, priceLabel: "/night", image: s.image, location: s.location, link: "/stays" });
      });
    }
    if (category === "all" || category === "vehicles") {
      data.vehicles.forEach(v => {
        if (!query || `${v.make} ${v.model}`.toLowerCase().includes(query) || v.location.toLowerCase().includes(query) || v.type.toLowerCase().includes(query))
          items.push({ id: v.id, type: "vehicle", title: `${v.make} ${v.model}`, subtitle: `${v.year} • ${v.seats} seats • ${v.fuel}`, price: v.price, priceLabel: `/${v.priceUnit}`, image: v.image, location: v.location, link: "/vehicles" });
      });
    }
    if (category === "all" || category === "events") {
      data.events.forEach(e => {
        if (!query || e.title.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query) || e.category.toLowerCase().includes(query))
          items.push({ id: e.id, type: "event", title: e.title, subtitle: `📅 ${e.date} • ⏰ ${e.time} • 🏛 ${e.venue}`, price: e.prices.standard, priceLabel: "", image: e.image, location: e.venue, link: "/events" });
      });
    }
    return items;
  }, [data, query, category]);

  const typeColors: Record<string, string> = { property: "bg-emerald/10 text-emerald", stay: "bg-sapphire/10 text-sapphire", vehicle: "bg-ruby/10 text-ruby", event: "bg-indigo/10 text-primary" };

  const categories = [
    { id: "all", label: "All", count: results.length },
    { id: "property", label: "Properties" },
    { id: "stays", label: "Stays" },
    { id: "vehicles", label: "Vehicles" },
    { id: "events", label: "Events" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-obsidian via-slate to-sapphire py-10">
        <div className="container">
          <h1 className="text-pearl text-3xl mb-4">Search Results</h1>
          <div className="max-w-[600px] bg-card rounded-xl p-1.5 pl-5 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <input defaultValue={params.get("q") || ""} placeholder="Search properties, stays, vehicles, events…"
              onKeyDown={e => { if (e.key === "Enter") navigate(`/search?q=${(e.target as HTMLInputElement).value}&category=${category}`); }}
              className="flex-1 border-none outline-none text-base bg-transparent text-foreground" />
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c.id} onClick={() => navigate(`/search?q=${query}&category=${c.id}`)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${category === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-input"}`}>
              {c.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground self-center">{results.length} result{results.length !== 1 ? "s" : ""} found</span>
        </div>
      </div>

      <div className="container py-8">
        {results.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-3">🔍</div>
            <h3>No results found</h3>
            <p className="mt-2">Try different keywords or browse categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(item.link)}
                className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-border">
                <div className="h-32 bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-center text-5xl relative">
                  {item.image}
                  <span className={`absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${typeColors[item.type]}`}>{item.type}</span>
                </div>
                <div className="p-4">
                  <div className="font-display text-base font-bold mb-1">{item.title}</div>
                  <div className="text-[13px] text-muted-foreground mb-1">📍 {item.location}</div>
                  <div className="text-xs text-muted-foreground mb-3">{item.subtitle}</div>
                  <div className="font-display text-lg font-bold text-primary">Rs. {item.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">{item.priceLabel}</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
