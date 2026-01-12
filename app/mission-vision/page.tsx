"use client";

import { motion } from "framer-motion";
import bagongPilipinasLogo from "@/assets/images/Bagong-Pilipinas-Logo.png";
import departmentOfAgricultureLogo from "@/assets/images/Department_of_Agriculture_of_the_Philippines.svg.png";

export default function MissionVisionPage() {
  return (
    <section className="relative bg-white overflow-hidden min-h-screen top-6">

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 h-full flex flex-col justify-center items-center relative z-10 text-center">
        {/* Logos */}
        <motion.div
          className="flex justify-center gap-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={bagongPilipinasLogo.src}
            alt="Bagong Pilipinas Logo"
            className="h-16 w-auto object-contain"
          />
          <img
            src={departmentOfAgricultureLogo.src}
            alt="Department of Agriculture Logo"
            className="h-16 w-auto object-contain"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-green-900 font-bold text-3xl sm:text-4xl md:text-5xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          DEPARTMENT OF AGRICULTURE - RFO IX
        </motion.h1>

        <motion.h2
          className="text-green-800 font-semibold text-xl sm:text-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          RESEARCH DIVISION
        </motion.h2>

        {/* Mission */}
        <motion.div
          className="mb-12 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-green-700 mb-4">MISSION</h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            An improved future for the farmer entrepreneurs through dynamic Research, Development and Extension endeavors in agriculture.
          </p>
        </motion.div>

        {/* Vision */}
        <motion.div
          className="max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-green-700 mb-4">VISION</h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            Serving as catalyst in strengthening and maximizing the potentials of the Strategic Agriculture and Fishery Development Zones (SAFDZs) through RD & E to booster productivity, income and sustainability.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
