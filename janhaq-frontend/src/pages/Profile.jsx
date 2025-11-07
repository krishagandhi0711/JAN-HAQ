import React, { useState, useEffect, useRef } from "react";
import { getUserProfile, updateUserProfile, changePassword } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import OnboardingForm from "../components/OnboardingForm";
import { UserCircle, ChevronLeft } from "lucide-react"; // Added ChevronLeft
import { useNavigate } from "react-router-dom"; // Added useNavigate

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate(); // Added navigate hook
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [casteCategory, setCasteCategory] = useState("");
  const [address, setAddress] = useState("");
  const [profilePic, setProfilePic] = useState(null); // base64 or url
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const fileInputRef = useRef();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [personalization, setPersonalization] = useState({ ageGroup: "", role: "", interests: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const casteCategories = ["General", "OBC", "SC", "ST", "Other"];

  // Load user profile on mount
  useEffect(() => {
    setLoading(true);
    setError("");
    getUserProfile()
      .then(data => {
        setFullName(data.name || "");
        setEmail(data.email || "");
        setCasteCategory(data.profile?.casteCategory || "");
        setAddress(data.profile?.address || "");
        setPersonalization({
          ageGroup: data.profile?.ageGroup || "",
          role: data.profile?.role || "",
          interests: Array.isArray(data.profile?.interests) ? data.profile.interests : [],
        });
        if (data.profile?.profilePic) {
          setProfilePic(data.profile.profilePic);
          setProfilePicPreview(data.profile.profilePic);
        } else {
          setProfilePic(null);
          setProfilePicPreview(null);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load profile");
        setLoading(false);
      });
  }, []);

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Send all profile fields as a nested 'profile' object
      const profileData = {
        ...personalization,
        casteCategory,
        address,
        profilePic: profilePic || "",
      };
      const updatedUser = await updateUserProfile({ profile: profileData });
      if (fullName && fullName !== user?.name) {
        updateUser({ ...updatedUser, name: fullName });
      } else {
        updateUser(updatedUser);
      }
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Profile picture upload/preview
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle onboarding form completion
  const handlePersonalizationEdit = (profile) => {
    setPersonalization(profile);
    setShowOnboarding(false);
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-grow max-w-2xl mx-auto py-14 px-2 sm:px-6">
        
        {/* --- ADDED BACK BUTTON --- */}
        <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
        >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
        </button>
        {/* --- END OF ADDED BUTTON --- */}
        
        <form onSubmit={handleSave} className="bg-white/95 dark:bg-gray-800/95 rounded-3xl p-8 shadow-2xl space-y-10 border border-blue-100 dark:border-gray-700 backdrop-blur-md">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-xl transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-4 border-blue-400 shadow-xl">
                  <UserCircle className="w-24 h-24 text-blue-400 dark:text-gray-400" />
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 border-2 border-white dark:border-gray-800"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Change profile picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h6m2 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleProfilePicChange}
              />
            </div>
            <h1 className="text-4xl font-extrabold text-center tracking-tight bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent mb-2">Profile Settings</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 text-center">Manage your personal information and preferences</p>
          </div>
          {/* Personal Info */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
                />
              </div>
            </div>
          </section>
          {/* Personalization (Onboarding Form) */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300 flex items-center justify-between">Personalization
              <button
                className="ml-4 px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                onClick={() => setShowOnboarding(true)}
                type="button"
              >
                Edit
              </button>
            </h2>
            <div className="mb-2">
              <span className="block text-gray-700 dark:text-gray-300">Age Group: <b>{personalization.ageGroup || "-"}</b></span>
              <span className="block text-gray-700 dark:text-gray-300">Role: <b>{personalization.role || "-"}</b></span>
              <span className="block text-gray-700 dark:text-gray-300">Interests: <b>{personalization.interests?.join(", ") || "-"}</b></span>
            </div>
          </section>
          {/* Caste Category */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Caste Category</h2>
            <select
              value={casteCategory}
              onChange={e => setCasteCategory(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
            >
              <option value="">Select category</option>
              {casteCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </section>
          {/* Address (Backend) */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Address</h2>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Your address"
              className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
            />
          </section>
          {/* Change Password */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-3 rounded-xl border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
                />
              </div>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={changingPassword}
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
              {passwordSuccess && <span className="block text-green-600 dark:text-green-400 font-medium text-sm">{passwordSuccess}</span>}
              {passwordError && <span className="block text-red-600 dark:text-red-400 font-medium text-sm">{passwordError}</span>}
            </div>
          </section>
          {/* Save Button & Status */}
          <div className="flex flex-col items-center space-y-2 mt-8">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 hover:from-blue-700 hover:via-purple-600 hover:to-pink-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg tracking-wide"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {success && <span className="text-green-600 dark:text-green-400 font-medium">{success}</span>}
            {error && <span className="text-red-600 dark:text-red-400 font-medium">{error}</span>}
          </div>
          {/* Onboarding Modal for Personalization */}
          {showOnboarding && (
            <OnboardingForm
              initialProfile={personalization}
              onComplete={handlePersonalizationEdit}
              onCancel={() => setShowOnboarding(false)}
            />
          )}
        </form>
      </div>
    </div>
  );
}