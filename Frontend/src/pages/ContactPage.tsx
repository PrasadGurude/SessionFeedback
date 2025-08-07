import React, { useState } from "react";
import { useParams } from "react-router-dom";
import emailjs from "@emailjs/browser";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface ContactForm {
  name: string;
  email: string;
  mobile: string;
  description: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  description?: string;
  general?: string;
}

const ContactPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const DESCRIPTION_MAX = 300;

  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    mobile: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change

    if (name === "description") {
      setForm((prev) => ({
        ...prev,
        description: value.slice(0, DESCRIPTION_MAX),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(form.email)) errors.email = "Invalid email format";

    if (!form.mobile.trim()) errors.mobile = "Mobile number is required";
    else if (!mobileRegex.test(form.mobile)) errors.mobile = "Mobile must be exactly 10 digits";

    if (!form.description.trim()) errors.description = "Description is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setFormErrors({});

    if (!validateForm()) return;

    setLoading(true);

    const templateParams = {
      name: form.name,
      email: form.email,
    };

    try {
      await emailjs.send(
        "service_12574g5",
        "template_qkrflq6",
        templateParams,
        "9jDDp62hTf4vV_CDH"
      );

      const res = await fetch(`${API_BASE_URL}/contact/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 400) {
        setAlreadySubmitted(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setFormErrors((prev) => ({
          ...prev,
          general: errData.error || "Failed to send contact message",
        }));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        mobile: "",
        description: "",
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      setFormErrors((prev) => ({
        ...prev,
        general: err?.message || "Failed to send contact message",
      }));
    } finally {
      setLoading(false);
    }
  };

  if( alreadySubmitted ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Already Contacted
          </h2>
          <p className="text-center text-gray-700">
            You have already submitted a contact message. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          Contact Admin
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50"
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50"
            />
            {formErrors.mobile && (
              <p className="text-sm text-red-600 mt-1">{formErrors.mobile}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={DESCRIPTION_MAX}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-gray-50 min-h-[80px] resize-y"
              placeholder="Type your message..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {form.description.length} / {DESCRIPTION_MAX} characters
            </div>
            {formErrors.description && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Contact Message"}
          </button>

          {/* Feedback */}
          {formErrors.general && (
            <div className="text-red-600 text-center font-medium mt-2">
              {formErrors.general}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-center font-medium mt-2">
              Contact message sent!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
