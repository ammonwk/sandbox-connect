// LandingPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [phoneNumber, setPhoneNumber] = useState('(111) 111-1111');
  const navigate = useNavigate();
  
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    if (/^[\d\s()-]*$/.test(input)) {
      const formatted = formatPhoneNumber(input);
      setPhoneNumber(formatted);
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen flex items-center py-8 md:py-0">
      <div className="grid md:grid-cols-2 gap-16 w-full max-w-6xl mx-auto">
        <div className="space-y-12">
          <div>
            <h1 className="text-5xl font-bold text-black dark:text-white mb-4 leading-tight">
              Welcome to
              <div className="block bg-black dark:bg-white text-white dark:text-black px-14 py-3 mt-3 -ml-1 transform -skew-x-12">
                Sandbox Headstart
              </div>
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-xl">
              Find your team better, faster.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { num: 1, text: "Describe your perfect team" },
              { num: 2, text: "Connect with them" },
              { num: 3, text: "Hit the ground running" }
            ].map((step) => (
              <div key={step.num} className="flex items-center space-x-6 group">
                <span className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-semibold group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-all duration-300">
                  {step.num}
                </span>
                <p className="text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-black dark:bg-white rounded-2xl transform rotate-2"></div>
          <div className="relative bg-white dark:bg-gray-800 p-10 mt-5 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-8 text-black dark:text-white">Sign In</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="(123) 456-7890"
                  maxLength="14"
                />
              </div>

              <button
                onClick={() => navigate('/sandbox-headstart/onboarding')}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200 text-lg font-medium"
              >
                Continue
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;