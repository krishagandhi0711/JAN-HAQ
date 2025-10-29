// src/utils/api.js
const BASE_URL = "http://localhost:3000"; // backend URL

// --- Generic API request helper ---
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "API request failed");
  }

  return data;
}

// --- Auth API ---

// Login: Only succeeds if user is registered, returns full user with profile
export async function loginUser(email, password) {
  console.log('API - Logging in user:', email);
  
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  console.log('API - Login response received:', {
    hasToken: !!data.token,
    hasUser: !!data.user,
    userId: data.user?._id,
    hasProfile: !!data.user?.profile,
    profileRole: data.user?.profile?.role,
    profileInterests: data.user?.profile?.interests
  });

  // Validate response structure
  if (!data.token) {
    throw new Error('No authentication token received');
  }

  if (!data.user || !data.user._id) {
    throw new Error('Invalid user data received');
  }

  // Store token and full user object (including profile) in localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  console.log('API - Login successful, data stored in localStorage');

  return data.user;
}

// Register: Creates new user with profile, returns token and complete user object
export async function registerUser(name, email, password, profile = null) {
  console.log('API - Registering user:', email, 'with profile:', profile);
  
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, profile }),
  });

  console.log('API - Registration response:', {
    hasToken: !!data.token,
    hasUser: !!data.user,
    userId: data.user?._id,
    hasProfile: !!data.user?.profile,
    profileRole: data.user?.profile?.role,
    profileInterests: data.user?.profile?.interests
  });

  // Validate response structure
  if (!data.token) {
    throw new Error('No authentication token received');
  }

  if (!data.user || !data.user._id) {
    throw new Error('Invalid user data received');
  }

  // Store token and user in localStorage after registration
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  console.log('API - Registration successful, data stored in localStorage');

  return data;
}

// Get current user profile (protected route) - refreshes user data from backend
export async function getUserProfile() {
  console.log('API - Fetching user profile from backend');
  
  const data = await apiRequest("/api/auth/profile", {
    method: "GET",
  });

  console.log('API - Profile fetched:', {
    userId: data._id,
    hasProfile: !!data.profile,
    profile: data.profile
  });

  // Update user in localStorage with fresh profile data
  localStorage.setItem("user", JSON.stringify(data));

  return data;
}

// Update user profile (for onboarding or profile edits)
export async function updateUserProfile({ profile }) {
  console.log('API - Updating user profile:', profile);
  const data = await apiRequest("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });
  console.log('API - Profile update response:', {
    userId: data.user?._id,
    profileRole: data.user?.profile?.role,
    profileInterests: data.user?.profile?.interests
  });
  if (!data.user || !data.user._id) {
    throw new Error('Invalid user data received after profile update');
  }
  localStorage.setItem("user", JSON.stringify(data.user));
  console.log('API - Profile updated successfully in localStorage');
  return data.user;
}

// Change password
export async function changePassword(currentPassword, newPassword) {
  console.log('API - Changing password');
  const data = await apiRequest("/api/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  console.log('API - Password changed successfully');
  return data;
}

// Check if user profile is complete (for onboarding check)
export function isProfileComplete(user) {
  if (!user || !user.profile) {
    console.log('isProfileComplete - No user or profile:', !!user);
    return false;
  }
  
  const { role, interests } = user.profile;
  
  const complete = (
    role && 
    role.trim() !== "" &&
    interests && 
    Array.isArray(interests) && 
    interests.length > 0
  );
  
  console.log('isProfileComplete - Check:', {
    hasRole: !!role,
    role: role,
    interestCount: interests?.length || 0,
    complete
  });
  
  return complete;
}

// Get user from localStorage
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    console.log('getCurrentUser - No user in localStorage');
    return null;
  }
  
  try {
    const user = JSON.parse(userStr);
    console.log('getCurrentUser - Retrieved user:', {
      userId: user._id,
      name: user.name,
      email: user.email,
      hasProfile: !!user.profile,
      profileRole: user.profile?.role,
      profileInterestsCount: user.profile?.interests?.length || 0
    });
    return user;
  } catch (err) {
    console.error("getCurrentUser - Failed to parse user from localStorage:", err);
    localStorage.removeItem("user"); // Clear corrupted data
    return null;
  }
}

