

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const QUESTION_TYPES = [
  { label: "Text", value: "TEXT" },
  { label: "Yes/No", value: "YES_NO" },
  { label: "Rating", value: "RATING" },
];

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", type: "TEXT", isRequired: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      )
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { text: "", type: "TEXT", isRequired: true }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title || !description || !date) {
      setError("Title, description, and date are required.");
      return;
    }
    if (questions.some(q => !q.text || !q.type)) {
      setError("All questions must have text and type.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          questions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create session");
      } else {
        setSuccess("Session created successfully!");
        setTimeout(() => navigate("/admin/sessions"), 1200);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl mt-12">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow">Create New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block font-semibold mb-2 text-blue-900">Title</label>
          <input
            type="text"
            className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-blue-900">Description</label>
          <textarea
            className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-blue-900">Date</label>
          <input
            type="datetime-local"
            className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <div>
            <label className="block font-semibold mb-3 text-blue-900">Questions</label>
            <button
              type="button"
              onClick={() => {
                let newQuestions = questions;
                if (questions.length > 0 && !questions[0].text) {
                  newQuestions = questions.slice(1);
                }
                setQuestions([
                  ...newQuestions,
                  { text: "How was the session", type: "TEXT", isRequired: true },
                  { text: "Would you recommend this session", type: "YES_NO", isRequired: true },
                  { text: "Rate the session", type: "RATING", isRequired: true },
                  { text: "Any additional comments", type: "TEXT", isRequired: false }
                ]);
              }}
              className="mb-4 px-5 py-2 bg-blue-200 text-blue-900 rounded-lg font-semibold hover:bg-blue-300 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Default questions
            </button>
          </div>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 border-2 border-blue-100 rounded-2xl bg-white shadow flex flex-col gap-2 relative group">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 border-2 border-blue-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
                    placeholder="Question text"
                    value={q.text}
                    onChange={e => handleQuestionChange(idx, "text", e.target.value)}
                    required
                  />
                  <select
                    className="border-2 border-blue-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
                    value={q.type}
                    onChange={e => handleQuestionChange(idx, "type", e.target.value)}
                    required
                  >
                    {QUESTION_TYPES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 ml-2">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={e => handleQuestionChange(idx, "isRequired", e.target.checked)}
                    />
                    <span className="text-sm">Required</span>
                  </label>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700 text-2xl font-bold px-2 transition-colors"
                      onClick={() => removeQuestion(idx)}
                      title="Remove question"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 px-6 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors shadow"
            onClick={addQuestion}
          >
            + Add Question
          </button>
        </div>
        {error && <div className="text-red-600 font-semibold text-base bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-base bg-green-50 border border-green-200 rounded-lg px-4 py-2 shadow">{success}</div>}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Session"}
        </button>
      </form>
    </div>
  );
};

export default CreateSession;
