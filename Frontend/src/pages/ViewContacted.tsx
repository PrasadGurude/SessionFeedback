import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type Contact = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  description: string;
  createdAt: string;
};

const ViewContacted: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (!adminData) {
      setError("Not authorized");
      setLoading(false);
      return;
    }

    const admin = JSON.parse(adminData);
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/contact/${admin.id}`);
        if (!res.ok) throw new Error("Failed to fetch contacts");
        const data = await res.json();
        setContacts(data);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <span className="text-base sm:text-lg text-gray-700">Loading contacts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 text-center">
        <span className="text-base sm:text-lg text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-10 drop-shadow">
          Contacted Persons
        </h2>

        {contacts.length === 0 ? (
          <div className="text-center text-gray-500 text-base sm:text-lg font-medium py-12">
            No contacts found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 space-y-4 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800 break-words">{c.name}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600 break-all">
                    <span className="font-medium">Email:</span> {c.email}
                  </p>
                  <p className="text-sm text-gray-600 break-all">
                    <span className="font-medium">Mobile:</span> {c.mobile}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {c.description}
                </div>

                <div className="text-right text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewContacted;