// --- Recommendations API ---

// Get recommendations based on user profile (POST with profile in body)
export async function getRecommendations(profile) {
  console.log('API - Fetching recommendations for profile:', {
    role: profile?.role,
    interestsCount: profile?.interests?.length || 0
  });
  
  // Don't make API call if profile is incomplete
  if (!profile || (!profile.role && (!profile.interests || profile.interests.length === 0))) {
    console.log('API - Profile incomplete, returning empty recommendations');
    return [];
  }

  try {
    const data = await apiRequest("/api/recommendations", {
      method: "POST",
      body: JSON.stringify({ profile }),
    });

    console.log('API - Recommendations received:', data?.length || 0, 'items');

    return data || [];
  } catch (err) {
    console.error('API - Error fetching recommendations:', err);
    return [];
  }
}

// Get recommendations for authenticated user (GET - uses token)
export async function getMyRecommendations() {
  try {
    console.log('API - Fetching recommendations for authenticated user');
    
    const data = await apiRequest("/api/recommendations", {
      method: "GET",
    });
    
    console.log('API - My recommendations received:', data?.length || 0, 'items');
    
    return data || [];
  } catch (err) {
    console.error("API - Failed to fetch recommendations:", err);
    return [];
  }
}

// --- Public APIs ---

export async function searchProblem(query) {
  if (!query) return [];
  return apiRequest(`/search?q=${encodeURIComponent(query)}`);
}

export async function getAllLaws() {
  return apiRequest("/api/laws");
}

export async function getAllSchemes() {
  return apiRequest("/api/schemes");
}

export async function explainItem(title, description) {
  if (!title) return null;
  const data = await apiRequest("/api/explain", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
  return data.explanation;
}

// --- Departments API ---
export async function getDepartments() {
  return apiRequest("/api/departments");
}

// --- Complaint Generator APIs (NEW) ---

export async function rewriteComplaint(data) {
  console.log('API - Generating formal complaint...');
  return apiRequest("/api/rewriteComplaint", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitComplaint(data) {
  console.log('API - Submitting new complaint...');
  return apiRequest("/api/complaints", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getComplaints() {
  console.log('API - Fetching user complaints list...');
  return apiRequest("/api/complaints", {
    method: "GET",
  });
}

export async function getComplaintDetails(id) {
  console.log('API - Fetching single complaint details:', id);
  return apiRequest(`/api/complaints/${id}`, {
    method: "GET",
  });
}

// --- Saved Items API ---

// Save an item (law or scheme)
export async function saveItem(itemId, title, description, type, referenceLink = "", tags = []) {
  console.log('API - Saving item:', { itemId, title, type });
  
  try {
    const data = await apiRequest("/api/saved-items", {
      method: "POST",
      body: JSON.stringify({ itemId, title, description, type, referenceLink, tags }),
    });
    
    console.log('API - Item saved successfully');
    return data;
  } catch (err) {
    console.error("API - Failed to save item:", err);
    throw err;
  }
}

// Get all saved items
export async function getSavedItems() {
  console.log('API - Fetching saved items');
  
  try {
    const data = await apiRequest("/api/saved-items", {
      method: "GET",
    });
    
    console.log('API - Saved items received:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error("API - Failed to fetch saved items:", err);
    return [];
  }
}

// Remove a saved item
export async function unsaveItem(itemId) {
  console.log('API - Unsaving item:', itemId);
  
  try {
    const data = await apiRequest(`/api/saved-items/${itemId}`, {
      method: "DELETE",
    });
    
    console.log('API - Item unsaved successfully');
    return data;
  } catch (err) {
    console.error("API - Failed to unsave item:", err);
    throw err;
  }
}

// Check if item is saved
export async function checkIfSaved(itemId) {
  try {
    const data = await apiRequest(`/api/saved-items/check/${itemId}`, {
      method: "GET",
    });
    
    return data.isSaved;
  } catch (err) {
    console.error("API - Failed to check saved status:", err);
    return false;
  }
}

// --- Logout ---
export function logoutUser() {
  console.log('API - Logging out user');
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}