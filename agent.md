# Ankyr App - Agent Documentation

## Project Overview

**Ankyr** is a cross-platform fitness-focused mobile application built with **Expo (React Native)** that combines:
- Personalized AI-powered workout generation
- Social media features (posts, following, profiles)
- Nutrition/meal planning
- Gamification (leagues, challenges, XP system)
- Music integration (playlists)

The app uses a **file-based routing system** with Expo Router and follows a component-based architecture.

---

## Tech Stack & Dependencies

### Core Framework
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo**: ^54.0.20
- **Expo Router**: ~6.0.21 (file-based routing)
- **TypeScript**: ~5.8.3

### Key Libraries
- **NativeWind**: ^4.1.23 (Tailwind CSS for React Native)
- **React Navigation**: Bottom tabs, native navigation
- **React Native Reanimated**: ~4.1.1 (animations)
- **Moti**: ^0.30.0 (motion animations)
- **Axios**: ^1.9.0 (HTTP client)
- **AsyncStorage**: 2.2.0 (local storage)
- **React Native Appwrite**: ^0.18.0 (file storage)
- **Expo Camera**: ~17.0.8 (camera functionality)
- **Expo Image Picker**: ~17.0.8
- **Expo AV**: ~16.0.7 (video/audio)
- **Expo Notifications**: ~0.32.12
- **Moment**: ^2.30.1 (date handling)
- **D3-shape**: ^3.2.0 (charts/graphs)

### Styling
- **Tailwind CSS**: ^3.4.17
- **NativeWind**: Tailwind for React Native
- **Expo Linear Gradient**: ~15.0.7
- **Expo Blur**: ~15.0.8

### Backend Integration
- **Backend API**: Uses ngrok URL (currently: `https://dc6d66010f5c.ngrok-free.app`)
- **Appwrite**: Cloud storage for images (endpoint: `https://cloud.appwrite.io/v1`, project: `670dcd780032e814bc9c`)

---

## Project Structure

```
AnkyrApp/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with fonts & GlobalProvider
│   ├── index.tsx                # Landing/onboarding screen
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── home.tsx            # Home feed (posts, friends)
│   │   ├── camera.tsx          # Camera screen for posts
│   │   ├── profile.tsx         # User profile
│   │   ├── nutrition.tsx       # Nutrition/meals screen
│   │   └── challanges.tsx      # Challenges screen
│   ├── (root)/                 # Auth screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (workout)/              # Workout flow screens
│   │   ├── ActiveWorkoutScreen.tsx
│   │   ├── EndWorkoutScreen.tsx
│   │   ├── WorkoutOverview.tsx
│   │   └── NextDayWorkout.tsx
│   ├── (components)/           # Shared component screens
│   │   ├── CreatePost.tsx
│   │   ├── UserPost.tsx
│   │   ├── UserProfile.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── Playlist.tsx
│   │   └── workout/            # Workout sub-components
│   │       ├── ExerciseOverview.tsx
│   │       ├── ExerciseScreen.tsx
│   │       ├── RestScreen.tsx
│   │       ├── UpNextScreen.tsx
│   │       └── ChangeThemeScreen.tsx
│   ├── (nutrition)/            # Nutrition screens
│   │   ├── generateMeal.tsx
│   │   ├── MealDetail.tsx
│   │   ├── SavedMeals.tsx
│   │   ├── SearchMeal.tsx
│   │   └── FilteredMeals.tsx
│   ├── (questions)/           # Onboarding/questionnaire
│   │   ├── Onboard.tsx
│   │   ├── OnboardQuestionnaire.tsx
│   │   ├── PreQuestionnaire.tsx
│   │   ├── questionnaire.tsx
│   │   ├── CodeEntry.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── VideoFile.tsx
│   └── (settings)/            # Settings screens
│       ├── settings.tsx
│       ├── homeSettings.tsx
│       ├── ChangeTheme.tsx
│       ├── ChangePreview.tsx
│       └── notifications.tsx
├── components/                 # Reusable UI components
│   ├── CustomButton.tsx
│   ├── PostCard.tsx
│   ├── WorkoutCard.tsx
│   ├── CalendarView.tsx
│   ├── GraphView.tsx
│   ├── CircularTimer.tsx
│   └── ...
├── context/                    # React Context providers
│   └── GlobalProvider.js       # Main app state management
├── providers/                   # Additional providers
│   └── ScaleProvider.tsx      # Responsive scaling utilities
├── constants/                  # Constants and configs
│   ├── images.ts              # Image imports
│   ├── icons.ts               # Icon imports
│   ├── styles.js              # Shared StyleSheet styles
│   └── workout.ts              # Workout type definitions
├── lib/                        # Utility libraries
│   └── appwrite.ts            # Appwrite storage functions
├── assets/                     # Static assets
│   ├── fonts/                 # Custom fonts (Poppins, Quicksand, Raleway, etc.)
│   ├── icons/                 # App icons
│   ├── images/                # Images
│   ├── Leagues/               # League badge images
│   ├── Recipes/               # Recipe images
│   └── Videos/                # Video assets
├── global.css                 # Tailwind CSS global styles
├── tailwind.config.js         # Tailwind configuration
├── babel.config.js            # Babel config (NativeWind, Reanimated)
├── metro.config.js            # Metro bundler config
└── tsconfig.json              # TypeScript configuration
```

