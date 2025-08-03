import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    questions: number;
    responses: number;
  };
}

const PAGE_SIZE = 10;

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

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
  }, [navigate]);

  const fetchSessions = async (token: string, adminId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        navigate("/admin/login");
      } else {
        setError("Failed to fetch sessions");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
  const paginatedSessions = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-8 flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow">All Sessions</h1>
        <Link to="/admin/sessions/create" className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-base font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors w-full xs:w-auto justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </Link>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium shadow">{error}</div>}
      <div className="bg-white rounded-3xl shadow-xl overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-blue-100 via-white to-indigo-100 rounded-t-3xl">
            <tr>
              <th className="px-2 sm:px-6 py-4 text-left font-bold text-blue-800 uppercase tracking-wider">Title</th>
              <th className="px-2 sm:px-6 py-4 text-left font-bold text-blue-800 uppercase tracking-wider">Date</th>
              <th className="px-2 sm:px-6 py-4 text-left font-bold text-blue-800 uppercase tracking-wider">Questions</th>
              <th className="px-2 sm:px-6 py-4 text-left font-bold text-blue-800 uppercase tracking-wider">Responses</th>
              <th className="px-2 sm:px-6 py-4 text-left font-bold text-blue-800 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedSessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-lg font-semibold">No sessions found.</td>
              </tr>
            ) : (
              paginatedSessions.map((session) => (
                <tr key={session.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900 break-words max-w-xs group-hover:text-blue-700 transition-colors">{session.title}</td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-gray-700">{new Date(session.date).toLocaleDateString()}</td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-blue-700 font-bold">{session._count.questions}</td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-green-700 font-bold">{session._count.responses}</td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <Link to={`/admin/sessions/${session.id}`} className="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2m6 0V9a2 2 0 00-2-2M9 7a2 2 0 012-2h2a2 2 0 012 2v2" />
                      </svg>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col xs:flex-row justify-center items-center mt-8 gap-2 xs:gap-0">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50 text-sm font-semibold w-full xs:w-auto shadow"
          >
            Previous
          </button>
          <span className="mx-3 text-gray-700 text-base font-medium">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50 text-sm font-semibold w-full xs:w-auto shadow"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
