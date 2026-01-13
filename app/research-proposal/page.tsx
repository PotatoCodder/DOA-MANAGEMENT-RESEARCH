'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Loader, Search } from 'lucide-react';

interface Proposal {
  id: number;
  userid: string;
  title: string;
  status: string;
  proponents: string;
  fundingAgency: string;
  dateUpload: string;
  file: string;
}

export default function ResearchProposalPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    status: '',
    proponents: '',
    fundingAgency: '',
    file: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (editingProposal) {
      setFormData({
        title: editingProposal.title,
        status: editingProposal.status,
        proponents: editingProposal.proponents,
        fundingAgency: editingProposal.fundingAgency,
        file: editingProposal.file,
      });
    } else {
      setFormData({ title: '', status: '', proponents: '', fundingAgency: '', file: '' });
    }
  }, [editingProposal]);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/research-proposal');
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
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
      const method = editingProposal ? 'PUT' : 'POST';
      const url = editingProposal ? `/api/research-proposal/${editingProposal.id}` : '/api/research-proposal';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(editingProposal ? {} : { userid: 'current-user' }), // TODO: get from token or context
          ...formData,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingProposal(null);
        setFormData({ title: '', status: '', proponents: '', fundingAgency: '', file: '' });
        fetchProposals();
      } else {
        alert(`Failed to ${editingProposal ? 'update' : 'create'} proposal`);
      }
    } catch (error) {
      console.error(`Error ${editingProposal ? 'updating' : 'creating'} proposal:`, error);
      alert(`Error ${editingProposal ? 'updating' : 'creating'} proposal`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/research-proposal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchProposals();
      } else {
        alert('Failed to delete proposal');
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Error deleting proposal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Research Proposals</h1>
          {(userRole === 'admin' || userRole === 'employee') && (
            <button
              onClick={() => { setEditingProposal(null); setShowModal(true); }}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
            >
              Create New Proposal
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search proposals..."
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
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Proponents</th>
                  <th className="px-6 py-3 text-left">Funding Agency</th>
                  <th className="px-6 py-3 text-left">Date Uploaded</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.filter(proposal =>
                  proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  proposal.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  proposal.proponents.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  proposal.fundingAgency.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((proposal) => (
                  <tr key={proposal.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{proposal.title}</td>
                    <td className="px-6 py-4 text-black">{proposal.status}</td>
                    <td className="px-6 py-4 text-black">{proposal.proponents}</td>
                    <td className="px-6 py-4 text-black">{proposal.fundingAgency}</td>
                    <td className="px-6 py-4 text-black">
                      {new Date(proposal.dateUpload).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPdf(proposal.file);
                            setShowPdfModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          View PDF
                        </button>
                        {userRole === 'admin' && (
                          <>
                            <button onClick={() => { setEditingProposal(proposal); setShowModal(true); }} className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(proposal.id)}
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
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-black/60">
                      No proposals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Proposal Modal */}
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
              {editingProposal ? 'Edit Research Proposal' : 'Create Research Proposal'}
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
                  className="w-full border rounded-md px-3 py-2 mt-1 placeholder-black"
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
                  Funding Agency
                </label>
                <input
                  type="text"
                  value={formData.fundingAgency}
                  onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
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
                  required={!editingProposal}
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
                  {submitting ? (editingProposal ? 'Updating...' : 'Creating...') : (editingProposal ? 'Update Proposal' : 'Create Proposal')}
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