'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Loader, Search } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  file: string | null;
  createdAt: string;
}

interface Revision {
  id: number;
  file: string;
  description: string | null;
  createdAt: string;
}

interface Proposal {
  id: number;
  userid: string;
  title: string;
  status: string;
  proponents: string;
  fundingAgency: string;
  dateUpload: string;
  file: string;
  comments: Comment[];
  revisedProposals: Revision[];
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

  // Comment & Revision States
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showViewCommentsModal, setShowViewCommentsModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showViewRevisionsModal, setShowViewRevisionsModal] = useState(false);
  const [selectedProposalForAction, setSelectedProposalForAction] = useState<Proposal | null>(null);

  const [commentForm, setCommentForm] = useState({ content: '', file: '' });
  const [revisionForm, setRevisionForm] = useState({ description: '', file: '' });

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposalForAction) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/research-proposal/${selectedProposalForAction.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(commentForm),
      });

      if (res.ok) {
        setShowCommentModal(false);
        setCommentForm({ content: '', file: '' });
        fetchProposals();
      } else {
        alert('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposalForAction) return;
    if (!revisionForm.file) {
      alert('Please select a file to upload');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/research-proposal/${selectedProposalForAction.id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(revisionForm),
      });

      if (res.ok) {
        setShowRevisionModal(false);
        setRevisionForm({ description: '', file: '' });
        fetchProposals();
      } else {
        alert('Failed to add revised proposal');
      }
    } catch (error) {
      console.error('Error adding revision:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setCommentForm({ ...commentForm, file: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRevisionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setRevisionForm({ ...revisionForm, file: base64 });
      };
      reader.readAsDataURL(file);
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
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Comments</th>
                  <th className="px-6 py-3 text-left">Revised</th>
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
                    <td className="px-6 py-4 text-black text-sm whitespace-nowrap">
                      {new Date(proposal.dateUpload).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {(userRole === 'admin' || userRole === 'employee') && (
                          <button 
                            onClick={() => { setSelectedProposalForAction(proposal); setShowCommentModal(true); }}
                            className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-fit"
                          >
                            Add Comments
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedProposalForAction(proposal); setShowViewCommentsModal(true); }}
                          className="text-xs text-blue-600 hover:underline w-fit font-medium"
                        >
                          View ({proposal.comments?.length || 0})
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {(userRole === 'admin' || userRole === 'employee') && (
                          <button 
                            onClick={() => { setSelectedProposalForAction(proposal); setShowRevisionModal(true); }}
                            className="text-[10px] bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 w-fit"
                          >
                            Add Revised
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedProposalForAction(proposal); setShowViewRevisionsModal(true); }}
                          className="text-xs text-purple-600 hover:underline w-fit font-medium"
                        >
                          View ({proposal.revisedProposals?.length || 0})
                        </button>
                      </div>
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
                    <td colSpan={7} className="px-6 py-8 text-center text-black/60">
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

      {/* Add Comment Modal */}
      {showCommentModal && selectedProposalForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setShowCommentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">Add Comment to: {selectedProposalForAction.title}</h2>

            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black">Comment Content</label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 h-32 text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Attach PDF (Optional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCommentFileChange}
                  className="w-full mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCommentModal(false)} className="px-4 py-2 border rounded-md text-black">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Comments Modal */}
      {showViewCommentsModal && selectedProposalForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowViewCommentsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">Comments for: {selectedProposalForAction.title}</h2>

            <div className="space-y-4">
              {selectedProposalForAction.comments?.length > 0 ? (
                selectedProposalForAction.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-black whitespace-pre-wrap">{comment.content}</p>
                    {comment.file && (
                      <button
                        onClick={() => { setSelectedPdf(comment.file); setShowPdfModal(true); }}
                        className="mt-2 text-blue-600 text-sm hover:underline font-medium"
                      >
                        View Attached PDF
                      </button>
                    )}
                    <p className="text-[10px] text-gray-500 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Revision Modal */}
      {showRevisionModal && selectedProposalForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setShowRevisionModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">Add Revised Proposal</h2>

            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black text-black">Description (Optional)</label>
                <input
                  type="text"
                  value={revisionForm.description}
                  onChange={(e) => setRevisionForm({ ...revisionForm, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Attach Revised PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleRevisionFileChange}
                  className="w-full mt-1"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowRevisionModal(false)} className="px-4 py-2 border rounded-md text-black">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Revisions Modal */}
      {showViewRevisionsModal && selectedProposalForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowViewRevisionsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">Revised Proposals for: {selectedProposalForAction.title}</h2>

            <div className="space-y-4">
              {selectedProposalForAction.revisedProposals?.length > 0 ? (
                selectedProposalForAction.revisedProposals.map((revision) => (
                  <div key={revision.id} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                    <div>
                      {revision.description && <p className="text-black font-medium">{revision.description}</p>}
                      <p className="text-[10px] text-gray-500 mt-1">{new Date(revision.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedPdf(revision.file); setShowPdfModal(true); }}
                      className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      View PDF
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No revisions found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}