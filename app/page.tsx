"use client"
import { useEffect } from 'react';
import HeroSection from '../components/hero';
import LoginModal from './components/LoginModal';


export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);
  }, []);



  return (
    <div>
      <LoginModal />
      <HeroSection/>
    </div>      
  );
}
