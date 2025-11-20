import { useState, useEffect } from 'react';
import Card from '../components/LawCard';
import { getAllLaws } from '../utils/api'; 

export default function Laws() {
  const [allLaws, setAllLaws] = useState([]);
  const [filteredLaws, setFilteredLaws] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaws = async () => {
      setLoading(true);
      const lawsData = await getAllLaws();
      setAllLaws(lawsData);
      setFilteredLaws(lawsData);
      setLoading(false);
    };
    fetchLaws();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLaws(allLaws);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = allLaws.filter(law =>
      law.title.toLowerCase().includes(lowercasedFilter) ||
      (law.description && law.description.toLowerCase().includes(lowercasedFilter))
    );
    setFilteredLaws(filteredData);
  }, [searchTerm, allLaws]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 bg-pattern">

      {/* Proper padding for navbar */}
      <div className="pt-28 pb-16">
        <div className="text-center mb-6 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Laws & Regulations</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse and filter through the legal knowledge base.
          </p>
        </div>

        {/* Search input */}
        <div className="mb-6 max-w-lg mx-auto px-4">
          <input
            type="text"
            placeholder="Filter laws by title or keyword..."
            className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Law cards with extra horizontal padding */}
        {loading ? (
          <p className="text-center">Loading laws...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-12 lg:px-16">
            {filteredLaws.length > 0 ? (
              filteredLaws.map((law, index) => (
                <Card
                  key={index}
                  id={law.id || `law-${index}`}
                  title={law.title}
                  description={law.description}
                  icon="📜"
                  referenceLink={law.referenceLink}
                  tags={law.tags || []}
                />
              ))
            ) : (
              <p className="text-center col-span-full">No laws match your filter.</p>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          /* LIGHT MODE: Visible gray dotted texture */
          .bg-pattern {
            background-color: #f9fafb;
            background-image: radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px);
            background-size: 15px 15px;
          }

          /* DARK MODE: Soft white dotted texture */
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
