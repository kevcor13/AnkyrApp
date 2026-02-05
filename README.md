## AI-Powered Workout Social Media App 
Ankyr is a comprehensive fitness application that bridges the gap between personalized AI-driven workout planning and social fitness engagement. By leveraging intelligent algorithms and modern mobile development practices, Ankyr creates customized workout journeys tailored to each user's goals, experience level, and preferences while fostering a community of fitness enthusiasts.

Problem Solved: Traditional fitness apps offer either generic workout plans or social features, but rarely both. Ankyr integrates AI-powered personalization with social connectivity to create a holistic fitness experience.

## 🎯 Features

** 🔐 Authentication**
- Secure user registration and authentication system
- Personalized user profiles with fitness tracking
- Privacy-focused data handling****

** 🤝 Social Media Functionality**
- Create and share fitness posts with the community
- Follow other users and manage follower/following relationships
- Send and receive following requests
- Explore user profiles and workout achievements
- Engage with a supportive fitness community

** 🤖Personalized AI Workouts**
- Smart Questionnaire System: Users complete a detailed fitness assessment
- Intelligent Algorithm: AI analyzes goals, experience, equipment availability, and preferences (see more in the Backend) 
- Personalized Workout Plans: Dynamic, adaptive routines tailored to individual fitness profiles
- Progressive Overload: Workouts evolve based on user progress and feedback

** 🏋🏽‍♂️ Workout Experience**
- Log daily progress and track completed workouts
- View detailed exercise instructions and form guidance
- Monitor workout history and performance trends
- Access AI-generated routines optimized for your fitness journey

## 🛠 Tech Stack 
- **Frontend**:
- Framework: React Native with Expo
- Language: TypeScript (93.1%) / JavaScript (5.9%)
- Styling: NativeWind (Tailwind CSS for React Native)
- State Management: React Context API
- Navigation: Expo Router (file-based routing)

**Backend**: 
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (NoSQL)
- Architecture: RESTful API

**Development Tools**
- Build Tool: Metro bundler
- Package Manager: npm
- Version Control: Git & GitHub
- Configuration: Babel, TypeScript, ESLint

## Screenshots 


## How to run locally

**Clone the frontend repo:**

bash Copy Edit
git clone https://github.com/kevcor13/AnkyrApp.git
cd your-frontend-repo

**Install dependencies**

npm install 

**Start the Expo app** 

npm expo start


🌐 Backend Repository
The backend API powering Ankyr is available in a separate repository:
Repository: Ankyr Backend [here](https://github.com/kevcor13/Ankyr_Backend.git).
Backend Features

- RESTful API endpoints for all app functionality
- AI workout generation algorithms
- MongoDB database integration with Mongoose ODM
- JWT-based authentication middleware
- User management and social features
- Workout logging and progress tracking
