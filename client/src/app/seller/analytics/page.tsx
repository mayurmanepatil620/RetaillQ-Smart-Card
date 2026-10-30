"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import {
  Activity,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  AlertTriangle,
  Link as LinkIcon,
  Clock,
  CalendarDays,
  Menu,
  Zap
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../../lib/firebase";
import Navbar from "@/components/Navbar";

import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsPage() {
  // 1. ADDED: isMounted state to prevent Vercel SSR build crashes
  const [isMounted, setIsMounted] = useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Safe default structure to prevent rendering crashes
  const [analytics, setAnalytics] = useState<any>({
    chart_data: [],
    prediction: 0,
    trend: "flat",
    suggestion: "",
    top_selling: [],
    cross_sell_rules: [],
    inventory_alerts: [],
    buying_patterns: {}
  });

  const [timeframe, setTimeframe] = useState("monthly");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

  // 2. ADDED: Set isMounted to true only in the browser
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(currentUser);
      const token = await currentUser.getIdToken();
      try {
        const res = await fetch(`${API_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shop");
        const data = await res.json();
        setShop(data.shop);

        if (data.shop?._id) {
          fetchAnalytics(data.shop._id, timeframe);
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [API_URL, timeframe]);

  useEffect(() => {
    if (shop?._id) {
      fetchAnalytics(shop._id, timeframe);
    }
  }, [shop?._id, timeframe]); // FIXED: Added "?" to shop?._id to prevent the dependency array crash

  const fetchAnalytics = async (shopId: string, selectedTimeframe: string) => {
    try {
      const res = await fetch(`${ML_API_URL}/api/analytics/${shopId}?timeframe=${selectedTimeframe}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics({
          ...data.data,
          top_selling: data.data.top_selling || [],
          cross_sell_rules: data.data.cross_sell_rules || [],
          inventory_alerts: data.data.inventory_alerts || [],
          chart_data: data.data.chart_data || [],
          buying_patterns: data.data.buying_patterns || {}
        });
      }
    } catch (err) {
      console.error("Error fetching ML analytics:", err);
    }
  };

  // Calculate Max Qty for visual progress bars
  const maxTopSellingQty = Math.max(...(analytics?.top_selling?.map((i: any) => i.qty) || [1]));

  // 3. ADDED: Return null during server-build to prevent SSR crashes
  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="w-64 h-full flex-shrink-0 z-30">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20">
            <Navbar />
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30 bg-white border-r border-gray-100 shadow-sm">
        <Sidebar />
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-[#2D2A26]/40 backdrop-blur-sm z-[90] lg:hidden"
            />
            
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white z-[100] lg:hidden shadow-2xl flex flex-col"
            >
              <Sidebar />
              {/* Optional: Close button inside the mobile menu */}
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-6 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
 {/* 🛠️ FIXED HEADER WITH MOBILE HAMBURGER */}
        <header className="h-[70px] bg-white/90 backdrop-blur-md border-b border-gray-100 flex-shrink-0 z-20 sticky top-0 shadow-sm flex items-center px-4 sm:px-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 mr-3 text-[#2D2A26] hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 h-full w-full">
            <Navbar />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Sales Intelligence</h1>
                <p className="text-gray-500 mt-2 text-sm max-w-2xl">
                  Enterprise-grade predictive analytics, behavioral insights, and smart inventory recommendations.
                </p>
              </div>

              {/* Timeframe Toggles */}
              <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-full md:w-auto overflow-x-auto">
                {["daily", "weekly", "monthly", "quarterly", "yearly"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${timeframe === tf
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {!analytics?.chart_data?.length ? (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Awaiting Data</h3>
                <p className="text-gray-500 max-w-md">
                  Process a few successful orders to generate your first comprehensive Machine Learning report.
                </p>
              </div>
            ) : (
              <div className="space-y-8">

                {/* 1. HERO METRICS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Prediction Card */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-lg border border-gray-700 text-white flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                      <div className={`p-3 rounded-xl backdrop-blur-md bg-white/10 ${analytics?.trend === "up" ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics?.trend === "up" ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${analytics?.trend === "up" ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {analytics?.trend === "up" ? "Trending Up" : "Trending Down"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Projected Sales ({timeframe.replace('ly', '')})</p>
                      <h2 className="text-5xl font-extrabold tracking-tight">₹{analytics?.prediction}</h2>
                    </div>
                  </div>

                  {/* AI Strategy Card */}
                  {/* AI Strategy Copilot - Advanced Details */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Lightbulb className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Strategy Copilot</h3>
                        <p className="text-sm text-gray-500">Data-driven action plan based on your recent performance</p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      {analytics?.detailed_strategies?.map((strategy: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                          <div className="mt-1">
                            {strategy.type === 'revenue' && <TrendingUp className="w-5 h-5 text-green-600" />}
                            {strategy.type === 'marketing' && <LinkIcon className="w-5 h-5 text-blue-600" />}
                            {strategy.type === 'inventory' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                            {strategy.type === 'behavior' && <Activity className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{strategy.title}</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{strategy.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. CUSTOMER BEHAVIOR PATTERNS */}
                {analytics?.buying_patterns?.busiest_day && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-sm border border-indigo-100">
                    <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-indigo-600" /> Behavioral Analytics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarDays className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Busiest Day</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{analytics.buying_patterns.busiest_day}</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Peak Time</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{analytics.buying_patterns.peak_time}</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Avg. Basket Size</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{analytics.buying_patterns.avg_basket_size} <span className="text-lg text-gray-500 font-medium">items</span></p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-indigo-100 inline-flex items-center gap-3 shadow-sm">
                      <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-indigo-900 font-medium">{analytics.buying_patterns.insight}</span>
                    </div>
                  </div>
                )}

                {/* 3. SMART BUNDLING (Apriori Rules) */}
                {analytics?.cross_sell_rules?.length > 0 && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <LinkIcon className="w-6 h-6 text-blue-600" /> Smart Bundling Opportunities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {analytics.cross_sell_rules.map((rule: any, idx: number) => (
                        <div key={idx} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                          <p className="text-xs text-blue-700 font-extrabold mb-3 uppercase tracking-widest bg-blue-100 inline-block px-3 py-1 rounded-full">
                            {rule.confidence}% Confidence
                          </p>
                          <p className="text-gray-600 mb-1">When buying:</p>
                          <p className="text-lg text-gray-900 font-bold mb-3">'{rule.trigger_item}'</p>
                          <p className="text-gray-600 mb-1">Recommend:</p>
                          <p className="text-lg text-blue-700 font-bold">'{rule.recommendation}'</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. INVENTORY INTELLIGENCE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Movers Visual List */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <ArrowUpCircle className="w-6 h-6 text-green-500" /> Top Performers
                    </h3>
                    {analytics?.top_selling?.length > 0 ? (
                      <div className="space-y-6">
                        {analytics.top_selling.map((item: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between items-end mb-2">
                              <span className="font-bold text-gray-800">{item.name}</span>
                              <span className="text-sm font-bold text-gray-900">{item.qty} sold</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${(item.qty / maxTopSellingQty) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-gray-500 italic">Not enough diverse data.</p>}
                  </div>

                  {/* Velocity Alerts */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500" /> Velocity & Surge Alerts
                    </h3>
                    {analytics?.inventory_alerts?.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.inventory_alerts.map((item: any, idx: number) => (
                          <div key={idx} className={`p-5 rounded-2xl border ${item.insight.includes('SURGE') ? 'bg-red-50 border-red-100' : 'bg-orange-50/50 border-orange-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-gray-900 text-lg">{item.name}</span>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${item.insight.includes('SURGE') ? 'bg-red-500 text-white' : 'bg-orange-200 text-orange-800'}`}>
                                {item.velocity} / day
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.insight}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <Activity className="w-8 h-8 mb-2 opacity-50" />
                        <p>Stable inventory burn rates.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. REVENUE CHART */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{timeframe} Revenue History</h3>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.chart_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#111827" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                        <Tooltip
                          cursor={{ stroke: '#111827', strokeWidth: 1, strokeDasharray: '4 4' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#111827" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 8, fill: '#111827', stroke: '#fff', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}







// "use client";

// import Sidebar from "@/components/Sidebar";
// import { useEffect, useState } from "react";
// import {
//   Activity,
//   Lightbulb,
//   TrendingUp,
//   TrendingDown,
//   ArrowUpCircle,
//   AlertTriangle,
//   Link as LinkIcon,
//   Clock,
//   CalendarDays,
//   Zap,
//   Menu,
//   X
// } from "lucide-react";
// import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import app from "../../../lib/firebase";
// import Navbar from "@/components/Navbar";
// import { motion, AnimatePresence } from "framer-motion";

// // --- ANIMATION VARIANTS ---
// const fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { type: "spring", damping: 25, stiffness: 120 }
//   }
// };

// const staggerContainer = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
// };

// export default function AnalyticsPage() {
//   const [isMounted, setIsMounted] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [shop, setShop] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   // Mobile Sidebar State
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

//   // Safe default structure
//   const [analytics, setAnalytics] = useState<any>({
//     chart_data: [],
//     prediction: 0,
//     trend: "flat",
//     suggestion: "",
//     top_selling: [],
//     cross_sell_rules: [],
//     inventory_alerts: [],
//     buying_patterns: {}
//   });

//   const [timeframe, setTimeframe] = useState("monthly");

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//   const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     const auth = getAuth(app);
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (!currentUser) {
//         setUser(null);
//         setLoading(false);
//         return;
//       }
//       setUser(currentUser);
//       const token = await currentUser.getIdToken();
//       try {
//         const res = await fetch(`${API_URL}/api/seller/profile`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error("Failed to fetch shop");
//         const data = await res.json();
//         setShop(data.shop);

//         if (data.shop?._id) {
//           fetchAnalytics(data.shop._id, timeframe);
//         }
//       } catch (err) {
//         console.error("Error fetching shop:", err);
//       } finally {
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, [API_URL, timeframe]);

//   useEffect(() => {
//     if (shop?._id) {
//       fetchAnalytics(shop._id, timeframe);
//     }
//   }, [shop?._id, timeframe]);

//   const fetchAnalytics = async (shopId: string, selectedTimeframe: string) => {
    
//     // --- FORCE DATA TO SHOW UI ---
//     // This populates the dashboard so you can see the designs and charts working
//     setAnalytics({
//       prediction: 12500,
//       trend: "up",
//       detailed_strategies: [
//         { type: 'revenue', title: 'Weekend Surge Strategy', desc: 'Run a targeted flash sale on Saturdays based on peak traffic.' },
//         { type: 'inventory', title: 'Restock Alert', desc: 'Power Banks are depleting faster than usual. Restock within 3 days.' }
//       ],
//       buying_patterns: {
//         busiest_day: "Saturday",
//         peak_time: "5:00 PM - 7:00 PM",
//         avg_basket_size: 3.4,
//         insight: "Customers buy 40% more items when shopping on weekends."
//       },
//       top_selling: [
//         { name: "Premium Wireless Headphones", qty: 145 },
//         { name: "Smartphone Case", qty: 89 },
//         { name: "Fast Charging Cable", qty: 64 },
//       ],
//       cross_sell_rules: [
//         { trigger_item: "Smartphone", recommendation: "Screen Protector", confidence: 85 },
//         { trigger_item: "Laptop", recommendation: "Wireless Mouse", confidence: 72 }
//       ],
//       inventory_alerts: [
//         { name: "Power Bank", velocity: 12, insight: "SURGE: Selling 3x faster than normal." },
//         { name: "Bluetooth Speaker", velocity: 8, insight: "Stock depleting steadily." }
//       ],
//       chart_data: [
//         { time: "Mon", sales: 400 },
//         { time: "Tue", sales: 300 },
//         { time: "Wed", sales: 550 },
//         { time: "Thu", sales: 450 },
//         { time: "Fri", sales: 700 },
//         { time: "Sat", sales: 1100 },
//         { time: "Sun", sales: 950 },
//       ]
//     });
//     return; // Stops the real fetch so the mock data stays on screen
//     // -----------------------------

//     try {
//       const res = await fetch(`${ML_API_URL}/api/analytics/${shopId}?timeframe=${selectedTimeframe}`);
//       const data = await res.json();
//       if (data.success) {
//         setAnalytics({
//           ...data.data,
//           top_selling: data.data.top_selling || [],
//           cross_sell_rules: data.data.cross_sell_rules || [],
//           inventory_alerts: data.data.inventory_alerts || [],
//           chart_data: data.data.chart_data || [],
//           buying_patterns: data.data.buying_patterns || {}
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching ML analytics:", err);
//     }
//   };

//   const maxTopSellingQty = Math.max(...(analytics?.top_selling?.map((i: any) => i.qty) || [1]));

//   if (!isMounted) {
//     return null;
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
//         <div className="animate-spin h-12 w-12 border-t-4 border-[#cd1873] rounded-full"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-[#FFFDF5] text-[#2D2A26] font-sans overflow-x-hidden">
      
//       {/* --- DESKTOP SIDEBAR --- */}
//       <div className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30 bg-white border-r border-gray-100 shadow-sm">
//         <Sidebar />
//       </div>

//       {/* --- MOBILE SIDEBAR OVERLAY --- */}
//       <AnimatePresence>
//         {isMobileSidebarOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="fixed inset-0 bg-[#2D2A26]/40 backdrop-blur-sm z-[90] lg:hidden"
//             />
//             <motion.div
//               initial={{ x: "-100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "-100%" }}
//               transition={{ type: "spring", damping: 25, stiffness: 200 }}
//               className="fixed top-0 left-0 h-full w-[280px] bg-white z-[100] lg:hidden shadow-2xl flex flex-col"
//             >
//               <Sidebar />
//               <button 
//                 onClick={() => setIsMobileSidebarOpen(false)}
//                 className="absolute top-6 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* --- MAIN CONTENT AREA --- */}
//       <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
//         {/* HEADER */}
//         <header className="h-[70px] bg-white/90 backdrop-blur-md border-b border-gray-100 flex-shrink-0 z-20 sticky top-0 shadow-sm flex items-center px-4 sm:px-6">
//           <button
//             onClick={() => setIsMobileSidebarOpen(true)}
//             className="lg:hidden p-2 mr-3 text-[#2D2A26] hover:bg-gray-100 rounded-xl transition-colors"
//           >
//             <Menu className="w-6 h-6" />
//           </button>
          
//           <div className="flex-1 h-full w-full">
//             <Navbar />
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           <div className="max-w-7xl mx-auto">

//             {/* Header Section */}
//             <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
//               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
//                 <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A26] tracking-tight">AI Sales Intelligence</h1>
//                 <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base max-w-2xl">
//                   Enterprise-grade predictive analytics, behavioral insights, and smart recommendations.
//                 </p>
//               </motion.div>

//               {/* Timeframe Toggles */}
//               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-full md:w-auto overflow-x-auto custom-scrollbar">
//                 {["daily", "weekly", "monthly", "quarterly", "yearly"].map((tf) => (
//                   <button
//                     key={tf}
//                     onClick={() => setTimeframe(tf)}
//                     className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${
//                       timeframe === tf
//                         ? "bg-[#f5a824] text-white shadow-md shadow-[#f5a824]/20"
//                         : "text-gray-500 hover:text-[#cd1873] hover:bg-gray-50"
//                     }`}
//                   >
//                     {tf}
//                   </button>
//                 ))}
//               </motion.div>
//             </div>

//             {!analytics?.chart_data?.length ? (
//               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
//                 <div className="w-16 h-16 bg-[#f5a824]/10 rounded-2xl flex items-center justify-center mb-6">
//                   <Activity className="w-8 h-8 text-[#f5a824]" />
//                 </div>
//                 <h3 className="text-2xl font-black text-[#2D2A26] mb-3">Awaiting Data</h3>
//                 <p className="text-gray-500 max-w-md font-medium leading-relaxed">
//                   Process a few successful orders to generate your first comprehensive Machine Learning report.
//                 </p>
//               </motion.div>
//             ) : (
//               <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 lg:space-y-8">

//                 {/* 1. HERO METRICS */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  
//                   {/* Revenue Prediction Card */}
//                   <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
//                     <div className="flex items-center justify-between mb-8">
//                       <div className={`p-3 rounded-xl ${analytics?.trend === "up" ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//                         {analytics?.trend === "up" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
//                       </div>
//                       <span className={`px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg ${analytics?.trend === "up" ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
//                         {analytics?.trend === "up" ? "Trending Up" : "Trending Down"}
//                       </span>
//                     </div>
//                     <div>
//                       <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Projected Sales ({timeframe.replace('ly', '')})</p>
//                       <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#2D2A26]">₹{analytics?.prediction}</h2>
//                     </div>
//                   </motion.div>

//                   {/* AI Strategy Copilot */}
//                   <motion.div variants={fadeInUp} className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col">
//                     <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
//                       <div className="p-3 bg-[#cd1873]/10 text-[#cd1873] rounded-xl">
//                         <Lightbulb className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl sm:text-2xl font-bold text-[#2D2A26]">AI Strategy Copilot</h3>
//                         <p className="text-xs sm:text-sm text-gray-500 font-medium">Data-driven action plan based on your recent performance</p>
//                       </div>
//                     </div>

//                     <div className="space-y-3 flex-1">
//                       {analytics?.detailed_strategies?.map((strategy: any, idx: number) => (
//                         <div key={idx} className="flex gap-4 p-4 rounded-xl bg-[#FFFDF5] border border-gray-100 hover:border-[#f5a824]/40 hover:bg-white transition-all group">
//                           <div className="mt-0.5">
//                             {strategy.type === 'revenue' && <TrendingUp className="w-5 h-5 text-green-500" />}
//                             {strategy.type === 'marketing' && <LinkIcon className="w-5 h-5 text-[#cd1873]" />}
//                             {strategy.type === 'inventory' && <AlertTriangle className="w-5 h-5 text-[#f5a824]" />}
//                             {strategy.type === 'behavior' && <Activity className="w-5 h-5 text-purple-500" />}
//                           </div>
//                           <div>
//                             <h4 className="font-bold text-[#2D2A26] mb-1 group-hover:text-[#cd1873] transition-colors">{strategy.title}</h4>
//                             <p className="text-xs sm:text-sm text-gray-600 font-medium">{strategy.desc}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 </div>

//                 {/* 2. CUSTOMER BEHAVIOR PATTERNS */}
//                 {analytics?.buying_patterns?.busiest_day && (
//                   <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
//                     <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] mb-5 flex items-center gap-2">
//                       <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a824]" /> Behavioral Analytics
//                     </h3>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
//                       <div className="bg-[#FFFDF5] p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
//                         <div className="flex items-center gap-2 mb-2">
//                           <CalendarDays className="w-5 h-5 text-[#cd1873]" />
//                           <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">Busiest Day</p>
//                         </div>
//                         <p className="text-2xl font-black text-[#2D2A26] capitalize">{analytics.buying_patterns.busiest_day}</p>
//                       </div>

//                       <div className="bg-[#FFFDF5] p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Clock className="w-5 h-5 text-[#cd1873]" />
//                           <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">Peak Time</p>
//                         </div>
//                         <p className="text-2xl font-black text-[#2D2A26] capitalize">{analytics.buying_patterns.peak_time}</p>
//                       </div>

//                       <div className="bg-[#FFFDF5] p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Activity className="w-5 h-5 text-[#cd1873]" />
//                           <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">Avg. Basket Size</p>
//                         </div>
//                         <p className="text-2xl font-black text-[#2D2A26]">{analytics.buying_patterns.avg_basket_size} <span className="text-sm text-gray-400 font-bold">items</span></p>
//                       </div>
//                     </div>

//                     <div className="bg-[#FFFBEB] p-4 rounded-xl border border-[#f5a824]/30 inline-flex items-center gap-3 w-full">
//                       <Zap className="w-5 h-5 text-[#f5a824] fill-[#f5a824] flex-shrink-0" />
//                       <span className="text-[#B45309] font-bold text-sm leading-snug">{analytics.buying_patterns.insight}</span>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* 3. SMART BUNDLING */}
//                 {analytics?.cross_sell_rules?.length > 0 && (
//                   <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
//                     <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] mb-5 flex items-center gap-2">
//                       <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#cd1873]" /> Smart Bundling Opportunities
//                     </h3>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {analytics.cross_sell_rules.map((rule: any, idx: number) => (
//                         <div key={idx} className="bg-[#FFFDF5] p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
//                           <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#cd1873] to-[#f5a824]"></div>
//                           <span className="text-[10px] text-[#cd1873] bg-[#cd1873]/10 font-black mb-3 uppercase tracking-widest inline-block px-2.5 py-1 rounded-lg">
//                             {rule.confidence}% Confidence
//                           </span>
//                           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">When buying:</p>
//                           <p className="text-lg text-[#2D2A26] font-bold mb-3 truncate">'{rule.trigger_item}'</p>
//                           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Recommend:</p>
//                           <p className="text-lg text-[#f5a824] font-bold truncate">'{rule.recommendation}'</p>
//                         </div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* 4. INVENTORY INTELLIGENCE */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
//                   {/* Top Movers Visual List */}
//                   <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
//                     <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] mb-5 flex items-center gap-2">
//                       <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#cd1873]" /> Top Performers
//                     </h3>
//                     {analytics?.top_selling?.length > 0 ? (
//                       <div className="space-y-5">
//                         {analytics.top_selling.map((item: any, idx: number) => (
//                           <div key={idx} className="group">
//                             <div className="flex justify-between items-end mb-1.5">
//                               <span className="font-bold text-[#2D2A26] truncate pr-4 text-sm">{item.name}</span>
//                               <span className="text-xs font-black text-[#cd1873] bg-[#cd1873]/10 px-2 py-0.5 rounded-md whitespace-nowrap">{item.qty} sold</span>
//                             </div>
//                             <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//                               <motion.div
//                                 initial={{ width: 0 }}
//                                 whileInView={{ width: `${(item.qty / maxTopSellingQty) * 100}%` }}
//                                 transition={{ duration: 1, ease: "easeOut" }}
//                                 className="bg-[#f5a824] h-full rounded-full"
//                               />
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : <p className="text-gray-500 text-sm font-medium italic">Not enough diverse data.</p>}
//                   </motion.div>

//                   {/* Velocity Alerts */}
//                   <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
//                     <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] mb-5 flex items-center gap-2">
//                       <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a824]" /> Velocity & Surge Alerts
//                     </h3>
//                     {analytics?.inventory_alerts?.length > 0 ? (
//                       <div className="space-y-4">
//                         {analytics.inventory_alerts.map((item: any, idx: number) => (
//                           <div key={idx} className={`p-4 rounded-xl border transition-colors ${item.insight.includes('SURGE') ? 'bg-red-50 border-red-100' : 'bg-[#FFFBEB] border-[#f5a824]/20'}`}>
//                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
//                               <span className="font-bold text-[#2D2A26] text-sm">{item.name}</span>
//                               <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap ${item.insight.includes('SURGE') ? 'bg-red-500 text-white' : 'bg-[#f5a824] text-white'}`}>
//                                 {item.velocity} / day
//                               </span>
//                             </div>
//                             <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.insight}</p>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
//                         <Activity className="w-8 h-8 mb-2 text-gray-300" />
//                         <p className="font-bold text-sm">Stable inventory burn rates.</p>
//                       </div>
//                     )}
//                   </motion.div>
//                 </div>

//                 {/* 5. REVENUE CHART */}
//                 <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
//                   <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] capitalize">{timeframe} Revenue History</h3>
//                   </div>
//                   <div className="h-[250px] sm:h-[350px] w-full">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={analytics?.chart_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <defs>
//                           <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#cd1873" stopOpacity={0.3} />
//                             <stop offset="95%" stopColor="#cd1873" stopOpacity={0} />
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
//                         <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} dy={10} />
//                         <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} tickFormatter={(value) => `₹${value}`} dx={-10} />
//                         <Tooltip
//                           cursor={{ stroke: '#cd1873', strokeWidth: 1, strokeDasharray: '4 4' }}
//                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '12px', fontWeight: 'bold', color: '#2D2A26' }}
//                         />
//                         <Area type="monotone" dataKey="sales" stroke="#cd1873" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#cd1873', stroke: '#fff', strokeWidth: 2 }} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </motion.div>

//               </motion.div>
//             )}
//           </div>
//         </main>
//       </div>

//       <style jsx global>{`
//         /* Custom Scrollbar */
//         .custom-scrollbar::-webkit-scrollbar {
//           height: 6px;
//           width: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background-color: #E5E7EB;
//           border-radius: 20px;
//         }
//       `}</style>
//     </div>
//   );
// }