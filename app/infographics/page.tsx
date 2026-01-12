'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';

interface Infographic {
  id: number;
  title: string;
  image: string;
}

export default function InfographicsPage() {
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInfographics();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const fetchInfographics = async () => {
    try {
      const res = await fetch('/api/infographics');
      if (res.ok) {
        const data = await res.json();
        setInfographics(data);
      }
    } catch (error) {
      console.error('Failed to fetch infographics:', error);
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
        setFormData({ ...formData, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/infographics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ title: '', image: '' });
        fetchInfographics();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create infographic');
      }
    } catch (error) {
      console.error('Error creating infographic:', error);
      alert('Error creating infographic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this infographic?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/infographics/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchInfographics();
      } else {
        alert('Failed to delete infographic');
      }
    } catch (error) {
      console.error('Error deleting infographic:', error);
      alert('Error deleting infographic');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-black">Infographics</h1>
          {(userRole === 'admin' || userRole === 'employee') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-700 text-white px-5 py-2 rounded-md shadow-md hover:bg-green-800 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Infographic
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {infographics.map((infographic) => (
                <div key={infographic.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={`data:image/jpeg;base64,${infographic.image}`}
                      alt={infographic.title}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => {
                        setSelectedImage(`data:image/jpeg;base64,${infographic.image}`);
                        setShowImageModal(true);
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-black mb-2">{infographic.title}</h3>
                    {userRole === 'admin' && (
                      <div className="flex justify-end gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(infographic.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {infographics.length === 0 && (
                <div className="col-span-full text-center text-black/60 py-8">
                  No infographics found
                </div>
              )}
            </div>
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
              Add Infographic
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
                  className="w-full border rounded-md px-3 py-2 mt-1 text-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Attach Image file
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
                  {submitting ? 'Creating...' : 'Add Infographic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-4 relative">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full h-96 relative">
              <Image
                src={selectedImage}
                alt="Infographic"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}