// src/components/PrivacyPolicyContent.jsx
function PrivacyPolicyContent() {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy for Sandbox Connect</h1>
        <p className="text-lg mb-8"><strong>Last Updated: February 24, 2025</strong></p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Account information (name, email, password)</li>
          <li>Profile information (skills, interests, availability, profile photos)</li>
          <li>Content you create or share (ideas, comments, messages)</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Device information (device type, operating system)</li>
          <li>Usage data (how you interact with the App)</li>
          <li>Log information (access times, features used)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Age Restriction</h3>
        <p className="mb-4">Individuals under 16 should not use our App or provide personal information. We do not knowingly collect information from anyone under the age of 16 and will promptly delete any such information if discovered.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">We use your information to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Provide and improve our services</li>
          <li>Match you with potential cofounders on Sandbox Connect based on your profile information</li>
          <li>Facilitate communication between users</li>
          <li>Ensure the security of our App</li>
          <li>Analyze usage patterns to enhance user experience</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Information Storage</h2>
        <p className="mb-4">Your personal information is stored on:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Amazon Cognito (for user authentication)</li>
          <li>MongoDB (for profile information and content)</li>
        </ul>
        <p className="mb-4">We implement reasonable security measures to protect your information, but no method of transmission or storage is 100% secure.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Information Sharing</h2>
        <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties under any circumstances. Your information may only be disclosed when required by law or government request.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights and Choices</h2>
        <p className="mb-4">You may:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Access, correct, or delete your personal information at any time</li>
          <li>Request a copy of your data</li>
          <li>Close your account, which will remove your profile from active use</li>
        </ul>
        <p className="mb-4">To exercise these rights, please contact us at ammonwk@gmail.com.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Retention</h2>
        <p className="mb-4">We retain your information for as long as your account is active or as needed to provide you services. We will delete or anonymize your information upon request or when no longer needed.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to This Policy</h2>
        <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the App.</p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Us</h2>
        <p className="mb-4">If you have questions about this Privacy Policy, please contact Ammon Kunzler at ammonwk@gmail.com.</p>
      </div>
    );
  }
  
  export default PrivacyPolicyContent;