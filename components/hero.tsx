"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import bagongPilipinasLogo from "@/assets/images/Bagong-Pilipinas-Logo.png";
import departmentOfAgricultureLogo from "@/assets/images/Department_of_Agriculture_of_the_Philippines.svg.png";

export default function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden h-screen">
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-center items-center relative z-10 text-center">
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
          className="text-green-900 font-bold text-3xl sm:text-4xl md:text-5xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          DEPARTMENT OF AGRICULTURE - RFO IX
        </motion.h1>

        <motion.h2
          className="text-green-800 font-semibold text-xl sm:text-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          RESEARCH DIVISION
        </motion.h2>

        {/* Contact Info */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-700 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-700" />
            0917 7128 609 / 0998 5667 609
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-700" />
            darfo9researchdivision@gmail.com
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-700" />
            Sanito, Ipil, Zamboanga Sibugay
          </div>
        </motion.div>
      </div>
    </section>
  );
}