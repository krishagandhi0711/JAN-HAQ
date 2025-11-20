import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from './BackToTop'; // ✅ Import BackToTop

// This component provides the standard layout with Navbar and Footer
export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* The 'Outlet' is a placeholder from React Router where the actual page component will be rendered */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BackToTop /> {/* ✅ Add BackToTop here */}
    </div>
  );
}
