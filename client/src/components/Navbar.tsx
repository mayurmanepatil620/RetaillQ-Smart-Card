"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  LogIn,
  LogOut,
  Settings,
  LayoutDashboard,
  ListOrdered,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync Auth State
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleAuthChange = (event: any) => {
      const { email } = event.detail;
      setUserEmail(email || null);
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () => window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // HIDE LOGIC: Don't show Navbar on Home or general Dashboard landing
  if (pathname === "/" || pathname === "/dashboard") {
    return null;
  }

  const handleLogout = () => {
    // Clear session data
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsDropdownOpen(false);
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { email: null } }));
    
    // Redirect to the home page
    router.push("/");
  };

  const getUserInitials = (email: string) => {
    return email.split("@")[0].charAt(0).toUpperCase();
  };

  return (
    <nav className="h-[70px] w-full bg-transparent flex items-center justify-end">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all border shadow-sm ${
            isDropdownOpen 
              ? "bg-[#FFFBEB] border-[#f5a824]/30" 
              : "bg-white border-gray-200 hover:border-[#f5a824]/50"
          }`}
        >
          {userEmail ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-[#f5a824] to-[#ea580c] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
                {getUserInitials(userEmail)}
              </div>
              <div className="text-left hidden sm:block pr-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Store Owner</p>
                <p className="text-sm font-bold text-[#2D2A26] leading-none truncate max-w-[120px]">
                  {userEmail.split("@")[0]}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <User size={18} />
              </div>
              <span className="text-sm font-bold text-[#2D2A26] pr-2">Account</span>
            </>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-[#f5a824]" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/5 overflow-hidden z-[100]">
            {userEmail ? (
              <>
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-[#2D2A26] truncate">{userEmail}</p>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-[#FFFBEB] hover:text-[#f5a824] rounded-xl transition-colors group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard size={18} className="text-gray-400 group-hover:text-[#f5a824]" />
                    <span className="text-sm font-bold">Dashboard</span>
                  </Link>
                  <Link
                    href="/seller/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-[#FFFBEB] hover:text-[#f5a824] rounded-xl transition-colors group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ListOrdered size={18} className="text-gray-400 group-hover:text-[#f5a824]" />
                    <span className="text-sm font-bold">Orders</span>
                  </Link>
                  <Link
                    href="/seller/setup"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-[#FFFBEB] hover:text-[#f5a824] rounded-xl transition-colors group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={18} className="text-gray-400 group-hover:text-[#f5a824]" />
                    <span className="text-sm font-bold">Settings</span>
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-sm font-bold"
                  >
                    <LogOut size={18} />
                    Logout Session
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3 space-y-2">
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-[#2D2A26] hover:bg-gray-50 rounded-xl transition-colors">
                  <LogIn size={18} className="text-[#f5a824]" />
                  <span className="text-sm font-bold">Login to Account</span>
                </Link>
                <div className="pt-1 border-t border-gray-100">
                  <Link href="/signup">
                    <button className="w-full mt-2 bg-gradient-to-r from-[#f5a824] to-[#ea580c] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md shadow-[#f5a824]/20">
                      Create a Store
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}