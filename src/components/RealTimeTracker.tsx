import { useState, useEffect, useRef } from "react";
import LeafletMap from "@/components/LeafletMap";

interface TrackerProps {
  vehicleName: string;
  startLocation: { lat: number; lng: number; name: string };
  onClose: () => void;
}

const ROUTE_POINTS = [
  { lat: 6.9271, lng: 79.8612 },
  { lat: 6.9350, lng: 79.8580 },
  { lat: 6.9420, lng: 79.8530 },
  { lat: 6.9510, lng: 79.8470 },
  { lat: 6.9600, lng: 79.8400 },
  { lat: 6.9700, lng: 79.8350 },
  { lat: 6.9800, lng: 79.8280 },
  { lat: 6.9900, lng: 79.8200 },
  { lat: 7.0000, lng: 79.8150 },
  { lat: 7.0100, lng: 79.8100 },
];

const RealTimeTracker = ({ vehicleName, startLocation, onClose }: TrackerProps) => {
  const [position, setPosition] = useState(startLocation);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [tripTime, setTripTime] = useState(0);
  const [safetyStatus, setSafetyStatus] = useState<"safe" | "warning" | "danger">("safe");
  const [isMoving, setIsMoving] = useState(true);
  const routeIdx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMoving) return;
      setTripTime(prev => prev + 2);

      routeIdx.current = (routeIdx.current + 1) % ROUTE_POINTS.length;
      const next = ROUTE_POINTS[routeIdx.current];
      const jitterLat = (Math.random() - 0.5) * 0.002;
      const jitterLng = (Math.random() - 0.5) * 0.002;

      setPosition({ lat: next.lat + jitterLat, lng: next.lng + jitterLng, name: startLocation.name });

      const newSpeed = Math.floor(30 + Math.random() * 50);
      setSpeed(newSpeed);
      setHeading(Math.floor(Math.random() * 360));
      setTotalKm(prev => +(prev + newSpeed * (2 / 3600)).toFixed(1));

      if (newSpeed > 70) setSafetyStatus("warning");
      else if (newSpeed > 85) setSafetyStatus("danger");
      else setSafetyStatus("safe");
    }, 2000);

    return () => clearInterval(interval);
  }, [isMoving, startLocation.name]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const safetyColors = {
    safe: { bg: "bg-emerald/10", text: "text-emerald", border: "border-emerald/30", label: "Within Safe Zone" },
    warning: { bg: "bg-primary/10", text: "text-gold-dark", border: "border-primary/30", label: "Speed Advisory" },
    danger: { bg: "bg-ruby/10", text: "text-ruby", border: "border-ruby/30", label: "Speed Limit Exceeded" },
  };

  const safety = safetyColors[safetyStatus];

  return (
    <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl max-w-[900px] w-full max-h-[92vh] overflow-y-auto border border-border shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-ruby to-ruby/70 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
              <h2 className="text-pearl text-lg font-bold">🛰️ Live Tracking — {vehicleName}</h2>
            </div>
            <p className="text-pearl/70 text-xs mt-0.5">Real-time GPS telemetry • Updated every 2s</p>
          </div>
          <button onClick={onClose} className="bg-white/15 backdrop-blur-sm border-none text-pearl w-9 h-9 rounded-full cursor-pointer hover:bg-white/25 transition-all">✕</button>
        </div>

        {/* Telemetry cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3.5 text-center border border-border">
            <div className="text-2xl font-bold text-ruby">{speed}</div>
            <div className="text-[11px] text-muted-foreground">km/h Speed</div>
          </div>
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3.5 text-center border border-border">
            <div className="text-2xl font-bold text-emerald">{totalKm}</div>
            <div className="text-[11px] text-muted-foreground">km Traveled</div>
          </div>
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3.5 text-center border border-border">
            <div className="text-2xl font-bold text-sapphire">{heading}°</div>
            <div className="text-[11px] text-muted-foreground">Heading</div>
          </div>
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3.5 text-center border border-border">
            <div className="text-2xl font-bold text-primary">{formatTime(tripTime)}</div>
            <div className="text-[11px] text-muted-foreground">Trip Time</div>
          </div>
        </div>

        {/* Safety perimeter */}
        <div className={`mx-5 mb-4 p-3 rounded-lg border ${safety.bg} ${safety.border} flex items-center gap-3`}>
          <span className={`text-xl ${safetyStatus === "safe" ? "" : "animate-pulse"}`}>
            {safetyStatus === "safe" ? "🛡️" : safetyStatus === "warning" ? "⚠️" : "🚨"}
          </span>
          <div>
            <div className={`text-sm font-bold ${safety.text}`}>{safety.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {safetyStatus === "safe" ? "Vehicle within designated route and speed limit" : 
               safetyStatus === "warning" ? "Approaching speed limit — driver notified" : 
               "Speed exceeds 85 km/h — automatic alert sent"}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="px-5 pb-4">
          <LeafletMap
            markers={[{
              lat: position.lat,
              lng: position.lng,
              title: vehicleName,
              location: position.name,
              emoji: "🚗",
              type: "vehicle",
            }]}
            center={[position.lat, position.lng]}
            zoom={13}
            height="350px"
          />
        </div>

        {/* GPS coordinates */}
        <div className="px-5 pb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-4 text-xs text-muted-foreground font-mono">
            <span>LAT: {position.lat.toFixed(6)}</span>
            <span>LNG: {position.lng.toFixed(6)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsMoving(!isMoving)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isMoving ? "bg-ruby/10 text-ruby border border-ruby/30" : "bg-emerald/10 text-emerald border border-emerald/30"}`}>
              {isMoving ? "⏸ Pause Tracking" : "▶️ Resume Tracking"}
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-bold bg-background text-muted-foreground border border-border hover:bg-card transition-all">
              Close Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracker;
