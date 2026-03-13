import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const ComparisonTool = () => {
  const { compareItems, removeFromCompare, clearCompare } = useAppContext();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary shadow-2xl z-[900] p-4">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold">📊 Compare ({compareItems.length}/3)</h4>
            <button onClick={clearCompare} className="text-xs text-muted-foreground hover:text-foreground">Clear All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left text-xs text-muted-foreground w-28">Metric</th>
                  {compareItems.map(item => (
                    <th key={item.id} className="p-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate max-w-[150px]">{item.title}</span>
                        <button onClick={() => removeFromCompare(item.id)} className="text-muted-foreground hover:text-ruby text-xs">✕</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "location", label: "📍 Location" },
                  { key: "price", label: "💰 Price" },
                  { key: "rating", label: "⭐ Rating" },
                  { key: "type", label: "🏷️ Type" },
                  { key: "extra1", label: "📐 Details" },
                  { key: "extra2", label: "✨ Features" },
                ].map(row => (
                  <tr key={row.key} className="border-b border-border">
                    <td className="p-2 text-xs text-muted-foreground font-semibold">{row.label}</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-2 text-xs">
                        {row.key === "location" && item.location}
                        {row.key === "price" && (item.price ? `Rs. ${item.price.toLocaleString()}${item.priceUnit || ""}` : "—")}
                        {row.key === "rating" && (item.rating ? `★ ${item.rating}` : "—")}
                        {row.key === "type" && (item.subtype || item.itemType)}
                        {row.key === "extra1" && (item.details || "—")}
                        {row.key === "extra2" && (item.features || "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonTool;
