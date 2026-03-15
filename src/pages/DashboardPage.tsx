import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import RateManagement from "@/components/RateManagement";
import LankaPayModal from "@/components/LankaPayModal";
import ImageUpload from "@/components/ImageUpload";

const DashboardPage = () => {
  const { data, currentUser, showToast } = useAppContext();
  const { user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const mockUser = data.users[currentUser];
  const displayName = profile?.full_name || mockUser.name;
  const displayEmail = profile?.email || mockUser.email;

  const roleColorMap: Record<string, string> = { customer: "bg-emerald", owner: "bg-sapphire", broker: "bg-primary", admin: "bg-ruby", stay_provider: "bg-teal", event_organizer: "bg-indigo", sme: "bg-primary" };
  const roleColor = roleColorMap[currentUser] || "bg-primary";

  const [showPayment, setShowPayment] = useState(false);
  const [paymentCtx, setPaymentCtx] = useState({ amount: 0, description: "", onSuccess: () => {} });

  const navItems: Record<string, { id: string; label: string; icon: string }[]> = {
    customer: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "bookings", label: "My Bookings", icon: "📅" },
      { id: "promo", label: "Promo Codes", icon: "🎁" },
      { id: "compliance", label: "Compliance", icon: "📋" },
      { id: "profile", label: "My Profile", icon: "👤" },
    ],
    owner: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "listings", label: "My Listings", icon: "🏠" },
      { id: "enquiries", label: "Enquiries", icon: "📩" },
      { id: "analytics", label: "Analytics", icon: "📈" },
      { id: "rates", label: "Rate Management", icon: "⚙️" },
      { id: "pricing", label: "Fees & Pricing", icon: "💳" },
      { id: "promos", label: "Promo Codes", icon: "🎁" },
      { id: "revenue", label: "Revenue", icon: "💰" },
      { id: "terms", label: "Terms & Conditions", icon: "📄" },
      { id: "compliance", label: "Compliance", icon: "📋" },
      { id: "profile", label: "Profile", icon: "👤" },
    ],
    broker: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "listings", label: "Listings (38/65)", icon: "🏢" },
      { id: "enquiries", label: "Enquiries", icon: "📩" },
      { id: "analytics", label: "Analytics", icon: "📈" },
      { id: "rates", label: "Rate Management", icon: "⚙️" },
      { id: "pricing", label: "Fees & Pricing", icon: "💳" },
      { id: "membership", label: "Membership", icon: "👑" },
      { id: "revenue", label: "Revenue", icon: "💰" },
      { id: "terms", label: "Terms & Conditions", icon: "📄" },
      { id: "compliance", label: "Compliance", icon: "📋" },
      { id: "profile", label: "Profile", icon: "👤" },
    ],
    admin: [
      { id: "overview", label: "Dashboard", icon: "📊" },
      { id: "analytics", label: "Analytics", icon: "📈" },
      { id: "rates", label: "Platform Rates", icon: "⚙️" },
      { id: "users", label: "Users", icon: "👥" },
      { id: "all_listings", label: "All Listings", icon: "🏘️" },
      { id: "transactions", label: "Transactions", icon: "💳" },
      { id: "commissions", label: "Commissions", icon: "💹" },
      { id: "settings", label: "Settings", icon: "⚙️" },
    ],
    stay_provider: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "listings", label: "My Stays", icon: "🏨" },
      { id: "enquiries", label: "Enquiries", icon: "📩" },
      { id: "analytics", label: "Analytics", icon: "📈" },
      { id: "rates", label: "Rate Management", icon: "⚙️" },
      { id: "pricing", label: "Fees & Pricing", icon: "💳" },
      { id: "revenue", label: "Revenue", icon: "💰" },
      { id: "profile", label: "Profile", icon: "👤" },
    ],
    event_organizer: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "listings", label: "My Events", icon: "🎭" },
      { id: "enquiries", label: "Enquiries", icon: "📩" },
      { id: "analytics", label: "Analytics", icon: "📈" },
      { id: "rates", label: "Rate Management", icon: "⚙️" },
      { id: "pricing", label: "Fees & Pricing", icon: "💳" },
      { id: "revenue", label: "Revenue", icon: "💰" },
      { id: "profile", label: "Profile", icon: "👤" },
    ],
    sme: [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "listings", label: "My Listings", icon: "🏪" },
      { id: "enquiries", label: "Enquiries", icon: "📩" },
      { id: "profile", label: "Profile", icon: "👤" },
    ],
  };

  const mockBookings = [
    { id: "B001", type: "stay", item: "Shangri-La Colombo", dates: "Feb 14-18, 2024", amount: 180000, status: "completed", checkIn: "2:00 PM", checkOut: "11:00 AM" },
    { id: "B002", type: "vehicle", item: "Toyota Prius – 3 days", dates: "Jan 28-31, 2024", amount: 19500, status: "completed", pickupTime: "9:00 AM", returnTime: "9:00 AM" },
    { id: "B003", type: "event", item: "Bathiya & Santhush – 2 tickets", dates: "Mar 22, 2024", amount: 5000, status: "upcoming", gateTime: "6:00 PM" },
  ];

  const typeIcons: Record<string, string> = { stay: "🏨", vehicle: "🚗", event: "🎫", property: "🏠" };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-60 bg-card border-r border-border p-4 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-auto hidden md:block">
        <div className={`p-4 rounded-lg mb-5 ${roleColor}/10 border border-current/20`} style={{ borderColor: "hsl(var(--border))" }}>
          <div className={`w-12 h-12 rounded-full ${roleColor} flex items-center justify-center text-xl mb-2.5`}>
            {currentUser === "admin" ? "👑" : currentUser === "broker" ? "🏢" : currentUser === "owner" ? "🏠" : "👤"}
          </div>
          <div className="font-bold text-sm">{displayName}</div>
          <div className="text-xs text-muted-foreground">{displayEmail}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold mt-1.5 ${roleColor}/10 capitalize`}>
            {currentUser}{user ? " ✓" : ""}
          </span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {(navItems[currentUser] || navItems.customer).map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all ${
                activeSection === item.id ? "bg-primary/10 text-gold-dark font-semibold" : "text-muted-foreground hover:bg-background"
              }`}>{item.icon} {item.label}</button>
          ))}
        </nav>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex overflow-x-auto z-50 px-2 py-1">
        {(navItems[currentUser] || navItems.customer).map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            className={`flex-1 min-w-[60px] flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              activeSection === item.id ? "text-primary" : "text-muted-foreground"
            }`}>{item.icon}<span>{item.label}</span></button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 pb-20 md:pb-8">
        {activeSection === "overview" && (
          <div>
            <h2 className="text-2xl mb-6">Welcome, {displayName} 👋</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {currentUser === "customer" ? (
                <>
                  <StatCard icon="📅" label="Total Bookings" value={String(mockUser.bookings || 0)} color="text-sapphire" />
                  <StatCard icon="💰" label="Total Spent" value={`Rs. ${(mockUser.spent || 0).toLocaleString()}`} color="text-primary" />
                  <StatCard icon="❤️" label="Saved Properties" value="3" color="text-ruby" />
                  <StatCard icon="🎫" label="Upcoming Events" value="1" color="text-indigo" />
                </>
              ) : currentUser === "admin" ? (
                <>
                  <StatCard icon="👥" label="Total Users" value="4,280" color="text-sapphire" />
                  <StatCard icon="🏠" label="Total Listings" value="12,400" color="text-emerald" />
                  <StatCard icon="💰" label="Platform Revenue" value="Rs. 3.9M" color="text-primary" />
                  <StatCard icon="📈" label="Monthly Growth" value="+18%" color="text-emerald" />
                </>
              ) : (
                <>
                  <StatCard icon="🏠" label="Active Listings" value={String(mockUser.listings || 0)} color="text-sapphire" />
                  <StatCard icon="💰" label="Revenue" value={`Rs. ${(mockUser.revenue || 0).toLocaleString()}`} color="text-primary" />
                  <StatCard icon="👁" label="Total Views" value="1,245" color="text-emerald" />
                  <StatCard icon="📩" label="Enquiries" value="23" color="text-ruby" />
                </>
              )}
            </div>

            {currentUser === "admin" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="text-base mb-4">Revenue Breakdown</h3>
                  {[
                    { label: "Property Listing Fees", amount: 1245000, pct: 32 },
                    { label: "Broker Memberships", amount: 1242000, pct: 31 },
                    { label: "Stay Commissions (8.5%)", amount: 892000, pct: 23 },
                    { label: "Vehicle Listings", amount: 312000, pct: 8 },
                    { label: "Event Commissions", amount: 234000, pct: 6 },
                  ].map(item => (
                    <div key={item.label} className="mb-3">
                      <div className="flex justify-between text-[13px] mb-1"><span>{item.label}</span><strong>Rs. {item.amount.toLocaleString()}</strong></div>
                      <div className="h-1.5 bg-pearl-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-gold-light rounded-full transition-all" style={{ width: `${item.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="text-base mb-4">Recent Transactions</h3>
                  {data.transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div><div className="text-[13px] font-semibold">{t.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div><div className="text-[11px] text-muted-foreground">{t.user} • {t.date}</div></div>
                      <div className="text-right"><div className="font-bold text-emerald">Rs. {t.amount.toLocaleString()}</div><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "completed" ? "bg-emerald/10 text-emerald" : "bg-primary/15 text-gold-dark"}`}>{t.status}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "analytics" && currentUser !== "customer" && <AnalyticsDashboard />}

        {activeSection === "enquiries" && (currentUser === "owner" || currentUser === "broker" || currentUser === "stay_provider" || currentUser === "event_organizer" || currentUser === "sme") && (
          <EnquiriesSection userId={user?.id} />
        )}

        {/* Rate Management - for owner/broker/admin */}
        {activeSection === "rates" && currentUser !== "customer" && <RateManagement />}

        {/* Pricing / Fees section */}
        {activeSection === "pricing" && (currentUser === "owner" || currentUser === "broker") && (
          <div>
            <h2 className="text-2xl mb-2">Fees & Pricing</h2>
            <p className="text-muted-foreground mb-6">Your applicable rates and commission structure.</p>
            <div className="flex flex-col gap-3">
              {currentUser === "owner" ? (
                <>
                  <FeeCard icon="🏠" category="Property Listing Fee" rate="Rs. 1,000 flat" basis="Per listing submission" />
                  <FeeCard icon="💰" category="Sale Commission" rate="2.0%" basis="Of final sale price, via promo code system" />
                  <FeeCard icon="🎁" category="Buyer Discount" rate="0.5%" basis="Cashback to buyer on promo redemption (owner-listed only, funded by Pearl Hub)" />
                  <FeeCard icon="🔍" category="Wanted Ad Listing" rate="Rs. 8,500 flat" basis="Per wanted property ad, valid 30 days" />
                </>
              ) : (
                <>
                  <FeeCard icon="🏢" category="Broker Membership" rate="Rs. 23,000/month" basis="65 listings/month, no sale commission" />
                  <FeeCard icon="🔍" category="Wanted Ad Listing" rate="Rs. 8,500 flat" basis="Per wanted property ad, valid 30 days" />
                </>
              )}
              <FeeCard icon="🏨" category="Stays Commission" rate="8.5% flat" basis="Per booking total (excl. taxes)" />
              <FeeCard icon="🚗" category="Vehicle Listing" rate="Rs. 6,500/vehicle" basis="Per vehicle per month" />
              <FeeCard icon="🎫" category="Event Tickets" rate="8.5%" basis="Per ticket sold" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">💳 All payments processed via LankaPay. Charges are borne by the client.</p>
          </div>
        )}

        {/* Terms section for owner/broker */}
        {activeSection === "terms" && (currentUser === "owner" || currentUser === "broker") && (
          <div className="max-w-3xl">
            <h2 className="text-2xl mb-2">Terms & Conditions</h2>
            <p className="text-muted-foreground mb-6">Applicable terms for your account type.</p>
            <div className="bg-card rounded-xl p-6 border border-border space-y-4 text-sm text-muted-foreground leading-relaxed">
              {currentUser === "owner" ? (
                <>
                  <h3 className="text-foreground font-bold text-base">Property Owner Terms</h3>
                  <p><strong className="text-foreground">1. Listing Fee:</strong> Rs. 1,000 flat fee per property listing, non-refundable.</p>
                  <p><strong className="text-foreground">2. Sale Commission:</strong> 2.0% of final sale price, payable upon completed transaction.</p>
                  <p><strong className="text-foreground">3. Buyer Discount:</strong> 0.5% cashback to buyer on promo code redemption. This applies only to owner-listed properties.</p>
                  <p><strong className="text-foreground">4. Wanted Ads:</strong> Rs. 8,500 flat fee, valid for 30 days from posting date.</p>
                  <p><strong className="text-foreground">5. Verification:</strong> Owners must provide valid NIC and property deed documentation.</p>
                  <p><strong className="text-foreground">6. Stays Commission:</strong> 8.5% flat commission on booking total (excluding government taxes).</p>
                  <p><strong className="text-foreground">7. Payment:</strong> All fees processed via LankaPay. Transaction charges borne by client.</p>
                </>
              ) : (
                <>
                  <h3 className="text-foreground font-bold text-base">Broker Membership Terms</h3>
                  <p><strong className="text-foreground">1. Membership Fee:</strong> Rs. 23,000/month for up to 65 property listings.</p>
                  <p><strong className="text-foreground">2. No Sale Commission:</strong> Brokers are exempt from sale commission on properties sold through the platform.</p>
                  <p><strong className="text-foreground">3. Buyer Discount:</strong> NOT applicable on broker-listed properties. Only owner-listed properties qualify for buyer cashback.</p>
                  <p><strong className="text-foreground">4. Wanted Ads:</strong> Rs. 8,500 flat fee, valid for 30 days from posting date.</p>
                  <p><strong className="text-foreground">5. Listing Limit:</strong> Maximum 65 active listings per billing period. Additional listings require upgrade.</p>
                  <p><strong className="text-foreground">6. Owner Consent:</strong> All broker listings must have documented owner consent.</p>
                  <p><strong className="text-foreground">7. Payment:</strong> All fees processed via LankaPay. Transaction charges borne by client.</p>
                </>
              )}
            </div>
          </div>
        )}

        {activeSection === "bookings" && (
          <div>
            <h2 className="text-2xl mb-6">My Bookings</h2>
            <div className="flex flex-col gap-3">
              {mockBookings.map(b => (
                <div key={b.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-2xl flex-shrink-0">{typeIcons[b.type]}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{b.item}</div>
                    <div className="text-[13px] text-muted-foreground">📅 {b.dates}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {b.type === "stay" && `🕐 Check-in: ${b.checkIn} | Check-out: ${b.checkOut}`}
                      {b.type === "vehicle" && `🕐 Pickup: ${b.pickupTime} | Return: ${b.returnTime}`}
                      {b.type === "event" && `🚪 Gate: ${b.gateTime}`}
                    </div>
                  </div>
                  <div className="text-right"><div className="font-bold">Rs. {b.amount.toLocaleString()}</div><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === "completed" ? "bg-emerald/10 text-emerald" : "bg-sapphire/10 text-sapphire"}`}>{b.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "listings" && (
          <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl">My Listings</h2><button onClick={() => showToast("Opening listing form…", "info")} className="bg-primary hover:bg-gold-light text-primary-foreground px-5 py-2.5 rounded-lg font-bold text-sm">➕ Add New</button></div>
            <div className="bg-card rounded-xl overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border"><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Property</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Type</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Price</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Views</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Status</th></tr></thead>
                  <tbody>
                    {data.properties.filter(p => currentUser === "admin" ? true : p.owner === currentUser).map(p => (
                      <tr key={p.id} className="border-b border-border hover:bg-background">
                        <td className="p-3"><div className="flex items-center gap-2.5"><span className="text-2xl">{p.image}</span><div><div className="font-semibold">{p.title}</div><div className="text-xs text-muted-foreground">📍 {p.location}</div></div></div></td>
                        <td className="p-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${p.type === "sale" ? "bg-emerald/10 text-emerald" : p.type === "rent" ? "bg-sapphire/10 text-sapphire" : "bg-primary/15 text-gold-dark"}`}>{p.type}</span></td>
                        <td className="p-3 font-bold">Rs. {p.price.toLocaleString()}</td>
                        <td className="p-3">👁 {p.views}</td>
                        <td className="p-3"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald inline-block" /><span>Active</span></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "transactions" && (
          <div>
            <h2 className="text-2xl mb-6">All Transactions</h2>
            <div className="bg-card rounded-xl overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border"><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">ID</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Type</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">User</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Amount</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Date</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Status</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Gateway</th></tr></thead>
                  <tbody>
                    {data.transactions.map(t => (
                      <tr key={t.id} className="border-b border-border hover:bg-background">
                        <td className="p-3 font-mono text-xs">{t.id}</td>
                        <td className="p-3">{t.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td className="p-3">{t.user}</td>
                        <td className="p-3 font-bold text-emerald">Rs. {t.amount.toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">{t.date}</td>
                        <td className="p-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "completed" ? "bg-emerald/10 text-emerald" : "bg-primary/15 text-gold-dark"}`}>{t.status}</span></td>
                        <td className="p-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sapphire/10 text-sapphire">LankaPay</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div>
            <h2 className="text-2xl mb-6">User Management</h2>
            <div className="bg-card rounded-xl overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border"><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">User</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Role</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Contact</th><th className="p-3 text-left text-xs uppercase text-muted-foreground font-semibold">Status</th></tr></thead>
                  <tbody>
                    {Object.values(data.users).map(u => (
                      <tr key={u.id} className="border-b border-border hover:bg-background">
                        <td className="p-3"><div className="font-semibold">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                        <td className="p-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${u.role === "admin" ? "bg-ruby/10 text-ruby" : u.role === "broker" ? "bg-primary/15 text-gold-dark" : u.role === "owner" ? "bg-sapphire/10 text-sapphire" : "bg-emerald/10 text-emerald"}`}>{u.role}</span></td>
                        <td className="p-3 text-[13px]">{u.phone || "—"}</td>
                        <td className="p-3"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald inline-block" />Active{u.verified && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald/10 text-emerald">✓</span>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "commissions" && (
          <div>
            <h2 className="text-2xl mb-2">Commission Structure</h2>
            <p className="text-muted-foreground mb-6">Pearl Hub's complete fee model across all service categories.</p>
            <div className="flex flex-col gap-2.5">
              {[
                { category: "Property – Owner Listing Fee", rate: "Rs. 1,000 flat", basis: "Per listing submission", icon: "🏠" },
                { category: "Property – Sale Commission", rate: "2.0%", basis: "Final sale price, via promo code system", icon: "💰" },
                { category: "Buyer Discount (Pearl Hub funded)", rate: "0.5%", basis: "Cashback to buyer on promo redemption (owner-listed only)", icon: "🎁" },
                { category: "Broker Membership", rate: "Rs. 23,000/month", basis: "65 listings/month, no sale commission", icon: "🏢" },
                { category: "Wanted Property Listing", rate: "Rs. 8,500 flat", basis: "Per wanted ad, valid 30 days", icon: "🔍" },
                { category: "Stays – All Types", rate: "8.5% flat", basis: "Per booking total (excl. taxes)", icon: "🏨" },
                { category: "Vehicle Listing", rate: "Rs. 6,500/vehicle", basis: "Per vehicle per month", icon: "🚗" },
                { category: "Event Tickets", rate: "8.5%", basis: "Per ticket sold", icon: "🎫" },
              ].map(cr => (
                <div key={cr.category} className="bg-card rounded-lg p-4 border border-border flex items-center gap-4">
                  <span className="text-3xl flex-shrink-0">{cr.icon}</span>
                  <div className="flex-1"><div className="font-bold text-sm">{cr.category}</div><div className="text-[13px] text-muted-foreground mt-0.5">{cr.basis}</div></div>
                  <div className="bg-background rounded-lg px-4 py-2.5 text-center flex-shrink-0"><div className="font-display text-lg font-bold text-primary">{cr.rate}</div></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">💳 All payments processed via LankaPay. Charges borne by client.</p>
          </div>
        )}

        {(activeSection === "membership") && (
          <div>
            <h2 className="text-2xl mb-2">Broker Membership</h2>
            <p className="text-muted-foreground mb-6">Rs. 23,000/month — 65 property listings</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard icon="👑" label="Status" value="Active ✓" color="text-emerald" />
              <StatCard icon="📅" label="Days Remaining" value="27" color="text-primary" />
              <StatCard icon="🏢" label="Listings Used" value="38 / 65" color="text-sapphire" />
            </div>
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="text-base mb-4">Listing Usage</h3>
              <div className="flex justify-between text-[13px] mb-1.5"><span>Monthly Listings Used</span><strong>38 / 65</strong></div>
              <div className="h-2.5 bg-pearl-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald to-primary rounded-full" style={{ width: "58%" }} /></div>
              <p className="text-[13px] text-muted-foreground mt-2.5">27 listings remaining this month.</p>
            </div>
            <button onClick={() => { setPaymentCtx({ amount: 23000, description: "Broker Monthly Membership Renewal", onSuccess: () => { showToast("Membership renewed!", "success"); setShowPayment(false); } }); setShowPayment(true); }}
              className="mt-4 bg-primary hover:bg-gold-light text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
              💳 Renew Membership – Rs. 23,000
            </button>
          </div>
        )}

        {(activeSection === "profile") && (
          <div className="max-w-lg">
            <h2 className="text-2xl mb-6">My Profile</h2>
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex justify-center mb-5">
                <ImageUpload
                  bucket="avatars"
                  maxFiles={1}
                  circular
                  existingUrls={profile?.avatar_url ? [profile.avatar_url] : []}
                  onUpload={async (urls) => {
                    if (urls.length > 0 && user) {
                      await supabase.from("profiles").update({ avatar_url: urls[0] }).eq("id", user.id);
                      showToast("Avatar updated!", "success");
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-semibold mb-1">Full Name</label><input defaultValue={displayName} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Email</label><input defaultValue={displayEmail} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-semibold mb-1">Phone</label><input defaultValue={profile?.phone || mockUser.phone || ""} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Account Type</label><input defaultValue={currentUser} disabled className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background capitalize" /></div>
              </div>
              <button onClick={() => showToast("Profile updated!", "success")} className="bg-primary hover:bg-gold-light text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm transition-all">Save Changes</button>
            </div>
          </div>
        )}

        {(activeSection === "promo" || activeSection === "promos") && (
          <div className="max-w-lg">
            <h2 className="text-2xl mb-2">{currentUser === "customer" ? "Redeem Promo Code" : "Generate Promo Code"}</h2>
            <p className="text-muted-foreground mb-6">{currentUser === "customer" ? "Enter your promo code from the seller to get 0.5% cashback (owner-listed properties only)." : "Generate a promo code for your buyer (0.5% buyer discount, funded by Pearl Hub)."}</p>
            <div className="bg-card rounded-xl p-6 border border-border">
              {currentUser === "customer" ? (
                <>
                  <div className="mb-4"><label className="block text-xs font-semibold mb-1">Promo Code</label><input placeholder="e.g. PH-P001-AX7K2M" className="w-full rounded-md border border-input px-3 py-2 text-sm font-mono" /></div>
                  <div className="mb-4"><label className="block text-xs font-semibold mb-1">Final Sale Price (Rs.)</label><input type="number" placeholder="e.g. 85000000" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 text-xs text-muted-foreground">
                    ℹ️ Buyer discount (0.5%) is only available for owner-listed properties, not broker listings.
                  </div>
                  <button onClick={() => showToast("Promo code validated! Cashback will be processed.", "success")} className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-3 rounded-lg font-bold transition-all">🎁 Redeem</button>
                </>
              ) : (
                <>
                  <div className="bg-background rounded-lg p-5 text-center mb-4">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Generated Promo Code</div>
                    <div className="font-mono text-2xl font-bold text-primary tracking-widest">PH-P001-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground mt-2">Valid 30 days • Single use • Owner-listed only</div>
                  </div>
                  <button onClick={() => showToast("Promo code copied!", "success")} className="w-full bg-primary hover:bg-gold-light text-primary-foreground py-3 rounded-lg font-bold transition-all">📋 Copy Code</button>
                </>
              )}
            </div>
          </div>
        )}

        {(activeSection === "revenue") && (
          <div>
            <h2 className="text-2xl mb-6">Revenue</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard icon="💰" label="Total Revenue" value={`Rs. ${(mockUser.revenue || 0).toLocaleString()}`} color="text-primary" />
              <StatCard icon="📈" label="This Month" value="Rs. 125,000" color="text-emerald" />
              <StatCard icon="📊" label="Pending" value="Rs. 45,000" color="text-ruby" />
            </div>
          </div>
        )}

        {activeSection === "settings" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl mb-6">Platform Settings</h2>
            <div className="flex flex-col gap-4">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="text-base mb-3">General Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold mb-1">Platform Name</label><input defaultValue="Pearl Hub" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Support Email</label><input defaultValue="support@pearlhub.lk" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="text-base mb-3">Commission Rates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold mb-1">Stay Commission (%)</label><input defaultValue="8.5" type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Event Commission (%)</label><input defaultValue="8.5" type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Sale Commission (%)</label><input defaultValue="2" type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Buyer Discount (%)</label><input defaultValue="0.5" type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="text-base mb-3">Payment Gateway</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold mb-1">Provider</label><input defaultValue="LankaPay" disabled className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background" /></div>
                  <div><label className="block text-xs font-semibold mb-1">Fee Bearer</label><input defaultValue="Client" disabled className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background" /></div>
                </div>
              </div>
              <button onClick={() => showToast("Settings saved!", "success")} className="bg-primary hover:bg-gold-light text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm self-start transition-all">Save Settings</button>
            </div>
          </div>
        )}

        {activeSection === "all_listings" && (
          <div>
            <h2 className="text-2xl mb-6">All Platform Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.properties.map(p => (
                <div key={p.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{p.image}</span><div><div className="font-bold text-sm">{p.title}</div><div className="text-xs text-muted-foreground">📍 {p.location}</div></div></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald text-sm">Rs. {p.price.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">👁 {p.views}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/10 text-emerald">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LankaPayModal open={showPayment} onClose={() => setShowPayment(false)} amount={paymentCtx.amount} description={paymentCtx.description} onSuccess={paymentCtx.onSuccess} />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <div className="bg-card rounded-xl p-5 border border-border text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-[13px] text-muted-foreground">{label}</div>
  </div>
);

const FeeCard = ({ icon, category, rate, basis }: { icon: string; category: string; rate: string; basis: string }) => (
  <div className="bg-card rounded-lg p-4 border border-border flex items-center gap-4">
    <span className="text-3xl flex-shrink-0">{icon}</span>
    <div className="flex-1"><div className="font-bold text-sm">{category}</div><div className="text-[13px] text-muted-foreground mt-0.5">{basis}</div></div>
    <div className="bg-background rounded-lg px-4 py-2.5 text-center flex-shrink-0"><div className="font-display text-lg font-bold text-primary">{rate}</div></div>
  </div>
);

const EnquiriesSection = ({ userId }: { userId?: string }) => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const fetchEnquiries = async () => {
      const { data } = await supabase.from("inquiries").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
      setEnquiries(data || []);
      setLoading(false);
    };
    fetchEnquiries();
  }, [userId]);

  const markRead = async (id: string) => {
    await supabase.from("inquiries").update({ status: "read" }).eq("id", id);
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: "read" } : e));
  };

  const typeIcons: Record<string, string> = { property: "🏠", stay: "🏨", vehicle: "🚗", event: "🎭" };

  return (
    <div>
      <h2 className="text-2xl mb-6">📩 Enquiries</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-3">📩</div>
          <h3>No enquiries yet</h3>
          <p className="mt-2">When customers enquire about your listings, they'll appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enquiries.map(e => (
            <div key={e.id} className={`bg-card rounded-xl p-4 border transition-all ${e.status === "new" ? "border-primary shadow-sm" : "border-border"}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl flex-shrink-0">{typeIcons[e.listing_type] || "📩"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{e.sender_name}</span>
                    {e.status === "new" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-gold-dark">NEW</span>}
                    <span className="text-[11px] text-muted-foreground ml-auto">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[13px] text-muted-foreground mb-1">📧 {e.sender_email} {e.sender_phone && `• 📱 ${e.sender_phone}`}</div>
                  <div className="text-xs text-muted-foreground mb-1 capitalize">🏷️ {e.listing_type} • ID: {e.listing_id}</div>
                  {e.message && <p className="text-sm bg-background rounded-lg p-2.5 mt-2">{e.message}</p>}
                </div>
                {e.status === "new" && (
                  <button onClick={() => markRead(e.id)} className="text-xs font-semibold text-primary hover:underline flex-shrink-0">Mark Read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
