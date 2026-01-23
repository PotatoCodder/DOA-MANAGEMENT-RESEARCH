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

interface TargetActivity {
  id: number;
  targetActivity: string;
  date?: string;
  objectivesId: number;
}

interface Objective {
  id: number;
  objectives: string;
  targetActivities?: string;
  targetActivityList: TargetActivity[];
}

export default function SubOngoingResearchPage() {
  const searchParams = useSearchParams();
  const ongoingResearchId = searchParams.get('ongoingResearchId');

  const [researches, setResearches] = useState<SubOngoingResearch[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWorkPlanModal, setShowWorkPlanModal] = useState(false);
  const [showObjectivesForm, setShowObjectivesForm] = useState(true);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [showAddTargetForm, setShowAddTargetForm] = useState(false);
  const [currentObjectiveId, setCurrentObjectiveId] = useState<number | null>(null);
  const [objectivesFormData, setObjectivesFormData] = useState({
    objectives: '',
    targetActivities: '',
  });
  const [targetFormData, setTargetFormData] = useState({
    targetActivity: '',
    date: '',
  });
  const [targetActivitiesList, setTargetActivitiesList] = useState<{targetActivity: string, date: string}[]>([]);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  useEffect(() => {
    if (ongoingResearchId) {
      fetchResearches();
    }
    fetchObjectives();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, [ongoingResearchId]);

  useEffect(() => {
    if (objectives.length > 0) {
      setFormData(prev => ({
        ...prev,
        objectives: objectives[0].objectives
      }));
    }
  }, [objectives]);

  useEffect(() => {
    if (editingObjective) {
      setObjectivesFormData({
        objectives: editingObjective.objectives,
        targetActivities: editingObjective.targetActivities || '',
      });
    } else {
      setObjectivesFormData({ objectives: '', targetActivities: '' });
    }
  }, [editingObjective]);

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

  const fetchObjectives = async () => {
    try {
      const res = await fetch('/api/objectives');
      if (res.ok) {
        const data = await res.json();
        setObjectives(data);
      }
    } catch (error) {
      console.error('Failed to fetch objectives:', error);
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
        setFormData({ objectives: '', actualAccomplishment: '', dateConducted: '', documentation: '' });
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

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingObjective ? 'PUT' : 'POST';
      const url = editingObjective ? `/api/objectives/${editingObjective.id}` : '/api/objectives';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objectivesFormData)
      });

      if (res.ok) {
        if (!editingObjective) {
          const data = await res.json();
          const objectiveId = data.id;

          // Create target activities for new objectives
          for (const target of targetActivitiesList) {
            await fetch('/api/target-activities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                targetActivity: target.targetActivity,
                date: target.date ? new Date(target.date) : null,
                objectivesId: objectiveId
              })
            });
          }
        }

        setShowWorkPlanModal(false);
        setEditingObjective(null);
        setTargetActivitiesList([]);
        setObjectivesFormData({ objectives: '', targetActivities: '' });
        fetchObjectives();
      } else {
        alert(`Failed to ${editingObjective ? 'update' : 'create'} objective`);
      }
    } catch (error) {
      console.error(`Error ${editingObjective ? 'updating' : 'creating'} objective:`, error);
      alert(`Error ${editingObjective ? 'updating' : 'creating'} objective`);
    }
  };

  const handleAddToList = () => {
    setTargetActivitiesList([...targetActivitiesList, targetFormData]);
    setTargetFormData({ targetActivity: '', date: '' });
    setShowAddTargetForm(false);
  };

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/target-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...targetFormData,
          objectivesId: currentObjectiveId
        })
      });

      if (res.ok) {
        setShowWorkPlanModal(false);
      } else {
        alert('Failed to create target activity');
      }
    } catch (error) {
      console.error('Error creating target activity:', error);
      alert('Error creating target activity');
    }
  };

  const handleDeleteObjective = async (id: number) => {
    if (!confirm('Are you sure you want to delete this objective?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/objectives/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchObjectives();
      } else {
        alert('Failed to delete objective');
      }
    } catch (error) {
      console.error('Error deleting objective:', error);
      alert('Error deleting objective');
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
          <div className="flex flex-col gap-4">
            {(userRole === 'admin' || userRole === 'employee') && (
              <button
                onClick={() => { setShowWorkPlanModal(true); setShowObjectivesForm(true); setShowAddTargetForm(false); setShowTargetForm(false); setTargetActivitiesList([]); }}
                className="bg-blue-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-800 transition"
              >
                Create Work Plan
              </button>
            )}
            {(userRole === 'admin' || userRole === 'employee') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
              >
                Create Online Reporting
              </button>
            )}
          </div>
        </div>

        {/* Workplan Table */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-black mb-4">Workplan</h2>
          <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Objectives</th>
                  <th className="px-6 py-3 text-left">Target Activities</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {objectives.map((objective) => (
                  <tr key={objective.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{objective.objectives}</td>
                    <td className="px-6 py-4 text-black">
                      {objective.targetActivityList.length > 0
                        ? objective.targetActivityList.map((ta, index) => `${index + 1}. ${ta.targetActivity}`).join('\n')
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {userRole === 'admin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingObjective(objective);
                              setShowWorkPlanModal(true);
                              setShowObjectivesForm(true);
                              setShowAddTargetForm(false);
                              setShowTargetForm(false);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteObjective(objective.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {objectives.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-black/60">
                      No objectives found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {researches.filter(research =>
                  research.objectives.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.actualAccomplishment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  research.dateConducted.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((research) => (
                  <tr key={research.id} className="border-b border-white/20 hover:bg-white/5">
                    <td className="px-6 py-4 text-black">{research.objectives}</td>
                    <td className="px-6 py-4 text-black">{research.actualAccomplishment}</td>
                    <td className="px-6 py-4 text-black">{research.dateConducted}</td>
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
                    <td colSpan={4} className="px-6 py-8 text-center text-black/60">
                      No sub research found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Work Plan Modal */}
      {showWorkPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative max-h-96 overflow-y-auto">
            <button
              onClick={() => {
                setShowWorkPlanModal(false);
                setEditingObjective(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">
              {editingObjective ? 'Edit Objective' : 'Create Work Plan'}
            </h2>

            {showObjectivesForm && (
              <form onSubmit={handleCreateObjective} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black">
                    Objectives
                  </label>
                  <input
                    type="text"
                    value={objectivesFormData.objectives}
                    onChange={(e) => setObjectivesFormData({ ...objectivesFormData, objectives: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                    required
                  />
                </div>


                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => { setShowObjectivesForm(false); setShowAddTargetForm(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Target Activities
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                  >
                    {editingObjective ? 'Update Objective' : 'Create Objective'}
                  </button>
                </div>
              </form>
            )}

            {showAddTargetForm && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">Add Target Activities</h3>
                <div>
                  <label className="text-sm font-medium text-black">
                    Target Activity
                  </label>
                  <input
                    type="text"
                    value={targetFormData.targetActivity}
                    onChange={(e) => setTargetFormData({ ...targetFormData, targetActivity: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">
                    Date
                  </label>
                  <input
                    type="date"
                    value={targetFormData.date}
                    onChange={(e) => setTargetFormData({ ...targetFormData, date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowAddTargetForm(false)}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToList}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add to List
                  </button>
                </div>
                <ul className="space-y-2">
                  {targetActivitiesList.map((item, index) => (
                    <li key={index} className="text-black">- {item.targetActivity} ({item.date})</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => { setShowAddTargetForm(false); setShowObjectivesForm(true); }}
                  className="w-full px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                  Done Adding
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                  {objectives.map((obj) => (
                    <option key={obj.id} value={obj.objectives}>
                      {obj.objectives}
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