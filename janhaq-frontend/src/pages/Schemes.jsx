import { useState, useEffect, useRef } from "react";
import SchemeCard from "../components/SchemeCard";
import { getAllSchemes } from "../utils/api";

export default function Schemes() {
  const [allSchemes, setAllSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Fetch schemes and extract categories
  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      const schemesData = await getAllSchemes();
      setAllSchemes(schemesData);
      setFilteredSchemes(schemesData);

      const uniqueCategories = [
        ...new Set(schemesData.map((scheme) => scheme.schemeCategory)),
      ];
      setCategories(uniqueCategories.filter(Boolean));
      setLoading(false);
    };
    fetchSchemes();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = allSchemes;
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (scheme) =>
          scheme.scheme_name.toLowerCase().includes(lowercasedFilter) ||
          (scheme.details && scheme.details.toLowerCase().includes(lowercasedFilter))
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (scheme) => scheme.schemeCategory === selectedCategory
      );
    }
    setFilteredSchemes(filtered);
  }, [searchTerm, selectedCategory, allSchemes]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 bg-pattern">

      {/* Proper padding for navbar */}
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Government Schemes</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find and filter schemes that can help you.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-3xl mx-auto items-center relative z-10">
          <input
            type="text"
            placeholder="Filter by keyword..."
            className="w-full sm:flex-1 p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Custom Dropdown */}
          <div className="relative w-full sm:w-1/2" ref={dropdownRef}>
            <button
              type="button"
              className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 flex justify-between items-center"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedCategory}
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10" />
                <ul className="absolute mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg z-20">
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => { setSelectedCategory("All"); setDropdownOpen(false); }}
                  >
                    All Categories
                  </li>
                  {categories.map((cat) => (
                    <li
                      key={cat}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <p className="text-center relative z-0">Loading schemes...</p>
        ) : filteredSchemes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
            {filteredSchemes.map((scheme, index) => (
              <SchemeCard
                key={index}
                id={scheme.id || `scheme-${index}`}
                title={scheme.scheme_name}
                description={scheme.details}
                icon="💡"
                referenceLink={scheme.referenceLink}
                tags={scheme.tags || [scheme.schemeCategory].filter(Boolean)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center col-span-full relative z-0">No schemes match your filters.</p>
        )}
      </div>

      {/* Dotted background styling */}
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
