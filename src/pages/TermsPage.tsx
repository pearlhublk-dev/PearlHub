import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const TermsPage = () => {
  const { currentUser } = useAppContext();
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general", label: "General Terms", icon: "📄" },
    { id: "property", label: "Property Terms", icon: "🏠" },
    { id: "wanted", label: "Wanted Listings", icon: "🔍" },
    { id: "stays", label: "Stays Terms", icon: "🏨" },
    { id: "vehicles", label: "Vehicle Rental", icon: "🚗" },
    { id: "events", label: "Events & Tickets", icon: "🎭" },
    { id: "social", label: "Social & SME", icon: "🌐" },
    { id: "payments", label: "Payments & LankaPay", icon: "💳" },
    { id: "privacy", label: "Privacy Policy", icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-slate to-obsidian py-10">
        <div className="container">
          <h1 className="text-pearl text-3xl">Terms & Conditions</h1>
          <p className="text-fog mt-1.5">Pearl Hub Platform — Legal & Policies</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8 flex-col md:flex-row">
          <div className="md:w-56 flex-shrink-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left whitespace-nowrap transition-all ${activeSection === s.id ? "bg-primary/10 text-gold-dark font-semibold" : "text-muted-foreground hover:bg-background"}`}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-3xl">
            <div className="bg-card rounded-xl p-6 border border-border prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
              {activeSection === "general" && (
                <>
                  <h3 className="text-foreground">Pearl Hub Platform — General Terms of Service</h3>
                  <p>Last updated: March 2026</p>
                  <p><strong className="text-foreground">1. Acceptance:</strong> By accessing Pearl Hub, you agree to these terms. If you disagree, do not use the platform.</p>
                  <p><strong className="text-foreground">2. Eligibility:</strong> Users must be 18+ and legally capable of entering contracts under Sri Lankan law.</p>
                  <p><strong className="text-foreground">3. Account Security:</strong> Users are responsible for maintaining the confidentiality of login credentials.</p>
                  <p><strong className="text-foreground">4. Accuracy:</strong> All submitted information must be accurate. Fraudulent listings will be removed and accounts suspended.</p>
                  <p><strong className="text-foreground">5. NIC Verification:</strong> Pearl Hub requires National Identity Card verification for sellers to prevent fraud.</p>
                  <p><strong className="text-foreground">6. Payment Processing:</strong> All payments are processed via LankaPay. Processing fees and charges are borne by the client/payer.</p>
                  <p><strong className="text-foreground">7. Dispute Resolution:</strong> Disputes shall be resolved through arbitration in Colombo under Sri Lankan law.</p>
                  <p><strong className="text-foreground">8. Governing Law:</strong> This agreement is governed by the laws of the Democratic Socialist Republic of Sri Lanka.</p>
                </>
              )}

              {activeSection === "property" && (
                <>
                  <h3 className="text-foreground">Property Marketplace Terms</h3>
                  <p><strong className="text-foreground">Owner Listings:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Listing fee: Rs. 1,000 per property (paid via LankaPay)</li>
                    <li>Sale commission: 2% of final sale price</li>
                    <li>Required documents: NIC, deed, and property ownership proof</li>
                    <li>Owners must generate promo codes for verified buyers</li>
                    <li>Views and engagement metrics visible on dashboard</li>
                  </ul>
                  <p><strong className="text-foreground">Broker Terms:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Membership: Rs. 23,000/month for 65 listings (paid via LankaPay)</li>
                    <li>No sale commission charged to brokers</li>
                    <li>Required: Owner consent form for each listing</li>
                    <li>Broker must be licensed under Sri Lankan real estate regulations</li>
                  </ul>
                  <p><strong className="text-foreground">Buyer Benefits:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>0.5% cashback on <strong>owner-listed properties only</strong> via promo code (funded by Pearl Hub)</li>
                    <li>Buyer discount does NOT apply to broker-listed properties</li>
                    <li>All listings verified with document authentication</li>
                  </ul>
                </>
              )}

              {activeSection === "wanted" && (
                <>
                  <h3 className="text-foreground">Wanted Property Listings</h3>
                  <p><strong className="text-foreground">Listing Fee:</strong> Rs. 8,500 flat fee per wanted ad (paid via LankaPay)</p>
                  <p><strong className="text-foreground">Duration:</strong> Wanted ads are visible for 30 days from the date of posting.</p>
                  <p><strong className="text-foreground">Eligibility:</strong> Any registered user can post a wanted property ad.</p>
                  <p><strong className="text-foreground">Content Requirements:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Must include preferred location, budget range, and property requirements</li>
                    <li>Contact information will be verified before publishing</li>
                    <li>Misleading or spam ads will be removed without refund</li>
                  </ul>
                  <p><strong className="text-foreground">Response Policy:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Owners and brokers can contact wanted ad posters directly</li>
                    <li>Pearl Hub is not responsible for the quality of responses</li>
                    <li>Wanted ad fee is non-refundable once published</li>
                  </ul>
                </>
              )}

              {activeSection === "vehicles" && (
                <>
                  <h3 className="text-foreground">Vehicle Rental Terms & Conditions</h3>
                  <p><strong className="text-foreground">For Customers:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Valid driving license required for self-drive bookings</li>
                    <li>Daily allowance: 100 km per day included</li>
                    <li>Excess mileage charges apply beyond the daily km limit</li>
                    <li>Fuel is the responsibility of the renter</li>
                    <li>Security deposit required (refundable upon return)</li>
                    <li>Vehicle must be returned in the same condition</li>
                    <li>Pickup and return times must be strictly adhered to</li>
                    <li>Late return penalty: 150% of daily rate per additional day</li>
                    <li>Cancellation: Full refund 48hrs+ before pickup; 50% within 24-48hrs; no refund under 24hrs</li>
                    <li>All payments via LankaPay; charges borne by customer</li>
                  </ul>
                  <p><strong className="text-foreground">For Vehicle Suppliers:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Listing fee: Rs. 6,500 per vehicle per month (paid via LankaPay)</li>
                    <li>Vehicle must pass Pearl Hub safety inspection</li>
                    <li>Valid insurance and registration required</li>
                    <li>Supplier sets pricing (with/without driver)</li>
                    <li>Pearl Hub takes 8.5% commission on completed bookings</li>
                    <li>Vehicles must meet minimum safety standards</li>
                  </ul>
                  <p><strong className="text-foreground">Pickup & Return:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Pickup and return times are configurable at booking</li>
                    <li>Late pickups do not extend the rental period</li>
                    <li>Early returns are not refunded</li>
                    <li>Vehicle condition will be inspected at pickup and return</li>
                  </ul>
                </>
              )}

              {activeSection === "stays" && (
                <>
                  <h3 className="text-foreground">Stays & Accommodation Terms</h3>
                  <p><strong className="text-foreground">Commission:</strong> 8.5% flat rate on all bookings (excluding government taxes)</p>
                  <p><strong className="text-foreground">Check-in/Check-out:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Standard check-in time: 2:00 PM</li>
                    <li>Standard check-out time: 11:00 AM</li>
                    <li>Early check-in and late check-out subject to availability</li>
                    <li>Guests can select preferred check-in/check-out times at booking</li>
                  </ul>
                  <p><strong className="text-foreground">Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in; 50% charge within 24-48hrs; full charge within 24hrs</p>
                  <p><strong className="text-foreground">Provider Requirements:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sri Lanka Tourism Board approval recommended</li>
                    <li>Accurate room descriptions and photos</li>
                    <li>Maintain listed amenities</li>
                    <li>Respond to bookings within 2 hours</li>
                    <li>All payments processed via LankaPay</li>
                  </ul>
                </>
              )}

              {activeSection === "events" && (
                <>
                  <h3 className="text-foreground">Events & Ticketing Terms</h3>
                  <p><strong className="text-foreground">Commission:</strong> 8.5% per ticket sold</p>
                  <p><strong className="text-foreground">Gate & Timing:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gate opening times are displayed at booking</li>
                    <li>Attendees should arrive at least 30 minutes before event start</li>
                    <li>Late entry may result in seat forfeiture</li>
                  </ul>
                  <p><strong className="text-foreground">QR Tickets:</strong> All tickets are QR-coded and tamper-proof. Screenshots or copies are invalid.</p>
                  <p><strong className="text-foreground">Refund Policy:</strong> Event-specific. Generally non-refundable unless event is cancelled by organizer.</p>
                  <p><strong className="text-foreground">Seat Selection:</strong> Selected seats are held for 10 minutes during checkout.</p>
                  <p><strong className="text-foreground">Payment:</strong> All payments via LankaPay. Processing charges borne by the ticket buyer.</p>
                </>
              )}

              {activeSection === "social" && (
                <>
                  <h3 className="text-foreground">Social Hub & SME Directory Terms</h3>
                  <p><strong className="text-foreground">Community Guidelines:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>No spam, hate speech, or misleading content</li>
                    <li>Business listings must be accurate and verifiable</li>
                    <li>Location data used for fraud prevention and local recommendations</li>
                    <li>Fake profiles will be permanently banned</li>
                  </ul>
                  <p><strong className="text-foreground">SME Listing Fees (paid via LankaPay):</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Basic: Rs. 1,500/month — Profile + feed posts</li>
                    <li>Pro: Rs. 2,500/month — Featured placement + analytics</li>
                    <li>Premium: Rs. 5,000/month — Pop-up ads + priority listing</li>
                  </ul>
                </>
              )}

              {activeSection === "payments" && (
                <>
                  <h3 className="text-foreground">Payments & LankaPay Gateway</h3>
                  <p><strong className="text-foreground">Payment Gateway:</strong> All platform transactions are processed through LankaPay, Sri Lanka's trusted payment infrastructure.</p>
                  <p><strong className="text-foreground">Supported Payment Methods:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Credit/Debit Cards (Visa, MasterCard, AMEX)</li>
                    <li>Bank Transfers (All major Sri Lankan banks)</li>
                    <li>Mobile Payments (Dialog, Mobitel, Hutch mobile wallets)</li>
                  </ul>
                  <p><strong className="text-foreground">Fee Structure:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All payment processing fees and gateway charges are borne by the client/payer</li>
                    <li>Pearl Hub does not absorb any payment processing costs</li>
                    <li>Gateway fees are displayed at checkout before payment confirmation</li>
                  </ul>
                  <p><strong className="text-foreground">Security:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All transactions are SSL encrypted</li>
                    <li>PCI-DSS compliant payment processing</li>
                    <li>No card details are stored on Pearl Hub servers</li>
                    <li>Two-factor authentication for high-value transactions</li>
                  </ul>
                  <p><strong className="text-foreground">Refunds:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Refunds are processed within 5-10 business days</li>
                    <li>Refund amount depends on the service-specific cancellation policy</li>
                    <li>Payment processing fees may be non-refundable</li>
                  </ul>
                </>
              )}

              {activeSection === "privacy" && (
                <>
                  <h3 className="text-foreground">Privacy Policy</h3>
                  <p><strong className="text-foreground">Data Collection:</strong> We collect personal information (name, email, phone, NIC) for account verification and transaction processing.</p>
                  <p><strong className="text-foreground">Location Data:</strong> Used for fraud detection, local recommendations, and safety features. Can be disabled by the user.</p>
                  <p><strong className="text-foreground">Payment Data:</strong> Card details are processed by LankaPay and are never stored on Pearl Hub servers.</p>
                  <p><strong className="text-foreground">Data Sharing:</strong> We do not sell personal data. Information is shared only with service providers to fulfill bookings.</p>
                  <p><strong className="text-foreground">Security:</strong> All data encrypted at rest and in transit. Regular security audits conducted.</p>
                  <p><strong className="text-foreground">Analytics:</strong> We collect usage analytics to improve the platform. This data is anonymized and not linked to individual users.</p>
                  <p><strong className="text-foreground">Your Rights:</strong> You may request data deletion at any time by contacting support@pearlhub.lk</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
