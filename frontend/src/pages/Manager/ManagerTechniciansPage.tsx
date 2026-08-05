import React, { useEffect, useState } from "react";
import {
  fetchManagerTechnicians, // Changed from listTechnicians
  createTechnician,
  Technician,
} from "../../lib/api";

export default function ManagerTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dispatcherId: "",
  });

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setError("");
      // Calls GET /api/data/manager/technicians
      const data = await fetchManagerTechnicians();
      setTechnicians(data);
    } catch (err: any) {
      setError(err.message || "Unable to load technicians.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const newTech = await createTechnician({
        ...formData,
        enabled: true,
      });

      setTechnicians((prev) => [...prev, newTech]);
      setFormData({ fullName: "", email: "", phone: "", dispatcherId: "" });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to add technician.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Technicians
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Manage Field Technicians
            </h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 transition"
          >
            Add Technician
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Dispatcher</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading technicians...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-red-600 font-medium">
                    {error}
                  </td>
                </tr>
              ) : technicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No technicians found for your zone.
                  </td>
                </tr>
              ) : (
                technicians.map((tech) => (
                  <tr
                    key={tech.id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 font-semibold text-slate-900">{tech.fullName}</td>
                    <td className="px-6 py-5 text-slate-600">{tech.email}</td>
                    <td className="px-6 py-5 text-slate-600">{tech.phone}</td>
                    <td className="px-6 py-5 text-slate-600">{tech.dispatcherId ?? "N/A"}</td>
                    <td className="px-6 py-5">
                      {tech.enabled ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700">
                          Edit
                        </button>
                        <button className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding Technician */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">Add New Technician</h3>

            {formError && (
              <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </p>
            )}

            <form onSubmit={handleAddTechnician} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Dispatcher ID
                </label>
                <input
                  type="text"
                  name="dispatcherId"
                  required
                  value={formData.dispatcherId}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-violet-600 px-5 py-2 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}