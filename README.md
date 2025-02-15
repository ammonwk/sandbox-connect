# Sandbox Headstart

Sandbox Headstart is a web application designed to help students in the Sandbox program efficiently form startup teams. The platform enables users to create profiles showcasing their skills, interests, and availability while also allowing them to browse and connect with potential teammates. 

## 🚀 Features
- **User Profiles:** Display skills, interests, and availability.
- **Team Matching:** Filter potential teammates by skill sets, commitment level, and availability.
- **Search & Filters:** Find users by name, skill, or team status.
- **Onboarding Flow:** Easy step-by-step profile setup.
- **Dashboard:** Browse and connect with other Sandbox participants.
- **User Profiles:** View detailed profiles, including contact information.

## TODO

- [ ] Add a few more focused options for user profiles
- [ ] Replace filler data with real user data
- [ ] Make matching algorithm
- [ ] Review data security

## 🛠️ Installation & Setup
To get started with Sandbox Headstart on your local machine, follow these steps:

### 1️⃣ Clone the Repository
```
git clone https://github.com/ammonwk/sandbox-headstart.git
cd sandbox-headstart
```

### 2️⃣ Install Dependencies
```
npm install
```

### 3️⃣ Start the Development Server
```
npm run dev
```

The app will be available at `http://localhost:5173` (or a similar port).

## 🔑 Authentication
Users sign in using their phone numbers, which should integrate with the existing Sandbox authentication service.

## 🌟 Core Components

### `LandingPage.jsx`
- Entry point for users to log in using phone number authentication.

### `Onboarding.jsx`
- Multi-step form where users specify:
  - Current skills
  - Skills they want to learn
  - Skills they want in teammates
  - Weekly commitment hours
  - Their level of idea commitment

### `Dashboard.jsx`
- Displays a list of potential teammates.
- Users can filter by:
  - Name, skills, or profile text.
  - Availability: **Looking for Team, Open to Join, Closed Teams**.
  
### `UserProfile.jsx`
- Displays a full profile of a user.
- Shows contact details (email, phone, Slack).
- Lists current skills and desired skills.

### `UserCard.jsx`
- Displays a short preview of a user’s profile within the dashboard.

## 🎨 Styling
This project uses **Tailwind CSS** for styling. Modify `index.css` to customize UI elements.

## 📂 Data Structure (Example `users.json`)
```
{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "intro": "Passionate about fintech startups!",
      "status": "looking",
      "photo": "https://example.com/photo.jpg",
      "currentSkills": ["Web Development", "Data Analytics"],
      "desiredSkills": ["Sales/Marketing", "Operations Management"],
      "contact": {
        "email": "alice@example.com",
        "phone": "(555) 123-4567",
        "slack": "@alicej"
      }
    }
  ]
}
```

## 🛠️ Future Enhancements
- **Idea Management:** Users can post startup ideas without revealing too much detail.
- **Direct Messaging:** In-app messaging to streamline communication.
- **AI Team Recommendations:** Suggest optimal team matches based on skillset and commitment.
- **Integration with Sandbox Authentication:** Secure login using university-provided authentication.

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-xyz`).
3. Commit changes.
4. Push to your fork and submit a Pull Request.

## 📜 License
This project is licensed under the MIT License.

## 📧 Contact
For questions or suggestions, reach out to `ammonwk@example.com`.