import { useNavigate } from 'react-router-dom';

function UserCard({ user }) {
  const navigate = useNavigate();

  const statusStyles = {
    looking: "bg-green-100 text-green-800",
    open: "bg-yellow-100 text-yellow-800",
    closed: "bg-red-100 text-red-800"
  };

  const statusText = {
    looking: "Looking for a team",
    open: "Open to new teammates",
    closed: "Closed team"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.photo}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-black">{user.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{user.intro}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusStyles[user.status]}`}>
              {statusText[user.status]}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">They know:</h4>
            <div className="space-y-2">
              {user.currentSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-block w-full px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">They need:</h4>
            <div className="space-y-2">
              {user.desiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-block w-full px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/sandbox-headstart/profile/${user.id}`)}
          className="w-full mt-6 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors duration-200"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default UserCard;