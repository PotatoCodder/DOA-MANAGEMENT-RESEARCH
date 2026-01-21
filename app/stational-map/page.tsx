"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import bagongPilipinasLogo from "@/assets/images/Bagong-Pilipinas-Logo.png";
import departmentOfAgricultureLogo from "@/assets/images/Department_of_Agriculture_of_the_Philippines.svg.png";
import stationImage from "../../assets/images/station.jpg";

export default function StationalMapPage() {
  return (
    <section className="relative bg-white overflow-hidden min-h-screen">
      {/* Background wave shapes */}
      <div className="absolute bottom-0 left-0 w-full h-40 md:h-60">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="#15603D"
            d="M0,64L80,90.7C160,117,320,171,480,176C640,181,800,139,960,144C1120,149,1280,203,1360,229.3L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
          <path
            fill="#F9A825"
            fillOpacity="0.6"
            d="M0,224L80,208C160,192,320,160,480,165.3C640,171,800,213,960,197.3C1120,181,1280,107,1360,69.3L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
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
          className="text-green-900 font-bold text-3xl sm:text-4xl md:text-5xl mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          DEPARTMENT OF AGRICULTURE - RFO IX
        </motion.h1>

        <motion.h2
          className="text-green-800 font-semibold text-xl sm:text-2xl mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          RESEARCH DIVISION
        </motion.h2>

        {/* Content Layout */}
        <div className="flex flex-col gap-8">
          {/* Image */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Image
              src={stationImage}
              alt="Station Map"
              className="w-full h-screen object-contain rounded-lg shadow-lg"
            />
          </motion.div>

          {/* Stations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h3 className="text-lg font-bold text-green-700 mb-2">Ipil Zamboanga Sibugay<br />Research and Experiment Station</h3>
              <p className="text-gray-600 mb-4">Mabini and Taruc Experimental Site</p>
              <h4 className="font-semibold text-green-600 mb-2">PRIORITY COMMODITY</h4>
              <ul className="list-disc list-inside text-gray-700">
                <li>Coffee</li>
                <li>Cacao</li>
                <li>Corn and Cassava</li>
                <li>Calamansi</li>
                <li>Rice</li>
                <li>Carabao</li>
                <li>Swine</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <h3 className="text-lg font-bold text-green-700 mb-2">Zamboanga del Norte<br />Research and Experiment Station</h3>
              <p className="text-gray-600 mb-4">Kalawit and Inuman Experimental Site</p>
              <h4 className="font-semibold text-green-600 mb-2">PRIORITY COMMODITY</h4>
              <ul className="list-disc list-inside text-gray-700">
                <li>Mango</li>
                <li>Cattle</li>
                <li>Fruit Trees</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <h3 className="text-lg font-bold text-green-700 mb-2">La Paz Research and<br />Experiment Station</h3>
              <p className="text-gray-600 mb-4">Pamucutan and Isabela Experimental Site</p>
              <h4 className="font-semibold text-green-600 mb-2">PRIORITY COMMODITY</h4>
              <ul className="list-disc list-inside text-gray-700">
                <li>Highland and Pinatbot</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <h3 className="text-lg font-bold text-green-700 mb-2">Zamboanga del Sur<br />Research and Experiment Station</h3>
              <p className="text-gray-600 mb-4">Dumalinao and Betinan Experimental Site</p>
              <h4 className="font-semibold text-green-600 mb-2">PRIORITY COMMODITY</h4>
              <ul className="list-disc list-inside text-gray-700">
                <li>Native Chicken</li>
                <li>Native Swine</li>
                <li>Upland Rice</li>
                <li>Adlay</li>
                <li>Soybean</li>
                <li>Mushroom</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

