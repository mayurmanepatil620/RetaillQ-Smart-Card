"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, TrendingUp, Users, Zap } from "lucide-react";
import { auth, googleProvider } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
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
    return data;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await sendTokenToBackend(idToken);

      // Save user email to localStorage
      localStorage.setItem("userEmail", userCredential.user.email || "");
      
      // Dispatch custom event to update navbar immediately
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { email: userCredential.user.email } 
      }));

      router.push("/seller/setup");
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      alert(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

      router.push("/seller/setup");
    } catch (error: any) {
      // 🛠️ THE FIX: Ignore the error if the user simply closed the popup
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request' || error.message.includes('auth/user-cancelled')) {
        console.log("Sign-up popup closed by user.");
        return; 
      }

      console.error("❌ Google signup error:", error);
      alert(error.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShoppingBag, text: "Manage Inventory" },
    { icon: TrendingUp, text: "Track Sales" },
    { icon: Users, text: "Customer Insights" },
    { icon: Zap, text: "Quick Payments" }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex font-sans text-[#2D2A26]">
      
      {/* Left Side - Clean Branding Panel */}
      <div className="hidden items-center lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        
        {/* Pill-shaped Logo Container */}
        <div className="inline-flex items-center gap-3 bg-transparent px-6 py-3 rounded-full shadow-sm border border-gray-100 mb-8 w-fit">
          <div className="w-8 h-8 bg-gradient-to-br from-[#f5a824] to-[#ea580c] rounded-lg flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            Retail<span className="text-[#f5a824]">IQ</span>
          </span>
        </div>

        {/* Massive Header text */}
        <h1 className="text-5xl xl:text-[3.75rem] font-black leading-[1.05] tracking-tighter uppercase mb-6">
          Welcome Back To <br />
          <span className="text-[#f5a824] text-5xl xl:text-[4.75rem]">Your Dashboard.</span>
        </h1>
        
        <p className="text-gray-500 text-lg font-medium w-full leading-relaxed">
          Sign in to continue managing your business operations, tracking inventory, and analyzing sales effortlessly.
        </p>
      </div>

      {/* Right Side - Login Form Card */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Logo (Only visible on small screens) */}
        <div className="lg:hidden flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-[#f5a824] to-[#ea580c] rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            Retail<span className="text-[#f5a824]">IQ</span>
          </span>
        </div>

        {/* Floating White Card */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-[#f5a824]/5 border border-gray-100 relative z-10">
          
          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#2D2A26] tracking-tight mb-2">Sign Up</h2>
            <p className="text-gray-500 font-medium text-sm">
              Create an account to get started.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#f5a824] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border border-gray-200 rounded-xl text-[#2D2A26] font-medium placeholder-gray-400 focus:border-[#f5a824] focus:ring-4 focus:ring-[#f5a824]/10 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#f5a824] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-transparent border border-gray-200 rounded-xl text-[#2D2A26] font-medium placeholder-gray-400 focus:border-[#f5a824] focus:ring-4 focus:ring-[#f5a824]/10 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#f5a824] to-[#ea580c] hover:from-[#e09920] hover:to-[#d84d0b] text-white font-black tracking-wide py-4 rounded-xl shadow-lg shadow-[#f5a824]/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  SIGNING UP...
                </span>
              ) : (
                <>
                  SIGN UP <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-sm font-bold">
              <span className="px-4 bg-white text-gray-400 uppercase tracking-widest text-[10px]">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#2D2A26] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>

        {/* Footer Links outside the card */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f5a824] hover:text-[#d98d1a] font-black transition-colors">
              Log In
            </Link>
          </p>
          <p className="text-[11px] text-gray-400 font-medium mt-3">
            By continuing, you agree to our{" "}
            <Link href="#" className="hover:text-gray-600 underline transition-colors">Terms</Link> and{" "}
            <Link href="#" className="hover:text-gray-600 underline transition-colors">Privacy Policy</Link>
          </p>
        </div>

      </div>
    </div>
  );
}