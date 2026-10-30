"use client";
import * as XLSX from "xlsx";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import {
  Store,
  Package,
  PlusCircle,
  QrCode,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard,
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit3,
  Check,
  LayoutDashboard,
  ListOrdered,
  Settings,
  Tag,
  Menu,
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";
import app from "../../../lib/firebase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function SellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [showQRModal, setShowQRModal] = useState(false);

  
  // 🛠️ ADDED: State to control mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "", price: "", description: "", category: "", stock: "", image: null as File | null,
  });

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Smart URL checker to handle both Cloudinary and local image paths
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

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
        await fetchProducts(token);
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

      if (isEdit) {
        setEditingProduct({ ...editingProduct, newImage: file });
      } else {
        setNewProduct({ ...newProduct, image: file });
      }
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setProducts([...products, data.product]);
      setShowAddProduct(false);
      setNewProduct({ name: "", price: "", description: "", category: "", stock: "", image: null });
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const token = await user.getIdToken();
      const formData = new FormData();

      formData.append("name", editingProduct.name);
      formData.append("price", editingProduct.price);
      formData.append("description", editingProduct.description);
      formData.append("category", editingProduct.category);
      formData.append("stock", editingProduct.stock);

      if (editingProduct.newImage) {
        formData.append("image", editingProduct.newImage);
      }

      const res = await fetch(`${API_URL}/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setProducts(products.map(p => p._id === data.product._id ? data.product : p));
        setShowEditProduct(false);
        setEditingProduct(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCoupon = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/seller/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode, discountPercent: Number(discountPercent) })
      });

      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setCouponCode("");
        setDiscountPercent("");
        alert("Coupon created successfully!");
      } else {
        alert(data.message || "Failed to create coupon");
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="animate-spin h-12 w-12 border-t-4 border-[#cd1873] rounded-full"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Sales", value: `₹${products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toFixed(2)}`, icon: TrendingUp },
    { label: "Products", value: products.length, icon: Package },
    { label: "Total Stock", value: products.reduce((sum, p) => sum + (p.stock || 0), 0), icon: ShoppingBag },
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {activeRoute === "dashboard" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A26] tracking-tight">Welcome back, Seller</h1>
                  <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Here are today's stats from your shop!</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                          <p className="text-2xl sm:text-3xl font-black text-[#2D2A26] mt-2">{stat.value}</p>
                        </div>
                        <div className="bg-[#cd1873]/10 p-3 rounded-xl">
                          <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#cd1873]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Info */}
                {shop && (
                  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#f5a824]/10 p-3 sm:p-4 rounded-2xl">
                          <Store className="w-6 h-6 sm:w-8 sm:h-8 text-[#f5a824]" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A26]">{shop.name}</h2>
                          <p className="text-gray-500 text-sm font-medium">{shop.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowQRModal(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-[#f5a824] hover:bg-[#FFFBEB] text-[#f5a824] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <QrCode className="w-5 h-5" />
                        Show QR Code
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 bg-[#FFFDF5] p-4 rounded-xl border border-[#f5a824]/20">
                      <div className="flex gap-3 items-center">
                        <MapPin className="w-5 h-5 text-[#cd1873]" />
                        <span className="font-medium truncate">{shop.address}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Phone className="w-5 h-5 text-[#cd1873]" />
                        <span className="font-medium">{shop.mobile}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <CreditCard className="w-5 h-5 text-[#cd1873]" />
                        <span className="font-medium truncate">{shop.upiId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* COUPONS SECTION */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-[#2D2A26] flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-[#cd1873]" /> Marketing & Coupons
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
                    <div className="w-full sm:flex-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#2D2A26] uppercase font-medium focus:ring-2 focus:ring-[#cd1873]/20 focus:border-[#cd1873] outline-none transition-all"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Discount %</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#cd1873]/20 focus:border-[#cd1873] outline-none transition-all"
                        max="100"
                        min="1"
                      />
                    </div>
                    <button
                      onClick={handleAddCoupon}
                      disabled={!couponCode || !discountPercent}
                      className="w-full sm:w-auto px-6 py-3 bg-[#2D2A26] hover:bg-black text-white font-bold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                      Create
                    </button>
                  </div>

                  {/* Display existing coupons */}
                  {shop?.coupons?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {shop.coupons.map((c: any, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-[#f5a824]/10 text-[#B45309] rounded-lg text-sm font-bold border border-[#f5a824]/30 flex items-center gap-2">
                          {c.code} <span className="bg-[#B45309] text-white text-[10px] px-1.5 py-0.5 rounded-md">{c.discountPercent}% OFF</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#2D2A26] flex items-center gap-2">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a824]" />
                      Your Products
                    </h2>
                        <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-green-600 hover:bg-green-50 rounded-xl text-green-700 font-bold cursor-pointer transition-all">
      <Upload className="w-5 h-5" />
      Import Excel

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        //onChange={handleExcelImport}
      />
    </label>
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setShowAddProduct(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f5a824] hover:bg-[#e09920] rounded-xl text-white font-bold transition-all shadow-md shadow-[#f5a824]/20"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Add Product
                    </button>
                    
                  </div>

                  {products.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {products.map((p) => (
                        <div key={p._id} className="bg-[#FFFDF5] border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                          <div className="relative">
                            <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 sm:p-5">
                            <h3 className="font-bold text-[#2D2A26] mb-1 truncate">{p.name}</h3>
                            <p className="text-[#cd1873] font-black text-lg mb-2">₹{p.price}</p>
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4 truncate">{p.category}</p>

                            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                              <span className="text-gray-500 text-sm font-medium">
                                Stock: <span className="font-bold text-[#2D2A26]">{p.stock}</span>
                              </span>
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...p, newImage: null });
                                  setImagePreview(getImageUrl(p.image));
                                  setShowEditProduct(true);
                                }}
                                className="text-[#f5a824] hover:text-[#d98d1a] flex items-center gap-1.5 text-sm font-bold bg-[#f5a824]/10 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No products found. Add your first item!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Other Routes Placeholder */}
            {activeRoute === "orders" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center py-20">
                <h2 className="text-2xl font-bold text-[#2D2A26] mb-2">Orders</h2>
                <p className="text-gray-500">Orders functionality coming soon...</p>
              </div>
            )}

            {activeRoute === "settings" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center py-20">
                <h2 className="text-2xl font-bold text-[#2D2A26] mb-2">Settings</h2>
                <p className="text-gray-500">Settings functionality coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && shop && (
          <div className="fixed inset-0 bg-[#2D2A26]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mt-4">
                <h3 className="font-bold text-xl text-[#2D2A26] mb-6">Scan to Shop</h3>
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block shadow-sm">
                  <QRCodeCanvas
                    id="shopQR"
                    value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                    size={220}
                    includeMargin
                  />
                </div>
                <div className="mt-6 text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Direct Link</p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-xl">
                    <input
                      type="text"
                      readOnly
                      value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                      className="flex-1 bg-transparent text-[#2D2A26] font-medium text-xs sm:text-sm px-2 outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`);
                        alert("Link copied!");
                      }}
                      className="px-4 py-2 bg-[#2D2A26] hover:bg-black rounded-lg text-xs font-bold text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const canvas = document.querySelector("#shopQR") as HTMLCanvasElement;
                    const link = document.createElement("a");
                    link.download = `${shop.name}_QR.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }}
                  className="w-full mt-4 py-3 bg-[#cd1873] hover:bg-[#b01360] rounded-xl text-white font-bold transition-all shadow-md shadow-[#cd1873]/20"
                >
                  Download QR Code
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Form Modal for Adding AND Editing Products */}
      <AnimatePresence>
        {(showAddProduct || showEditProduct) && (
          <div className="fixed inset-0 bg-[#2D2A26]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="border-b border-gray-100 p-5 sm:p-6 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                <h2 className="text-xl sm:text-2xl font-black text-[#2D2A26]">
                  {showEditProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }}
                  className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  
                  {/* Image Upload Column */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Product Image *</label>
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-200 hover:border-[#f5a824] bg-gray-50 rounded-2xl p-8 sm:p-12 text-center transition-colors group">
                        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 group-hover:text-[#f5a824] mx-auto mb-4 transition-colors" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, showEditProduct)}
                          className="hidden"
                          id="imageUpload"
                        />
                        <label htmlFor="imageUpload" className="px-6 py-2.5 bg-white border border-gray-200 hover:border-[#f5a824] hover:text-[#f5a824] rounded-xl text-gray-700 font-bold cursor-pointer inline-flex items-center gap-2 shadow-sm transition-all">
                          <Upload className="w-4 h-4" />
                          Browse File
                        </label>
                        <p className="text-xs text-gray-400 mt-4 font-medium">JPEG, PNG, WEBP accepted</p>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                        <img src={imagePreview} alt="Preview" className="w-full h-[250px] sm:h-[300px] object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              setImagePreview(null);
                              showEditProduct ? setEditingProduct({ ...editingProduct, newImage: null }) : setNewProduct({ ...newProduct, image: null });
                            }}
                            className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transform hover:scale-110 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Fields Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Product Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Premium Wireless Headphones"
                        value={showEditProduct ? editingProduct?.name : newProduct.name}
                        onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Price (₹) *</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={showEditProduct ? editingProduct?.price : newProduct.price}
                          onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                          min="0" step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Stock</label>
                        <input
                          type="number"
                          placeholder="100"
                          value={showEditProduct ? editingProduct?.stock : newProduct.stock}
                          onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Electronics"
                        value={showEditProduct ? editingProduct?.category : newProduct.category}
                        onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                  <textarea
                    placeholder="Write a brief description about this product..."
                    value={showEditProduct ? editingProduct?.description : newProduct.description}
                    onChange={(e) => showEditProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={4}
                    className="w-full p-3.5 rounded-xl border border-gray-200 text-[#2D2A26] font-medium focus:ring-2 focus:ring-[#f5a824]/20 focus:border-[#f5a824] outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer (Sticky) */}
              <div className="border-t border-gray-100 p-5 sm:p-6 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditProduct ? handleUpdateProduct : handleAddProduct}
                  className="w-full sm:w-auto px-8 py-3 bg-[#cd1873] hover:bg-[#b01360] rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#cd1873]/20"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Custom Scrollbar for Modals */
        .custom-scrollbar::-webkit-scrollbar {
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