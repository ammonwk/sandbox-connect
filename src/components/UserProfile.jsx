import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { FaSlack } from 'react-icons/fa';
import { SKILLS } from '../data/skills';
import { useApi } from '../api/apiClient';

function UserProfile() {
  const { id } = useParams();
  const api = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.user.getUserById(id);
        setUser(response.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const getTeamNeedsDisplay = (teamNeeds) => {
    if (!teamNeeds?.needsPM && !teamNeeds?.needsDev) {
      return {
        text: "Team Full",
        style: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
      };
    }
    
    const needs = [];
    if (teamNeeds?.needsPM) needs.push("PM");
    if (teamNeeds?.needsDev) needs.push("Dev");
    
    return {
      text: `Looking for ${needs.join(" & ")}`,
      style: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
    };
  };
  
  const roleColors = {
    "Developer": "text-role-technical bg-tag-bg dark:text-blue-300 dark:bg-blue-900/20",
    "Designer": "text-role-design bg-tag-bg dark:text-blue-200 dark:bg-blue-900/20",
    "Project Manager": "text-role-management bg-tag-bg dark:text-green-300 dark:bg-green-900/20",
    "Technical Project Manager": "text-role-technicalmanagement bg-tag-bg dark:text-emerald-300 dark:bg-emerald-900/20",
    "Undecided": "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700"
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
          <Link to="/dashboard" className="mt-4 inline-flex items-center text-black dark:text-white hover:underline">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const needsInfo = getTeamNeedsDisplay(user.teamNeeds);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-100 dark:ring-gray-700">
                  <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{user.name}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{user.intro || 'No intro'}</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <span className={`px-4 py-2 rounded-full text-sm ${roleColors[user.role || 'Undecided']}`}>
                    {user.role || 'Undecided'}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm ${needsInfo.style}`}>
                    {needsInfo.text}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {(user.matchPercentage || 0)}% Match
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(user.skills || []).map((skill) => (
                <span
                  key={skill}
                  className={`px-4 py-2 rounded-full text-sm ${
                    SKILLS.dev.includes(skill)
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Team Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Looking for:</span>
                <div className="flex gap-2">
                  {!user.teamNeeds?.needsPM && !user.teamNeeds?.needsDev ? (
                    <span className="text-gray-600 dark:text-gray-400">Not looking for additional team members</span>
                  ) : (
                    <>
                      {user.teamNeeds?.needsPM && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                          Project Manager
                        </span>
                      )}
                      {user.teamNeeds?.needsDev && (
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                          Developer
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Commitment:</span>
                <span className="text-gray-600 dark:text-gray-400">{user.hoursPerWeek || 0} hours per week</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Project Ideas:</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {user.ideaStatus === 'one, set in stone' 
                    ? 'Has a specific startup idea' 
                    : user.ideaStatus === 'a few of them' 
                      ? 'Has multiple startup ideas under consideration' 
                      : 'Open to exploring different startup ideas'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Background & Experience</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{user.background || 'No background provided'}</p>
          </div>

          {/* Contact Section - Placeholder since API might not return this yet */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Contact Information</h2>
            <div className="flex flex-col gap-4">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <FiMail className="w-5 h-5 mr-3" />
                  {user.email}
                </a>
              )}
              {/* Add phone and Slack if your User model supports it */}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200">
                Send Message via Slack
              </button>
              <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;