import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKILLS, ROLES, determineRole } from '../data/skills';
import { useApi } from '../api/apiClient';

function Onboarding() {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [ideaStatus, setIdeaStatus] = useState('few');
  const [teamNeeds, setTeamNeeds] = useState({ needsPM: false, needsDev: false });
  const [suggestedRole, setSuggestedRole] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState('');
  const [intro, setIntro] = useState('');
  const [background, setBackground] = useState('');
  const [contact, setContact] = useState({ email: '', phone: '', slack: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await api.user.getProfile();
        if (response.user) {
          setIsAuthenticated(true);
          fetchProfileData(response.user);
          setContact(prev => ({ ...prev, email: response.user.email || localStorage.getItem('userEmail') || '' }));
        } else {
          throw new Error('No user data returned');
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchProfile();
  }, []);

  const fetchProfileData = (userData) => {
    if (!userData) return;
    
    setName(prev => prev || userData.name || '');
    setIntro(prev => prev || userData.intro || '');
    setBackground(prev => prev || userData.background || '');
    
    if (userData.skills && userData.skills.length > 0) {
      setSkills(userData.skills);
      const role = determineRole(userData.skills);
      setSuggestedRole(role);
      setSelectedRole(userData.role || role);
    }
    
    if (userData.hoursPerWeek) {
      setHoursPerWeek(userData.hoursPerWeek);
    }
    
    if (userData.ideaStatus) {
      setIdeaStatus(userData.ideaStatus);
    }
    
    if (userData.teamNeeds) {
      setTeamNeeds({
        needsPM: userData.teamNeeds.needsPM || false,
        needsDev: userData.teamNeeds.needsDev || false
      });
    }
    
    setContact(prev => ({
      email: userData.contact?.email || localStorage.getItem('userEmail') || '',
      phone: userData.contact?.phone || '',
      slack: userData.contact?.slack || ''
    }));
    
    if (userData.photo) {
      setPhotoPreview(userData.photo);
    }
    
    if (userData.name && userData.photo) {
      setStep(2);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleProfileSubmit = async () => {
    setError('');
    try {
      await api.user.updateProfile({
        name,
        intro,
        background,
        contact
      }, photo);
      return true;
    } catch (err) {
      setError(err.message || 'Error updating profile');
      return false;
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.user.updateProfile({
        // Include all data
        name,
        intro,
        background,
        skills,
        role: selectedRole || suggestedRole || 'Undecided',
        hoursPerWeek,
        ideaStatus,
        teamNeeds,
        contact
      }, photo);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error completing profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select only JPG, JPEG, PNG, or GIF files.');
      return;
    }
    
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };  

  const handleSkillSelection = (skill) => {
    const MAX_SKILLS = 5;
    setSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < MAX_SKILLS ? [...prev, skill] : prev
    );
    
    // Update role suggestion based on new skills
    const newSkills = skills.includes(skill) 
      ? skills.filter(s => s !== skill)
      : [...skills, skill].slice(0, MAX_SKILLS);
    const newRole = determineRole(newSkills);
    setSuggestedRole(newRole);
    if (!isEditingRole) setSelectedRole(newRole);
  };

  const handleTeamNeedsChange = (key) => {
    setTeamNeeds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Show loading state
  if (loading && step === 1) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  // Display idea status text
  const getIdeaStatusText = () => {
    switch(ideaStatus) {
      case 'one': return 'One, set in stone';
      case 'few': return 'A few of them';
      case 'none': return 'No, open to ideas';
      default: return ideaStatus;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-12">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100 + 33}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Profile</span>
          <span>Skills</span>
          <span>Complete</span>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
              First, who are you?
            </h2>
            <h3 className="text-m text-black dark:text-white mb-6">
              You can edit this later in your profile settings
            </h3>
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Intro <span className="text-gray-500 dark:text-gray-400">(max 250 characters)</span>
                </label>
                <textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  maxLength={250}
                  rows={3}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="A brief description about yourself"
                  required
                ></textarea>
                <p className="text-sm text-right text-gray-500 dark:text-gray-400 mt-1">
                  {intro.length}/250
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Background <span className="text-gray-500 dark:text-gray-400">(max 5000 characters)</span>
                </label>
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  maxLength={5000}
                  rows={6}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="Tell us about your experience, education, and interests"
                ></textarea>
                <p className="text-sm text-right text-gray-500 dark:text-gray-400 mt-1">
                  {background.length}/5000
                </p>
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-8">
              And last, what's your situation?
            </h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <span className="text-xl font-semibold text-black dark:text-white">
                  Skills You're Experienced in:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Select up to 5
                </span>
              </button>
              <div>
                <div className="p-6 bg-white dark:bg-gray-800">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-black dark:text-white mb-4">Development Skills</h4>
                      <div className="flex flex-wrap gap-3">
                        {SKILLS.dev.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleSkillSelection(skill)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
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
                      <h4 className="text-lg font-medium text-black dark:text-white mb-4">Business Skills</h4>
                      <div className="flex flex-wrap gap-3">
                        {SKILLS.business.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleSkillSelection(skill)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
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
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 dark:text-gray-300">Based on your skills:</span>
                      {!isEditingRole ? (
                        <span className="font-semibold text-black dark:text-white">
                          You're a {selectedRole || suggestedRole || 'member'}
                        </span>
                      ) : (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="ml-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                        >
                          {Object.values(ROLES).map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditingRole(!isEditingRole)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      {isEditingRole ? 'Save' : 'Change Role'}
                    </button>
                  </div>
                  {skills.length === 0 && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Select some skills above to get a role suggestion
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl pt-6 font-semibold text-black dark:text-white mb-6">
                Realistically, how many hours a week do you plan on dedicating to your startup?
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>15 hours</span>
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-black dark:text-white font-bold text-lg">
                    {hoursPerWeek}{hoursPerWeek == 65 && '+'} hours
                  </div>
                  <span>65 hours</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic text-center">
                  This helps match you with teammates who share similar commitment levels
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white pt-6 mb-6">
                Do you already have a startup idea in mind?
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
                      onClick={() => setIdeaStatus(value)}
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
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white pt-6 mb-6">
                Are you still looking for someone on your team?
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
              <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-xl">
                Status: {!teamNeeds.needsPM && !teamNeeds.needsDev ? "My team is full" :
                  [
                    teamNeeds.needsPM && "I'm looking for a PM",
                    teamNeeds.needsDev && "I'm looking for a dev."
                  ].filter(Boolean).join(" and ")}
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        {step > 1 && (
          <button
            onClick={() => {
              setStep(step - 1);
              scrollToTop();
            }}
            className="w-1/3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-lg font-medium"
            disabled={loading}
          >
            Back
          </button>
        )}
        <button
          onClick={async () => {
            if (step < 2) {
              setLoading(true);
              const success = await handleProfileSubmit();
              setLoading(false);
              if (success) {
                setStep(step + 1);
                scrollToTop();
              }
            } else {
              handleFinalSubmit();
            }
          }}
          className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200 text-lg font-medium`}
          disabled={loading}
        >
          {loading ? 'Saving...' : (step === 2 ? 'Complete Profile' : 'Continue')}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;