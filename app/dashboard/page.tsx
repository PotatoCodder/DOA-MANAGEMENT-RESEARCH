// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, FileText, Clock, CheckCircle, Leaf, BookOpen, Loader } from "lucide-react";
import { X } from "lucide-react";

const DashboardPage = () => {
   const [showCreateProposal, setShowCreateProposal] = useState(false);
   const [open, setOpen] = useState(false);
   const [loading, setLoading] = useState(true);
   const [researchData, setResearchData] = useState({
     researchProposals: 0,
     ongoingResearch: 0,
     completedResearch: 0,
     maturedResearch: 0,
     publicationResearch: 0,
   });

   useEffect(() => {
      const fetchCounts = async () => {
        setLoading(true);
        try {
          const [proposalsRes, ongoingRes, completedRes, maturedRes, publicationRes] = await Promise.all([
            fetch('/api/research-proposal'),
            fetch('/api/ongoing-research'),
            fetch('/api/completed-research'),
            fetch('/api/matured-research'),
            fetch('/api/publication-research'),
          ]);

          const proposals = proposalsRes.ok ? await proposalsRes.json() : [];
          const ongoing = ongoingRes.ok ? await ongoingRes.json() : [];
          const completed = completedRes.ok ? await completedRes.json() : [];
          const matured = maturedRes.ok ? await maturedRes.json() : [];
          const publication = publicationRes.ok ? await publicationRes.json() : [];

          setResearchData({
            researchProposals: proposals.length,
            ongoingResearch: ongoing.length,
            completedResearch: completed.length,
            maturedResearch: matured.length,
            publicationResearch: publication.length,
          });
        } catch (error) {
          console.error('Failed to fetch counts:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCounts();
    }, []);

   const cards = [
     { title: "Research Proposals", count: researchData.researchProposals, link: "/research-proposal", icon: FileText, color: "text-blue-600" },
     { title: "Ongoing Research", count: researchData.ongoingResearch, link: "/ongoing-research", icon: Clock, color: "text-orange-600" },
     { title: "Completed Research", count: researchData.completedResearch, link: "/completed-research", icon: CheckCircle, color: "text-green-600" },
     { title: "Matured Research", count: researchData.maturedResearch, link: "/matured-research", icon: Leaf, color: "text-purple-600" },
     { title: "Publication Research", count: researchData.publicationResearch, link: "/publication-research", icon: BookOpen, color: "text-red-600" },
   ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <button
            onClick={() => setOpen(!open)}
            className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition"
          >
            Create Research Proposal
          </button>
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
            <h3 className="text-xl font-semibold text-green-700 mb-3">Recent Activity</h3>
            <ul className="text-black/80 space-y-2">
              <li>- Research proposal "Sustainable Farming" submitted</li>
              <li>- Ongoing research "Rice Yield Study" updated</li>
              <li>- Completed research "Corn Pest Control" published</li>
              <li>- New matured technology "Organic Fertilizer" added</li>
            </ul>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-green-700 mb-3">Announcements</h3>
            <ul className="text-black/80 space-y-2">
              <li>- DA RFO IX webinar on modern agriculture techniques</li>
              <li>- Submission deadline for research proposals: Jan 15</li>
              <li>- New guidelines for research publication uploaded</li>
            </ul>
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
