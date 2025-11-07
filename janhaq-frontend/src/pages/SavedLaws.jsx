import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSavedItems, unsaveItem } from "../utils/api";
import SavedItemCard from "../components/SavedItemCard";
import { Bookmark, Sparkles, BookOpen, FileText, ChevronLeft } from "lucide-react"; // Added ChevronLeft
import { useNavigate } from "react-router-dom"; // Added useNavigate

export default function SavedLaws() {
  const { user } = useAuth();
  const navigate = useNavigate(); // Added navigate hook
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'law', 'scheme'
  const [error, setError] = useState(null);

  // Fetch saved items on mount
  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const items = await getSavedItems();
      setSavedItems(items);
    } catch (err) {
      console.error("Failed to fetch saved items:", err);
      setError("Failed to load saved items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (itemId) => {
    try {
      await unsaveItem(itemId);
      
      // Remove from local state
      setSavedItems(prev => prev.filter(item => item.itemId !== itemId));
      
      console.log("Item removed successfully");
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  // Filter items based on selected filter
  const filteredItems = savedItems.filter(item => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  // Count by type
  const lawsCount = savedItems.filter(item => item.type === "law").length;
  const schemesCount = savedItems.filter(item => item.type === "scheme").length;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-16 px-6">

        {/* --- ADDED BACK BUTTON --- */}
        <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
        >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
        </button>
        {/* --- END OF ADDED BUTTON --- */}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Bookmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold">Saved Items</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your personal library of saved laws and schemes
          </p>
        </div>

        {/* Stats Bar */}
        {!loading && savedItems.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-lg font-semibold dark:text-white">
                    {savedItems.length} Total Items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {lawsCount} Laws
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {schemesCount} Schemes
                  </span>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("law")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "law"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Laws
                </button>
                <button
                  onClick={() => setFilter("scheme")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === "scheme"
                      ? "bg-green-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Schemes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your saved items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchSavedItems}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && savedItems.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">No Saved Items Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start building your personal library by saving laws and schemes that matter to you.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/laws"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Laws
              </a>
              <a
                href="/schemes"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Browse Schemes
              </a>
            </div>
          </div>
        )}

        {/* Saved Items Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <SavedItemCard
                key={item.itemId}
                itemId={item.itemId}
                title={item.title}
                description={item.description}
                type={item.type}
                referenceLink={item.referenceLink}
                tags={item.tags}
                onUnsave={handleUnsave}
              />
            ))}
          </div>
        )}

        {/* No Results for Filter */}
        {!loading && !error && savedItems.length > 0 && filteredItems.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">
              No {filter === "law" ? "Laws" : "Schemes"} Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't saved any {filter === "law" ? "laws" : "schemes"} yet.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Show All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}