---

## Key Patterns & Conventions

### File-Based Routing
- Uses **Expo Router** with file-based routing
- Route groups: `(tabs)`, `(root)`, `(workout)`, `(components)`, etc. (parentheses = no URL segment)
- Navigation: `router.push()`, `router.replace()`, `router.navigate()`
- Dynamic routes: `[id].tsx` for params

### State Management
- **GlobalProvider** (`context/GlobalProvider.js`) is the main state container
- Uses React Context API
- Access via `useGlobal()` hook
- Stores: user data, workout data, game data, posts, challenges, etc.

### Styling Approach
- **Primary**: NativeWind (Tailwind CSS classes via `className`)
- **Secondary**: StyleSheet for complex styles (see `constants/styles.js`)
- **Fonts**: Custom fonts loaded in `_layout.tsx`:
  - Poppins (Regular, Bold, SemiBold, Medium, Light, BoldItalic)
  - Quicksand, Raleway, Sintony, Saira
- **Responsive**: `ScaleProvider` for viewport-based scaling (`useScale()` hook)

### Component Patterns
- Functional components with hooks
- TypeScript for type safety (some files still `.js`)
- Custom components in `/components` directory
- Screen components in `/app` directory

---

## State Management (GlobalProvider)

### Key State Variables
```javascript
- isLoggedIn: boolean
- user: User object
- userData: Full user profile data
- userGameData: League, XP, badges
- userWorkoutData: Current workout routine
- userFitnessData: Fitness metrics
- userPosts: User's posts
- loggedWorkouts: Completed workout history
- challenges: Available challenges
- selectedChallenges: Challenges added to workout
- recipes: Featured meal recipes
- focusWorkouts: Focus-specific exercises
- weeklyData: Weekly XP/points history
- followingUsers: Friends/following list
- warmup, workout, coolDown: Separated workout phases
- TodayWorkout: Today's workout routine
- loading: Loading state
- questionStatus: Questionnaire completion status
```

### Key Functions
```javascript
- signUpUser(name, username, email, password, profile)
- loginUser(email, password)
- logoutUser()
- fetchUserData(token)
- fetchGameData(token, UserID)
- fetchWorkout(token, UserID)
- fetchFitnessData(UserID)
- fetchUserPosts()
- fetchFriends()
- fetchRecipes()
- fetchChallenges(UserID)
- getChallenges(UserID, league)
- fetchLoggedWorkouts(UserID)
- fetchWorkoutFocus(focus, userFitnessLevel)
- updateGameData(userId, points)
- addChallengesToWorkout(challenges)
- markQuestionnaireCompleted()
```

### API Base URL
- Currently: `https://dc6d66010f5c.ngrok-free.app` (stored in `ngrokAPI` constant)
- **Note**: This is a development ngrok URL and will need updating for production

---

## API Integration

### Authentication
- **Login**: `POST /api/auth/login` (email, password)
- **Register**: `POST /api/auth/register` (name, username, email, password, profile)
- **Token Storage**: JWT stored in AsyncStorage as `"token"`

### User Data
- **Get User Data**: `POST /api/user/getUserData` (token)
- **Get Game Data**: `POST /api/user/getGameData` (token, UserID)
- **Get Fitness Data**: `POST /api/user/getFitnessData` (UserID, token)
- **Get Workout Data**: `POST /api/user/getWorkoutData` (token, date, UserID)
- **Get Challenges**: `POST /api/user/getChallenges` (UserID, leaveLevel)

