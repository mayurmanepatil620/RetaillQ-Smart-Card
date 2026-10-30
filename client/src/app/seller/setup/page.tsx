// "use client";

// import { useEffect, useState } from "react";
// import { Store, Phone, FileText, Upload, Building2, Clock, MapPin } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { getIdToken, onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../../lib/firebase";
// import Sidebar from "../../../components/Sidebar";

// export default function SellerSetupPage() {
//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [logo, setLogo] = useState<File | null>(null);
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);

//   const [form, setForm] = useState({
//     shopName: "",
//     ownerName: "",
//     mobile: "",
//     address: "",
//     shopType: "",
//     gstNumber: "",
//     upiId: "",
//     openingHours: "",
//     description: "",
//   });

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (u) => {
//       if (!u) router.push("/login");
//       else {
//         setUser(u);
//         await fetchShopProfile(u);
//       }
//     });
//     return () => unsub();
//   }, [router]);

//   const fetchShopProfile = async (u: any) => {
//     try {
//       setFetching(true);
//       const token = await getIdToken(u, true);
//       const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//       const res = await fetch(`${API_URL}/api/seller/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("No existing shop found");
//       const data = await res.json();
//       if (data.success && data.shop) {
//         const s = data.shop;
//         setForm({
//           shopName: s.name || "",
//           ownerName: s.ownerName || "",
//           mobile: s.mobile || "",
//           address: s.address || "",
//           shopType: s.type || "",
//           gstNumber: s.gstNumber || "",
//           upiId: s.upiId || "",
//           openingHours: `${s.openTime || ""} - ${s.closeTime || ""}`,
//           description: s.description || "",
//         });
//         if (s.logo) setLogoPreview(`${API_URL}${s.logo}`);
//       }
//     } catch (err) {
//       console.log("No existing shop profile, new setup required.");
//     } finally {
//       setFetching(false);
//     }
//   };

//   const update = (key: string, value: string) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 5 * 1024 * 1024) {
//       setError("File too large (max 5MB)");
//       return;
//     }
//     setLogo(file);
//     setLogoPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async () => {
//     if (!user) return router.push("/login");
//     setError(null);
//     setLoading(true);

//     try {
//       const token = await getIdToken(user, true);
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => fd.append(k, v));
//       if (logo) fd.append("logo", logo);

//       const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//       const res = await fetch(`${API_URL}/api/seller/register`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to save");

//       alert("Shop info saved successfully!");
//       router.push("/seller/dashboard");
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
      
//       <main className="ml-64 flex-1 p-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
//           <p className="text-gray-600 mt-1">Update your shop details and preferences</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
//           <div className="space-y-8">
//             {/* Basic Info */}
//             <section>
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
//                 <div className="bg-orange-100 p-2 rounded-lg">
//                   <Store className="w-5 h-5 text-orange-600" />
//                 </div>
//                 Basic Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Shop Name *
//                   </label>
//                   <input
//                     required
//                     placeholder="Enter shop name"
//                     value={form.shopName}
//                     onChange={(e) => update("shopName", e.target.value)}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Shop Type *
//                   </label>
//                   <select
//                     required
//                     value={form.shopType}
//                     onChange={(e) => update("shopType", e.target.value)}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   >
//                     <option value="">Select shop type</option>
//                     <option>Grocery</option>
//                     <option>Electronics</option>
//                     <option>Clothing</option>
//                     <option>Pharmacy</option>
//                     <option>Stationery</option>
//                     <option>Other</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     GST Number (Optional)
//                   </label>
//                   <input
//                     placeholder="Enter GST number"
//                     value={form.gstNumber}
//                     onChange={(e) => update("gstNumber", e.target.value)}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* Contact */}
//             <section>
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
//                 <div className="bg-blue-100 p-2 rounded-lg">
//                   <Phone className="w-5 h-5 text-blue-600" />
//                 </div>
//                 Contact Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mobile Number *
//                   </label>
//                   <input
//                     required
//                     placeholder="Enter mobile number"
//                     value={form.mobile}
//                     onChange={(e) => update("mobile", e.target.value)}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     UPI ID
//                   </label>
//                   <input
//                     placeholder="yourname@upi"
//                     value={form.upiId}
//                     onChange={(e) => update("upiId", e.target.value)}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Shop Address *
//                   </label>
//                   <textarea
//                     required
//                     placeholder="Enter complete shop address"
//                     value={form.address}
//                     onChange={(e) => update("address", e.target.value)}
//                     rows={3}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* Extra */}
//             <section>
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
//                 <div className="bg-green-100 p-2 rounded-lg">
//                   <FileText className="w-5 h-5 text-green-600" />
//                 </div>
//                 Additional Details
//               </h3>
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Opening Hours
//                   </label>
//                   <input
//                     placeholder="e.g. 9:00 AM - 9:00 PM"
//                     value={form.openingHours}
//                     onChange={(e) => update("openingHours", e.target.value)}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     placeholder="Tell customers about your shop"
//                     value={form.description}
//                     onChange={(e) => update("description", e.target.value)}
//                     rows={4}
//                     className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Shop Logo
//                   </label>
//                   <div className="flex items-start gap-6">
//                     <div className="flex-1">
//                       <label
//                         htmlFor="logo-upload"
//                         className="block border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-orange-400 cursor-pointer text-center bg-gray-50 hover:bg-gray-100 transition-colors"
//                       >
//                         <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
//                         <p className="text-sm text-gray-600">Click to upload logo</p>
//                         <p className="text-xs text-gray-500 mt-1">Maximum 5MB</p>
//                       </label>
//                       <input
//                         id="logo-upload"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleLogoUpload}
//                         className="hidden"
//                       />
//                     </div>
//                     {logoPreview && (
//                       <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
//                         <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <div className="flex justify-end pt-6 border-t border-gray-200">
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Saving..." : "Save Changes"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { Store, Phone, FileText, Upload, Clock, MapPin, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";
import Navbar from "@/components/Navbar";
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

