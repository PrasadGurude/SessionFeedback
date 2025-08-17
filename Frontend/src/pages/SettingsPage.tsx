import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    setLoading(false);
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError("");
    setSuccess("");

    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      setChangingPassword(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Password changed successfully.");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <span className="text-lg text-gray-700">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
        </header>

        {/* Change Password */}
        <section className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500 mt-1">Ensure it’s strong and secure.</p>
          </div>
          <div className="p-6 space-y-4">
            {success && <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-md">{success}</div>}
            {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-md">{error}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {["oldPassword", "newPassword", "confirmPassword"].map(field => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                    {field === "oldPassword"
                      ? "Current Password"
                      : field === "newPassword"
                      ? "New Password"
                      : "Confirm New Password"}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type="password"
                    required
                    minLength={6}
                    disabled={changingPassword}
                    value={passwordData[field as keyof typeof passwordData]}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {changingPassword && (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path
                        fill="currentColor"
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Account Info */}
        <section className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            <p className="text-sm text-gray-500 mt-1">Details of your admin account.</p>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="block text-gray-500 mb-1">Account Type</span>
              <span className="font-medium text-gray-900">Administrator</span>
            </div>
            <div>
              <span className="block text-gray-500 mb-1">Account Status</span>
              <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        {/* <section className="bg-white rounded-xl shadow-md border-l-4 border-red-500 border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-600 mt-1">Proceed with caution.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-red-50 p-4 border border-red-200 rounded-md text-sm text-red-800 space-y-3">
              <p>
                Deleting your account is irreversible. All sessions, questions, and responses will be permanently lost.
              </p>
              <button
                onClick={() => alert("Account deletion not implemented in this demo.")}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section> */}
      </div>
    </div>
  );
}
