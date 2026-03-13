import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";

const monthlyData = [
  { month: "Sep", revenue: 320000, bookings: 42, views: 1200 },
  { month: "Oct", revenue: 410000, bookings: 56, views: 1800 },
  { month: "Nov", revenue: 385000, bookings: 48, views: 1650 },
  { month: "Dec", revenue: 520000, bookings: 71, views: 2100 },
  { month: "Jan", revenue: 480000, bookings: 63, views: 2400 },
  { month: "Feb", revenue: 610000, bookings: 85, views: 3100 },
  { month: "Mar", revenue: 725000, bookings: 94, views: 3600 },
];

const categoryData = [
  { name: "Properties", value: 42, color: "hsl(155, 60%, 27%)" },
  { name: "Stays", value: 28, color: "hsl(210, 53%, 23%)" },
  { name: "Vehicles", value: 18, color: "hsl(350, 73%, 33%)" },
  { name: "Events", value: 12, color: "hsl(256, 57%, 29%)" },
];

const trafficData = [
  { day: "Mon", visitors: 450, pageViews: 1200 },
  { day: "Tue", visitors: 520, pageViews: 1400 },
  { day: "Wed", visitors: 480, pageViews: 1300 },
  { day: "Thu", visitors: 610, pageViews: 1800 },
  { day: "Fri", visitors: 720, pageViews: 2200 },
  { day: "Sat", visitors: 850, pageViews: 2800 },
  { day: "Sun", visitors: 680, pageViews: 2100 },
];

const AnalyticsDashboard = () => {
  const { currentUser } = useAppContext();
  const [dateRange, setDateRange] = useState("30d");
  const isAdmin = currentUser === "admin";

  const topListings = [
    { name: "Luxury Villa – Colombo 7", views: 342, enquiries: 18, type: "property" },
    { name: "Shangri-La Colombo", views: 289, enquiries: 45, type: "stay" },
    { name: "Beach House – Negombo", views: 421, enquiries: 22, type: "property" },
    { name: "Toyota Prius", views: 156, enquiries: 34, type: "vehicle" },
    { name: "Bathiya & Santhush Live", views: 890, enquiries: 120, type: "event" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-2xl">📊 Analytics Dashboard</h2>
        <div className="flex gap-2">
          {[
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "90d", label: "90 Days" },
            { id: "1y", label: "1 Year" },
          ].map(r => (
            <button key={r.id} onClick={() => setDateRange(r.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${dateRange === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-input"}`}>
              {r.label}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-md text-xs font-semibold border border-input bg-card text-muted-foreground hover:bg-background transition-all">
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(isAdmin ? [
          { icon: "💰", label: "Total Revenue", value: "Rs. 3.9M", change: "+18%", positive: true },
          { icon: "👥", label: "Total Users", value: "4,280", change: "+12%", positive: true },
          { icon: "🏠", label: "Active Listings", value: "12,400", change: "+8%", positive: true },
          { icon: "📊", label: "Conversion Rate", value: "3.2%", change: "+0.4%", positive: true },
        ] : [
          { icon: "👁", label: "Total Views", value: "1,245", change: "+24%", positive: true },
          { icon: "📩", label: "Enquiries", value: "23", change: "+15%", positive: true },
          { icon: "💰", label: "Revenue", value: "Rs. 850K", change: "+10%", positive: true },
          { icon: "📈", label: "Click Rate", value: "4.8%", change: "+1.2%", positive: true },
        ]).map(kpi => (
          <div key={kpi.label} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.positive ? "bg-emerald/10 text-emerald" : "bg-ruby/10 text-ruby"}`}>{kpi.change}</span>
            </div>
            <div className="text-xl font-bold">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-bold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 20%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(155, 60%, 27%)" fill="hsl(155, 60%, 27%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-bold mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Bookings Chart */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-bold mb-4">Bookings Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 20%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="hsl(210, 53%, 23%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Chart */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-bold mb-4">Website Traffic (This Week)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 20%, 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="hsl(42, 52%, 54%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="pageViews" stroke="hsl(256, 57%, 29%)" strokeWidth={2} dot={{ r: 4 }} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Listings */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold">Top Performing Listings</h3>
          <button className="text-xs text-primary font-semibold">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2.5 text-left text-xs uppercase text-muted-foreground font-semibold">#</th>
                <th className="p-2.5 text-left text-xs uppercase text-muted-foreground font-semibold">Listing</th>
                <th className="p-2.5 text-left text-xs uppercase text-muted-foreground font-semibold">Type</th>
                <th className="p-2.5 text-left text-xs uppercase text-muted-foreground font-semibold">Views</th>
                <th className="p-2.5 text-left text-xs uppercase text-muted-foreground font-semibold">Enquiries</th>
                <th className="p-2.5 text-left text-xs uppercase text-muted-foreground font-semibold">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {topListings.map((item, i) => (
                <tr key={i} className="border-b border-border hover:bg-background">
                  <td className="p-2.5 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="p-2.5 font-semibold">{item.name}</td>
                  <td className="p-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    item.type === "property" ? "bg-emerald/10 text-emerald" :
                    item.type === "stay" ? "bg-sapphire/10 text-sapphire" :
                    item.type === "vehicle" ? "bg-ruby/10 text-ruby" :
                    "bg-indigo/10 text-indigo"
                  }`}>{item.type}</span></td>
                  <td className="p-2.5">👁 {item.views}</td>
                  <td className="p-2.5">📩 {item.enquiries}</td>
                  <td className="p-2.5 font-bold text-emerald">{((item.enquiries / item.views) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">This Month vs Last Month</h4>
          {[
            { label: "Revenue", current: "Rs. 725K", prev: "Rs. 610K", change: "+18.9%" },
            { label: "Bookings", current: "94", prev: "85", change: "+10.6%" },
            { label: "Views", current: "3,600", prev: "3,100", change: "+16.1%" },
          ].map(c => (
            <div key={c.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-sm">{c.label}</span>
              <div className="text-right">
                <span className="text-sm font-bold">{c.current}</span>
                <span className="text-xs text-emerald ml-2">{c.change}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Top Locations</h4>
          {["Colombo", "Galle", "Kandy", "Negombo", "Ella"].map((loc, i) => (
            <div key={loc} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-sm">{loc}</span>
              <div className="h-1.5 w-24 bg-pearl-dark rounded-full overflow-hidden">
                <div className="h-full bg-emerald rounded-full" style={{ width: `${100 - i * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">User Activity</h4>
          {[
            { label: "New Signups", value: "128" },
            { label: "Active Users (7d)", value: "1,042" },
            { label: "Avg Session Duration", value: "4m 32s" },
            { label: "Bounce Rate", value: "32%" },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="text-sm font-bold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