### Workouts
- **Get Focus Exercises**: `POST /api/workout/getFocusExercise` (focus, userFitnessLevel)
- **Get Logged Workouts**: `POST /api/update/getLoggedWorkouts` (UserID)
- **Update Badge**: `POST /api/update/updateBadge` (token, UserID, league)

### Social Media
- **Upload Post**: `POST /upload` (imageUrl, UserID)
- **Get User Posts**: `POST /getUserPosts` (token, UserId)
- **Get User Images**: `POST /UserImages` (token, UserId)
- **Get Friends**: `POST /api/media/getFriends` (userId)

### Nutrition
- **Get Featured Recipes**: `POST /api/meals/getFeaturedRecipes`

### Other
- **Random Challenges**: `POST /randomChallenges` (UserID)
- **Fetch Weekly Points**: `POST /fetchWeeklyPoints` (UserID)
- **Mark Questionnaire**: `POST /mark-questionnaire` (UserID) - Note: uses localhost:5001

### Request Headers
- Most requests require `Authorization: Bearer ${token}`
- Content-Type: `application/json` (or `multipart/form-data` for file uploads)

---

## File Storage (Appwrite)

### Configuration
- **Endpoint**: `https://cloud.appwrite.io/v1`
- **Project ID**: `670dcd780032e814bc9c`
- **Storage Bucket ID**: `670dcf8e000a3813136c`

### Functions (lib/appwrite.ts)
- `uploadImage(fileUri, userId)` - Upload image to Appwrite storage
- `getFilePreview(fileId, width, height)` - Get preview URL
- `getFileView(fileId)` - Get full file view URL
- `deleteFile(fileId)` - Delete file
- `listUserFiles()` - List user's files

### Usage
Images are uploaded to Appwrite first, then the URL is sent to the backend API.

---

## Navigation Structure

### Tab Navigation (Bottom Tabs)
1. **Nutrition** - Meal planning and recipes
2. **Home** - Social feed, posts, friends
3. **Camera** - Capture and upload posts
4. **Profile** - User profile and settings
5. **Challenges** - Daily challenges and gamification

### Stack Navigation
- Root layout wraps all screens
- Special screens with `gestureEnabled: false`:
  - Sign-in/Sign-up
  - ActiveWorkoutScreen

### Navigation Patterns
```typescript
import { router } from "expo-router";

// Navigate
router.push("/path");
router.replace("/path");
router.navigate("/path");

// With params
router.push({ pathname: "/path", params: { id: "123" } });
```

---

## Styling Guidelines

### NativeWind (Tailwind)
```tsx
<View className="flex-1 bg-black">
  <Text className="text-white font-poppins-semibold text-xl">
    Hello
  </Text>
</View>
```

### Custom Fonts
Available font families:
- `font-poppins`, `font-poppins-semibold`, `font-poppins-medium`, `font-poppins-bold`, `font-poppins-light`
- `font-quicksand`, `font-quicksand-bold`
- `font-raleway`, `font-raleway-light`
- `font-sintony`, `font-sintony-bold`
- `font-saire`, `font-saire-bold`

### Responsive Scaling
```tsx
import { useScale } from "@/providers/ScaleProvider";

const { vw, vh, s, rem } = useScale();
// vw(50) = 50% of viewport width
// vh(50) = 50% of viewport height
// s(20) = scaled spacing
// rem(16) = scaled font size
```

### StyleSheet (for complex styles)
See `constants/styles.js` for shared StyleSheet definitions.

---

## Key Features & Screens

### Authentication Flow
1. **Landing** (`app/index.tsx`) - Shows if not logged in
2. **Onboard** (`app/(questions)/Onboard.tsx`) - Entry point
3. **Code Entry** (`app/(questions)/CodeEntry.tsx`) - Sign up
4. **Sign In** (`app/(root)/sign-in.tsx`) - Login
5. **Questionnaire** (`app/(questions)/questionnaire.tsx`) - User onboarding

### Workout Flow
1. **Workout Overview** - View today's workout
2. **Active Workout** - Live workout session with:
   - Warmup (time-based exercises)
   - Workout (sets/reps with weight)
   - Challenges (optional)
   - Rest screens between sets
   - Up Next previews
