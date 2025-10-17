import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // ✅ Import AuthProvider
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Laws from "./pages/Laws";
import Schemes from "./pages/Schemes";
import ProblemSolver from "./pages/ProblemSolver";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Departments from "./pages/Departments";
import SavedLaws from "./pages/SavedLaws";
import MyComplaints from './pages/MyComplaints';
// NEW IMPORT: Import the new page component
import ComplaintGenerator from './pages/ComplaintGenerator';
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider> {/* ✅ Wrap everything with AuthProvider */}
      <Router>
        <Routes>
          {/* Public pages inside MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            {/* ✅ Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="laws" element={<Laws />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="problem-solver" element={<ProblemSolver />} />
              <Route path="departments" element={<Departments />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="saved-laws" element={<SavedLaws />} />
              {/* COMPLAINTS: List View */}
              <Route path="my-complaints" element={<MyComplaints />} /> 
              {/* FIX: Dynamic Route for Complaint Details (to avoid 404 on /my-complaints/ID) */}
              <Route path="my-complaints/:complaintId" element={<MyComplaints />} />
              {/* NEW ROUTE: Add the path for the Complaint Generator */}
              <Route path="complaint-generator" element={<ComplaintGenerator />} />
                <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Auth pages (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<div className="p-10 text-center">Page not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;