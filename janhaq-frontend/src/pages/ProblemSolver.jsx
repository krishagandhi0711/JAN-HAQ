import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { searchProblem, explainItem, saveItem, unsaveItem, checkIfSaved } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import { Bookmark, ChevronLeft } from "lucide-react"; // Added ChevronLeft
import LoginPromptModal from "../components/LoginPromptModal";

export default function ProblemSolver() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); // Added navigate hook
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [error, setError] = useState(null);
  const [savedStatus, setSavedStatus] = useState({});
  const [savingStatus, setSavingStatus] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery) handleSearch(initialQuery);
  }, [searchParams]);

  // Check saved status for all results when authenticated
  useEffect(() => {
    if (isAuthenticated && results.length > 0) {
      checkAllSavedStatus();
    }
  }, [results, isAuthenticated]);

  const checkAllSavedStatus = async () => {
    const statusChecks = results.map(async (item) => {
      const itemId = generateItemId(item.title);
      const isSaved = await checkIfSaved(itemId);
      return { itemId, isSaved };
    });

    const statuses = await Promise.all(statusChecks);
    const statusMap = {};
    statuses.forEach(({ itemId, isSaved }) => {
      statusMap[itemId] = isSaved;
    });
    setSavedStatus(statusMap);
  };

  const generateItemId = (title) => {
    return `search-${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50)}`;
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setExplanations({});
    setSavedStatus({});

    try {
      const data = await searchProblem(searchQuery.trim());
      setResults(data);
      if (data.length === 0) setError("No relevant laws or schemes found for your query.");
    } catch {
      setError("Failed to fetch search results. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const handleExplain = async (title, description) => {
    if (explanations[title]) return;
    setExplanations(prev => ({ ...prev, [title]: "Loading explanation..." }));
    const explanation = await explainItem(title, description);
    setExplanations(prev => ({ ...prev, [title]: marked.parse(explanation || "No explanation available.") }));
  };

  const handleSaveClick = async (item) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const itemId = generateItemId(item.title);
    setSavingStatus(prev => ({ ...prev, [itemId]: true }));

    try {
      const isSaved = savedStatus[itemId];
      
      if (isSaved) {
        await unsaveItem(itemId);
        setSavedStatus(prev => ({ ...prev, [itemId]: false }));
      } else {
        // Determine type based on content (you can improve this logic)
        const type = item.title.toLowerCase().includes('act') || 
                     item.title.toLowerCase().includes('law') ||
                     item.title.toLowerCase().includes('rule') ? 'law' : 'scheme';
        
        await saveItem(
          itemId,
          item.title,
          item.description,
          type,
          item.referenceLink,
          []
        );
        setSavedStatus(prev => ({ ...prev, [itemId]: true }));
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      alert(err.message || "Failed to save item. Please try again.");
    } finally {
      setSavingStatus(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 bg-pattern">

      {/* Top and bottom spacing + inner padding */}
      <div className="mt-[-100px] mb-[-140px] pt-24 pb-24 px-4 sm:px-6 lg:px-16">

        {/* --- ADDED BACK BUTTON --- */}
        <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
        >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
        </button>
        {/* --- END OF ADDED BUTTON --- */}

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Problem Solver</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Describe your problem and get relevant laws, schemes, and AI explanations.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Describe your problem..."
            className="p-3 rounded-lg flex-1 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 w-full"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Loading / Error */}
        {loading && <p className="text-center mb-4">Searching for relevant information...</p>}
        {error && !loading && <p className="text-center text-red-500">{error}</p>}

        {/* Results */}
        <div className="space-y-6">
          {results.map(item => {
            const itemId = generateItemId(item.title);
            const isSaved = savedStatus[itemId] || false;
            const isSaving = savingStatus[itemId] || false;

            return (
              <div
                key={`${item.title}-${item.score}`}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 relative"
              >
                {/* Save Button */}
                <button
                  onClick={() => handleSaveClick(item)}
                  disabled={isSaving}
                  className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                    isSaved
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={isSaved ? "Remove from saved items" : "Save this item"}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                  )}
                </button>

                <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 pr-12">{item.title}</h3>
                <p className="my-2 text-gray-700 dark:text-gray-300">{item.description || "No description available."}</p>

                {item.referenceLink && (
                  <a
                    href={item.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mr-4"
                  >
                    Read full document
                  </a>
                )}

                <button
                  onClick={() => handleExplain(item.title, item.description)}
                  disabled={!!explanations[item.title]}
                  className="mt-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-50"
                >
                  {explanations[item.title] ? 'Explained' : 'Explain with AI'}
                </button>

                {explanations[item.title] && (
                  <div
                    className="prose dark:prose-invert max-w-none mt-4 p-4 border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700 rounded-r-lg"
                    dangerouslySetInnerHTML={{ __html: explanations[item.title] }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
      />

      {/* Dotted Background Styling */}
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