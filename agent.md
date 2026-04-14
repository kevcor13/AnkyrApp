# Ankyr App Agent Guide

## Overview

Ankyr is an Expo Router mobile app focused on fitness, social posting, meal planning, and gamified workout progression. The frontend is primarily React Native + TypeScript, with a small amount of legacy JavaScript still present in shared state code.

This file is meant to orient an editing agent quickly before making changes.

## Current Stack

- Expo `^54.0.20`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.21`
- TypeScript `~5.8.3`
- NativeWind `^4.1.23`
- React Native Reanimated `~4.1.1`
- Moti `^0.30.0`
- Axios `^1.9.0`
- AsyncStorage `2.2.0`
- React Native Appwrite `^0.18.0`
- Expo Dev Client (installed — required for development builds)

## Project Shape

```text
AnkyrApp/
├── app/                       # Expo Router screens
│   ├── _layout.tsx            # Root layout, fonts, global provider
│   ├── index.tsx              # Landing screen / auth redirect
│   ├── (tabs)/                # Main native tabs
│   ├── (root)/                # Sign-in / sign-up
│   ├── (workout)/             # Workout flow screens
│   ├── (components)/          # Routed component-style screens
│   ├── (nutrition)/           # Meal-related screens
│   ├── (questions)/           # Onboarding and questionnaire flow
│   └── (settings)/            # Settings screens
├── components/                # Reusable UI components
├── constants/                 # Asset registries, styles, lightweight types
├── context/                   # Global app state
├── providers/                 # Shared providers like scaling
├── lib/                       # External service helpers
├── assets/                    # Fonts, images, icons, video
├── ios/                       # Native iOS project (generated via prebuild)
└── eas.json                   # EAS Build configuration (development profile for iOS)
```

## Routing Notes

- Routing is file-based via Expo Router.
- The main app shell lives under `app/(tabs)`.
- The tab layout uses `expo-router/unstable-native-tabs`, not the standard JS tab navigator.
- The current tab route names are:
  - `nutrition`
  - `home`
  - `camera`
  - `profile`
  - `challanges`
- `challanges` is intentionally misspelled in the filesystem and route names. Do not "fix" it casually unless you also update all navigation references.

## App Bootstrap

The root layout in `app/_layout.tsx` currently does the following:

- Loads custom fonts with `useFonts`
- Hides the splash screen after fonts load
- Wraps the app with `GestureHandlerRootView`
- Mounts `GlobalProvider`
- Disables gestures for:
  - `(root)/sign-in`
  - `(root)/sign-up`
  - `(workout)/ActiveWorkoutScreen`

## Global State

The main shared state container is `context/GlobalProvider.js`.

Important notes:

- This file is still JavaScript, not TypeScript.
- It owns auth state, user profile data, game data, workout data, challenges, recipes, and several fetch helpers.
- `useGlobal()` is the primary access point.
- The provider delays rendering children until its initial auth check completes.

Key exposed values and actions include:

- `isLoggedIn`
- `user`, `userData`
- `userGameData`
- `userFitnessData`
- `userWorkoutData`
- `loggedWorkouts`
- `TodayWorkout`
- `challenges`
- `selectedChallenges`
- `recipes`
- `focusWorkouts`
- `ngrokAPI`
- `signUpUser`
- `loginUser`
- `logoutUser`
- `fetchUserData`
- `fetchGameData`
- `fetchFitnessData`
- `saveFitnessPreferences`
- `fetchWorkout`
- `fetchLoggedWorkouts`
- `fetchFriends`
- `fetchWorkoutFocus`
- `fetchUserRoutine`
- `fetchTemporaryUserRoutine`
- `useFloatie`
- `activateRecoveryMode`
- `endRecoveryMode`

## Backend Integration

The frontend currently points to this development backend base URL in `context/GlobalProvider.js`:

- `https://c88a-173-8-115-9.ngrok-free.app`

This is a temporary ngrok URL and should be treated as volatile.

Common API areas used by the app:

- Auth:
  - `/api/auth/register`
  - `/api/auth/login`
- User:
  - `/api/user/getUserData`
  - `/api/user/getGameData`
  - `/api/user/getWorkoutData`
  - `/api/user/getFitnessData`
  - `/api/user/getChallenges`
- Workout:
  - `/api/workout/getFocusExercise`
  - `/api/workout/getUserRoutine`
  - `/api/workout/getTemporaryRoutineDay`
  - `/api/workout/getTemporaryUserRoutine`
