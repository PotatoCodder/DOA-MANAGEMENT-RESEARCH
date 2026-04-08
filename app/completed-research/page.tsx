'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Loader, Search } from 'lucide-react';

interface ResearchData {
  id: number;
  userid: string;
  title: string;
  researcher?: string;
  proponents?: string;
  fundingAgency: string;
  projectDuration?: string;
  journal?: string;
  published?: string;
  file: string;
}

type ResearchType = 'completed' | 'matured' | 'published';

export default function CompletedResearchPage() {
  const [researchType, setResearchType] = useState<ResearchType>('completed');
  const [researches, setResearches] = useState<ResearchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    researcher: '',
    proponents: '',
    fundingAgency: '',
    projectDuration: '',
    journal: '',
    published: '',
    file: '' as string,
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchResearches();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, [researchType]);

  const fetchResearches = async () => {
    try {
      setLoading(true);
      const endpoint = researchType === 'completed' ? '/api/completed-research' : 
                       researchType === 'matured' ? '/api/matured-research' : 
                       '/api/publication-research';
      const res = await fetch(endpoint);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id') || 'current-user';
      const endpoint = researchType === 'completed' ? '/api/completed-research' : 
                       researchType === 'matured' ? '/api/matured-research' : 
                       '/api/publication-research';
      
      const url = editingId ? `${endpoint}/${editingId}` : endpoint;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          userid: userId,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setEditingId(null);
        setFormData({ title: '', researcher: '', proponents: '', fundingAgency: '', projectDuration: '', journal: '', published: '', file: '' });
        fetchResearches();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit research');
      }
    } catch (error) {
      console.error('Error submitting research:', error);
      alert('Error submitting research');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this research?')) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = researchType === 'completed' ? `/api/completed-research/${id}` : 
                       researchType === 'matured' ? `/api/matured-research/${id}` : 
                       `/api/publication-research/${id}`;
      const res = await fetch(endpoint, {
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

  const openEditModal = (research: ResearchData) => {
    setEditingId(research.id);
    setFormData({
      title: research.title,
      researcher: research.researcher || '',
      proponents: research.proponents || '',
      fundingAgency: research.fundingAgency,
      projectDuration: research.projectDuration || '',
      journal: research.journal || '',
      published: research.published || '',
      file: '',
    });
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Research Management</h1>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setResearchType('completed')}
                className={`px-4 py-2 rounded-md transition ${researchType === 'completed' ? 'bg-green-700 text-white' : 'bg-white text-black border hover:bg-gray-50'}`}
              >
                Completed Research
              </button>
              <button 
                onClick={() => setResearchType('matured')}
                className={`px-4 py-2 rounded-md transition ${researchType === 'matured' ? 'bg-green-700 text-white' : 'bg-white text-black border hover:bg-gray-50'}`}
              >
                Matured Technology
              </button>
              <button 
                onClick={() => setResearchType('published')}
                className={`px-4 py-2 rounded-md transition ${researchType === 'published' ? 'bg-green-700 text-white' : 'bg-white text-black border hover:bg-gray-50'}`}
              >
                Published
              </button>
            </div>
          </div>
          {userRole === 'admin' && (
            <button
              onClick={() => { setEditingId(null); setFormData({ title: '', researcher: '', proponents: '', fundingAgency: '', projectDuration: '', journal: '', published: '', file: '' }); setShowCreateModal(true); }}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
            >
              Add {researchType === 'completed' ? 'Completed Research' : researchType === 'matured' ? 'Matured Technology' : 'Published'}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${researchType} researches...`}
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
                  <th className="px-6 py-3 text-left">Title</th>
                  {researchType === 'completed' ? (
                    <th className="px-6 py-3 text-left">Researcher</th>
                  ) : (
                    <th className="px-6 py-3 text-left">Proponents</th>
                  )}
                  <th className="px-6 py-3 text-left">Funding Agency</th>
                  {researchType === 'published' ? (
                    <>
                      <th className="px-6 py-3 text-left">Journal</th>
                      <th className="px-6 py-3 text-left">Published</th>
                    </>
                  ) : (
                    <th className="px-6 py-3 text-left">Project Duration</th>
                  )}
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {researches.filter(research =>
                  research.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (research.researcher || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (research.proponents || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.fundingAgency.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((research) => (
                  <tr key={research.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{research.title}</td>
                    <td className="px-6 py-4 text-black">{research.researcher || research.proponents}</td>
                    <td className="px-6 py-4 text-black">{research.fundingAgency}</td>
                    {researchType === 'published' ? (
                      <>
                        <td className="px-6 py-4 text-black">{research.journal}</td>
                        <td className="px-6 py-4 text-black">{research.published}</td>
                      </>
                    ) : (
                      <td className="px-6 py-4 text-black">{research.projectDuration}</td>
                    )}
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
                            <button 
                              onClick={() => openEditModal(research)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
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
                    <td colSpan={6} className="px-6 py-8 text-center text-black/60">
                      No {researchType} research found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">
              {editingId ? 'Edit' : 'Add'} {researchType === 'completed' ? 'Completed Research' : researchType === 'matured' ? 'Matured Technology' : 'Published'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                  required
                />
              </div>

              {researchType === 'completed' ? (
                <div>
                  <label className="text-sm font-medium text-black">Researcher</label>
                  <input
                    type="text"
                    value={formData.researcher}
                    onChange={(e) => setFormData({ ...formData, researcher: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-black">Proponents</label>
                  <input
                    type="text"
                    value={formData.proponents}
                    onChange={(e) => setFormData({ ...formData, proponents: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-black">Funding Agency</label>
                <input
                  type="text"
                  value={formData.fundingAgency}
                  onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                  required
                />
              </div>

              {researchType === 'published' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-black">Journal</label>
                    <input
                      type="text"
                      value={formData.journal}
                      onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Year/Date Published</label>
                    <input
                      type="text"
                      value={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium text-black">Project Duration</label>
                  <input
                    type="text"
                    value={formData.projectDuration}
                    onChange={(e) => setFormData({ ...formData, projectDuration: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-black">
                  Attach PDF file {editingId && '(optional)'}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full mt-1 text-black"
                  required={!editingId}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-md text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : (editingId ? 'Update' : 'Add')} Research
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
              src={selectedPdf?.startsWith('/uploads') ? selectedPdf : `data:application/pdf;base64,${selectedPdf}`}
              className="w-full h-full border rounded"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
}