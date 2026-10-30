"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowRight } from "lucide-react";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } } // FIXED: Added opacity: 1
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendTokenToBackend = async (idToken: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verifyToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Backend verification failed:", data);
      throw new Error(data.message || "Failed to verify user on server");
    }
    console.log("User verified on backend:", data);
    return data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await sendTokenToBackend(idToken);

      // Save user email to localStorage
      localStorage.setItem("userEmail", userCredential.user.email || "");
      
      // Dispatch custom event to update navbar immediately
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { email: userCredential.user.email } 
      }));

      router.push("/seller/dashboard");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await sendTokenToBackend(idToken);

      // Save Google user email
      localStorage.setItem("userEmail", result.user.email || "");
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { email: result.user.email } 
      }));

      router.push("/seller/dashboard");
    } catch (error: any) {
      console.error("Google login error:", error);
      alert(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D2A26] selection:bg-[#F59E0B]/20 selection:text-[#B45309] flex font-sans overflow-hidden">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div className="hidden items-center lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F59E0B]/10 blur-[100px] rounded-full pointer-events-none" 
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#FFFDF5] to-transparent z-10" />
        </div>
        
        <div className="relative z-20 flex flex-col justify-center px-16 max-w-xl">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            
            
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 mb-8 bg-white p-3 pr-6 rounded-full shadow-sm border border-[#FDE68A]/50">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#EA580C] rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase text-[#2D2A26]">
                Retail<span className="text-[#F59E0B]">IQ</span>
              </span>
            </motion.div>
            
            <h1 className="text-5xl xl:text-[3.05rem] font-black leading-[1.05] tracking-tighter uppercase mb-6">
                      Welcome Back To <br />
                      <span className="text-[#f5a824] text-5xl xl:text-[4.75rem]">Your Dashboard.</span>
                    </h1>
            
            <p className="text-gray-500 text-lg font-medium w-full leading-relaxed">
              Sign in to continue managing your business operations, tracking inventory, and analyzing sales effortlessly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div variants={fadeInUp} className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#EA580C] rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-[#2D2A26]">
              Retail<span className="text-[#F59E0B]">IQ</span>
            </span>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-[2rem] border border-[#FDE68A]/50 p-8 sm:p-10 shadow-xl shadow-[#F59E0B]/5 relative overflow-hidden">
            
            {/* Form Header */}
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-3xl font-black text-[#2D2A26] mb-2 tracking-tight">Sign In</h2>
              <p className="text-gray-500 text-sm font-medium">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F59E0B] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FFFDF5] border border-gray-200 rounded-xl text-[#2D2A26] placeholder-gray-400 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 outline-none transition-all font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-bold text-[#F59E0B] hover:text-[#B45309] transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F59E0B] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-[#FFFDF5] border border-gray-200 rounded-xl text-[#2D2A26] placeholder-gray-400 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F59E0B] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#F59E0B] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-black py-4 rounded-xl shadow-lg shadow-[#F59E0B]/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-[#2D2A26] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </motion.button>
          </motion.div>

          {/* Footer Link */}
          <motion.p variants={fadeInUp} className="text-center text-sm text-gray-500 mt-8 font-medium">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#F59E0B] hover:text-[#EA580C] font-black transition-colors">
              Create a Store
            </Link>
          </motion.p>

          {/* Terms */}
          <motion.p variants={fadeInUp} className="text-center text-xs text-gray-400 mt-4 font-medium">
            By continuing, you agree to our{" "}
            <Link href="#" className="hover:text-[#F59E0B] underline transition-colors">Terms</Link>{" "}
            and{" "}
            <Link href="#" className="hover:text-[#F59E0B] underline transition-colors">Privacy Policy</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}