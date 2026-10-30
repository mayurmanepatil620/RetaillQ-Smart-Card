// "use client";

// import { useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../../lib/firebase";
// import Sidebar from "../../../components/Sidebar";
// import Navbar from "@/components/Navbar";
// import { Package, Clock, CheckCircle, DollarSign } from "lucide-react";

// export default function SellerOrdersPage() {
//   const [orders, setOrders] = useState<any[]>([]);
//   const [filter, setFilter] = useState("all");
//   const [shopId, setShopId] = useState("");
//   const [loading, setLoading] = useState(true);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         console.error("User not logged in");
//         setLoading(false);
//         return;
//       }
//       await fetchShop(user);
//     });

//     return () => unsub();
//   }, []);

//   const fetchShop = async (user: any) => {
//     try {
//       const token = await user.getIdToken(true);

//       const res = await fetch(`${API_URL}/api/seller/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to fetch shop");

//       const data = await res.json();
//       if (data.success && data.shop?._id) {
//         setShopId(data.shop._id);
//         await fetchOrders(data.shop._id, token);
//       }
//     } catch (err) {
//       console.error("Shop fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrders = async (shopId: string, token: string) => {
//     try {
//       const res = await fetch(`${API_URL}/api/shops/${shopId}/orders`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       if (data.success) setOrders(data.orders);
//     } catch (err) {
//       console.error("Orders fetch error:", err);
//     }
//   };

//   const markAsPaid = async (orderId: string) => {
//     if (!confirm("Mark this order as paid?")) return;

//     try {
//       const token = await auth.currentUser?.getIdToken(true);

//       const res = await fetch(
//         `${API_URL}/api/shops/orders/${orderId}/mark-paid`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await res.json();
//       if (data.success) {
//         alert("Order marked as paid");
//         fetchOrders(shopId, token!);
//       } else {
//         alert("Failed to mark as paid");
//       }
//     } catch (err) {
//       console.error("Mark paid error:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full" />
//       </div>
//     );
//   }

//   const filteredOrders =
//     filter === "all"
//       ? orders
//       : orders.filter((o) => o.paymentStatus === filter);

//   const stats = [
//     {
//       label: "Total Orders",
//       value: orders.length,
//       icon: Package,
//       color: "bg-blue-100 text-blue-600",
//     },
//     {
//       label: "Pending",
//       value: orders.filter((o) => o.paymentStatus === "pending").length,
//       icon: Clock,
//       color: "bg-yellow-100 text-yellow-600",
//     },
//     {
//       label: "Paid",
//       value: orders.filter((o) => o.paymentStatus === "paid").length,
//       icon: CheckCircle,
//       color: "bg-green-100 text-green-600",
//     },
//     {
//       label: "Revenue",
//       value: `₹${orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)}`,
//       icon: DollarSign,
//       color: "bg-orange-100 text-orange-600",
//     },
//   ];

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 flex flex-col ml-64">
//         <Navbar />
//       <main className="flex-1 overflow-y-auto p-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
//           <p className="text-gray-600 mt-1">Track and manage all your customer orders</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           {stats.map((stat, i) => (
//             <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-gray-600 text-sm">{stat.label}</p>
//                   <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
//                 </div>
//                 <div className={`${stat.color} p-3 rounded-xl`}>
//                   <stat.icon className="w-6 h-6" />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Filter Tabs */}
//         <div className="flex gap-4 mb-6">
//           {["all", "pending", "paid"].map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               className={`px-6 py-2.5 rounded-lg font-medium transition ${
//                 filter === f
//                   ? "bg-orange-600 text-white shadow-sm"
//                   : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
//               }`}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Orders List */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//           {filteredOrders.length === 0 ? (
//             <div className="p-12 text-center">
//               <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-600 text-lg">No orders found</p>
//               <p className="text-gray-500 text-sm mt-1">Orders will appear here once customers place them</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredOrders.map((order) => (
//                 <div
//                   key={order._id}
//                   className="p-6 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                         Order #{order._id.slice(-8).toUpperCase()}
//                       </h3>
//                       <div className="flex items-center gap-4 text-sm text-gray-600">
//                         <span className="flex items-center gap-1">
//                           <DollarSign className="w-4 h-4" />
//                           Total: ₹{order.totalAmount}
//                         </span>
//                         <span>•</span>
//                         <span>Payment: {order.paymentMethod.toUpperCase()}</span>
//                         <span>•</span>
//                         <span className={`font-medium ${
//                           order.paymentStatus === "paid"
//                             ? "text-green-600"
//                             : "text-yellow-600"
//                         }`}>
//                           {order.paymentStatus === "paid" ? "✓ Paid" : "○ Pending"}
//                         </span>
//                       </div>
//                     </div>

//                     {order.paymentMethod === "cash" &&
//                       order.paymentStatus === "pending" && (
//                         <button
//                           onClick={() => markAsPaid(order._id)}
//                           className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
//                         >
//                           <CheckCircle className="w-4 h-4" />
//                           Mark as Paid
//                         </button>
//                       )}
//                   </div>

