import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LankaPayModal from "@/components/LankaPayModal";

interface RateItem {
  id: string;
  service_type: string;
  rate_name: string;
  rate_value: number;
  description: string;
}

const DEFAULT_RATES: Record<string, { rate_name: string; rate_value: number; description: string; service_type: string }[]> = {
  vehicle: [
    { rate_name: "daily_rate", rate_value: 6500, description: "Base daily rental rate (Rs.)", service_type: "vehicle" },
    { rate_name: "excess_km_rate", rate_value: 45, description: "Excess KM charge per km (Rs.)", service_type: "vehicle" },
    { rate_name: "driver_rate", rate_value: 3500, description: "Driver charge per day (Rs.)", service_type: "vehicle" },
    { rate_name: "km_limit", rate_value: 100, description: "Daily KM limit included", service_type: "vehicle" },
    { rate_name: "late_return_multiplier", rate_value: 1.5, description: "Late return rate multiplier", service_type: "vehicle" },
  ],
  stay: [
    { rate_name: "base_rate", rate_value: 15000, description: "Standard room rate per night (Rs.)", service_type: "stay" },
    { rate_name: "deluxe_multiplier", rate_value: 1.4, description: "Deluxe room price multiplier", service_type: "stay" },
    { rate_name: "suite_multiplier", rate_value: 2.2, description: "Suite room price multiplier", service_type: "stay" },
    { rate_name: "service_charge_pct", rate_value: 5, description: "Service charge percentage", service_type: "stay" },
    { rate_name: "tax_pct", rate_value: 10, description: "Tax percentage", service_type: "stay" },
  ],
  property: [
    { rate_name: "listing_fee", rate_value: 1000, description: "Owner listing fee (Rs.)", service_type: "property" },
    { rate_name: "sale_commission_pct", rate_value: 2, description: "Sale commission percentage", service_type: "property" },
    { rate_name: "wanted_ad_fee", rate_value: 8500, description: "Wanted ad listing fee (Rs.)", service_type: "property" },
  ],
  event: [
    { rate_name: "commission_pct", rate_value: 8.5, description: "Event ticket commission (%)", service_type: "event" },
    { rate_name: "entertainment_tax_pct", rate_value: 15, description: "Entertainment tax (%)", service_type: "event" },
  ],
};

const RateManagement = () => {
  const { user } = useAuth();
  const [activeService, setActiveService] = useState("vehicle");
  const [rates, setRates] = useState<Record<string, typeof DEFAULT_RATES.vehicle>>(DEFAULT_RATES);
  const [saving, setSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const serviceLabels: Record<string, { label: string; icon: string }> = {
    vehicle: { label: "Vehicle Rental", icon: "🚗" },
    stay: { label: "Stays & Hotels", icon: "🏨" },
    property: { label: "Property", icon: "🏠" },
    event: { label: "Events", icon: "🎫" },
  };

  const updateRate = (rateIndex: number, newValue: number) => {
    const updated = { ...rates };
    updated[activeService] = [...updated[activeService]];
    updated[activeService][rateIndex] = { ...updated[activeService][rateIndex], rate_value: newValue };
    setRates(updated);
  };

  const saveRates = async () => {
    if (!user) return;
    setSaving(true);
    
    // For demo, save to localStorage; in production would save to service_rates table
    try {
      for (const rate of rates[activeService]) {
        await supabase.from("service_rates").upsert({
          user_id: user.id,
          service_type: rate.service_type,
          rate_name: rate.rate_name,
          rate_value: rate.rate_value,
          description: rate.description,
        }, { onConflict: "user_id,service_type" }).select();
      }
    } catch {
      // Fallback to local storage
    }
    
    localStorage.setItem(`rates_${activeService}`, JSON.stringify(rates[activeService]));
    setSaving(false);
  };

  return (
    <div>
      <h2 className="text-2xl mb-2">Rate Management</h2>
      <p className="text-muted-foreground mb-6">Customize your service rates and charges. Changes apply to your listings only.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(serviceLabels).map(([key, { label, icon }]) => (
          <button key={key} onClick={() => setActiveService(key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all border ${
              activeService === key ? "bg-primary/10 text-gold-dark border-primary/30" : "bg-card text-muted-foreground border-border"
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-base font-bold flex items-center gap-2">
            {serviceLabels[activeService].icon} {serviceLabels[activeService].label} Rates
          </h3>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-4">
            {rates[activeService].map((rate, i) => (
              <div key={rate.rate_name} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{rate.description}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{rate.rate_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  {rate.rate_name.includes("pct") || rate.rate_name.includes("multiplier") ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step={rate.rate_name.includes("multiplier") ? "0.1" : "0.5"}
                        value={rate.rate_value}
                        onChange={e => updateRate(i, parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-md border border-input px-3 py-2 text-sm text-right font-bold"
                      />
                      <span className="text-sm text-muted-foreground">{rate.rate_name.includes("multiplier") ? "×" : "%"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">Rs.</span>
                      <input
                        type="number"
                        value={rate.rate_value}
                        onChange={e => updateRate(i, parseFloat(e.target.value) || 0)}
                        className="w-28 rounded-md border border-input px-3 py-2 text-sm text-right font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={saveRates} disabled={saving}
              className="bg-primary hover:bg-gold-light text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50">
              {saving ? "Saving..." : "💾 Save Rates"}
            </button>
            <button onClick={() => setRates({ ...rates, [activeService]: DEFAULT_RATES[activeService] })}
              className="px-6 py-2.5 rounded-lg font-bold text-sm border border-input bg-card hover:bg-background transition-all">
              ↩️ Reset to Default
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="text-sm font-bold mb-2">💳 Payment Processing</h4>
        <p className="text-xs text-muted-foreground">All charges are processed via LankaPay. Transaction fees are borne by the client. Rate changes take effect immediately for new bookings.</p>
      </div>

      <LankaPayModal open={showPayment} onClose={() => setShowPayment(false)} amount={0} description="" onSuccess={() => setShowPayment(false)} />
    </div>
  );
};

export default RateManagement;
