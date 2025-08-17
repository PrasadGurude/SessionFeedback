
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Link , useNavigate, useParams } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"

interface Question {
  id: string
  text: string
  type: "TEXT" | "YES_NO" | "RATING"
  isRequired: boolean
  sessionId: string
}
  
interface SessionDetails {
  id: string
  title: string
  description: string
  date: string
  admin: {
    id: string
    name: string
    email: string
  }
  questions: Question[]
  responses: any[]
}

export default function SessionDetailsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "TEXT" as "TEXT" | "YES_NO" | "RATING",
    isRequired: true,
  })
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [error, setError] = useState("")
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<{ id: string; index: number } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/admin/login")
      return
    }

    if (sessionId === "create") {
      navigate("/admin/sessions/create")
      return
    }

    fetchSession(token)
  }, [sessionId, navigate])

  const fetchSession = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(response)
        setSession(data)
      } else if (response.status === 401) {
        navigate("/admin/login")
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingQuestion(true)
    setError("")

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/admin/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questions: [newQuestion],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Backend returns { message: "Questions added successfully", questions: [...] }
        setSession((prev) =>
          prev
            ? {
                ...prev,
                questions: [...prev.questions, ...data.questions],
              }
            : null,
        )
        setNewQuestion({ text: "", type: "TEXT", isRequired: true })
        setShowAddQuestion(false)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to add question")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setAddingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/admin/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Backend returns { message: "Question removed successfully" }
        setSession((prev) =>
          prev
            ? {
                ...prev,
                questions: prev.questions.filter((q) => q.id !== questionId),
              }
            : null,
        )
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete question")
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      setError("Network error. Please try again.")
    }
  }

  const startEditQuestion = (question: Question, index: number) => {
    setNewQuestion({
      text: question.text,
      type: question.type,
      isRequired: question.isRequired,
    })
    setEditingQuestion({ id: question.id, index })
    setShowAddQuestion(true)
  }

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuestion) return

    setAddingQuestion(true)
    setError("")

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/admin/login")
      return
    }

    try {
      // Delete the old question
      await fetch(`${API_BASE_URL}/questions/${editingQuestion.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Add the updated question
      const response = await fetch(`${API_BASE_URL}/questions/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questions: [newQuestion],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSession((prev) => {
          if (!prev) return null
          const updatedQuestions = [...prev.questions]
          updatedQuestions.splice(editingQuestion.index, 1, ...data.questions)
          return {
            ...prev,
            questions: updatedQuestions,
          }
        })
        setNewQuestion({ text: "", type: "TEXT", isRequired: true })
        setShowAddQuestion(false)
        setEditingQuestion(null)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update question")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setAddingQuestion(false)
    }
  }

  const cancelEdit = () => {
    setNewQuestion({ text: "", type: "TEXT", isRequired: true })
    setEditingQuestion(null)
    setShowAddQuestion(false)
    setError("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session not found</h2>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
          <Link
            to="/admin/sessions"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  const feedbackUrl = `${window.location.origin}/feedback/${sessionId}`

  return (
    <div className="max-w-7xl mx-auto px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
          <div className="w-full md:w-auto">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 break-words leading-tight">{session.title}</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-xs xs:text-sm sm:text-base">{format(new Date(session.date), "PPP 'at' p")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 md:mt-0 w-full md:w-auto">
            <Link
              to={`/admin/analytics/${sessionId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 text-sm sm:text-base justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Analytics
            </Link>
            <Link
              to={`/admin/qrcode/${sessionId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm sm:text-base justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 11a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"
                />
              </svg>
              QR Code
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
        {/* Session Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="px-2 xs:px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Session Information</h2>
            </div>
            <div className="p-2 xs:p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{session.description}</p>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Questions</label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">{session.questions.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Responses</label>
                  <p className="mt-1 text-2xl font-bold text-green-600">{session.responses.length}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Public Feedback URL</label>
                <div className="mt-1 flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
                  <input
                    value={feedbackUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(feedbackUrl)}
                    className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* View Questions Button */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to={`/feedback/${sessionId}`}
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  View Questions as Participant
                </Link>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="px-2 xs:px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Questions ({session.questions.length})</h2>
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 w-full xs:w-auto justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>
              </div>
            </div>
            <div className="p-2 xs:p-4 sm:p-6">
              {session.questions.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600 mb-4">Add your first question to start collecting feedback.</p>
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {session.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-2 xs:p-4">
                      <div className="flex flex-col xs:flex-row justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                question.type === "TEXT"
                                  ? "bg-blue-100 text-blue-800"
                                  : question.type === "YES_NO"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {question.type === "TEXT" ? "Text" : question.type === "YES_NO" ? "Yes/No" : "Rating"}
                            </span>
                            {question.isRequired && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900">{question.text}</p>
                        </div>
                        <div className="flex flex-row space-x-2 mt-2 xs:mt-0 xs:ml-4">
                          <button
                            onClick={() => startEditQuestion(question, index)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Question Form */}
        <div>
          {showAddQuestion && (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <div className="px-2 xs:px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {editingQuestion ? "Edit Question" : "Add New Question"}
                  </h2>
                  <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion} className="p-2 xs:p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-xs sm:text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="questionText" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      id="questionText"
                      placeholder="Enter your question..."
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, text: e.target.value }))}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="questionType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      id="questionType"
                      value={newQuestion.type}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({ ...prev, type: e.target.value as "TEXT" | "YES_NO" | "RATING" }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="TEXT">Text Response</option>
                      <option value="YES_NO">Yes/No</option>
                      <option value="RATING">Rating (1-5)</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={newQuestion.isRequired}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, isRequired: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRequired" className="ml-2 text-xs sm:text-sm text-gray-700">
                      Required question
                    </label>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingQuestion}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      {addingQuestion ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {editingQuestion ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {editingQuestion ? "Update Question" : "Add Question"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