//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
//                     <ul className="space-y-1">
//                       {order.items.map((item: any, idx: number) => (
//                         <li key={idx} className="text-sm text-gray-600 flex justify-between">
//                           <span>{item.name}</span>
//                           <span className="font-medium">₹{item.price} × {item.quantity}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";
import Navbar from "@/components/Navbar";
import { Package, Clock, CheckCircle, DollarSign, Menu, X, Wallet, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 }
  }
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }
      await fetchShop(user);
    });

    return () => unsub();
  }, []);

  const fetchShop = async (user: any) => {
    try {
      const token = await user.getIdToken(true);

      const res = await fetch(`${API_URL}/api/seller/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch shop");

      const data = await res.json();
      if (data.success && data.shop?._id) {
        setShopId(data.shop._id);
        await fetchOrders(data.shop._id, token);
      }
    } catch (err) {
      console.error("Shop fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (shopId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/shops/${shopId}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Orders fetch error:", err);
    }
  };

  const markAsPaid = async (orderId: string) => {
    if (!confirm("Mark this order as paid?")) return;

    try {
      const token = await auth.currentUser?.getIdToken(true);

      const res = await fetch(
        `${API_URL}/api/shops/orders/${orderId}/mark-paid`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchOrders(shopId, token!);
      } else {
        alert("Failed to mark as paid");
      }
    } catch (err) {
      console.error("Mark paid error:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FFFDF5]">
        <div className="animate-spin h-12 w-12 border-t-4 border-[#cd1873] rounded-full" />
      </div>
    );
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.paymentStatus === filter);

  // --- CALCULATING METRICS ---
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  
  const totalCashPayment = orders
    .filter((o) => o.paymentMethod?.toLowerCase() === "cash")
    .reduce((s, o) => s + o.totalAmount, 0);

  const totalOnlinePayment = orders
    .filter((o) => o.paymentMethod?.toLowerCase() !== "cash")
    .reduce((s, o) => s + o.totalAmount, 0);

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-[#cd1873]",
      bg: "bg-[#cd1873]/10",
    },
    {
      label: "Cash Payments",
      value: `₹${totalCashPayment.toFixed(2)}`,
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Online Payments",
      value: `₹${totalOnlinePayment.toFixed(2)}`,
      icon: Globe,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Pending Status",
      value: orders.filter((o) => o.paymentStatus === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Paid Status",
      value: orders.filter((o) => o.paymentStatus === "paid").length,
      icon: CheckCircle,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FFFDF5] text-[#2D2A26] font-sans overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30 bg-white border-r border-gray-100 shadow-sm">
        <Sidebar />
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-[#2D2A26]/40 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white z-[100] lg:hidden shadow-2xl flex flex-col"
            >
              <Sidebar />
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

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[70px] bg-white border-b border-gray-100 flex-shrink-0 z-20 shadow-sm flex items-center px-4 sm:px-6">
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

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Header Section */}
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A26] tracking-tight">Orders Management</h1>
                <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Track and manage all your customer orders</p>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-xl sm:text-2xl font-black text-[#2D2A26] mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.bg} p-3 rounded-xl`}>
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-full md:w-max overflow-x-auto mb-6 custom-scrollbar">
                {["all", "pending", "paid"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${
                      filter === f
                        ? "bg-[#2D2A26] text-white shadow-md"
                        : "text-gray-500 hover:text-[#cd1873] hover:bg-gray-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-800 text-lg font-bold">No orders found</p>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Orders will appear here once customers place them.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-5 sm:p-6 hover:bg-[#FFFDF5] transition-colors group"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
                          <div>
                            <h3 className="text-lg font-black text-[#2D2A26] mb-2 flex items-center gap-2">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 font-medium">
                              <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                                <DollarSign className="w-4 h-4 text-[#cd1873]" />
                                Total: <span className="font-bold text-[#2D2A26]">₹{order.totalAmount}</span>
                              </span>
                              <span className="bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                                Via: <span className="font-bold text-[#2D2A26] uppercase">{order.paymentMethod}</span>
                              </span>
                              <span className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] sm:text-xs border ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : "bg-yellow-50 text-yellow-600 border-yellow-200"
                              }`}>
                                {order.paymentStatus === "paid" ? "✓ Paid" : "○ Pending"}
                              </span>
                            </div>
                          </div>

                          {order.paymentMethod === "cash" && order.paymentStatus === "pending" && (
                            <button
                              onClick={() => markAsPaid(order._id)}
                              className="w-full md:w-auto px-5 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as Paid
                            </button>
                          )}
                        </div>

                        <div className="bg-[#FFFDF5] border border-[#f5a824]/20 rounded-xl p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
                          <ul className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <li key={idx} className="text-sm flex justify-between items-center pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                <span className="text-[#2D2A26] font-medium">{item.name}</span>
                                <span className="font-bold text-[#cd1873]">₹{item.price} <span className="text-gray-400 text-xs font-medium ml-1">× {item.quantity}</span></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}