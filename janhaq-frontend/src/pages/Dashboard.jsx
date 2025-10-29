import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecommendations, updateUserProfile } from '../utils/api';
import { Link } from 'react-router-dom';
import OnboardingForm from '../components/OnboardingForm';
import { BookOpen, FileText, Settings, TrendingUp, Sparkles, CheckCircle, XCircle, Zap } from 'lucide-react'; // <-- Zap is new here

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Helper function to check if profile is complete
  const isProfileComplete = (userObj) => {
    if (!userObj || !userObj.profile) return false;
    
    const { role, interests } = userObj.profile;
    const complete = role && 
                    role.trim() !== '' && 
                    interests && 
                    Array.isArray(interests) && 
                    interests.length > 0;
    
    return complete;
  };

  // Check profile completeness whenever user changes (after login or profile update)
  useEffect(() => {
    if (!user) {
      setShowOnboarding(false);
      return;
    }

    const profileComplete = isProfileComplete(user);
    
    console.log('Dashboard - Profile check:', {
      userId: user._id,
      hasProfile: !!user.profile,
      role: user.profile?.role,
      interests: user.profile?.interests,
      profileComplete
    });

    // Show onboarding only if profile is incomplete AND not in edit mode
    if (!profileComplete && !isEditMode) {
      setShowOnboarding(true);
    }
  }, [user]); // Watch user object for changes

  // Fetch recommendations when user profile is complete
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Don't fetch if no user
      if (!user) {
        console.log('Dashboard - No user, clearing recommendations');
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Don't fetch if profile is incomplete
      if (!isProfileComplete(user)) {
        console.log('Dashboard - Profile incomplete, clearing recommendations');
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Profile is complete, fetch recommendations
      setLoading(true);
      try {
        console.log('Dashboard - Fetching recommendations for profile:', user.profile);
        const recommendedItems = await getRecommendations(user.profile);
        console.log('Dashboard - Received recommendations:', recommendedItems?.length || 0);
        setRecommendations(recommendedItems || []);
      } catch (err) {
        console.error('Dashboard - Error fetching recommendations:', err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.profile?.role, user?.profile?.interests, user?.profile?.ageGroup]); // Re-fetch when profile changes

  // Auto-hide feedback after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle opening edit profile
  const handleEditProfile = () => {
    console.log('Dashboard - Opening edit profile mode');
    setIsEditMode(true);
    setShowOnboarding(true);
    setFeedback(null); // Clear any previous feedback
  };

  // Handle onboarding completion (both initial and edit)
  const handleOnboardingComplete = async (profileData) => {
    setOnboardingLoading(true);
    setFeedback(null);

    try {
      console.log('Dashboard - Saving profile:', profileData);
      
      // Update profile on backend
      const updatedUser = await updateUserProfile(profileData);
      console.log('Dashboard - Backend update successful:', updatedUser);

      // Update context with new profile (this triggers re-renders and recommendation fetch)
      updateProfile(profileData);

      // Hide onboarding modal
      setShowOnboarding(false);
      setIsEditMode(false);
      
      // Show success feedback
      setFeedback({
        type: 'success',
        message: isEditMode 
          ? 'Profile updated successfully! Recommendations will refresh automatically.' 
          : 'Profile created successfully!'
      });

      console.log('Dashboard - Profile saved successfully, recommendations will load automatically');
    } catch (err) {
      console.error('Dashboard - Error updating profile:', err);
      
      // Show error feedback
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save profile. Please try again.'
      });
      
      // Keep modal open on error so user can retry
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Handle onboarding cancel (only for edit mode)
  const handleOnboardingCancel = () => {
    console.log('Dashboard - Onboarding cancelled');
    setShowOnboarding(false);
    setIsEditMode(false);
    setFeedback(null);
  };

  // Render recommendation card
  const RecommendationCard = ({ item }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          {item.score && (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
              {item.score} relevance
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
        {item.title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {item.description || item.summary || 'No description available'}
      </p>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {item.referenceLink && (
        <a 
          href={item.referenceLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          Learn More →
        </a>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Onboarding Modal - Show for incomplete profiles or when editing */}
      {showOnboarding && (
        <OnboardingForm
          onComplete={handleOnboardingComplete}
          onCancel={isEditMode ? handleOnboardingCancel : undefined}
          isLoading={onboardingLoading}
          initialProfile={isEditMode ? user?.profile : null}
          isEditing={isEditMode}
        />
      )}

      <section className="max-w-7xl mx-auto py-12 px-6">
        {/* Feedback Message */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            feedback.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name || 'Guest'}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isProfileComplete(user)
              ? `Here's what we found for ${user.profile.role}s like you`
              : 'Complete your profile to get personalized recommendations'}
          </p>
        </div>

        {/* Profile Summary - Only show if profile is complete */}
        {isProfileComplete(user) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-12 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.ageGroup && (
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                      Age: {user.profile.ageGroup}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                    {user.profile.role}
                  </span>
                  {user.profile.interests?.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-300 dark:border-gray-600"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleEditProfile}
                disabled={onboardingLoading}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition border border-blue-200 dark:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Recommended Section - Only show if profile is complete */}
        {isProfileComplete(user) ? (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold">Recommended for You</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((item, idx) => (
                  <RecommendationCard key={item.id || idx} item={item} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No recommendations available yet. Check back soon!
                </p>
              </div>
            )}
          </section>
        ) : (
          // Profile Incomplete - Prompt to complete
          <section className="mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tell us about yourself to get personalized recommendations tailored just for you.
              </p>
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Complete Profile Now
              </button>
            </div>
          </section>
        )}

        {/* Quick Access Tools */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid md:grid-cols-4 gap-6">
            
            {/* NEW: File a Complaint Card */}
            <Link to="/complaint-generator">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-blue-200 dark:border-blue-800">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                <h3 className="text-lg font-bold mb-2">📝 File a Complaint</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate and submit a formal complaint using AI assistance.
                </p>
              </div>
            </Link>

            {/* Existing Cards */}
            <Link to="/my-complaints">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="text-lg font-bold mb-2">My Complaints</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and track your submitted complaints.
                </p>
              </div>
            </Link>

            <Link to="/saved-laws">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="text-lg font-bold mb-2">Saved Items</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access saved laws and schemes.
                </p>
              </div>
            </Link>

            <Link to="/profile">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                <Settings className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="text-lg font-bold mb-2">Profile Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your information.
                </p>
              </div>
            </Link>
            
          </div>
        </section>
      </section>
    </div>
  );
}