3. **End Workout** - Completion screen with stats

### Social Features
- **Home Feed** - Posts from friends + self
- **Camera** - Capture photos for posts
- **User Posts** - View user's post gallery
- **User Profile** - View/edit profile
- **Search** - Search users
- **Create Post** - Upload and share posts

### Nutrition
- Featured recipes
- Meal generation
- Meal search
- Saved meals
- Meal details

### Gamification
- **Leagues**: NOVICE → PRIVATE → PILOT → SKIPPER → TITAN → OLYMPIAN
- **XP System**: Points earned from workouts
- **Challenges**: Daily challenges based on league
- **Badges**: Visual league badges

---

## Important Constants

### Images (`constants/images.ts`)
- Exports all image assets for easy importing
- Usage: `import images from "@/constants/images"`

### Icons (`constants/icons.ts`)
- Exports all icon assets
- Usage: `import icons from "@/constants/icons"`

### Workout Types (`constants/workout.ts`)
- TypeScript interfaces for workout data structures

---

## Development Guidelines

### Code Style
- Use TypeScript for new files (`.tsx` for components, `.ts` for utilities)
- Some legacy files are still `.js` (e.g., `GlobalProvider.js`)
- Prefer functional components with hooks
- Use `const` for component definitions

### Import Paths
- Use `@/` alias for root directory imports
- Example: `import { useGlobal } from "@/context/GlobalProvider"`

### Async Storage
- Token: `AsyncStorage.getItem("token")`
- Login status: `AsyncStorage.getItem("isLoggedIn")`
- Always check for token before API calls

### Error Handling
- API calls should have try/catch blocks
- Log errors with `console.error()`
- Show user-friendly alerts for failures

### Performance
- Use `useMemo` and `useCallback` for expensive operations
- Lazy load heavy components
- Preload workout videos when possible

### Testing
- Run with `npm start` or `expo start`
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

---

## Common Patterns

### Screen Component Structure
```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useGlobal } from "@/context/GlobalProvider";
import { router } from "expo-router";

const MyScreen = () => {
  const { userData, ngrokAPI } = useGlobal();
  
  return (
    <View className="flex-1 bg-black">
      <Text className="text-white">Content</Text>
    </View>
  );
};

export default MyScreen;
```

### API Call Pattern
```tsx
const fetchData = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(`${ngrokAPI}/api/endpoint`, {
      token,
      // other data
    });
    if (response.data.status === "success") {
      // Handle success
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### Image Upload Pattern
```tsx
// 1. Upload to Appwrite
const uploadResult = await uploadImage(photo.uri, userData._id);
if (!uploadResult.success) return;

// 2. Send URL to backend
const response = await axios.post(`${ngrokAPI}/upload`, {
  imageUrl: uploadResult.fileUrl,
  UserID: userData._id
});
```

---

## Known Issues & Notes

1. **ngrok URL**: The API base URL uses ngrok and will need to be updated for production
2. **Mixed JS/TS**: Some files are still `.js` (GlobalProvider) - consider migrating
3. **Localhost Reference**: `markQuestionnaireCompleted` uses `localhost:5001` - should use `ngrokAPI`
4. **Font Loading**: Fonts are loaded in root layout - ensure they're loaded before rendering
5. **Gesture Navigation**: Some screens disable gesture navigation for UX reasons

---

## Future Considerations

- Migrate remaining `.js` files to TypeScript
- Replace ngrok URL with production API endpoint
- Add environment variables for API URLs
- Implement proper error boundaries
- Add unit tests for critical functions
- Optimize image loading and caching
- Add offline support for workouts

---

## Quick Reference

### Start Development
```bash
npm install
npm start
```

### Key Files to Modify
- **State Management**: `context/GlobalProvider.js`
- **Routing**: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- **Styling**: `tailwind.config.js`, `constants/styles.js`
- **API Config**: `context/GlobalProvider.js` (ngrokAPI), `lib/appwrite.ts`

### Common Tasks
- **Add New Screen**: Create file in appropriate `app/` directory
- **Add New API Call**: Add function to `GlobalProvider` or create utility
- **Add New Component**: Create in `components/` directory
- **Add New Constant**: Add to `constants/` directory
- **Update Styling**: Modify Tailwind classes or `constants/styles.js`

---

*Last Updated: Based on codebase analysis*
*This document should be updated as the codebase evolves*
