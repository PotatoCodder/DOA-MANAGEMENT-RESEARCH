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
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWorkPlanModal, setShowWorkPlanModal] = useState(false);
  const [showObjectivesForm, setShowObjectivesForm] = useState(true);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [showAddTargetForm, setShowAddTargetForm] = useState(false);
  const [currentResearchId, setCurrentResearchId] = useState<number | null>(null);
  const [currentObjectiveId, setCurrentObjectiveId] = useState<number | null>(null);
  const [objectivesFormData, setObjectivesFormData] = useState({
    objectives: '',
    targetActivities: '',
    date: '',
  });
  const [targetFormData, setTargetFormData] = useState({
    targetActivity: '',
    date: '',
  });
  const [targetActivitiesList, setTargetActivitiesList] = useState<{targetActivity: string, date: string}[]>([]);

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
      });
    } else {
      setFormData({ title: '', proponents: '', fundingSource: '', projectDuration: '', budgetAllocation: '', commodity: '', status: '' });
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
        body: JSON.stringify({
          ...(editingResearch ? {} : { userId: 'current-user' }), // Assuming current user
          ...formData,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingResearch(null);
        setFormData({ title: '', proponents: '', fundingSource: '', projectDuration: '', budgetAllocation: '', commodity: '', status: '' });
        fetchResearches();
      } else {
        alert(`Failed to ${editingResearch ? 'update' : 'create'} research`);
      }
    } catch (error) {
      console.error(`Error ${editingResearch ? 'updating' : 'creating'} research:`, error);
      alert(`Error ${editingResearch ? 'updating' : 'creating'} research`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateObjective = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      const res = await fetch('/api/objectives', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(objectivesFormData)

      });

      if (res.ok) {

        const data = await res.json();

        const objectiveId = data.id;

        // Create target activities

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

        setShowWorkPlanModal(false);

        setTargetActivitiesList([]);

        setObjectivesFormData({ objectives: '', targetActivities: '', date: '' });

      } else {

        alert('Failed to create objective');

      }

    } catch (error) {

      console.error('Error creating objective:', error);

      alert('Error creating objective');

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

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Ongoing Research</h1>
          {userRole === 'admin' && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setShowWorkPlanModal(true); setShowObjectivesForm(true); setShowAddTargetForm(false); setShowTargetForm(false); setTargetActivitiesList([]); }}
                className="bg-blue-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-800 transition"
              >
                Create Work Plan
              </button>
              <button
                onClick={() => { setEditingResearch(null); setShowModal(true); }}
                className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
              >
                Create Ongoing Research
              </button>
            </div>
          )}
    
          {/* Work Plan Modal */}
    
          {showWorkPlanModal && (
    
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
    
              <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative max-h-96 overflow-y-auto">
    
                <button
    
                  onClick={() => setShowWorkPlanModal(false)}
    
                  className="absolute top-4 right-4 text-gray-500 hover:text-black"
    
                >
    
                  <X />
    
                </button>
    
                <h2 className="text-xl font-semibold text-black mb-6">{showAddTargetForm ? 'Add Target Activity' : 'Create Work Plan'}</h2>
    
                {showObjectivesForm && (

                  <form onSubmit={handleCreateObjective} className="space-y-4">

                    <div>

                      <label className="text-sm font-medium text-black">Objectives</label>

                      <textarea

                        value={objectivesFormData.objectives}

                        onChange={(e) => setObjectivesFormData({ ...objectivesFormData, objectives: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                        required

                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-black">Target Activities</label>

                      <textarea

                        value={objectivesFormData.targetActivities}

                        onChange={(e) => setObjectivesFormData({ ...objectivesFormData, targetActivities: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-black">Date</label>

                      <input

                        type="date"

                        value={objectivesFormData.date}

                        onChange={(e) => setObjectivesFormData({ ...objectivesFormData, date: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                      />

                    </div>

                    <div>

                      <button

                        type="button"

                        onClick={() => setShowAddTargetForm(true)}

                        className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"

                      >

                        Add Target Activity

                      </button>

                    </div>

                    {targetActivitiesList.length > 0 && (

                      <div>

                        <label className="text-sm font-medium text-black">Target Activities Added:</label>

                        <ul className="mt-2 space-y-1">

                          {targetActivitiesList.map((item, index) => (

                            <li key={index} className="text-black">

                              {item.targetActivity} - {item.date}

                            </li>

                          ))}

                        </ul>

                      </div>

                    )}
    
                    <div className="flex justify-end gap-3 pt-4">
    
                      <button
    
                        type="button"
    
                        onClick={() => setShowWorkPlanModal(false)}
    
                        className="px-4 py-2 border rounded-md"
    
                      >
    
                        Cancel
    
                      </button>
    
                      <button
    
                        type="submit"
    
                        className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
    
                      >
    
                        Create Work Plan
    
                      </button>
    
                    </div>
    
                  </form>

                )}

                {showAddTargetForm && (

                  <form className="space-y-4">

                    <div>

                      <label className="text-sm font-medium text-black">Target Activity</label>

                      <textarea

                        value={targetFormData.targetActivity}

                        onChange={(e) => setTargetFormData({ ...targetFormData, targetActivity: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                        required

                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-black">Date</label>

                      <input

                        type="date"

                        value={targetFormData.date}

                        onChange={(e) => setTargetFormData({ ...targetFormData, date: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                      />

                    </div>

                    <div className="flex justify-end gap-3 pt-4">

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

                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"

                      >

                        Add to List

                      </button>

                    </div>

                  </form>

                )}

                {showTargetForm && (

                  <form onSubmit={handleCreateTarget} className="space-y-4">

                    <div>

                      <label className="text-sm font-medium text-black">Target Activity</label>

                      <textarea

                        value={targetFormData.targetActivity}

                        onChange={(e) => setTargetFormData({ ...targetFormData, targetActivity: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                        required

                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-black">Date</label>

                      <input

                        type="date"

                        value={targetFormData.date}

                        onChange={(e) => setTargetFormData({ ...targetFormData, date: e.target.value })}

                        className="text-black w-full border rounded-md px-3 py-2 mt-1"

                      />

                    </div>

                    <div className="flex justify-end gap-3 pt-4">

                      <button

                        type="button"

                        onClick={() => setShowWorkPlanModal(false)}

                        className="px-4 py-2 border rounded-md"

                      >

                        Cancel

                      </button>

                      <button

                        type="submit"

                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"

                      >

                        Create Target Activity

                      </button>

                    </div>

                  </form>

                )}
    
              </div>
    
            </div>
    
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
                    <td className="px-6 py-4 text-black">{research.subResearches.length}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
                    <td colSpan={8} className="px-6 py-8 text-center text-black/60">
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
    </div>
  );
}