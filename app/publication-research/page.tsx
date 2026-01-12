'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Loader } from 'lucide-react';

interface PublicationResearch {
  id: number;
  userid: string;
  title: string;
  proponents: string;
  journal: string;
  published: string;
  file: string;
}

interface PublicationResearch {
  id: number;
  userid: string;
  title: string;
  proponents: string;
  journal: string;
  published: string;
  file: string;
}

export default function PublicationResearchPage() {
  const [researches, setResearches] = useState<PublicationResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    proponents: '',
    journal: '',
    published: '',
    file: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResearches();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFormData({ ...formData, file: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchResearches = async () => {
    try {
      const res = await fetch('/api/publication-research');
      if (res.ok) {
        const data = await res.json();
        setResearches(data);
      }
    } catch (error) {
      console.error('Failed to fetch researches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/publication-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: 'current-user',
          ...formData,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ title: '', proponents: '', journal: '', published: '', file: '' });
        fetchResearches();
      } else {
        alert('Failed to create research');
      }
    } catch (error) {
      console.error('Error creating research:', error);
      alert('Error creating research');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this research?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/publication-research/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchResearches();
      } else {
        alert('Failed to delete research');
      }
    } catch (error) {
      console.error('Error deleting research:', error);
      alert('Error deleting research');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Publication Research</h1>
          {(userRole === 'admin' || userRole === 'employee') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
            >
              Add Publication Research
            </button>
          )}
        </div>

        {/* Table */}
        <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center"><Loader className="animate-spin h-8 w-8 mx-auto text-blue-600" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Proponents</th>
                  <th className="px-6 py-3 text-left">Journal</th>
                  <th className="px-6 py-3 text-left">Published</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {researches.map((research) => (
                  <tr key={research.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{research.title}</td>
                    <td className="px-6 py-4 text-black">{research.proponents}</td>
                    <td className="px-6 py-4 text-black">{research.journal}</td>
                    <td className="px-6 py-4 text-black">{research.published}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPdf(research.file);
                            setShowPdfModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          View PDF
                        </button>
                        {userRole === 'admin' && (
                          <>
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(research.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {researches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-black/60">
                      No publication research found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">
              Add Publication Research
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Proponents
                </label>
                <input
                  type="text"
                  value={formData.proponents}
                  onChange={(e) => setFormData({ ...formData, proponents: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Journal
                </label>
                <input
                  type="text"
                  value={formData.journal}
                  onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Published Date
                </label>
                <input
                  type="date"
                  value={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Attach PDF file
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full mt-1"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add Research'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfModal && selectedPdf && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl h-5/6 rounded-xl shadow-lg p-4 relative">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold text-black mb-4">PDF Viewer</h2>

            <iframe
              src={`data:application/pdf;base64,${selectedPdf}`}
              className="w-full h-full border rounded"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
}