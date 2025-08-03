import React, { useEffect, useState } from "react";
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
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"><span className="text-lg text-gray-700">Loading contacts...</span></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"><span className="text-lg text-red-600">{error}</span></div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-0 px-0">
      <div className="w-full h-full max-w-6xl bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 flex flex-col justify-start min-h-[90vh]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight drop-shadow">Contacted Persons</h2>
        {contacts.length === 0 ? (
          <div className="text-center text-gray-500 text-lg font-medium py-12">No contacts found.</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full text-sm rounded-2xl overflow-hidden">
              <colgroup>
                <col span={1} />
                <col span={1} />
                <col span={1} />
                <col span={1} style={{ width: '32%' }} />
                <col span={1} />
              </colgroup>
              <thead className="bg-gradient-to-r from-blue-100 via-white to-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider w-[32%]">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, idx) => (
                  <tr key={c.id} className={
                    `transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`
                  }>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-700 font-medium">{c.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.mobile}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-[500px] break-words whitespace-pre-line text-base bg-blue-50 rounded-lg group-hover:bg-blue-100 border border-blue-100">{c.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewContacted;
