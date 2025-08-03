import React, { useState } from "react";
import { useParams } from "react-router-dom";
import emailjs from "@emailjs/browser";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const ContactPage = () => {
  const { sessionId } = useParams();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", description: "" });
  const DESCRIPTION_MAX = 300;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "description") {
      setForm({ ...form, description: value.slice(0, DESCRIPTION_MAX) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!form.name || !form.email || !form.mobile || !form.description) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const templateParams = {
      name: form.name,     // Matches {{name}} in your template
      email: form.email,   // Matches {{email}} in "To Email"
    };

    try {
      // Send confirmation email to user
      await emailjs.send(
        "service_12574g5",
        "template_qkrflq6",
        templateParams,
        "9jDDp62hTf4vV_CDH"
      );

      // Save contact message to your backend
      const res = await fetch(`${API_BASE_URL}/contact/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to send contact message");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setForm({ name: "", email: "", mobile: "", description: "" });
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err?.message || "Failed to send contact message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">Contact Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={DESCRIPTION_MAX}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50 min-h-[80px] resize-y"
              required
              placeholder="Type your message..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {form.description.length} / {DESCRIPTION_MAX} characters
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Contact Message"}
          </button>
          {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
          {success && <div className="text-green-600 text-center font-medium mt-2">Contact message sent!</div>}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
