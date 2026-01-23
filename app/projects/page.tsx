'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, X, Wheat, Leaf, TreePine, BookOpen } from 'lucide-react';
import bagongPilipinasLogo from "@/assets/images/Bagong-Pilipinas-Logo.png";
import departmentOfAgricultureLogo from "@/assets/images/Department_of_Agriculture_of_the_Philippines.svg.png";
import mangoIcon from "@/assets/images/mango.png";
import cowIcon from "@/assets/images/cow.png";

interface Project {
  name: string;
  total: number;
}

const iconMap: { [key: string]: React.ComponentType<any> | string } = {
  'Rice': Wheat,
  'Corn and Cassava': Leaf,
  'Mango': mangoIcon.src,
  'Plantation Ccrops': TreePine,
  'LiveStock': cowIcon.src,
  'Other R4D': BookOpen,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTotal, setEditTotal] = useState<number>(0);

  useEffect(() => {
    fetchProjects();
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/total-projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number, total: number) => {
    setEditingIndex(index);
    setEditTotal(total);
  };

  const handleSave = async (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects[index].total = editTotal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/total-projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProjects),
      });
      if (res.ok) {
        setProjects(updatedProjects);
        setEditingIndex(null);
      } else {
        alert('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <motion.div
          className="text-green-700 text-xl font-semibold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Loading Projects...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
      <div className="relative z-10 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Logos */}
          <motion.div
            className="flex justify-center gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={bagongPilipinasLogo.src}
              alt="Bagong Pilipinas Logo"
              className="h-16 w-auto object-contain opacity-80"
            />
            <img
              src={departmentOfAgricultureLogo.src}
              alt="Department of Agriculture Logo"
              className="h-16 w-auto object-contain opacity-80"
            />
          </motion.div>

          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Total Projects
            </motion.h1>
            <motion.p
              className="text-xl text-green-700 font-medium max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Comprehensive overview of research initiatives across different commodities
            </motion.p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const icon = iconMap[project.name] || BookOpen;
              const isUrl = typeof icon === 'string';
              return (
                <motion.div
                  key={project.name}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl hover:bg-white/90 transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Card background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors">
                          {isUrl ? (
                            <img src={icon as string} alt={`${project.name} icon`} className="w-8 h-8" />
                          ) : (
                            React.createElement(icon as React.ComponentType<any>, { className: "w-8 h-8 text-green-700" })
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-green-900 group-hover:text-green-800 transition-colors">
                          {project.name}
                        </h2>
                      </motion.div>
                      {userRole === 'admin' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingIndex === index ? (
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleSave(index)}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Save className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={handleCancel}
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button
                              onClick={() => handleEdit(index, project.total)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-gray-600 font-medium mb-2">Total Projects</p>
                      {editingIndex === index ? (
                        <motion.input
                          type="number"
                          value={editTotal}
                          onChange={(e) => setEditTotal(Number(e.target.value))}
                          className="text-center border-2 border-green-300 rounded-lg px-4 py-2 w-24 text-2xl font-bold text-green-700 focus:border-green-500 focus:outline-none"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      ) : (
                        <motion.p
                          className="text-4xl font-bold text-green-700"
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {project.total}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-20"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}