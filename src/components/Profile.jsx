// In src/components/Profile.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useApi } from '../api/apiClient';
import { SKILLS, ROLES, determineRole } from '../data/skills';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    intro: '',
    background: ''
  });
  const [skills, setSkills] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savingFields, setSavingFields] = useState({
    name: false,
    intro: false,
    background: false
  });
  const [selectedRole, setSelectedRole] = useState('');
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [ideaStatus, setIdeaStatus] = useState('few');
  const [teamNeeds, setTeamNeeds] = useState({ needsPM: false, needsDev: false });
  
  const api = useApi();
  const navigate = useNavigate();
  
  // Debounce timer for auto-saving
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }
    fetchProfile();
  }, [navigate]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.user.getProfile();
      setProfile(data.user);
      
      // Set basic form data
      setFormData({
        name: data.user.name || '',
        intro: data.user.intro || '',
        background: data.user.background || '',
      });
      
      // Set skills and calculate suggested role
      const userSkills = data.user.skills || [];
      setSkills(userSkills);
      const calculatedRole = determineRole(userSkills);
      setSuggestedRole(calculatedRole);
      
      // Set role, preferring user's selected role over suggested
      setSelectedRole(data.user.role || calculatedRole);
      
      // Set other profile settings
      setHoursPerWeek(data.user.hoursPerWeek || 40);
      setIdeaStatus(data.user.ideaStatus || 'few');
      setTeamNeeds(data.user.teamNeeds || { needsPM: false, needsDev: false });
      setPhotoPreview(data.user.photo || null);

      console.log(data.user);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle text input changes and trigger auto-save
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear previous timer
    if (debounceTimer) clearTimeout(debounceTimer);
    
    // Show saving state for this field
    setSavingFields(prev => ({ ...prev, [name]: true }));
    
    // Set new timer to save after delay
    const timer = setTimeout(() => {
      saveProfile({ [name]: value });
      setSavingFields(prev => ({ ...prev, [name]: false }));
    }, 750);
    
    setDebounceTimer(timer);
  };
  
  // Handle photo change and save immediately
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select only JPG, JPEG, PNG, or GIF files.');
      return;
    }
    
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Save photo immediately
    saveProfile({}, file);
  };  
  
  // Handle skill selection
  const handleSkillSelection = (skill) => {
    const MAX_SKILLS = 5;
    const newSkills = skills.includes(skill)
      ? skills.filter(s => s !== skill)
      : skills.length < MAX_SKILLS ? [...skills, skill] : skills;
    
    setSkills(newSkills);
    
    // Update role suggestion based on new skills
    const newRole = determineRole(newSkills);
    setSuggestedRole(newRole);
    
    // Save changes
    saveProfile({ skills: newSkills });
  };
  
  // Handle hours per week change
  const handleHoursChange = (e) => {
    const hours = parseInt(e.target.value);
    setHoursPerWeek(hours);
    saveProfile({ hoursPerWeek: hours });
  };
  
  // Handle idea status change
  const handleIdeaStatusChange = (status) => {
    console.log("Setting idea status:", status);
    setIdeaStatus(status);
    saveProfile({ ideaStatus: status });
  };
  
  // Handle team needs change
  const handleTeamNeedsChange = (key) => {
    const newTeamNeeds = {
      ...teamNeeds,
      [key]: !teamNeeds[key]
    };
    setTeamNeeds(newTeamNeeds);
    saveProfile({ teamNeeds: newTeamNeeds });
  };
  
  // Handle role change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  
  // Save role change
  const saveRole = () => {
    saveProfile({ role: selectedRole });
    setIsEditingRole(false);
  };
  
  // Save profile to backend
  const saveProfile = async (updates = {}, photoFile = null) => {
    try {
      setSaving(true);
      
      // Prepare data to save
      const dataToSave = {
        ...formData,
        ...updates,
        skills: updates.skills !== undefined ? updates.skills : skills,
        role: updates.role !== undefined ? updates.role : selectedRole,
        hoursPerWeek: updates.hoursPerWeek !== undefined ? updates.hoursPerWeek : hoursPerWeek,
        ideaStatus: updates.ideaStatus !== undefined ? updates.ideaStatus : ideaStatus,
        teamNeeds: updates.teamNeeds !== undefined ? updates.teamNeeds : teamNeeds
      };
      
      console.log("Saving profile data:", dataToSave);
      
      const data = await api.user.updateProfile(dataToSave, photoFile);
      setProfile(data.user);
      
      // Update all state with the response data
      setFormData({
        name: data.user.name || '',
        intro: data.user.intro || '',
        background: data.user.background || '',
      });
      
      // Update other state variables from response
      if (data.user.skills) setSkills(data.user.skills);
      if (data.user.role) setSelectedRole(data.user.role);
      if (data.user.hoursPerWeek) setHoursPerWeek(data.user.hoursPerWeek);
      if (data.user.ideaStatus) setIdeaStatus(data.user.ideaStatus);
      if (data.user.teamNeeds) setTeamNeeds(data.user.teamNeeds);
      
      setPhotoFile(null); // Clear photo after upload
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = () => {
    api.auth.logout();
  };
  
  if (loading) return <div className="text-center py-12 text-black dark:text-white">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600 dark:text-red-400">Error: {error}</div>;
  
  // Get the idea status display text
  const getIdeaStatusText = (status) => {
    switch(status) {
      case 'one': return 'One, set in stone';
      case 'few': return 'A few of them';
      case 'none': return 'No, open to ideas';
      default: return status;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Your Profile</h1>
        
        {/* Basic profile section */}
        {profile && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative w-16 h-16">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt={profile.name} 
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-100 dark:ring-gray-700">
                    <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-lg font-medium text-black dark:text-white">{profile.name}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {profile.contact?.email || profile.email || 'Email not available'}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Your name"
                />
                {savingFields.name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saving...</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Intro <span className="text-gray-500 dark:text-gray-400">(max 250 characters)</span>
                </label>
                <textarea
                  name="intro"
                  value={formData.intro}
                  onChange={handleInputChange}
                  maxLength={250}
                  rows={3}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="A brief description about yourself"
                />
                <div className="flex justify-between items-center mt-1">
                  <span>{savingFields.intro && <p className="text-sm text-gray-500 dark:text-gray-400">Saving...</p>}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formData.intro.length}/250</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Background <span className="text-gray-500 dark:text-gray-400">(max 5000 characters)</span>
                </label>
                <textarea
                  name="background"
                  value={formData.background}
                  onChange={handleInputChange}
                  maxLength={5000}
                  rows={6}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Tell us about your experience, education, and interests"
                />
                <div className="flex justify-between items-center mt-1">
                  <span>{savingFields.background && <p className="text-sm text-gray-500 dark:text-gray-400">Saving...</p>}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formData.background.length}/5000</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Skills & Preferences Section */}
        {profile && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Skills & Preferences</h2>
            
            <div className="space-y-8">
              {/* Skills selection */}
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">Your Skills (select up to 5)</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Development Skills</h4>
                    <div className="flex flex-wrap gap-3">
                      {SKILLS.dev.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillSelection(skill)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            skills.includes(skill)
                              ? 'bg-role-technical dark:bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Business Skills</h4>
                    <div className="flex flex-wrap gap-3">
                      {SKILLS.business.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillSelection(skill)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            skills.includes(skill)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Role selection */}
                <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 dark:text-gray-300">Based on your skills:</span>
                      {!isEditingRole ? (
                        <span className="font-semibold text-black dark:text-white">
                          You're a {selectedRole || suggestedRole || 'Undecided'}
                        </span>
                      ) : (
                        <select
                          value={selectedRole}
                          onChange={handleRoleChange}
                          className="ml-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                        >
                          {Object.values(ROLES).map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <button
                      onClick={() => isEditingRole ? saveRole() : setIsEditingRole(true)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      {isEditingRole ? 'Save' : 'Change Role'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Hours per week */}
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                  Hours Per Week Commitment
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="15"
                    max="65"
                    step="5"
                    value={hoursPerWeek}
                    onChange={handleHoursChange}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>15 hours</span>
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-black dark:text-white font-bold text-lg">
                      {hoursPerWeek}{hoursPerWeek === 65 && '+'} hours
                    </div>
                    <span>65 hours</span>
                  </div>
                </div>
              </div>
              
              {/* Idea status */}
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                  Startup Idea Status
                </h3>
                <div className="flex justify-center w-full overflow-x-visible">
                  <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 p-1 relative"
                    style={{ "--min-button-width": "clamp(5.5rem, 28vw, 8rem)" }}>
                    <div
                      className="absolute h-[calc(100%-8px)] top-1 transition-all duration-150 ease-in-out bg-black dark:bg-white rounded-full"
                      style={{
                        width: 'var(--min-button-width)',
                        left: `calc(${
                          ideaStatus === 'one' ? '0' :
                          ideaStatus === 'few' ? '1' :
                          '2'
                        } * var(--min-button-width) + 4px)`
                      }}
                    />
                    {[
                      ['one', 'One, set in stone'],
                      ['few', 'A few of them'],
                      ['none', 'No, open to ideas']
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => handleIdeaStatusChange(value)}
                        className={`px-4 sm:px-4 py-2 sm:py-3 rounded-full text-s sm:text-sm font-medium 
                          transition-all duration-200 w-[var(--min-button-width)] text-center relative z-10 
                          leading-tight ${
                          ideaStatus === value
                            ? 'text-white dark:text-black'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Team needs */}
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                  Team Needs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTeamNeedsChange('needsPM')}
                    className={`flex items-center px-6 py-4 rounded-xl transition-all duration-200 ${
                      teamNeeds.needsPM
                        ? 'bg-gray-50 dark:bg-gray-700 border-2 border-black dark:border-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded flex items-center justify-center border transition-colors duration-200 ${
                      teamNeeds.needsPM
                        ? 'bg-black dark:bg-white border-black dark:border-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {teamNeeds.needsPM && (
                        <svg className="w-3 h-3 text-white dark:text-black" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`ml-3 ${teamNeeds.needsPM ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      I'm looking for a Project Manager
                    </span>
                  </button>
                  <button
                    onClick={() => handleTeamNeedsChange('needsDev')}
                    className={`flex items-center px-6 py-4 rounded-xl transition-all duration-200 ${
                      teamNeeds.needsDev
                        ? 'bg-gray-50 dark:bg-gray-700 border-2 border-black dark:border-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded flex items-center justify-center border transition-colors duration-200 ${
                      teamNeeds.needsDev
                        ? 'bg-black dark:bg-white border-black dark:border-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {teamNeeds.needsDev && (
                        <svg className="w-3 h-3 text-white dark:text-black" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`ml-3 ${teamNeeds.needsDev ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      I'm looking for a Developer
                    </span>
                  </button>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-xl">
                  Status: {!teamNeeds.needsPM && !teamNeeds.needsDev ? "My team is full" :
                    [
                      teamNeeds.needsPM && "I'm looking for a PM",
                      teamNeeds.needsDev && "I'm looking for a dev"
                    ].filter(Boolean).join(" and ")}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200"
              >
                Return to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;