export default function SellerSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    mobile: "",
    address: "",
    shopType: "",
    gstNumber: "",
    upiId: "",
    openingHours: "",
    description: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) router.push("/login");
      else {
        setUser(u);
        await fetchShopProfile(u);
      }
    });
    return () => unsub();
  }, [router]);

  const fetchShopProfile = async (u: any) => {
    try {
      setFetching(true);
      const token = await getIdToken(u, true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No existing shop found");
      const data = await res.json();
      if (data.success && data.shop) {
        const s = data.shop;
        setForm({
          shopName: s.name || "",
          ownerName: s.ownerName || "",
          mobile: s.mobile || "",
          address: s.address || "",
          shopType: s.type || "",
          gstNumber: s.gstNumber || "",
          upiId: s.upiId || "",
          openingHours: `${s.openTime || ""} - ${s.closeTime || ""}`,
          description: s.description || "",
        });
        if (s.logo) setLogoPreview(`${API_URL}${s.logo}`);
      }
    } catch (err) {
      console.log("No existing shop profile, new setup required.");
    } finally {
      setFetching(false);
    }
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return router.push("/login");
    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken(user, true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append("logo", logo);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/seller/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      alert("Shop info saved successfully!");
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FFFDF5]">
        <div className="animate-spin h-12 w-12 border-t-4 border-[#cd1873] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FFFDF5] text-[#2D2A26] font-sans overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden lg:block w-64 h-full flex-shrink-0 z-30 bg-white border-r border-gray-100 shadow-sm">
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
          <div className="max-w-4xl mx-auto pb-10">
            
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A26] tracking-tight">Shop Settings</h1>
                <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Update your public store details and preferences</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
                <div className="space-y-10">
                  
                  {/* Basic Info */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="bg-[#f5a824]/10 p-2.5 rounded-xl">
                        <Store className="w-5 h-5 text-[#f5a824]" />
                      </div>
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Shop Name *</label>
                        <input
                          required
                          placeholder="e.g. Mayur's Electronics"
                          value={form.shopName}
                          onChange={(e) => update("shopName", e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Shop Type *</label>
                        <select
                          required
                          value={form.shopType}
                          onChange={(e) => update("shopType", e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all appearance-none bg-white"
                        >
                          <option value="" disabled>Select shop type</option>
                          <option>Grocery</option>
                          <option>Electronics</option>
                          <option>Clothing</option>
                          <option>Pharmacy</option>
                          <option>Stationery</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Owner Name</label>
                        <input
                          placeholder="e.g. Mayur Mane Patil"
                          value={form.ownerName}
                          onChange={(e) => update("ownerName", e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">GST Number (Optional)</label>
                        <input
                          placeholder="Enter GST number"
                          value={form.gstNumber}
                          onChange={(e) => update("gstNumber", e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="bg-[#cd1873]/10 p-2.5 rounded-xl">
                        <Phone className="w-5 h-5 text-[#cd1873]" />
                      </div>
                      Contact & Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Mobile Number *</label>
                        <input
                          required
                          placeholder="e.g. +91 9876543210"
                          value={form.mobile}
                          onChange={(e) => update("mobile", e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#cd1873]/20 focus:border-[#cd1873] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">UPI ID (For Payments)</label>
                        <input
                          placeholder="e.g. yourname@upi"
                          value={form.upiId}
                          onChange={(e) => update("upiId", e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#cd1873]/20 focus:border-[#cd1873] outline-none transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Complete Shop Address *</label>
                        <textarea
                          required
                          placeholder="Enter your full physical address..."
                          value={form.address}
                          onChange={(e) => update("address", e.target.value)}
                          rows={3}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#cd1873]/20 focus:border-[#cd1873] outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Extra & Logo */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="bg-green-100 p-2.5 rounded-xl">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      Branding & Details
                    </h3>
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Shop Description</label>
                          <textarea
                            placeholder="Tell customers what makes your shop special..."
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                            rows={3}
                            className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Opening Hours</label>
                          <input
                            placeholder="e.g. 9:00 AM - 9:00 PM"
                            value={form.openingHours}
                            onChange={(e) => update("openingHours", e.target.value)}
                            className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Shop Logo</label>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          <div className="w-full sm:flex-1">
                            <label
                              htmlFor="logo-upload"
                              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#f5a824] rounded-2xl p-8 cursor-pointer bg-gray-50/50 hover:bg-[#FFFDF5] transition-all group"
                            >
                              <Upload className="w-8 h-8 mb-3 text-gray-300 group-hover:text-[#f5a824] transition-colors" />
                              <p className="text-sm font-bold text-[#2D2A26]">Click to upload logo</p>
                              <p className="text-xs text-gray-400 mt-1 font-medium">JPEG, PNG up to 5MB</p>
                            </label>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </div>
                          
                          {logoPreview && (
                            <div className="w-32 h-32 flex-shrink-0 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                              <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                      <X className="w-5 h-5" />
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-8 border-t border-gray-100">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-[#cd1873] to-[#9e1056] hover:from-[#b01360] hover:to-[#8a0e4a] text-white rounded-xl font-bold transition-all shadow-md shadow-[#cd1873]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>

      <style jsx global>{`
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