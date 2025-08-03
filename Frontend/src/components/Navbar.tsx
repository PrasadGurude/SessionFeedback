"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"


interface Admin {
  id: string
  name: string
  email: string
  bio?: string
  mobileNumber?: string
}

export default function Navbar() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    const adminData = localStorage.getItem("admin")
    if (adminData) {
      setAdmin(JSON.parse(adminData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("admin")
    navigate("/admin/login")
  }

  const isActive = (path: string) => {
    return pathname === path ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-600 hover:text-white"
  }

  if (!admin) {
    return null
  }

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">Feedback System</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/admin/sessions"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/sessions")}`}
            >
              Sessions
            </Link>
            <Link
              to="/admin/sessions/create"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/sessions/create")}`}
            >
              New Session
            </Link>
            <Link
              to="/admin/contacted"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/contacted")}`}
            >
              Contacted
            </Link>
            <Link
              to="/admin/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/settings")}`}
            >
              Settings
            </Link>
            <Link
              to="/admin/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/profile")}`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-blue-100 hover:text-white focus:outline-none focus:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/admin/sessions"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive("/admin/sessions")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sessions
              </Link>
              <Link
                to="/admin/sessions/create"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive("/admin/sessions/create")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                New Session
              </Link>
              <Link
                to="/admin/contacted"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive("/admin/contacted")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contacted
              </Link>
              <Link
                to="/admin/settings"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive("/admin/settings")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <Link
                to="/admin/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive("/admin/profile")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
