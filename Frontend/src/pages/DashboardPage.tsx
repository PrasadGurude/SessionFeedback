
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Link, useNavigate } from "react-router-dom"


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"

interface Session {
  id: string
  title: string
  description: string
  date: string
  admin: {
    id: string
    name: string
    email: string
  }
  _count: {
    questions: number
    responses: number
  }
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalContacts: 0,
    totalResponses: 0,
  })
  const navigate = useNavigate()



  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    if (!token || !admin) {
      navigate("/admin/login");
      return;
    }
    let adminId = "";
    try {
      adminId = JSON.parse(admin).id;
    } catch {
      adminId = admin;
    }
    fetchSessions(token, adminId);
    fetchContactsCount(adminId);
  }, [navigate]);

  const fetchContactsCount  = async (adminId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/${adminId}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats((prev) => ({ ...prev, totalContacts: data.length }));
    } catch (err) {
      console.error("Failed to fetch contacts count:", err);
    }
  }

  const fetchSessions = async (token: string, adminId: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data)

        // Calculate stats
        const totalResponses = data.reduce((acc: number, session: Session) => acc + session._count.responses, 0)

        setStats((prev) => ({
          ...prev,
          totalSessions: data.length,
          totalResponses,
        }))
      } else if (response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("admin")
        navigate("/admin/login")
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow">Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Overview of your feedback sessions and analytics</p>
        </div>
        <Link
          to="/admin/sessions/create"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-200 to-blue-50 rounded-2xl shadow-lg p-8 flex items-center gap-6 border border-blue-300 hover:scale-105 transition-transform">
          <div className="p-4 bg-blue-300 rounded-full">
            <svg className="w-9 h-9 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-blue-800">Total Sessions</p>
            <p className="text-3xl font-extrabold text-blue-900">{stats.totalSessions}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-200 to-green-50 rounded-2xl shadow-lg p-8 flex items-center gap-6 border border-green-300 hover:scale-105 transition-transform">
          <div className="p-4 bg-green-300 rounded-full">
            <svg className="w-9 h-9 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 14v7m-4-4h8" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-green-800">Total Contacts</p>
            <p className="text-3xl font-extrabold text-green-900">{stats.totalContacts}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-200 to-purple-50 rounded-2xl shadow-lg p-8 flex items-center gap-6 border border-purple-300 hover:scale-105 transition-transform">
          <div className="p-4 bg-purple-300 rounded-full">
            <svg className="w-9 h-9 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-purple-800">Total Responses</p>
            <p className="text-3xl font-extrabold text-purple-900">{stats.totalResponses}</p>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-3xl shadow-xl overflow-x-auto border border-gray-100">
        <div className="px-4 xs:px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-t-3xl">
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Recent Sessions</h2>
            <Link
              to="/admin/sessions/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors w-full xs:w-auto justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Session
            </Link>
          </div>
        </div>

        <div className="p-4 xs:p-8">
          {sessions.length === 0 ? (
            <div className="text-center py-10 sm:py-16">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-500 mb-5 text-base">Create your first feedback session to get started.</p>
              <Link
                to="/admin/sessions/create"
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-lg shadow"
              >
                Create Session
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="group border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow hover:shadow-2xl transition-all duration-200 hover:scale-[1.025] flex flex-col justify-between min-h-[170px]"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1 truncate">{session.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2 break-words">{session.description}</p>
                    <div className="flex flex-wrap items-center mt-1 text-xs text-gray-500 gap-x-2 gap-y-1">
                      <span>{format(new Date(session.date), "MMM dd, yyyy")}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>{session._count.questions} questions</span>
                      <span className="hidden xs:inline">•</span>
                      <span>{session._count.responses} responses</span>
                    </div>
                  </div>
                  <div className="flex flex-row space-x-2 mt-4 w-full">
                    <Link
                      to={`/admin/sessions/${session.id}`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/analytics/${session.id}`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center font-medium shadow"
                    >
                      Analytics
                    </Link>
                  </div>
                </div>
              ))}

              {sessions.length > 5 && (
                <div className="sm:col-span-2 text-center pt-4">
                  <Link to="/admin/sessions" className="text-blue-600 hover:text-blue-700 font-semibold text-base">
                    View all sessions →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
