import { useEffect, useState } from "react"
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

const PAGE_SIZE = 10

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const admin = localStorage.getItem("admin")
    if (!token || !admin) {
      navigate("/admin/login")
      return
    }

    let adminId = ""
    try {
      adminId = JSON.parse(admin).id
    } catch {
      adminId = admin
    }

    fetchSessions(token, adminId)
  }, [navigate])

  const fetchSessions = async (token: string, adminId: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      } else if (response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("admin")
        navigate("/admin/login")
      } else {
        setError("Failed to fetch sessions")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(sessions.length / PAGE_SIZE)
  const paginatedSessions = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 drop-shadow">All Sessions</h1>
          <Link
            to="/admin/sessions/create"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium shadow">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-auto border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-blue-100 via-white to-indigo-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">Questions</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">Responses</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-lg font-semibold">
                    No sessions found.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-blue-50 transition group">
                    <td className="px-4 py-3 font-medium text-gray-900 group-hover:text-blue-700 break-words max-w-xs">
                      {session.title}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-blue-700 font-bold">{session._count.questions}</td>
                    <td className="px-4 py-3 text-green-700 font-bold">{session._count.responses}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/sessions/${session.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {paginatedSessions.length === 0 ? (
            <p className="text-center text-gray-500 text-base font-medium">No sessions found.</p>
          ) : (
            paginatedSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl shadow p-4 space-y-2 border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">{session.title}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(session.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Questions:</span> {session._count.questions}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Responses:</span> {session._count.responses}
                </p>
                <Link
                  to={`/admin/sessions/${session.id}`}
                  className="inline-flex items-center justify-center mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 shadow"
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50 text-sm font-semibold w-full sm:w-auto"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50 text-sm font-semibold w-full sm:w-auto"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionsPage
