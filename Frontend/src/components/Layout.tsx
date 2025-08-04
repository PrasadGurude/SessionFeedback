import React from "react";
import Navbar from "./Navbar";
import { useLocation, Outlet } from "react-router-dom";
import SidebarLayout from "./SidebarLayout";

// const HIDE_NAVBAR_PATHS = ["/", "/admin/login", "/admin/register","/feedback/:sessionId"];

// export default function Layout() {
//   const location = useLocation();
//   const hideNavbar = HIDE_NAVBAR_PATHS.includes(location.pathname);

//   return (
//     <>
//       {!hideNavbar && <Navbar />}
//       <Outlet />
//     </>
//   );
// }

// layouts/AdminLayout.tsx
// import Sidebar from "@/components/Sidebar"

export default function AdminLayout() {
  return (
    <div className="flex">
      <SidebarLayout />
      <main className="flex-1 p-4 overflow-y-auto h-screen bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}

