// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, FileText, Clock, CheckCircle, Leaf, BookOpen, Loader, Edit, Save, X as CloseIcon, User } from "lucide-react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const router = useRouter();
    const [showCreateProposal, setShowCreateProposal] = useState(false);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [researchData, setResearchData] = useState({
      researchProposals: 0,
      ongoingResearch: 0,
      completedResearch: 0,
      maturedResearch: 0,
      publicationResearch: 0,
      infographics: 0,
    });
    const [dashboardData, setDashboardData] = useState({
      recentActivity: [] as string[],
      announcements: [] as string[],
    });
    const [editingActivity, setEditingActivity] = useState(false);
    const [editingAnnouncements, setEditingAnnouncements] = useState(false);
    const [tempActivity, setTempActivity] = useState<string[]>([]);
    const [tempAnnouncements, setTempAnnouncements] = useState<string[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);

   useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [proposalsRes, ongoingRes, completedRes, maturedRes, publicationRes, infographicsRes, dashboardRes] = await Promise.all([
            fetch('/api/research-proposal'),
            fetch('/api/ongoing-research'),
            fetch('/api/completed-research'),
            fetch('/api/matured-research'),
            fetch('/api/publication-research'),
            fetch('/api/infographics'),
            fetch('/api/dashboard'),
          ]);

          const proposals = proposalsRes.ok ? await proposalsRes.json() : [];
          const ongoing = ongoingRes.ok ? await ongoingRes.json() : [];
          const completed = completedRes.ok ? await completedRes.json() : [];
          const matured = maturedRes.ok ? await maturedRes.json() : [];
          const publication = publicationRes.ok ? await publicationRes.json() : [];
          const infographicsData = infographicsRes.ok ? await infographicsRes.json() : { infographics: [] };
          const dashboard = dashboardRes.ok ? await dashboardRes.json() : { recentActivity: [], announcements: [] };

          setResearchData({
            researchProposals: proposals.length,
            ongoingResearch: ongoing.length,
            completedResearch: completed.length,
            maturedResearch: matured.length,
            publicationResearch: publication.length,
            infographics: infographicsData.infographics.length,
          });
          setDashboardData(dashboard);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
      const role = localStorage.getItem('role');
      setUserRole(role);
    }, []);

   const cards = [
     { title: "Research Proposals", count: researchData.researchProposals, link: "/research-proposal", icon: FileText, color: "text-blue-600" },
     { title: "Ongoing Research", count: researchData.ongoingResearch, link: "/ongoing-research", icon: Clock, color: "text-orange-600" },
     { title: "Completed Research", count: researchData.completedResearch, link: "/completed-research", icon: CheckCircle, color: "text-green-600" },
     { title: "Matured Technology", count: researchData.maturedResearch, link: "/matured-research", icon: Leaf, color: "text-purple-600" },
     { title: "Publication", count: researchData.publicationResearch, link: "/publication-research", icon: BookOpen, color: "text-red-600" },
     ...(userRole === 'admin' ? [{ title: "Infographics", count: researchData.infographics, link: "/infographics", icon: FileText, color: "text-pink-600" }] : []),
   ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <div className="flex gap-3">
            {userRole === 'admin' && (
              <button
                onClick={() => router.push('/employees')}
                className="bg-blue-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-800 transition flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                Employee Data
              </button>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
            >
              Create Research Proposal
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {cards.map((card) => (
            <Link key={card.title} href={card.link}>
              <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-6 shadow-lg hover:scale-105 transform transition cursor-pointer flex flex-col items-center text-center relative">
                <ArrowRightIcon className="h-4 w-4 text-gray-500 absolute top-2 right-2" />
                <card.icon className={`h-8 w-8 ${card.color} mb-2`} />
                <h2 className="text-lg font-semibold text-green-700 mb-2">{card.title}</h2>
                <p className="text-3xl font-bold text-black">
                  {loading ? <Loader className="animate-spin h-8 w-8 mx-auto text-blue-600" /> : card.count}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-green-700">Recent Activity</h3>
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    if (!editingActivity) {
                      setTempActivity([...dashboardData.recentActivity]);
                    }
                    setEditingActivity(!editingActivity);
                  }}
                  className="text-green-700 hover:text-green-800"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
            </div>
            {editingActivity ? (
              <div className="space-y-2">
                {tempActivity.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      placeholder="Enter activity item"
                      onChange={(e) => {
                        const newTemp = [...tempActivity];
                        newTemp[index] = e.target.value;
                        setTempActivity(newTemp);
                      }}
                      className="flex-1 border rounded px-2 py-1 text-sm text-black"
                    />
                    <button
                      onClick={() => setTempActivity(tempActivity.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setTempActivity([...tempActivity, ''])}
                  className="text-green-700 hover:text-green-800 text-sm"
                >
                  + Add Item
                </button>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('/api/dashboard', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            ...dashboardData,
                            recentActivity: tempActivity.filter(item => item.trim() !== ''),
                          }),
                        });
                        if (response.ok) {
                          setDashboardData(prev => ({ ...prev, recentActivity: tempActivity.filter(item => item.trim() !== '') }));
                          setEditingActivity(false);
                        }
                      } catch (error) {
                        console.error('Failed to save:', error);
                      }
                    }}
                    className="bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-800"
                  >
                    <Save className="h-4 w-4 inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingActivity(false)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ul className="text-black/80 space-y-2">
                {dashboardData.recentActivity.map((item: string, index: number) => (
                  <li key={index}>- {item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-green-700">Announcements</h3>
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    if (!editingAnnouncements) {
                      setTempAnnouncements([...dashboardData.announcements]);
                    }
                    setEditingAnnouncements(!editingAnnouncements);
                  }}
                  className="text-green-700 hover:text-green-800"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
            </div>
            {editingAnnouncements ? (
              <div className="space-y-2">
                {tempAnnouncements.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      placeholder="Enter announcement item"
                      onChange={(e) => {
                        const newTemp = [...tempAnnouncements];
                        newTemp[index] = e.target.value;
                        setTempAnnouncements(newTemp);
                      }}
                      className="flex-1 border rounded px-2 py-1 text-sm text-black"
                    />
                    <button
                      onClick={() => setTempAnnouncements(tempAnnouncements.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setTempAnnouncements([...tempAnnouncements, ''])}
                  className="text-green-700 hover:text-green-800 text-sm"
                >
                  + Add Item
                </button>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('/api/dashboard', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            ...dashboardData,
                            announcements: tempAnnouncements.filter(item => item.trim() !== ''),
                          }),
                        });
                        if (response.ok) {
                          setDashboardData(prev => ({ ...prev, announcements: tempAnnouncements.filter(item => item.trim() !== '') }));
                          setEditingAnnouncements(false);
                        }
                      } catch (error) {
                        console.error('Failed to save:', error);
                      }
                    }}
                    className="bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-800"
                  >
                    <Save className="h-4 w-4 inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAnnouncements(false)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ul className="text-black/80 space-y-2">
                {dashboardData.announcements.map((item: string, index: number) => (
                  <li key={index}>- {item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>


      {/* CREATE PROPOSAL MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold text-black mb-6">
              Create Research Proposal
            </h2>

            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black">
                  Title
                </label>
                <input
                  type="text"
                  className="text-black w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Status
                </label>
                <input
                  type="text"
                  className="text-black w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Proponents
                </label>
                <input
                  type="text"
                  className="text-black w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Funding Agency
                </label>
                <input
                  type="text"
                  className="text-black w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Attach PDF file
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="text-black w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
