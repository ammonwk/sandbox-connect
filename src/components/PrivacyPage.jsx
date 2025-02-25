// src/components/PrivacyPage.jsx
import { Link } from 'react-router-dom';
import PrivacyPolicyContent from './PrivacyPolicyContent';

function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
        ← Back to home
      </Link>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
        <PrivacyPolicyContent />
      </div>
    </div>
  );
}

export default PrivacyPage;