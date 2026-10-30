// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
// import {
//   LayoutDashboard,
//   Activity,
//   ListOrdered,
//   Settings,
//   LogOut,
// } from "lucide-react";

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [userEmail, setUserEmail] = useState<string | null>(null);

//   useEffect(() => {
//     // 🛠️ FIX: Defer the localStorage read by one tick to prevent cascading render warnings
//     setTimeout(() => {
//       const email = localStorage.getItem("userEmail");
//       if (email) setUserEmail(email);
//     }, 0);

//     const handleAuthChange = (event: any) => {
//       const { email } = event.detail;
//       if (email) {
//         localStorage.setItem("userEmail", email);
//         setUserEmail(email);
//       } else {
//         localStorage.removeItem("userEmail");
//         setUserEmail(null);
//       }
//     };

//     window.addEventListener("authStateChanged", handleAuthChange);
//     return () =>
//       window.removeEventListener("authStateChanged", handleAuthChange);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("userEmail");
//     setUserEmail(null);
//     window.dispatchEvent(
//       new CustomEvent("authStateChanged", { detail: { email: null } })
//     );
//   };

//   const navItem = (href: string) =>
//     `flex items-center gap-3 px-4 py-3 rounded-lg transition
//      ${pathname === href
//       ? "bg-orange-600 text-white"
//       : "text-slate-400 hover:bg-slate-800 hover:text-white"
//     }`;

//   return (
//     <aside className="w-64 min-h-screen bg-gradient-to-r from-slate-900 via-black to-slate-900 text-white fixed">
//       {/* Logo */}
//             <div className="p-6 mb-4">
//          <Link href="/" className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-black text-white">R</div>
//             <span className="font-bold text-xl tracking-tighter">RetailIQ</span>
//          </Link>
//       </div>


//       {/* Nav */}
//       <nav className="p-4 space-y-2">
//         <Link href="/seller/dashboard" className={navItem("/seller/dashboard")}>
//           <LayoutDashboard className="w-5 h-5" />
//           Dashboard
//         </Link>

//         {/* Analytics Link */}
//         <Link href="/seller/analytics" className={navItem("/seller/analytics")}>
//           <Activity className="w-5 h-5" />
//           Analytics
//         </Link>

//         <Link href="/seller/orders" className={navItem("/seller/orders")}>
//           <ListOrdered className="w-5 h-5" />
//           Orders
//         </Link>

//         <Link href="/seller/setup" className={navItem("/seller/setup")}>
//           <Settings className="w-5 h-5" />
//           Settings
//         </Link>
//       </nav>

//       {/* Footer */}
//       <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
//         {userEmail && (
//           <p className="text-xs text-slate-400 truncate mb-3">
//             {userEmail}
//           </p>
//         )}
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
//         >
//           <LogOut className="w-5 h-5" />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }




"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  ListOrdered,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Defer the localStorage read by one tick to prevent cascading render warnings
    setTimeout(() => {
      const email = localStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    }, 0);

    const handleAuthChange = (event: any) => {
      const { email } = event.detail;
      if (email) {
        localStorage.setItem("userEmail", email);
        setUserEmail(email);
      } else {
        localStorage.removeItem("userEmail");
        setUserEmail(null);
      }
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () =>
      window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    window.dispatchEvent(
      new CustomEvent("authStateChanged", { detail: { email: null } })
    );
    // Optional: Force redirect to login page upon logout
    window.location.href = "/login";
  };

  const navItem = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-[#f5a824] to-[#ea580c] text-white shadow-md shadow-[#f5a824]/20"
        : "text-gray-500 hover:bg-[#FFFBEB] hover:text-[#B45309]"
    }`;
  };

  return (
    <aside className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto custom-scrollbar">
      <div>
        {/* Logo */}
        <div className="p-6 mb-2 border-b border-gray-100 sticky top-0 bg-white z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#cd1873] to-[#9e1056] rounded-xl flex items-center justify-center font-black text-white shadow-sm group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-black text-2xl tracking-tighter text-[#2D2A26] uppercase">
              Retail<span className="text-[#cd1873]">IQ</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <Link href="/seller/dashboard" className={navItem("/seller/dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <Link href="/seller/analytics" className={navItem("/seller/analytics")}>
            <Activity className="w-5 h-5" />
            Analytics
          </Link>

          <Link href="/seller/orders" className={navItem("/seller/orders")}>
            <ListOrdered className="w-5 h-5" />
            Orders
          </Link>

          <Link href="/seller/setup" className={navItem("/seller/setup")}>
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
        {userEmail && (
          <div className="mb-4 px-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Store</p>
            <p className="text-sm font-bold text-[#2D2A26] truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}



