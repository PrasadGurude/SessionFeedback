import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "YES_NO" | "RATING";
  isRequired?: boolean;
  options?: (string | number)[];
};

type AnswerMap = { [questionId: string]: string | number | boolean };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const ResponsePage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const navigate = useNavigate();
  const sessionId = window.location.pathname.split("/").pop();

  // ✅ Check if already submitted on mount
  useEffect(() => {
    if (sessionId) {
      const submittedSessions = JSON.parse(localStorage.getItem("submittedSessions") || "[]");
      if (submittedSessions.includes(sessionId)) {
        setAlreadySubmitted(true);
        setLoading(false);
        return;
      }
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/questions/${sessionId}`);
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load questions");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sessionId]);

  const handleChange = (questionId: string, value: string | number, type?: string) => {
    let v: string | number | boolean = value;
    if (type === "YES_NO") {
      v = value === "Yes" ? true : false;
    } else if (type === "RATING") {
      v = Number(value);
    }
    setAnswers((prev) => ({ ...prev, [questionId]: v }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    for (const q of questions) {
      if (q.isRequired && (answers[q.id] === undefined || answers[q.id] === "")) {
        setError("Please answer all required questions.");
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || "Failed to submit responses");
        return;
      }

      // ✅ Store submitted sessionId in localStorage
      const submittedSessions = JSON.parse(localStorage.getItem("submittedSessions") || "[]");
      if (!submittedSessions.includes(sessionId)) {
        submittedSessions.push(sessionId);
        localStorage.setItem("submittedSessions", JSON.stringify(submittedSessions));
      }

      setSuccess(true);
      setAnswers({});
    } catch (err: any) {
      setError(err?.message || "Failed to submit responses");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
        <span className="text-lg text-gray-700 animate-pulse">Loading questions...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-pink-100">
        <span className="text-lg text-red-700 font-semibold">{error}</span>
      </div>
    );

  if (alreadySubmitted)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-green-700">You have already submitted the response for this session.</h2>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            onClick={() => navigate(`/contact/${sessionId}`)}
          >
            Contact Us
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Session Feedback</h2>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-10">
            {questions.map((q, idx) => (
              <div key={q.id}>
                <div className="text-lg font-semibold text-gray-800 mb-3 flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-base">
                    {idx + 1}
                  </div>
                  <div>
                    {q.text}
                    {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </div>
                </div>

                {q.type === "TEXT" && (
                  <div>
                    <textarea
                      value={answers[q.id] === undefined ? "" : String(answers[q.id])}
                      onChange={(e) => handleChange(q.id, e.target.value, q.type)}
                      required={q.isRequired}
                      maxLength={300}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 min-h-[100px] resize-y"
                      placeholder="Type your answer here..."
                    />
                    <div className="text-sm text-gray-500 mt-1 text-right">
                      {(answers[q.id]?.toString().length || 0)}/300 characters
                    </div>
                  </div>
                )}

                {q.type === "YES_NO" && (
                  <div className="flex gap-6 mt-3">
                    {(q.options || ["Yes", "No"]).map((opt) => (
                      <label key={opt} className="inline-flex items-center cursor-pointer text-gray-700">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={answers[q.id] === (opt === "Yes" ? true : false)}
                          onChange={() => handleChange(q.id, opt, q.type)}
                          required={q.isRequired}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2 text-base">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "RATING" && (
                  <div className="flex gap-4 mt-3">
                    {(q.options || [1, 2, 3, 4, 5]).map((opt) => (
                      <label key={opt} className="inline-flex flex-col items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={answers[q.id] === Number(opt)}
                          onChange={() => handleChange(q.id, opt, q.type)}
                          required={q.isRequired}
                          className="form-radio h-5 w-5 text-blue-600 mb-1"
                        />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-200"
            >
              Submit Feedback
            </button>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-green-600 text-center font-semibold text-lg">Response submitted successfully!</div>
            <button
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-200"
              onClick={() => navigate(`/contact/${sessionId}`)}
            >
              Contact Us
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsePage;
