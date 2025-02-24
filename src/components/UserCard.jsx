import { useNavigate } from 'react-router-dom';
import { SKILLS } from '../data/skills';

function UserCard({ user }) {
  const navigate = useNavigate();
  
  const roleColors = {
    "Developer": "text-role-technical bg-tag-bg dark:text-blue-300 dark:bg-blue-900/20",
    "Designer": "text-role-design bg-tag-bg dark:text-blue-200 dark:bg-blue-900/20",
    "Project Manager": "text-role-management bg-tag-bg dark:text-green-300 dark:bg-green-900/20",
    "Technical Project Manager": "text-role-technicalmanagement bg-tag-bg dark:text-emerald-300 dark:bg-emerald-900/20",
    "Undecided": "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700"
  };

  const getTeamNeedsDisplay = (teamNeeds) => {
    if (!teamNeeds?.needsPM && !teamNeeds?.needsDev) {
      return {
        text: "Team Full",
        style: "text-status-full bg-tag-bg dark:text-gray-300 dark:bg-gray-700"
      };
    }
    
    const needs = [];
    if (teamNeeds?.needsPM) needs.push("PM");
    if (teamNeeds?.needsDev) needs.push("Dev");
    
    return {
      text: `Looking for ${needs.join(" & ")}`,
      style: "text-status-looking bg-tag-bg dark:text-green-300 dark:bg-green-900/20"
    };
  };

  const getCommitmentStyle = (hours) => {
    if (hours <= 30) return "text-gray-700 dark:text-gray-300 font-normal";
    if (hours <= 40) return "text-gray-900 dark:text-gray-200 font-medium";
    return "text-gray-900 dark:text-gray-200 font-bold";
  };

  const getCommitmentLevel = (hours) => {
    if (hours <= 30) return "Part-time:";
    if (hours <= 45) return "Full-time:";
    return "Over-time:";
  };

  const needsInfo = getTeamNeedsDisplay(user.teamNeeds);

  return (
    <div 
      onClick={() => navigate(`/sandbox-headstart/profile/${user._id || user.id}`)} 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-gray-200 dark:hover:border-gray-600"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`pl-2 py-1 rounded-full text-sm ${getCommitmentStyle(user.hoursPerWeek || 0)}`}>
              {getCommitmentLevel(user.hoursPerWeek || 0)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {user.hoursPerWeek || 0}h/week
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${needsInfo.style}`}>
            {needsInfo.text}
          </span>
        </div>

        <div className="flex items-center space-x-4">
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
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-gray-300">
              {user.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {user.intro || 'No bio provided'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm rounded-full px-2 ${roleColors[user.role || 'Undecided']}`}>
            {user.role || 'Undecided'}
          </span>
          <div className="text-gray-600 dark:text-gray-300 font-medium">
            {(user.matchPercentage || 0)}% Match
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;