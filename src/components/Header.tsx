import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/pearl-hub";

const Header = () => {
  const { currentUser, setCurrentUser, notifications, markNotificationRead } = useAppContext();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pearl-hub-theme");
      if (stored) return stored === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pearl-hub-theme", next ? "dark" : "light");
  };

  const navItems = [
    { path: "/property", label: "Property", icon: "🏘️" },
    { path: "/stays", label: "Stays", icon: "🏨" },
    { path: "/vehicles", label: "Rentals", icon: "🚗" },
    { path: "/events", label: "Events", icon: "🎭" },
    { path: "/social", label: "Social Hub", icon: "🌐" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="bg-obsidian sticky top-0 z-[500] border-b border-primary/20">
      <div className="container flex items-center gap-6 h-16">
        {/* Logo */}
        <div onClick={() => navigate("/")} className="cursor-pointer flex items-center gap-2.5 flex-shrink-0">
          <img src="/favicon.png" alt="Pearl Hub" className="w-[38px] h-[38px] rounded-full object-contain animate-gold-glow" />
          <div>
            <div className="font-display font-bold text-lg text-pearl leading-none">Pearl Hub</div>
            <div className="text-[9px] text-primary tracking-[2px] uppercase">Sri Lanka Premium</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1 flex-1 justify-center">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all flex items-center gap-1.5 border ${
                location.pathname === item.path
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-transparent text-fog hover:text-pearl"
              }`}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-pearl text-xl ml-auto">☰</button>

        {/* Controls */}
        <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative bg-white/[0.08] border border-white/15 text-pearl rounded-md p-2 text-sm cursor-pointer">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-ruby text-[10px] font-bold text-pearl rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
                <div className="p-3 border-b border-border font-display font-bold text-sm">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)}
                      className={`p-3 border-b border-border cursor-pointer hover:bg-pearl transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        {n.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-mist mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button onClick={toggleDarkMode} className="bg-white/[0.08] border border-white/15 text-pearl rounded-md p-2 text-sm" title={darkMode ? "Light mode" : "Dark mode"}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Role Switcher - only show when logged in or for demo */}
          <select value={currentUser} onChange={e => setCurrentUser(e.target.value as UserRole)}
            className="bg-white/[0.08] border border-white/15 text-pearl rounded-md px-2.5 py-1.5 text-xs font-body cursor-pointer w-auto">
            <option value="customer">👤 Customer</option>
            <option value="owner">🏠 Owner</option>
            <option value="broker">🏢 Broker</option>
            <option value="admin">👑 Admin</option>
          </select>

          <button onClick={handleAuthAction}
            className="bg-white/[0.08] border border-white/15 text-pearl rounded-md px-3 py-[7px] text-[13px] font-medium hover:bg-white/15 transition-all">
            {user ? "Sign Out" : "Sign In"}
          </button>

          <button onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-br from-primary to-gold-dark text-primary-foreground px-4 py-[7px] rounded-md text-[13px] font-bold flex items-center gap-1.5 hover:shadow-lg transition-all">
            📊 Dashboard
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-obsidian border-t border-primary/20 pb-4">
          <div className="container flex flex-col gap-2 pt-2">
            {navItems.map(item => (
              <button key={item.path} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                className={`px-4 py-2.5 rounded-md text-sm font-medium text-left flex items-center gap-2 ${
                  location.pathname === item.path ? "bg-primary/15 text-primary" : "text-fog"
                }`}>
                {item.icon} {item.label}
              </button>
            ))}
            <div className="flex gap-2 mt-2">
              <select value={currentUser} onChange={e => setCurrentUser(e.target.value as UserRole)}
                className="flex-1 bg-white/[0.08] border border-white/15 text-pearl rounded-md px-2 py-2 text-xs">
                <option value="customer">👤 Customer</option>
                <option value="owner">🏠 Owner</option>
                <option value="broker">🏢 Broker</option>
                <option value="admin">👑 Admin</option>
              </select>
              <button onClick={() => { handleAuthAction(); setMobileMenuOpen(false); }}
                className="bg-white/[0.08] border border-white/15 text-pearl px-3 py-2 rounded-md text-xs">
                {user ? "Sign Out" : "Sign In"}
              </button>
              <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                className="bg-gradient-to-br from-primary to-gold-dark text-primary-foreground px-4 py-2 rounded-md text-xs font-bold">
                📊
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
