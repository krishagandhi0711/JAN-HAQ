import { useEffect, useState } from "react";
import DeptCard from "../components/DeptCard";
import { getDepartments } from '../utils/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        setDepartments([]);
      }
      setLoading(false);
    };
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 bg-pattern">
      <div className="pt-28 pb-8 px-6 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Departments & Authorities</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore and connect with key government departments and authorities.
          </p>
        </div>

        {/* Department Cards */}
        {loading ? (
          <p className="text-center">Loading departments...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {departments.length > 0 ? (
              departments.map((dept, index) => (
                <DeptCard
                  key={dept._id || index}
                  title={dept.name}
                  contact_person={dept.contact_person}
                  phone={dept.phone}
                  email={dept.email}
                  city={dept.city}
                  icon="🏛️"
                />
              ))
            ) : (
              <p className="text-center col-span-full">No departments found.</p>
            )}
          </div>
        )}
      </div>

      {/* Background pattern styling */}
      <style>
        {`
          .bg-pattern {
            background-color: #f9fafb;
            background-image: radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px);
            background-size: 15px 15px;
          }
          .dark .bg-pattern {
            background-color: #111827;
            background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
            background-size: 20px 20px;
          }
        `}
      </style>
    </div>
  );
}
