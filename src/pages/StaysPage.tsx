import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import LeafletMap from "@/components/LeafletMap";
import LankaPayModal from "@/components/LankaPayModal";
import InquiryModal from "@/components/InquiryModal";
import TrustBanner from "@/components/TrustBanner";
import ShareButtons from "@/components/ShareButtons";
import ReviewSection from "@/components/ReviewSection";
import ComparisonTool from "@/components/ComparisonTool";
import StayListingModal, { StayListing } from "@/components/StayListingModal";
import ReportButton from "@/components/ReportButton";
import { Stay } from "@/types/pearl-hub";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const isUrl = (s: string) => s.startsWith("http");

const StaysPage = () => {
  const { data, showToast, addRecentlyViewed, addToCompare, compareItems } = useAppContext();
  const { user } = useAuth();
  const [dbListings, setDbListings] = useState<StayListing[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [editListing, setEditListing] = useState<StayListing | null>(null);

  const fetchListings = useCallback(async () => {
    const { data: rows } = await supabase.from("stays_listings").select("*").eq("moderation_status", "approved").eq("active", true).order("created_at", { ascending: false });
    if (rows) setDbListings(rows as unknown as StayListing[]);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const deleteListing = async (id: string) => {
    await supabase.from("stays_listings").delete().eq("id", id);
    showToast("Listing deleted", "success");
    fetchListings();
  };

  // Merge DB listings into Stay[] format
  const dbAsStays: Stay[] = dbListings.map(l => ({
    id: l.id, type: l.type, stars: l.stars, name: l.title, location: l.location,
    lat: Number(l.lat), lng: Number(l.lng), pricePerNight: Number(l.price_per_night),
    rooms: l.rooms, rating: 0, image: l.images?.[0] || "🏨",
    amenities: l.amenities || [], approved: l.approved, description: l.description || "",
  }));
  const [filter, setFilter] = useState({ type: "all", maxPrice: "", location: "", minRating: "0", amenity: "" });
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [roomType, setRoomType] = useState("standard");
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const stayTypes = [{ id: "all", label: "All" }, { id: "star_hotel", label: "Star Hotels" }, { id: "villa", label: "Villas" }, { id: "guest_house", label: "Guest Houses" }, { id: "hostel", label: "Hostels" }, { id: "lodge", label: "Lodges" }];

  const allStays = [...dbAsStays, ...data.stays];

  const filtered = allStays.filter(s => {
    if (filter.type !== "all" && s.type !== filter.type) return false;
    if (filter.maxPrice && s.pricePerNight > parseInt(filter.maxPrice)) return false;
    if (filter.location && !s.location.toLowerCase().includes(filter.location.toLowerCase())) return false;
    if (s.rating < parseFloat(filter.minRating)) return false;
    if (filter.amenity && !s.amenities.some(a => a.toLowerCase().includes(filter.amenity.toLowerCase()))) return false;
    return true;
  });

  const mapMarkers = filtered.map(s => ({ lat: s.lat, lng: s.lng, title: s.name, location: s.location, price: s.pricePerNight, emoji: isUrl(s.image) ? "🏨" : s.image, type: "stay" as const, rating: s.rating }));

  const roomTypes: Record<string, { label: string; mult: number; desc: string }> = {
    standard: { label: "Standard", mult: 1, desc: "Comfortable room with essential amenities" },
    deluxe: { label: "Deluxe", mult: 1.4, desc: "Spacious room with premium furnishings" },
    suite: { label: "Suite", mult: 2.2, desc: "Separate living area with luxury touches" },
    penthouse: { label: "Penthouse", mult: 3.5, desc: "Top floor with panoramic views" }
  };
  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const roomRate = selectedStay ? selectedStay.pricePerNight * roomTypes[roomType].mult : 0;
  const subtotal = roomRate * nights;
  const taxRate = 0.1;
  const serviceCharge = subtotal * 0.05;
  const tax = subtotal * taxRate;
  const total = subtotal + tax + serviceCharge;

  const priceRanges = [
    { label: "Any Price", value: "" },
    { label: "Under Rs. 5,000", value: "5000" },
    { label: "Under Rs. 15,000", value: "15000" },
    { label: "Under Rs. 30,000", value: "30000" },
    { label: "Under Rs. 50,000", value: "50000" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-sapphire to-sapphire/70 py-10">
        <div className="container flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🏨 Stays & Accommodation</div>
            <h1 className="text-pearl text-3xl">Find Perfect Accommodation</h1>
            <p className="text-pearl/75 mt-1.5">Hotels • Villas • Guest Houses • Hostels • Sri Lanka Tourism Board Approved</p>
          </div>
          {user && (
            <button onClick={() => { setEditListing(null); setShowListModal(true); }}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-pearl px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-white/25 transition-all">
              <PlusCircle className="w-4 h-4" /> List a Stay
            </button>
          )}
        </div>
      </div>
      <TrustBanner stats={[
        { value: "3,180+", label: "Stays", icon: "🏨" },
        { value: "340+", label: "STB Approved", icon: "✓" },
        { value: "4.7★", label: "Avg Rating", icon: "⭐" },
        { value: "98%", label: "Happy Guests", icon: "😊" },
      ]} />

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 items-center flex-wrap">
          {stayTypes.map(t => (
            <button key={t.id} onClick={() => setFilter({...filter, type: t.id})}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter.type === t.id ? "bg-sapphire text-pearl border-sapphire" : "bg-transparent text-muted-foreground border-input"}`}>{t.label}</button>
          ))}
          <div className="ml-auto flex gap-2">
            <input value={filter.location} onChange={e => setFilter({...filter, location: e.target.value})} placeholder="📍 Location" className="rounded-md border border-input px-3 py-1.5 text-sm w-32" />
            <select value={filter.maxPrice} onChange={e => setFilter({...filter, maxPrice: e.target.value})} className="rounded-md border border-input px-2 py-1.5 text-sm bg-card">
              {priceRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={filter.minRating} onChange={e => setFilter({...filter, minRating: e.target.value})} className="rounded-md border border-input px-2 py-1.5 text-sm bg-card">
              <option value="0">Any Rating</option><option value="4">4+ Stars</option><option value="4.5">4.5+ Stars</option><option value="4.8">4.8+ Stars</option>
            </select>
            <button onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${viewMode === "map" ? "bg-sapphire text-pearl border-sapphire" : "bg-transparent text-muted-foreground border-input"}`}>
              {viewMode === "map" ? "⊞ Grid" : "🗺️ Map"}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {viewMode === "map" ? (
          <LeafletMap markers={mapMarkers} center={[7.8731, 80.7718]} zoom={8} height="500px" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((stay, i) => (
              <motion.div key={stay.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedStay(stay); setRoomType("standard"); setGuests(2); setSpecialRequests(""); setCheckInTime("14:00"); setCheckOutTime("11:00"); addRecentlyViewed({ id: stay.id, title: stay.name, type: "stay", price: stay.pricePerNight, image: stay.image, location: stay.location }); }}
                className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-border">
                <div className="h-40 relative overflow-hidden">
                  {isUrl(stay.image) ? (
                    <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sapphire/10 to-sapphire/[0.03] flex items-center justify-center text-6xl">{stay.image}</div>
                  )}
                  {stay.stars > 0 && <span className="absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-gold-dark">{stay.stars}⭐</span>}
                  <span className={`absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${dbListings.find(l => l.id === stay.id)?.active ? 'bg-emerald/10 text-emerald' : 'bg-ruby/10 text-ruby'}`}>
                    {dbListings.find(l => l.id === stay.id)?.active ? 'Active' : 'Inactive'}
                  </span>
                  {dbListings.find(l => l.id === stay.id)?.user_id && (
                    <div className="absolute bottom-10 left-2.5 flex flex-wrap gap-1">
                      {/* Placeholder for verification badges - would fetch from profiles */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-100 text-blue-800">SLTDA Verified</span>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); addToCompare({ id: stay.id, title: stay.name, itemType: "stay", location: stay.location, price: stay.pricePerNight, priceUnit: "/night", rating: stay.rating, subtype: stay.type, details: `${stay.rooms} rooms • ${stay.stars}⭐`, features: stay.amenities.slice(0,3).join(", ") }); showToast(compareItems.length >= 3 ? "Max 3 items" : "Added to compare", compareItems.length >= 3 ? "warning" : "success"); }}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-card/90 flex items-center justify-center text-sm cursor-pointer" title="Compare">📊</button>
                  {user && !dbListings.some(l => l.id === stay.id && l.user_id === user.id) && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <ReportButton listingId={stay.id} listingType="stay" reportedUserId={dbListings.find(l => l.id === stay.id)?.user_id} />
                    </div>
                  )}
                  {user && dbListings.some(l => l.id === stay.id && l.user_id === user.id) && (
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setEditListing(dbListings.find(l => l.id === stay.id)!); setShowListModal(true); }}
                        className="w-7 h-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={e => e.stopPropagation()}>
                          <AlertDialogHeader><AlertDialogTitle>Delete this listing?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteListing(stay.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-display text-base font-bold mb-1">{stay.name}</div>
                  <div className="text-[13px] text-muted-foreground mb-2">📍 {stay.location}</div>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {stay.amenities.slice(0, 3).map(a => <span key={a} className="inline-block px-2 py-0.5 bg-pearl-dark rounded text-[11px] font-medium text-muted-foreground">{a}</span>)}
                    {stay.amenities.length > 3 && <span className="inline-block px-2 py-0.5 bg-pearl-dark rounded text-[11px] font-medium text-muted-foreground">+{stay.amenities.length - 3}</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-muted-foreground">from </span>
                      <span className="font-display text-xl font-bold text-sapphire">Rs. {stay.pricePerNight.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                    <div className="flex items-center gap-1"><span className="text-primary">★</span><span className="font-bold text-sm">{stay.rating}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail/Booking Modal */}
      <AnimatePresence>
        {selectedStay && (
          <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5" onClick={() => setSelectedStay(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl max-w-[900px] w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                {isUrl(selectedStay.image) ? (
                  <img src={selectedStay.image} alt={selectedStay.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sapphire to-sapphire/70 flex items-center justify-center text-6xl">{selectedStay.image}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
                <div className="absolute bottom-4 left-7 right-7 flex justify-between items-end">
                  <div>
                    <h2 className="text-pearl text-xl mb-1">{selectedStay.name}</h2>
                    <p className="text-pearl/70 text-sm">📍 {selectedStay.location} • ★ {selectedStay.rating} • {selectedStay.rooms} rooms</p>
                  </div>
                  <button onClick={() => setSelectedStay(null)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer">✕</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">
                <div className="p-7 border-r border-border">
                  <ShareButtons title={selectedStay.name} description={`Rs. ${selectedStay.pricePerNight.toLocaleString()}/night – ${selectedStay.location}`} />
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 mt-3">{selectedStay.description}</p>
                  <div className="flex gap-2 flex-wrap mb-5">{selectedStay.amenities.map(a => <span key={a} className="inline-block px-2 py-0.5 bg-pearl-dark rounded text-[11px] font-medium text-muted-foreground">{a}</span>)}</div>

                  <h4 className="mb-3 text-sm font-bold">Room Types</h4>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {Object.entries(roomTypes).map(([key, room]) => (
                      <div key={key} onClick={() => setRoomType(key)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${roomType === key ? "border-sapphire bg-sapphire/5" : "border-border"}`}>
                        <div className="font-semibold text-[13px]">{room.label}</div>
                        <div className="text-[11px] text-muted-foreground mb-1">{room.desc}</div>
                        <div className="text-[13px] text-sapphire font-bold">Rs. {(selectedStay.pricePerNight * room.mult).toLocaleString()}/night</div>
                      </div>
                    ))}
                  </div>
                  <LeafletMap markers={[{ lat: selectedStay.lat, lng: selectedStay.lng, title: selectedStay.name, location: selectedStay.location, price: selectedStay.pricePerNight, emoji: isUrl(selectedStay.image) ? "🏨" : selectedStay.image, type: "stay" }]} center={[selectedStay.lat, selectedStay.lng]} zoom={14} height="200px" />
                  <ReviewSection listingId={selectedStay.id} listingType="stay" />
                </div>
                <div className="p-6">
                  <h4 className="mb-4 text-sm font-bold">Book Your Stay</h4>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Check-in Date</label>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full rounded-md border border-input px-3 py-2 text-sm" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Check-in Time</label>
                    <select value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card">
                      <option value="12:00">12:00 PM</option><option value="13:00">1:00 PM</option><option value="14:00">2:00 PM (Standard)</option><option value="15:00">3:00 PM</option><option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Check-out Date</label>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn} className="w-full rounded-md border border-input px-3 py-2 text-sm" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Check-out Time</label>
                    <select value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card">
                      <option value="10:00">10:00 AM</option><option value="11:00">11:00 AM (Standard)</option><option value="12:00">12:00 PM</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Guests</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-input bg-card text-lg">−</button>
                      <span className="text-lg font-bold w-8 text-center">{guests}</span>
                      <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-8 h-8 rounded-full border border-input bg-card text-lg">+</button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Special Requests</label>
                    <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} placeholder="Early check-in, extra pillows…" className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" />
                  </div>
                  {nights > 0 && (
                    <div className="bg-background rounded-lg p-4 mb-4">
                      <div className="text-[13px] text-muted-foreground mb-2">Price Breakdown</div>
                      <div className="flex justify-between text-[13px] mb-1"><span>Check-in: {checkInTime}</span><span>Check-out: {checkOutTime}</span></div>
                      <div className="flex justify-between text-[13px] mb-1.5"><span>Rs. {roomRate.toLocaleString()} × {nights} nights</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Service Charge (5%)</span><span>Rs. {Math.round(serviceCharge).toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Taxes (10%)</span><span>Rs. {Math.round(tax).toLocaleString()}</span></div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-sapphire">Rs. {Math.round(total).toLocaleString()}</span></div>
                    </div>
                  )}
                  <button onClick={() => {
                    if (!checkIn || !checkOut) { showToast("Please select dates.", "error"); return; }
                    setShowPayment(true);
                  }}
                    className="w-full bg-sapphire hover:bg-sapphire-light text-pearl py-3 rounded-lg font-bold transition-all text-center mb-2">💳 Book & Pay via LankaPay</button>
                  <button onClick={() => setShowInquiry(true)}
                    className="w-full border border-sapphire text-sapphire py-2.5 rounded-lg font-bold transition-all text-center hover:bg-sapphire/5">📩 Enquire First</button>
                  <p className="text-[11px] text-muted-foreground text-center mt-2">Free cancellation up to 48 hours before check-in</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LankaPayModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        amount={Math.round(total)}
        description={`Stay at ${selectedStay?.name || ""} – ${nights} nights`}
        onSuccess={() => { showToast("🏨 Booking confirmed! Confirmation sent to your email.", "success"); setSelectedStay(null); setShowPayment(false); }}
      />

      {selectedStay && (
        <InquiryModal
          open={showInquiry}
          onClose={() => setShowInquiry(false)}
          listingId={selectedStay.id}
          listingType="stay"
          listingTitle={selectedStay.name}
        />
      )}

      <ComparisonTool />

      <StayListingModal
        open={showListModal}
        onClose={() => { setShowListModal(false); setEditListing(null); }}
        onSuccess={() => { fetchListings(); showToast(editListing ? "Stay updated!" : "Stay published!", "success"); }}
        editData={editListing}
      />
    </div>
  );
};

export default StaysPage;
