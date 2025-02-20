// UserProfile.jsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { FaSlack } from 'react-icons/fa';
import { SKILLS } from '../data/skills';
import userData from '../data/users.json';

function UserProfile() {
  const { id } = useParams();
  const user = userData.users.find(u => u.id === parseInt(id));
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  const getTeamNeedsDisplay = (teamNeeds) => {
    if (!teamNeeds.needsPM && !teamNeeds.needsDev) {
      return {
        text: "Team Full",
        style: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
      };
    }
    
    const needs = [];
    if (teamNeeds.needsPM) needs.push("PM");
    if (teamNeeds.needsDev) needs.push("Dev");
    
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
          <Link to="/sandbox-headstart/dashboard" className="mt-4 inline-flex items-center text-black dark:text-white hover:underline">
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
          <Link to="/sandbox-headstart/dashboard" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              <img
                src={user.photo}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover mb-4 md:mb-0 ring-2 ring-gray-100 dark:ring-gray-700"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{user.name}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{user.intro}</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <span className={`px-4 py-2 rounded-full text-sm ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm ${needsInfo.style}`}>
                    {needsInfo.text}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {user.matchPercentage}% Match
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.currentSkills.map((skill) => (
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

          {/* Team Needs Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Team Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Looking for:</span>
                <div className="flex gap-2">
                  {!user.teamNeeds.needsPM && !user.teamNeeds.needsDev ? (
                    <span className="text-gray-600 dark:text-gray-400">Not looking for additional team members</span>
                  ) : (
                    <>
                      {user.teamNeeds.needsPM && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                          Project Manager
                        </span>
                      )}
                      {user.teamNeeds.needsDev && (
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
                <span className="text-gray-600 dark:text-gray-400">{user.hoursPerWeek} hours per week</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Project Ideas:</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {user.ideaStatus === 'one' 
                    ? 'Has a specific startup idea' 
                    : user.ideaStatus === 'few' 
                      ? 'Has multiple startup ideas under consideration' 
                      : 'Open to exploring different startup ideas'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Background Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Background & Experience</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{user.background}</p>
          </div>

          {/* Contact Section */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Contact Information</h2>
            <div className="flex flex-col gap-4">
              <a
                href={`mailto:${user.contact.email}`}
                className="inline-flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FiMail className="w-5 h-5 mr-3" />
                {user.contact.email}
              </a>
              <a
                href={`tel:${user.contact.phone}`}
                className="inline-flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FiPhone className="w-5 h-5 mr-3" />
                {user.contact.phone}
              </a>
              <div className="inline-flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                <FaSlack className="w-5 h-5 mr-3" />
                {user.contact.slack}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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