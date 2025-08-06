"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  PlusSquare,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft
} from "lucide-react"

interface Admin {
  id: string
  name: string
  email: string
  bio?: string
  mobileNumber?: string
}

export default function Sidebar() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const adminData = localStorage.getItem("admin")
    if (adminData) setAdmin(JSON.parse(adminData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("admin")
    navigate("/admin/login")
  }

  const isActive = (path: string) =>
    location.pathname === path
      ? "bg-blue-700 text-white"
      : "text-blue-100 hover:bg-blue-600 hover:text-white"

  const links = [
    { to: "/admin/sessions", label: "Sessions", icon: LayoutDashboard },
    { to: "/admin/sessions/create", label: "New Session", icon: PlusSquare },
    { to: "/admin/contacted", label: "Contacted", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/profile", label: "Profile", icon: User }
  ]

  if (!admin) return null

  return (
    <>
      {/* Toggle for mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 bg-blue-800 text-white p-2 rounded-md shadow md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Overlay (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-screen bg-blue-800 text-white transition-all duration-300 ease-in-out flex flex-col ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-blue-700">
          {!collapsed ? (
            <h1 className="text-xl font-bold"> <Link to="/admin/dashboard">Feedback</Link> </h1>
          ) : (
            <span className="text-xl font-bold"><Link to="/admin/dashboard">F</Link></span>
          )}
          <button
            onClick={() =>
              mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)
            }
            className="text-white bg-white/10 p-1 rounded hover:bg-white/20"
          >
            {mobileOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Admin Info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-blue-700 text-sm">
            <p className="font-medium">{admin.name}</p>
            <p className="text-blue-200 truncate">{admin.email}</p>
          </div>
        )}

        {/* Links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive(to)
                } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && label}
            </Link>
          ))}

          <button
            onClick={() => {
              handleLogout()
              setMobileOpen(false)
            }}
            className={`flex items-center gap-3 px-3 py-2 mt-4 text-left rounded-md text-sm font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-colors ${collapsed ? "justify-center" : ""
              }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && "Logout"}
          </button>
        </nav>

        {/* Show collapsed open button */}
        {collapsed && (
          <div className="hidden md:flex justify-center pb-4">
            <button
              onClick={() => setCollapsed(false)}
              className="bg-white text-blue-800 w-6 h-6 rounded-full shadow hover:scale-105 transition"
            >
              <ChevronRight className="w-4 h-4 mx-auto" />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
