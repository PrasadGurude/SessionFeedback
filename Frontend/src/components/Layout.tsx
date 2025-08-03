import React from "react";
import Navbar from "./Navbar";
import { useLocation, Outlet } from "react-router-dom";

const HIDE_NAVBAR_PATHS = ["/", "/admin/login", "/admin/register","/feedback/:sessionId"];

export default function Layout() {
  const location = useLocation();
  const hideNavbar = HIDE_NAVBAR_PATHS.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  );
}
