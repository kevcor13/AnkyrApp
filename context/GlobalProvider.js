import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { WarmUp } from "@/constants/workout";


export const GlobalContext = createContext();
export const useGlobal = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const currentCalendarYear = new Date().getFullYear();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [warmup, setWarmup] = useState([])
    const [workout, setworkout] = useState([])
    const [coolDown, setCoolDown] = useState([])
    const [today, settoday] = useState('')
    const [recipes, setRecipes] = useState([])
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState('');
    const [userData, setUserData] = useState('');
    const [loading, setLoading] = useState(true);
    const [questionStatus, setQuestionStatus] = useState(false);
    const [userGameData, setUserGameData] = useState('');
    const [userFitnessData, setUserFitnessData] = useState(null);
    const [userWorkoutData, setUserWorkoutData] = useState([])
    const [TodayWorkout, setTodayWorkout] = useState('')
    const [weeklyData, setWeeklyData] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loggedWorkouts, setLoggedWorkouts] = useState([])
    const [workoutPlan, setWorkoutPlan] = useState('');
    const [followingUsers, setFollowingUsers] = useState([]);
    const [focusWorkouts, setFocusWorkouts] = useState([])
    const [selectedChallenges, setSelectedChallenges] = useState([]);
    const [aiMode, setAiMode] = useState(true);
    const ngrokAPI = 'https://cce3-2607-fb90-9903-1b92-4d3a-6a66-f0ed-e61b.ngrok-free.app'
    const normalizeGameData = (rawGameData = {}) => {
        const coveredDateKeysCurrentMonth = Array.isArray(rawGameData.coveredDateKeysCurrentMonth)
            ? rawGameData.coveredDateKeysCurrentMonth
            : [];

        const recoveryMode = rawGameData.recoveryMode ?? null;

        return {
            ...rawGameData,
            streak: Number(rawGameData.streak ?? 0),
            points: Number(rawGameData.points ?? 0),
            floatiesRemaining: Number(rawGameData.floatiesBalance ?? 0),
            floatiesCycleKey: rawGameData.floatiesCycleKey ?? null,
            coveredDateKeysCurrentMonth,
            recoveryMode,
        };
    };
    const normalizeFitnessData = (rawFitnessData = {}) => {
        const selectedWorkoutDays = Array.isArray(rawFitnessData.selectedWorkoutDays)
            ? rawFitnessData.selectedWorkoutDays
            : [];
        const myPlanChangeYear = Number(rawFitnessData.myPlanChangeYear ?? currentCalendarYear);
        const myPlanChangeCountYear = Number(rawFitnessData.myPlanChangeCountYear ?? 0);

        return {
            ...rawFitnessData,
            gender: rawFitnessData.gender ?? '',
            age: Number(rawFitnessData.age ?? 0),
            weight: Number(rawFitnessData.weight ?? 0),
            fitnessLevel: rawFitnessData.fitnessLevel ?? '',
            workoutDays: Number(rawFitnessData.workoutDays ?? selectedWorkoutDays.length ?? 0),
            fitnessGoal: rawFitnessData.fitnessGoal ?? '',
            selectedWorkoutDays,
            myPlanChangeCountYear: Number.isFinite(myPlanChangeCountYear) ? myPlanChangeCountYear : 0,
            myPlanChangeYear: Number.isFinite(myPlanChangeYear) ? myPlanChangeYear : currentCalendarYear,
            myPlanLastChangedAt: rawFitnessData.myPlanLastChangedAt ?? null,
        };
    };
    const resetClientSideState = () => {
        delete axios.defaults.headers.common.Authorization;

        // If you attached interceptors for auth, you can eject them here too
        // axios.interceptors.request.eject(reqId);
        // axios.interceptors.response.eject(resId);

        // If you use React Query:r
        // queryClient.clear();
    };


    // function to sign up the user
    const signUpUser = async (name, username, email, password, profile) => {
        console.log(profile);
        try {
            const response = await axios.post(`${ngrokAPI}/api/auth/register`, { name, username, email, password, profile });
            if (response.data.status === "success") {
                await AsyncStorage.setItem("token", response.data.data); // Save the JWT token
                await AsyncStorage.setItem("isLoggedIn", "true");
                setIsLoggedIn(true);
                fetchUserData(response.data.data);
                return { status: "success" };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: "Login failed." };
        }
    }

    // Function to log in the user
    const loginUser = async (email, password) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/auth/login`, { email, password });
            const data = response.data;

            if (data.status === "success") {
                await AsyncStorage.setItem("token", data.data); // Save the JWT token
                await AsyncStorage.setItem("isLoggedIn", "true");
                setIsLoggedIn(true);
                setUser(data.user);

                // Fetch user data immediately after login
                await fetchUserData(data.data);
                // fetchGameData will handle streak validation internally
                await fetchGameData(data.data, data.user._id);

                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: "Login failed." };
        }
    };


    const fetchUserPosts = async () => {
        if (!userData?._id) {
            console.error('No user ID available');
            return;
        }

        try {
            // Get the token from AsyncStorage
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await fetch(`${ngrokAPI}/UserImages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    UserId: userData._id
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                setUserPosts(result.data);
            } else {
                console.error('Failed to fetch posts:', result.data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };


    // Function to log out the user
    const logoutUser = async () => {
        try {
            // (Optional) tell your API to revoke refresh token/session
            // const token = await AsyncStorage.getItem("token");
            // await axios.post(`${ngrokAPI}/api/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});

            // Clear local auth markers first to prevent any racey requests
            await AsyncStorage.multiRemove(["token", "isLoggedIn"]);

            // Reset in-memory state
            setIsLoggedIn(false);

            // Nuke any client caches / headers
            resetClientSideState();

            // Navigate to sign-in; add a query param to force remount of the route
            router.replace({ pathname: "/sign-in", params: { ts: Date.now().toString() } });

            return { success: true, message: "Successfully logged out" };
        } catch (error) {
            console.error("Logout Error:", error);
            return { success: false, message: "Logout failed" };
        }
    };

    // Function to check the login state
    const checkLoginState = async () => {
        try {
            const loggedIn = await AsyncStorage.getItem("isLoggedIn");
            const token = await AsyncStorage.getItem("token");
            if (loggedIn === "true" && token) {
                setIsLoggedIn(true);
                await fetchUserData(token); // Fetch user data using the tokenn



            }
        } catch (error) {
            console.error("Error checking login state:", error);
        } finally {
            setLoading(false);
        }
    };

    // get the user data
    const fetchUserData = async (token) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/user/getUserData`, { token });
            console.log("Fetched user data response:", response.data.status);
            if (response.data.status === "success") {
                setUserData(response.data.data);
                if (response.data.data?._id) {
                    fetchFitnessData(response.data.data._id);
                }
            } else {
                console.error("Failed to fetch user data:", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // get the game data
    const fetchGameData = async (token, UserID) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/user/getGameData`, { token, UserID });
            if (response.data.status === "success") {
                const gameData = normalizeGameData(response.data.data || {});
                setUserGameData(gameData);
                console.log("Fetched game data response:", response.data);

                return gameData;
            } else {
                console.error("Failed to fetch user data:", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching game data:", error);
        }
    }

    const useFloatie = async (UserID, missedDate, clientTimezone, clientTimestamp) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                return { success: false, message: "No authentication token found." };
            }

            const response = await axios.post(`${ngrokAPI}/api/update/useFloatie`, {
                token,
                UserID,
                missedDate,
                clientTimezone,
                clientTimestamp,
            });

            if (response.data.status !== "success") {
                return { success: false, message: response.data.message || "Failed to use floatie." };
            }

            const payload = response.data.data || {};

            // Refresh shared state after successful usage.
            await Promise.all([
                fetchGameData(token, UserID),
                fetchLoggedWorkouts(UserID),
            ]);

            return {
                success: true,
                currentStreak: Number(payload.currentStreak ?? 0),
                floatiesRemaining: Number(payload.floatiesRemaining ?? 0),
                usedDateKey: payload.usedDateKey ?? null,
                timezone: payload.timezone ?? clientTimezone,
            };
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to use floatie.";
            console.error("Error using floatie:", error);
            return { success: false, message };
        }
    };
    const activateRecoveryMode = async (userId, startDateKey, endDateKey) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const clientTimestamp = new Date().toISOString();
            const response = await axios.post(`${ngrokAPI}/api/recovery/activate`, {
                token, UserID: userId, startDateKey, endDateKey, clientTimezone, clientTimestamp,
            });
            if (response.data.status === "success") {
                await fetchGameData(token, userId);
            }
            return response.data;
        } catch (error) {
            console.error("Error activating recovery mode:", error);
            throw error;
        }
    };

    const endRecoveryMode = async (userId) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const clientTimestamp = new Date().toISOString();
            const response = await axios.post(`${ngrokAPI}/api/recovery/end`, {
                token, UserID: userId, clientTimezone, clientTimestamp,
            });
            if (response.data.status === "success") {
                await fetchGameData(token, userId);
            }
            return response.data;
        } catch (error) {
            console.error("Error ending recovery mode:", error);
            throw error;
        }
    };

    const advancePhase = async (userId) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/workout/advancePhase`, { userId });
            if (response.data.status === "success") {
                await fetchFitnessData(userId);
            }
            return response.data;
        } catch (error) {
            console.error("Error advancing phase:", error);
            throw error;
        }
    };

    const submitWorkoutFeedback = async (userId, feeling, workoutName) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/workout/submitFeedback`, { userId, feeling, workoutName });
            console.log("Feedback response:", response.data);
        } catch (error) {
            console.error("Error submitting workout feedback:", error?.response?.data || error.message);
            throw error;
        }
    };

    //update Game Data
    const updateGameData = async (userId, points) => {
        try {
            console.log("Updating game data for user:", userId, "with points:", points);
            let league = "NOVICE";
            if (points >= 30000) league = "OLYMPIAN";
            else if (points >= 20000) league = "TITAN";
            else if (points >= 12000) league = "SKIPPER";
            else if (points >= 5000) league = "PILOT";
            else if (points >= 1000) league = "PRIVATE";

            const response = await axios.post(`${ngrokAPI}/api/update/updateBadge`, {
                token,
                UserID: userId,
                league
            });

            if (response.data.status === "success") {
                console.log("Game data updated successfully:", response.data.data);
            } else {
                console.error("Failed to update data", response.data.data);
            }
        } catch (error) {
            console.error("Error updating game data:", error);
        }
    };

    //get the workout data
    const fetchWorkout = async (token, UserID) => {
        try {
            const date = new Date();

            // First, check if there's a temporary routine
            try {
                console.log("Checking for temporary routine...");
                const tempResponse = await axios.post(`${ngrokAPI}/api/workout/getTemporaryRoutineDay`, {
                    token,
                    UserID,
                    date
                });

                console.log("Temporary routine response:", tempResponse.data);

                // If there's a temporary routine, use it
                if (tempResponse.data.status === "success" && tempResponse.data.data) {
                    console.log("Found temporary routine, using it:", tempResponse.data.data);
                    setUserWorkoutData(tempResponse.data.data);
                    await fetchLoggedWorkouts(UserID);
                    return tempResponse.data.data;
                } else {
                    console.log("No temporary routine found, fetching normal workout data");
                }
            } catch (tempError) {
                // If temporary routine check fails or returns no data, continue to normal fetch
                console.log("Temporary routine check failed or no temporary routine exists, proceeding with normal fetch");
            }

            // If no temporary routine, fetch normal workout data
            const response = await axios.post(`${ngrokAPI}/api/user/getWorkoutData`, { token, date, UserID });
            console.log("this is the response", response.data);
            if (response.data.status === "success") {
                //console.log("Fetched workout data responsess:", response.data.data);
                setUserWorkoutData(response.data.data)
                //await seperateWorkouts(response.data.data)
                //await fetchXpHistory(UserID);
                //await fetchChallenges(UserID);
                await fetchLoggedWorkouts(UserID)
                return response.data.data;
            } else {
                console.error("Failed to fetch workout data:", response.data.message);
            }
        } catch (error) {
            console.error("Fetching workout error", error);
        }
    }

    const fetchRecipes = async () => {
        try {
            // The URL should match the route you set up in your backend
            const response = await axios.post(`${ngrokAPI}/api/meals/getFeaturedRecipes`);

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response from the server
            const result = await response.json();
            console.log("Fetched recipes:", result.data);
            // 3. Store the data in state
            // We access `result.data` based on the API structure we defined
            setRecipes(result.data);

        } catch (err) {
            // If an error occurs, store the error message
            setError(err.message);
        } finally {
            // Set loading to false once the request is complete (whether it succeeded or failed)
            setLoading(false);
        }
    };


    const seperateWorkouts = async (rawWorkoutData) => {
        const routineArray = rawWorkoutData?.routine || [];
        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        const workoutOfTheDay = routineArray.find((dayRoutine) => dayRoutine.day === today);
        setTodayWorkout(workoutOfTheDay)
        setWarmup(workoutOfTheDay.warmup)
        setworkout(workoutOfTheDay.workoutRoutine)
        setCoolDown(workoutOfTheDay.cooldown)
    }
    //fetch the user XP history 
    const fetchXpHistory = async (UserID) => {
        try {
            const response = await axios.post(`${ngrokAPI}/fetchWeeklyPoints`, { UserID });
            if (!response.data) {
                throw new Error(`Failed to fetch XP history: ${response.statusText}`);
            }
            const data = await response.data;
            setWeeklyData(data);

        } catch (error) {
            console.error("Error fetching XP history:", error);
        }
    }
    // fecth the challanges of the day. 
    const fetchChallenges = async (UserID) => {
        try {
            const response = await axios.post(`${ngrokAPI}/randomChallenges`, { UserID });
            if (!response.data) {
                throw new Error(`Failed to fetch challenges: ${response.status}`);
            }

            const data = response.data; // Use response.data directly
            if (data && Array.isArray(data.challenges)) {
                setChallenges(data.challenges);

            } else {
                setChallenges([{ name: "No challenges available" }]);
            }

        } catch (error) {
            console.error("Error fetching challenges:", error);
            setChallenges([{ name: "No challenges available" }]);
        }
    }


    //fetch all the logged workouts
    const fetchLoggedWorkouts = async (UserID) => {
        // Guard clause to prevent API call if UserID is not available
        if (!UserID) {
            console.log("UserID is missing, cannot fetch workouts.");
            return;
        }

        try {
            // Make a POST request to your /getLoggedWorkouts endpoint
            const response = await axios.post(`${ngrokAPI}/api/update/getLoggedWorkouts`, {
                UserID // Note: Ensure the key matches your backend ('UserId')
            });

            if (!response.data) {
                throw new Error(`Failed to fetch logged workouts: Status ${response.status}`);
            }

            const data = response.data;

            // Check if the response data is an array before setting the state
            if (data && Array.isArray(data)) {
                setLoggedWorkouts(data);
            } else {
                console.error("Fetched data for workouts is not an array.");
                setLoggedWorkouts([]); // Set to empty array if data is invalid
            }

        } catch (error) {
            console.error("Error fetching logged workouts:", error);
            // In case of an error, reset the state to an empty array
            // to prevent displaying stale or incorrect data.
            setLoggedWorkouts([]);
        }
    }
    // get the followers from user.
    // inside GlobalProvider, replace your old fetchFollowingUsers with this:

    const fetchFriends = async () => {
        try {
            // make sure you have the current user’s ID
            if (!userData?._id) {
                console.error('No user ID available for fetching followings');
                return [];
            }

            // call your updated backend endpoint
            const response = await axios.post(
                `${ngrokAPI}/api/media/getFriends`,
                { userId: userData._id },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // if you require auth, include your token here:
                        // Authorization: `Bearer ${await AsyncStorage.getItem("token")}`
                    }
                }
            );

            if (response.data.status === 'success') {
                // response.data.data is now an array of:
                // { userId, username, email, profileImage, requestStatus }
                const formatted = response.data.data.map(u => ({
                    id: u.userId,
                    username: u.username,
                    email: u.email,
                    avatar: u.profileImage,
                    requestStatus: u.requestStatus
                }));

                //setFollowersUsers(formatted);
                return formatted;
            } else {
                console.error('Failed to fetch following users:', response.data.message);
                setFollowingUsers([]);
                return [];
            }

        } catch (error) {
            console.error('Error fetching following users:', error);
            setFollowingUsers([]);
            return [];
        }
    };

    const fetchQuestionnaireCompletion = async () => {
        try {
            const response = userData.questionnaire;
            console.log("user completion", response);
            setCompletedQuestions(response);
        } catch {
            console.error("Failed to fetch questionnaire completion:", error);
        }
    }

    const addChallengesToWorkout = (challengesToAdd) => {
        setSelectedChallenges(prevSelected => {
            // Create a Set of existing challenge names for efficient checking
            const existingChallengeNames = new Set(prevSelected.map(c => c.name));

            // Filter the new challenges to only include ones not already in the list
            const uniqueNewChallenges = challengesToAdd.filter(c => !existingChallengeNames.has(c.name));

            // Return the new combined array
            return [...prevSelected, ...uniqueNewChallenges];
        });
        console.log("Updated selected challenges:", challengesToAdd);
    };

    const markQuestionnaireCompleted = async () => {
        try {
            const UserID = userData._id;
            console.log(UserID)
            axios.post("http://localhost:5001/mark-questionnaire", { UserID });
            setQuestionStatus(true);
            console.log(questionStatus);
        } catch (error) {
            console.error("Error marking questionnaire as completed:", error);
            return { success: false, message: "Failed to mark questionnaire as completed." };
        }
    };

    const fetchWorkoutFocus = async (focus, userFitnessLevel) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/workout/getFocusExercise`, { focus, userFitnessLevel });
            if (response.data.status === "success") {
                setFocusWorkouts(response.data.data);
                return response
            } else {
                console.error("Failed to fetch workout focus:", response.data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching workout focus:", error);
            return [];
        }
    }

    const fetchFitnessData = async (UserID) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.post(`${ngrokAPI}/api/user/getFitnessData`, { UserID, token });
            if (response.data.status === "success") {
                const normalizedData = normalizeFitnessData(response.data.data || {});
                setUserFitnessData(normalizedData);
                return normalizedData
            } else {
                console.error("Failed to fetch fitness data:", response.data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching workout focus:", error);
            return [];
        }
    }

    const regenPartialRoutine = async (existingRoutine, previousDays, newDays, onStatusChange) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const UserID = userData?._id;
            if (!UserID || !token) return { success: false, message: "Not authenticated." };

            const fd = userFitnessData || {};

            // Days being kept (were active before and still active)
            const keptDays = previousDays.filter((d) => newDays.includes(d));
            // Days being removed
            const removedDays = previousDays.filter((d) => !newDays.includes(d));
            // Days being added
            const addedDays = newDays.filter((d) => !previousDays.includes(d));
            // All rest days (neither kept nor added)
            const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const allRestDays = allDays.filter((d) => !newDays.includes(d));

            if (addedDays.length === 0) {
                // Path A: only removals — zero out removed days directly
                const updatedRoutine = existingRoutine.map((day) => {
                    if (removedDays.includes(day.day)) {
                        return { ...day, focus: "Rest", timeEstimate: 0, warmup: [], workoutRoutine: [] };
                    }
                    return day;
                });
                await axios.post(`${ngrokAPI}/api/workout/updateRoutinePermanently`, {
                    token,
                    UserID,
                    modifiedUserRoutine: updatedRoutine,
                });
                return { success: true };
            }

            // Path B: days added — rebuild routine from scratch with updated days
            if (onStatusChange) onStatusChange("regenerating");

            await axios.post(`${ngrokAPI}/api/GenAI/ai`, { UserID });
            return { success: true };
        } catch (error) {
            console.error("Error in regenPartialRoutine:", error);
            return { success: false, message: error?.message || "Failed to regenerate routine." };
        }
    };

    const saveFitnessPreferences = async (payload, previousDays, existingRoutine, onStatusChange) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const mergedPayload = normalizeFitnessData({
                ...(userFitnessData || {}),
                ...payload,
            });
            const activeYear =
                mergedPayload.myPlanChangeYear === currentCalendarYear
                    ? mergedPayload.myPlanChangeCountYear
                    : 0;

            if (activeYear >= 3) {
                return {
                    success: false,
                    message: `You have already used all 3 My Plan changes for ${currentCalendarYear}.`,
                };
            }

            const response = await axios.post(`${ngrokAPI}/fitnessInfo`, {
                ...mergedPayload,
                token,
                source: "my_plan",
            });

            if (response.data?.status !== "success") {
                return {
                    success: false,
                    message: response.data?.message || "Failed to save fitness preferences.",
                };
            }

            const responseData = response.data?.data;
            const normalizedData = responseData
                ? normalizeFitnessData(responseData)
                : await fetchFitnessData(mergedPayload.UserID);

            if (normalizedData && !Array.isArray(normalizedData)) {
                setUserFitnessData(normalizedData);
            }

            // Update the routine if day changes were made
            const newDays = Array.isArray(payload.selectedWorkoutDays) ? payload.selectedWorkoutDays : [];
            const prevDays = Array.isArray(previousDays) ? previousDays : [];
            const daysChanged =
                newDays.length !== prevDays.length ||
                newDays.some((d) => !prevDays.includes(d)) ||
                prevDays.some((d) => !newDays.includes(d));

            if (daysChanged && existingRoutine && newDays.length > 0) {
                await regenPartialRoutine(existingRoutine, prevDays, newDays, onStatusChange);
            }

            return {
                success: true,
                data: normalizedData,
                message: response.data?.message || "Fitness preferences updated.",
            };
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save fitness preferences.";
            console.error("Error saving fitness preferences:", error);
            return { success: false, message };
        }
    };

    const getChallenges = async (UserID, league) => {
        console.log("Getting challenges for user:", UserID, "with league:", league);
        if (UserID) {
            try {
                // Removed duplicate UserID declaration
                const leaveLevel = league; // Use the parameter directly
                console.log("UserID:", UserID, "Leave Level:", leaveLevel);

                const response = await axios.post(`${ngrokAPI}/api/user/getChallenges`, {
                    UserID,
                    leaveLevel
                });

                console.log("Challenges: ", response.data.data);
                return response.data.data;

            } catch (error) {
                console.error("Error fetching AI challenges:", error);
                return [];
            }
        }
        return []; // Return empty array if no UserID
    };

    // Fetch full user routine
    const fetchUserRoutine = async (UserID) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token || !UserID) {
                console.error("Missing token or UserID for fetching user routine");
                return null;
            }

            const endpoint = `${ngrokAPI}/api/workout/getUserRoutine`;
            console.log("Fetching user routine from:", endpoint);

            const response = await axios.post(endpoint, {
                token,
                UserID
            });

            if (response.data.status === "success") {
                console.log("Fetched user routine:", JSON.stringify(response.data.data, null, 2));
                return response.data.data;
            } else {
                console.error("Failed to fetch user routine:", response.data.message);
                return null;
            }
        } catch (error) {
            if (error.response) {
                // Server responded with error status
                console.error(`Error fetching user routine - Status: ${error.response.status}, URL: ${error.config?.url}`);
                console.error("Response data:", error.response.data);
            } else if (error.request) {
                // Request made but no response
                console.error("Error fetching user routine - No response received:", error.request);
            } else {
                // Error setting up request
                console.error("Error fetching user routine:", error.message);
            }
            return null;
        }
    };

    const fetchTemporaryUserRoutine = async (UserID) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token || !UserID) {
                console.error("Missing token or UserID for fetching user routine");
                return null;
            }

            const endpoint = `${ngrokAPI}/api/workout/getTemporaryUserRoutine`;
            console.log("Fetching user Temp routine from:", endpoint);

            const response = await axios.post(endpoint, {
                token,
                UserID
            });

            if (response.data.status === "success") {
                console.log("Fetched user Temp routine:", JSON.stringify(response.data.data, null, 2));
                return response.data.data;
            } else {
                console.error("Failed to fetch user Temp routine:", response.data.message);
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    const toggleAiMode = () => setAiMode(prev => !prev);

    const logWorkoutSet = async (userId, workoutLogId, exerciseName, setNumber, suggestedWeight, actualWeight, actualReps) => {
        try {
            const response = await axios.post(`${ngrokAPI}/api/workout/logSet`, {
                userId,
                workoutLogId: workoutLogId || undefined,
                exerciseName,
                setNumber,
                suggestedWeight,
                actualWeight,
                actualReps,
            });
            return response.data;
        } catch (error) {
            console.error('Error logging workout set:', error);
            throw error;
        }
    };

    useEffect(() => {
        checkLoginState();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                user,
                userData, // Expose userData to the rest of the app
                setUserData,
                setUserWorkoutData,
                challenges,
                TodayWorkout,
                loggedWorkouts,
                weeklyData,
                warmup,
                selectedChallenges,
                coolDown,
                workout,
                loading,
                questionStatus,
                userGameData,
                userFitnessData,
                ngrokAPI,
                recipes,
                focusWorkouts,
                userWorkoutData,
                fetchUserPosts,
                signUpUser,
                loginUser,
                fetchRecipes,
                logoutUser,
                fetchTemporaryUserRoutine,
                fetchQuestionnaireCompletion,
                markQuestionnaireCompleted,
                addChallengesToWorkout,
                fetchUserData, // Expose fetchUserData if needed elsewhere
                fetchGameData,
                useFloatie,
                fetchFitnessData,
                saveFitnessPreferences,
                fetchWorkout,
                fetchFriends,
                updateGameData,
                fetchWorkoutFocus,
                getChallenges,
                fetchUserRoutine,
                fetchLoggedWorkouts,
                aiMode,
                toggleAiMode,
                logWorkoutSet,
                currentPhase: userFitnessData?.currentPhase ?? null,
                activateRecoveryMode,
                endRecoveryMode,
                submitWorkoutFeedback,
                advancePhase,
            }}
        >
            {!loading && children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
