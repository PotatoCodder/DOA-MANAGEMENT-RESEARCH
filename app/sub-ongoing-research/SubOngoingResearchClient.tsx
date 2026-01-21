'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Loader, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface SubOngoingResearch {
  id: number;
  userId: string;
  objectives: string;
  actualAccomplishment: string;
  dateConducted: string;
  documentation: string;
  targetActivities?: string;
  ongoingResearchId: number;
  ongoingResearch: {
    title: string;
  };
}

export default function SubOngoingResearchPage() {
  const searchParams = useSearchParams();
  const ongoingResearchId = searchParams.get('ongoingResearchId');

  const [researches, setResearches] = useState<SubOngoingResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    objectives: `Objective ${researches.length + 1}`,
    actualAccomplishment: '',
    dateConducted: '',
    documentation: '',
    targetActivities: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (ongoingResearchId) {
      fetchResearches();
    }
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, [ongoingResearchId]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      objectives: `Objective ${researches.length + 1}`
    }));
  }, [researches.length]);

  const fetchResearches = async () => {
    try {
      const res = await fetch(`/api/sub-ongoing-research?ongoingResearchId=${ongoingResearchId}`);
      if (res.ok) {
        const data = await res.json();
        setResearches(data);
      }
    } catch (error) {
      console.error('Failed to fetch sub researches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFormData({ ...formData, documentation: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sub-ongoing-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: 'current-user', // Assuming current user
          ongoingResearchId,
          ...formData,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ objectives: '', actualAccomplishment: '', dateConducted: '', documentation: '', targetActivities: '' });
        fetchResearches();
      } else {
        alert('Failed to create sub research');
      }
    } catch (error) {
      console.error('Error creating sub research:', error);
      alert('Error creating sub research');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sub research?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sub-ongoing-research/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchResearches();
      } else {
        alert('Failed to delete sub research');
      }
    } catch (error) {
      console.error('Error deleting sub research:', error);
      alert('Error deleting sub research');
    }
  };

  if (!ongoingResearchId) {
    return <div className="min-h-screen bg-gray-100 p-6 pt-24"><div className="text-center">Invalid access</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Sub Ongoing Research</h1>
            {researches.length > 0 && (
              <p className="text-gray-600 mt-2">For: {researches[0].ongoingResearch.title}</p>
            )}
          </div>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
            >
              Create Online Reporting
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sub researches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            />
          </div>
        </div>

        {/* Table */}
        <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center"><Loader className="animate-spin h-8 w-8 mx-auto text-blue-600" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Objectives</th>
                  <th className="px-6 py-3 text-left">Actual Accomplishment</th>
                  <th className="px-6 py-3 text-left">Date Conducted</th>
                  <th className="px-6 py-3 text-left">Target Activities</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {researches.filter(research =>
                  research.objectives.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.actualAccomplishment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.dateConducted.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (research.targetActivities && research.targetActivities.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((research) => (
                  <tr key={research.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{research.objectives}</td>
                    <td className="px-6 py-4 text-black">{research.actualAccomplishment}</td>
                    <td className="px-6 py-4 text-black">{research.dateConducted}</td>
                    <td className="px-6 py-4 text-black">{research.targetActivities || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {research.documentation && (
                          <button
                            onClick={() => {
                              setSelectedPdf(research.documentation);
                              setShowPdfModal(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            View Documentation
                          </button>
                        )}
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
                      No sub research found
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
              Create Online Reporting
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black">
                  Objectives
                </label>
                <select
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                  required
                >
                  {Array.from({ length: researches.length + 1 }, (_, i) => (
                    <option key={i + 1} value={`Objective ${i + 1}`}>
                      Objective {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Actual Accomplishment
                </label>
                <textarea
                  value={formData.actualAccomplishment}
                  onChange={(e) => setFormData({ ...formData, actualAccomplishment: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Date Conducted
                </label>
                <input
                  type="date"
                  value={formData.dateConducted}
                  onChange={(e) => setFormData({ ...formData, dateConducted: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Target Activities
                </label>
                <textarea
                  value={formData.targetActivities}
                  onChange={(e) => setFormData({ ...formData, targetActivities: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Attach Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
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
                  {submitting ? 'Creating...' : 'Create Online Reporting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documentation Viewer Modal */}
      {showPdfModal && selectedPdf && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl h-5/6 rounded-xl shadow-lg p-4 relative">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold text-black mb-4">Documentation Viewer</h2>

            <img
              src={`data:image/jpeg;base64,${selectedPdf}`}
              className="w-full h-full object-contain border rounded"
              alt="Documentation"
            />
          </div>
        </div>
      )}
    </div>
  );
}