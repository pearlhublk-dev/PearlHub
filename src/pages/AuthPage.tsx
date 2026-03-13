import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppContext();
  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: "customer", label: "👤 Customer / Buyer", desc: "Browse & book services" },
    { value: "owner", label: "🏠 Property Owner", desc: "List & sell properties" },
    { value: "broker", label: "🏢 Licensed Broker", desc: "Manage multiple listings" },
    { value: "stay_provider", label: "🏨 Stay Provider", desc: "Hotels, villas, guest houses" },
    { value: "event_organizer", label: "🎫 Event Organizer", desc: "List & manage events" },
    { value: "sme", label: "🏪 SME / Business", desc: "List in SME directory" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !agreed) {
      showToast("Please agree to the Terms & Conditions.", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) { showToast(error.message, "error"); return; }
        showToast("Password reset link sent to your email!", "success");
        setMode("login");
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, { full_name: name, phone, role });
        if (error) { showToast(error.message, "error"); return; }
        showToast("Account created successfully! Welcome to Pearl Hub.", "success");
        navigate("/dashboard");
      } else {
        const { error } = await signIn(email, password);
        if (error) { showToast(error.message, "error"); return; }
        showToast("Welcome back!", "success");
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-obsidian via-slate to-sapphire items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.04]" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-emerald/[0.06]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-gold-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-gold-glow">
            <img src="/favicon.png" alt="Pearl Hub" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="font-display text-pearl font-bold text-4xl mb-4">Pearl Hub</h1>
          <p className="text-fog text-lg max-w-md leading-relaxed">Sri Lanka's #1 marketplace for properties, stays, vehicles, and events.</p>
          <div className="flex gap-6 justify-center mt-8">
            {[{ v: "12,400+", l: "Properties" }, { v: "3,200+", l: "Stays" }, { v: "1,800+", l: "Vehicles" }].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-display text-2xl font-bold text-primary">{s.v}</div>
                <div className="text-xs text-fog">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <img src="/favicon.png" alt="Pearl Hub" className="w-10 h-10 object-contain" />
            <div className="font-display font-bold text-xl">Pearl Hub</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold mb-1">
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {mode === "login" ? "Sign in to your Pearl Hub account" : mode === "signup" ? "Join Sri Lanka's premier marketplace" : "We'll send a reset link to your email"}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Full Name</label>
                      <input value={name} onChange={e => setName(e.target.value)} required placeholder="John Perera" className="w-full rounded-lg border border-input px-3.5 py-2.5 text-sm bg-card" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Phone Number</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 77 123 4567" className="w-full rounded-lg border border-input px-3.5 py-2.5 text-sm bg-card" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Account Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {roleOptions.map(r => (
                          <div key={r.value} onClick={() => setRole(r.value)}
                            className={`p-2.5 border-2 rounded-lg cursor-pointer transition-all ${role === r.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                            <div className="text-xs font-bold">{r.label}</div>
                            <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full rounded-lg border border-input px-3.5 py-2.5 text-sm bg-card" />
                </div>
                {mode !== "forgot" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} className="w-full rounded-lg border border-input px-3.5 py-2.5 text-sm bg-card" />
                  </div>
                )}

                {mode === "login" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary font-semibold self-end -mt-1">Forgot password?</button>
                )}

                {mode === "signup" && (
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 rounded" />
                    <span>I agree to the <button type="button" onClick={() => window.open("/terms", "_blank")} className="text-primary font-semibold underline">Terms & Conditions</button> and <button type="button" onClick={() => window.open("/privacy", "_blank")} className="text-primary font-semibold underline">Privacy Policy</button></span>
                  </label>
                )}

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-gold-dark text-primary-foreground py-3 rounded-lg font-bold text-sm mt-2 hover:shadow-lg transition-all disabled:opacity-50">
                  {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center mt-5 text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary font-semibold">Sign up</button></>
                ) : mode === "signup" ? (
                  <>Already have an account? <button onClick={() => setMode("login")} className="text-primary font-semibold">Sign in</button></>
                ) : (
                  <button onClick={() => setMode("login")} className="text-primary font-semibold">← Back to sign in</button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
