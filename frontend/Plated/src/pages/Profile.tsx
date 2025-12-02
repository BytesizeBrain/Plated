import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAuthenticated, removeToken, setToken } from '../utils/auth';
import { updateUser, checkUsername, getUserProfile } from '../utils/api';
import BottomNav from '../components/navigation/BottomNav';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [email, setEmail] = useState('');
  
  // Editing state
  const [editUsername, setEditUsername] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const [profilePicError, setProfilePicError] = useState('');
  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Helper to validate image URLs: Allow only https? URLs (optionally data: if needed)
  function isValidImageUrl(url: string): boolean {
    // Allow only http(s) URLs, optionally add support for data:image
    try {
      const allowedProtocols = ['http:', 'https:'];
      const parsed = new URL(url);
      return allowedProtocols.includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  }

  useEffect(() => {
    const initProfile = async () => {
      // Get token from URL parameter if present (OAuth redirect)
      const token = searchParams.get('token');
      
      if (token) {
        setToken(token);
        // Clean up URL by removing the token parameter
        window.history.replaceState({}, '', '/profile');
      }

      // Check authentication
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Load user data from API
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        setEmail(profile.email);
        setUsername(profile.username);
        setDisplayName(profile.display_name);
        setProfilePic(profile.profile_pic);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // If we get an error (like 404), user needs to register
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status === 404) {
            // User doesn't exist, redirect to register
            navigate('/register');
            return;
          }
        }
        // For other errors (like 401), the axios interceptor will redirect to login
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check username availability when editing
  useEffect(() => {
    if (!isEditing || !editUsername || editUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Don't check if username hasn't changed
    if (editUsername === username) {
      setUsernameAvailable(true);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameCheckLoading(true);
      try {
        const available = await checkUsername(editUsername);
        setUsernameAvailable(available);
      } catch (err) {
        console.error('Failed to check username:', err);
      } finally {
        setUsernameCheckLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editUsername, username, isEditing]);

  const handleEdit = () => {
    setEditUsername(username);
    setEditDisplayName(displayName);
    setEditProfilePic(profilePic);
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditUsername('');
    setEditDisplayName('');
    setEditProfilePic('');
    setError('');
    setUsernameAvailable(null);
  };

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    // Validation
    if (editUsername && editUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!editDisplayName || editDisplayName.length < 1) {
      setError('Display name is required');
      return;
    }

    if (editUsername !== username && usernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: Record<string, string> = {};
      
      if (editUsername && editUsername !== username) {
        updateData.username = editUsername;
      }
      if (editDisplayName !== displayName) {
        updateData.display_name = editDisplayName;
      }
      if (editProfilePic !== profilePic) {
        updateData.profile_pic = editProfilePic;
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setIsSubmitting(false);
        return;
      }

      await updateUser(updateData);
      
      // Update local state
      if (updateData.username) setUsername(updateData.username);
      if (updateData.display_name) setDisplayName(updateData.display_name);
      if (updateData.profile_pic) setProfilePic(updateData.profile_pic);
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (err: unknown) {
      console.error('Update failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <button
            className="back-btn"
            onClick={() => navigate('/feed')}
            aria-label="Go back to feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <h1 className="profile-title">My Profile</h1>
          <button onClick={handleLogout} className="logout-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="profile-content-wrapper">
        <div className="profile-card">
          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="profile-loading">
              <div className="loading-spinner"></div>
              <p>Loading profile...</p>
            </div>
          ) : (
            <div className="profile-content">
              <div className="profile-pic-section">
                <div className="profile-pic-wrapper">
                  <img 
                    src={isEditing 
                      ? (isValidImageUrl(editProfilePic) ? editProfilePic : profilePic) 
                      : profilePic
                    }
                    alt="Profile" 
                    className="profile-pic-large"
                    onError={(e) => {
                      e.currentTarget.src = 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';
                    }}
                  />
                </div>
                <h2 className="profile-display-name">{displayName}</h2>
                <span className="profile-username">@{username}</span>
              </div>

              {!isEditing ? (
                <div className="profile-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="info-content">
                        <label>Username</label>
                        <p>@{username}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </div>
                      <div className="info-content">
                        <label>Email</label>
                        <p>{email}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="info-content">
                        <label>Display Name</label>
                        <p>{displayName}</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleEdit} className="edit-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      <path d="m15 5 4 4"></path>
                    </svg>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="profile-edit-form">
                  <div className="form-group">
                    <label htmlFor="editDisplayName">Display Name *</label>
                    <input
                      id="editDisplayName"
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="editUsername">Username</label>
                    <input
                      id="editUsername"
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="Choose a unique username"
                      minLength={3}
                    />
                    {editUsername && editUsername.length >= 3 && editUsername !== username && (
                      <div className="username-feedback">
                        {usernameCheckLoading ? (
                          <span className="checking">Checking availability...</span>
                        ) : usernameAvailable === true ? (
                          <span className="available">✓ Username is available</span>
                        ) : usernameAvailable === false ? (
                          <span className="unavailable">✗ Username is taken</span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="editProfilePic">Profile Picture URL</label>
                    <input
                      id="editProfilePic"
                      type="url"
                      value={editProfilePic}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || isValidImageUrl(val)) {
                          setEditProfilePic(val);
                          setProfilePicError('');
                        } else {
                          setProfilePicError('Please enter a valid image URL (https)'); 
                          setEditProfilePic(val); // let them see what they typed
                        }
                      }}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                    {profilePicError && (
                      <div className="input-error" style={{ color: 'red', fontSize: '0.9em' }}>
                        {profilePicError}
                      </div>
                    )}

                  <div className="form-actions">
                    <button 
                      onClick={handleSave} 
                      className="save-btn"
                      disabled={isSubmitting || (editUsername !== username && usernameAvailable === false) || profilePicError !== ''}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="cancel-btn"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Profile;
