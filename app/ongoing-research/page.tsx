'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, X, Loader, Search } from 'lucide-react';
import Link from 'next/link';

interface OngoingResearch {
   id: number;
   userId: string;
   title: string;
   proponents: string;
   fundingSource: string;
   projectDuration: string;
   budgetAllocation: string;
   commodity: string;
   status: string;
   pdf?: string;
   projectLocation?: string;
   subResearches: any[];
}

export default function OngoingResearchPage() {
  const [researches, setResearches] = useState<OngoingResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingResearch, setEditingResearch] = useState<OngoingResearch | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    proponents: '',
    fundingSource: '',
    projectDuration: '',
    budgetAllocation: '',
    commodity: '',
    status: '',
    projectLocation: '',
    pdf: '' as string,
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    fetchResearches();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (editingResearch) {
      setFormData({
        title: editingResearch.title,
        proponents: editingResearch.proponents,
        fundingSource: editingResearch.fundingSource,
        projectDuration: editingResearch.projectDuration,
        budgetAllocation: editingResearch.budgetAllocation,
        commodity: editingResearch.commodity,
        status: editingResearch.status,
        projectLocation: editingResearch.projectLocation || '',
        pdf: '',
      });
    } else {
      setFormData({ title: '', proponents: '', fundingSource: '', projectDuration: '', budgetAllocation: '', commodity: '', status: '', projectLocation: '', pdf: '' });
    }
  }, [editingResearch]);

  const fetchResearches = async () => {
    try {
      const res = await fetch('/api/ongoing-research');
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this research?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ongoing-research/${id}`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const method = editingResearch ? 'PUT' : 'POST';
      const url = editingResearch ? `/api/ongoing-research/${editingResearch.id}` : '/api/ongoing-research';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingResearch(null);
        setFormData({ title: '', proponents: '', fundingSource: '', projectDuration: '', budgetAllocation: '', commodity: '', status: '', projectLocation: '', pdf: '' });
        fetchResearches();
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.error || `Failed to ${editingResearch ? 'update' : 'create'} research`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error(`Error ${editingResearch ? 'updating' : 'creating'} research:`, error);
      const errorMessage = error instanceof Error ? error.message : `Error ${editingResearch ? 'updating' : 'creating'} research`;
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFormData({ ...formData, pdf: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-24">
      <div className="w-full px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Ongoing Research</h1>
          {userRole === 'admin' && (
            <button
              onClick={() => { setEditingResearch(null); setShowModal(true); }}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
            >
              Create Ongoing Research
            </button>
          )}
    
        </div>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search researches..."
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
                  <th className="px-6 py-3 text-left">Proponents</th>
                  <th className="px-6 py-3 text-left">Funding Source</th>
                  <th className="px-6 py-3 text-left">Project Duration</th>
                  <th className="px-6 py-3 text-left">Budget Allocation</th>
                  <th className="px-6 py-3 text-left">Commodity</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Project Location</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {researches.filter(research =>
                  research.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.proponents.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.fundingSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.projectDuration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.budgetAllocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.status.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((research) => (
                  <tr key={research.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{research.title}</td>
                    <td className="px-6 py-4 text-black">{research.proponents}</td>
                    <td className="px-6 py-4 text-black">{research.fundingSource}</td>
                    <td className="px-6 py-4 text-black">{research.projectDuration}</td>
                    <td className="px-6 py-4 text-black">{research.budgetAllocation}</td>
                    <td className="px-6 py-4 text-black">{research.commodity}</td>
                    <td className="px-6 py-4 text-black">{research.status}</td>
                    <td className="px-6 py-4 text-black">{research.projectLocation || '-'}</td>
                    <td className="px-6 py-4 text-black">{research.subResearches.length}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {research.pdf && (
                          <button
                            onClick={() => {
                              setSelectedPdf(research.pdf || null);
                              setShowPdfModal(true);
                              setPdfError(null);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            View PDF
                          </button>
                        )}
                        <Link
                          href={`/sub-ongoing-research?ongoingResearchId=${research.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Online Reporting
                        </Link>
                        {userRole === 'admin' && (
                          <>
                            <button onClick={() => { setEditingResearch(research); setShowModal(true); }} className="p-1 text-blue-600 hover:text-blue-800">
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
                    <td colSpan={9} className="px-6 py-8 text-center text-black/60">
                      No ongoing research found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">
              {editingResearch ? 'Edit Ongoing Research' : 'Create Ongoing Research'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-black w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
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
                  className="text-black w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Funding Source
                </label>
                <input
                  type="text"
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                  className="text-black w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Project Duration
                </label>
                <input
                  type="text"
                  value={formData.projectDuration}
                  onChange={(e) => setFormData({ ...formData, projectDuration: e.target.value })}
                  className="text-black w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Budget Allocation
                </label>
                <input
                  type="text"
                  value={formData.budgetAllocation}
                  onChange={(e) => setFormData({ ...formData, budgetAllocation: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Commodity
                </label>
                <input
                  type="text"
                  value={formData.commodity}
                  onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Status
                </label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Project Location
                </label>
                <input
                  type="text"
                  value={formData.projectLocation}
                  onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black text-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? (editingResearch ? 'Updating...' : 'Creating...') : (editingResearch ? 'Update Research' : 'Create Research')}
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
              onClick={() => {
                setShowPdfModal(false);
                setSelectedPdf(null);
                setPdfError(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold text-black mb-4">PDF Viewer</h2>

            {pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{pdfError}</p>
                  <a
                    href={selectedPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                src={selectedPdf?.startsWith('/uploads') ? selectedPdf : `data:application/pdf;base64,${selectedPdf}`}
                className="w-full h-full border rounded"
                title="PDF Viewer"
                onError={() => setPdfError('Failed to load PDF. Please try opening it in a new tab.')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}