- Updates / progression:
  - `/api/update/getLoggedWorkouts`
  - `/api/update/updateBadge`
  - `/api/update/useFloatie`
- Social / media:
  - `/api/media/getFriends`
  - `/getUserPosts`
  - `/UserImages`
  - `/upload`
- Nutrition:
  - `/api/meals/getFeaturedRecipes`
- Recovery Mode:
  - `/api/recovery/activate`
  - `/api/recovery/end`

## Assets And Icons

There are three separate asset patterns in use:

- `constants/images.ts`
  - General raster images and larger art assets
- `constants/icons.ts`
  - Raster icons used with React Native image sources and native tab icons
- `constants/svgIcons.ts`
  - Registry of imported SVG React components

`components/AppIcon.tsx` is the shared SVG renderer. Prefer this for tintable/reusable SVG icons.

When adding a new SVG icon:

1. Add the asset under `assets/icons/`
2. Register it in `constants/svgIcons.ts`
3. Render it through `AppIcon`

## Styling Conventions

- Primary styling approach: NativeWind via `className`
- Secondary styling approach: inline styles and `StyleSheet`
- Global Tailwind styles live in `global.css`
- Shared style constants live in `constants/styles.js` and `constants/modalStyles.js`

Fonts loaded in the root layout include:

- Poppins
- Quicksand
- Raleway
- Sintony
- Saira

## Scaling

`providers/ScaleProvider.tsx` exposes `useScale()` with:

- `vw(percent)`
- `vh(percent)`
- `s(number)` for spacing
- `rem(number)` for font sizing

The provider exists in the repo and is useful for responsive sizing, but the current root layout imports it without wrapping the app with it. Check usage before relying on it globally.

## File Types And Code Style

- Prefer TypeScript for new work.
- Existing screen and component files are mostly `.tsx`.
- `context/GlobalProvider.js` remains a legacy JS file, so be careful when changing shared types there.
- Use the `@/` import alias for root-based imports.

## Recovery Mode System

Recovery Mode lets users freeze their streak when sick. Key facts:

- 3 tokens per user per year (reset January 1st via `recoveryTokensCycleYear` on `GameSystem`)
- User picks a start date (up to 2 days retroactive) and duration (3–10 days)
- While active, `normalizeGameDataOnRead` skips streak recalculation and returns `frozenStreak`
- On end or expiry, `coverRecoveryWindow` fills `StreakCoverage` with `source="recovery"` docs so the streak chain is preserved
- After recovery, a 7-day return ramp sets suggested weights to 70% via `isInReturnRamp` on `FitnessInfo`
- UI: shield button in `components/CalendarView.tsx` opens the recovery modal in `app/(tabs)/challanges.tsx`
- `userGameData.recoveryMode` in GlobalProvider holds the active session data (null if not active)

## Known Sharp Edges

- `challanges` is misspelled across route names.
- The backend URL is hard-coded to ngrok and may expire.
- `markQuestionnaireCompleted()` still posts to `http://localhost:5001/mark-questionnaire` instead of `ngrokAPI`.
- `fetchRecipes()` mixes axios and fetch-style response handling and looks incorrect in its current form.
- `ScaleProvider` is imported in `app/_layout.tsx` but not actually mounted.
- Some provider state setters and error paths appear inconsistent, so changes in `GlobalProvider.js` should be tested carefully.

## EAS / Device Development

The project is configured for EAS Build (iOS development profile). To run on a physical device:

```bash
# Start Metro with tunnel (requires @expo/ngrok installed globally)
npx expo start --dev-client --tunnel

# Or LAN mode (Mac and iPhone on same Wi-Fi)
npx expo start --dev-client --lan

# Rebuild dev client after adding new native dependencies
eas build --platform ios --profile development
```

Scan the QR code from the terminal with the iPhone Camera app (not Expo Go) to connect.

## Useful Commands

- `npm start`
- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run lint`

## Editing Guidance

- Before changing navigation, check whether the target path lives in a route group like `(tabs)` or `(components)`.
- Before changing shared state, inspect `context/GlobalProvider.js` first because many screens rely on its exact response shapes.
- Prefer the centralized asset registries over ad hoc `require(...)` calls for reusable assets.
- Treat backend-facing changes as potentially brittle because several endpoints and payload shapes are handwritten rather than strongly typed.
