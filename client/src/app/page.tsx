"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Store,
  Globe,
  User,
  ChevronDown,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  LogIn,
  Menu,
  X,
  HelpCircle
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.12 } 
  }
};

const mobileMenuVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  exit: { 
    x: "100%", 
    opacity: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  }
};

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { email: null } }));
  };

  return (
    <div className="bg-[#FFFDF5] text-[#2D2A26] selection:bg-[#f5a824]/20 selection:text-[#cd1873] overflow-x-hidden font-sans">

      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        isScrolled ? "py-3 bg-white/90 backdrop-blur-xl border-b border-[#f5a824]/30 shadow-sm" : "py-6 bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 md:w-16 md:h-14"
            >
                <Image 
                    src="/RetailIQ.png" 
                    alt="RetailIQ Logo" 
                    fill 
                    sizes="(max-width: 768px) 48px, 64px"
                    className="object-contain drop-shadow-sm"
                    priority
                />
            </motion.div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-[#2D2A26]">
              Retail<span className="text-[#f5a824]">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6" ref={dropdownRef}>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#f5a824]/40 hover:bg-[#f5a824]/5 hover:border-[#f5a824]/60 transition-all shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f5a824] to-[#cd1873] flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                  {userEmail ? userEmail[0].toUpperCase() : <User size={14} />}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#cd1873]' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 mt-4 w-60 bg-white border border-[#f5a824]/30 rounded-2xl p-2 shadow-2xl z-[110] overflow-hidden"
                  >
                    {userEmail ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 mb-1">
                          <p className="text-[10px] text-[#cd1873] font-bold uppercase tracking-widest">Active Store</p>
                          <p className="text-sm font-bold truncate text-[#2D2A26]">{userEmail}</p>
                        </div>
                        <DropdownItem href="/seller/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                        <DropdownItem href="/seller/orders" icon={<ListOrdered size={16} />} label="Orders" />
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold transition-all mt-1">
                          <LogOut size={16} /> Logout Session
                        </button>
                      </>
                    ) : (
                      <>
                        <DropdownItem href="/login" icon={<LogIn size={16} />} label="Sign In" />
                        <DropdownItem href="" icon={<HelpCircle size={16} />} label="Help" />

                        <Link href="/signup" className="block p-1">
                          <button className="w-full bg-[#f5a824] hover:bg-[#cd1873] text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95">Launch App</button>
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-[#2D2A26] z-50 bg-white/50 backdrop-blur-sm rounded-xl border border-[#f5a824]/40"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Sidebar Navigation */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#2D2A26]/20 backdrop-blur-sm z-[90] lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <motion.div 
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#FFFDF5] shadow-2xl z-[100] p-8 flex flex-col border-l border-[#f5a824]/30"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <span className="font-black text-xl uppercase tracking-tight">Menu</span>
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setIsMobileMenuOpen(false)} 
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                            {userEmail ? (
                                <>
                                    <div className="p-4 bg-[#f5a824]/5 rounded-2xl border border-[#f5a824]/30 mb-6 shadow-sm">
                                        <p className="text-[10px] font-black text-[#cd1873] uppercase tracking-widest mb-1">Store Owner</p>
                                        <p className="text-base font-black truncate">{userEmail}</p>
                                    </div>
                                    <MobileNavItem href="/seller/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                                    <MobileNavItem href="/seller/orders" icon={<ListOrdered size={20}/>} label="Orders" />
                                    <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 mt-4 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
                                        <LogOut size={20} /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileNavItem href="/login" icon={<LogIn size={20}/>} label="Sign In" />
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block pt-6">
                                        <motion.button 
                                          whileTap={{ scale: 0.95 }}
                                          className="w-full bg-gradient-to-r from-[#f5a824] to-[#cd1873] text-white py-4 rounded-xl font-black shadow-lg shadow-[#cd1873]/20 uppercase text-sm tracking-widest"
                                        >
                                          Create Store
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-cart.png"
            alt="Retail Background"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-[0.03] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-transparent to-[#FFFDF5]" />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-[#f5a824]/10 blur-[100px] rounded-full pointer-events-none" 
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeInUp} className="inline-block py-2 px-5 rounded-full border border-[#f5a824]/40 bg-[#f5a824]/10 text-[#cd1873] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-6 md:mb-10 shadow-sm">
              The Next Gen Retail OS
            </motion.span>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-[8.5rem] font-black mb-6 md:mb-8 tracking-tighter leading-[0.9] md:leading-[0.8] uppercase text-[#2D2A26]">
              Smart <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#f5a824] to-[#cd1873] drop-shadow-sm">Retailing.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 md:mb-14 font-medium leading-relaxed px-4">
              Transform your physical store into a digital powerhouse. Track inventory and scale effortlessly from one premium dashboard.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link href={userEmail ? "/seller/dashboard" : "/signup"} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(205, 24, 115, 0.2), 0 8px 10px -6px rgba(245, 168, 36, 0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto group bg-gradient-to-br from-[#f5a824] to-[#cd1873] text-white px-10 py-4 md:py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#cd1873]/20"
                >
                  {userEmail ? "Go to Dashboard" : "Launch Store"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "rgba(245, 168, 36, 0.05)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto bg-white border-2 border-[#f5a824] px-10 py-4 md:py-5 rounded-2xl font-black text-lg text-[#cd1873] transition-all shadow-sm"
              >
                Live Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-16 md:py-24 border-y border-[#f5a824]/20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center"
          >
            {[
              { label: "Active Shops", val: "10+" },
              { label: "Daily Sales", val: "₹50k+" },
              { label: "Uptime", val: "99.9%" },
              { label: "Support", val: "24/7" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <h3 className="text-4xl md:text-5xl font-black text-[#f5a824] mb-2 tracking-tighter drop-shadow-sm">{stat.val}</h3>
                <p className="text-[#cd1873]/80 text-[10px] md:text-xs uppercase font-bold tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-16 md:mb-24 text-center md:text-left"
          >
            <h2 className="text-[#cd1873] font-black mb-4 uppercase tracking-[0.4em] text-xs">Capabilities</h2>
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-black max-w-3xl tracking-tighter leading-tight uppercase text-[#2D2A26]">
              Everything you need to <span className="text-gray-300">own the market.</span>
            </h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <FeatureCard icon={<Zap />} title="Instant Billing" desc="Generate professional invoices in seconds. Support for all thermal printers." />
            <FeatureCard icon={<BarChart3 />} title="AI Analytics" desc="Predictive algorithms tell you exactly what to restock based on buyer trends." />
            <FeatureCard icon={<ShieldCheck />} title="Secure Cloud" desc="Bank-level encryption and daily automated backups ensure your data is never lost." />
            <FeatureCard icon={<Store />} title="Multi-Store" desc="Manage one location or a thousand. Our dashboard scales as fast as your ambition." />
            <FeatureCard icon={<Globe />} title="Online Catalog" desc="Turn your physical inventory into a beautiful public website with just one click." />

            {/* CTA CARD */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#f5a824] to-[#cd1873] flex flex-col justify-center items-center text-center shadow-2xl shadow-[#cd1873]/30"
            >
              <h4 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-white tracking-tighter italic uppercase drop-shadow-md">"Scale or <br className="hidden md:block" />get left behind."</h4>
              <Link href="/signup" className="w-full">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-[#FFFDF5] text-[#cd1873] px-8 py-4 rounded-xl font-black hover:bg-white transition-colors shadow-lg uppercase text-xs tracking-widest"
                >
                  Join RetailIQ
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-6 md:py-4 px-6 md:px-6 border-t border-[#f5a824]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="relative w-16 h-16">
              <Image 
                src="/RetailIQ.png" 
                alt="RetailIQ Logo" 
                fill 
                sizes="(max-width: 768px) 48px, 64px"
                className="object-contain drop-shadow-sm"
                priority 
              />
            </div>
            <p className="text-gray-500 text-sm text align-center font-medium italic">Smart Billing. Smarter Business.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link href="#" className="hover:text-[#f5a824] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#f5a824] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#f5a824] transition-colors">Support</Link>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">© 2026 RetailIQ Intelligence Systems.</p>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DropdownItem({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-[#cd1873] hover:bg-[#f5a824]/5 rounded-xl transition-all text-sm font-bold group">
      <span className="text-gray-400 group-hover:text-[#cd1873] transition-colors">{icon}</span> {label}
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 text-[#2D2A26] font-bold hover:bg-[#f5a824]/5 rounded-xl transition-colors">
            <span className="text-[#f5a824]">{icon}</span>
            {label}
        </Link>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.01 }}
      className="p-8 md:p-10 rounded-[2.5rem] bg-white border border-[#f5a824]/20 transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-[#f5a824]"
    >
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#f5a824]/10 flex items-center justify-center mb-6 md:mb-8 text-[#f5a824] group-hover:bg-gradient-to-br group-hover:from-[#f5a824] group-hover:to-[#cd1873] group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#cd1873]/20">
        <div className="group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <h4 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tighter uppercase text-[#2D2A26]">{title}</h4>
      <p className="text-gray-500 leading-relaxed font-medium text-sm">{desc}</p>
    </motion.div>
  );
}