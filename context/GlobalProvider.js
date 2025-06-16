import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { WarmUp } from "@/constants/workout";


export const GlobalContext = createContext();
export const useGlobal = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [warmup, setWarmup] = useState([])
    const [workout, setworkout] = useState([])
    const [today, settoday] = useState('')
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState('');
    const [userData, setUserData] = useState('');
    const [loading, setLoading] = useState(true);
    const [questionStatus, setQuestionStatus] = useState(false);
    const [userGameData, setUserGameData] = useState('');
    const [userWorkoutData, setUserWorkoutData] = useState('')
    const [TodayWorkout, setTodayWorkout] = useState('')
    const [workoutPlan, setWorkoutPlan] = useState('');
    const [followingUsers, setFollowingUsers] = useState([]);
    const [followersUsers, setFollowersUsers] = useState([]);
    const ngrokAPI = 'https://d076-173-8-115-9.ngrok-free.app'


    // function to sign up the user
    const signUpUser = async (name, username, email, password, profile) => {
        console.log(profile);
        try{
            const response = await axios.post(`${ngrokAPI}/register`, {name, username, email, password, profile});
            const data = response.data;
            console.log(data)
            if (data.status === "success") {
                await AsyncStorage.setItem("token", data.data); // Save the JWT token
                await AsyncStorage.setItem("isLoggedIn", "true");
                setIsLoggedIn(true);
                fetchUserData(data.data);
                return { status: "success"};
            } else {
                return {success: false, message: data.message};
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: "Login failed." };
        }
    }

    // Function to log in the user
    const loginUser = async (email, password) => {
        try {
            const response = await axios.post(`${ngrokAPI}/login`, { email, password });
            const data = response.data;

            if (data.status === "success") {
                await AsyncStorage.setItem("token", data.data); // Save the JWT token
                await AsyncStorage.setItem("isLoggedIn", "true");
                setIsLoggedIn(true);
                setUser(data.user);

                // Fetch user data immediately after login
                await fetchUserData(data.data);
                //await fetchGameData(data.data, data.user._id);

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
            // Get token for potential server-side logout
            const token = await AsyncStorage.getItem("token");
            await AsyncStorage.setItem("isLoggedIn", "false");
           console.log("signing out");
            // Reset all state variables
            setIsLoggedIn(false);
            setUser(null);
            setUserData('');
            setUserPosts('');
            setQuestionStatus(false);
            setUserGameData('');
            setWorkoutPlan('');
            setFollowingUsers([]);

            // Navigate to login screen
            router.replace("/sign-in");

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
            const response = await axios.post(`${ngrokAPI}/userdata`, { token });
            if (response.data.status === "success") {
                setUserData(response.data.data);
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
            const response = await axios.post(`${ngrokAPI}/gamedata`, {token, UserID});
            if (response.data.status === "success") {
                setUserGameData(response.data.data);
                return response.data.data;
            } else {
                console.error("Failed to fetch user data:", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching game data:", error);
        }
    }

    //get the workout data
    const fetchWorkout = async (token, UserID) => {
        try{
            const response = await axios.post(`${ngrokAPI}/workout`, {token, UserID});
            if (response.data.status === "success") {
                setUserWorkoutData(response.data.data)
                await seperateWorkouts(response.data.data)
                return response.data.data;
            } else {
                console.error("Failed to fetch workout data:", response.data.data);
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    }
    const seperateWorkouts = async (rawWorkoutData) => {
        const routineArray = rawWorkoutData?.routine || [];
        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        const workoutOfTheDay = routineArray.find((dayRoutine) => dayRoutine.day === today);
        setTodayWorkout(workoutOfTheDay)      
        setWarmup(workoutOfTheDay.warmup)
        setworkout(workoutOfTheDay.workoutRoutine)
    }
    // get the followers from user.
    // inside GlobalProvider, replace your old fetchFollowingUsers with this:
    const fetchFollowingUsers = async () => {
        try {
            // make sure you have the current user’s ID
            if (!userData?._id) {
                console.error('No user ID available for fetching followings');
                return [];
            }

            // call your updated backend endpoint
            const response = await axios.post(
                `${ngrokAPI}/getFollowing`,
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
                console.log(response.data.data);
                // response.data.data is now an array of:
                // { userId, username, email, profileImage, requestStatus }
                const formatted = response.data.data.map(u => ({
                    id:            u.userId,
                    username:      u.username,
                    email:         u.email,
                    avatar:        u.profileImage,
                    requestStatus: u.requestStatus  // true | false | null
                }));

                setFollowingUsers(formatted);
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

    const fetchFollowerUsers = async () => {
        try {
            // make sure you have the current user’s ID
            if (!userData?._id) {
                console.error('No user ID available for fetching followings');
                return [];
            }

            // call your updated backend endpoint
            const response = await axios.post(
                `${ngrokAPI}/getFollowers`,
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
                console.log(response.data.data);
                // response.data.data is now an array of:
                // { userId, username, email, profileImage, requestStatus }
                const formatted = response.data.data.map(u => ({
                    id:            u.userId,
                    username:      u.username,
                    email:         u.email,
                    avatar:        u.profileImage,
                    requestStatus: u.requestStatus  // true | false | null
                }));

                setFollowersUsers(formatted);
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



    const fetchQuestionnaireCompletion = async ()  => {
        try{
            const response = userData.questionnaire;
            console.log("user completion", response);
            setCompletedQuestions(response);
        } catch {
            console.error("Failed to fetch questionnaire completion:", error);
        }
    }

    const AI = async () => {
        //const message = `what is ${random} * ${random}`
        console.log(message)

        try {
            // Send API request
            const res = await axios.post("http://localhost:5001/AI", {
                //message,
            });

            const chatResponse = res.data.reply.content;
            console.log("ChatGPT Response:", chatResponse);

            // Save response to state
            setWorkoutPlan(chatResponse);

        } catch (error) {
            console.error("Error communicating with ChatGPT:", error);
        }
    }

    // Function to mark the questionnaire as completed
    const markQuestionnaireCompleted = async () => {
        try {
            const UserID = userData._id;
            console.log(UserID)
            axios.post("http://localhost:5001/mark-questionnaire",  {UserID} );
            setQuestionStatus(true);
            console.log(questionStatus);
        } catch (error) {
            console.error("Error marking questionnaire as completed:", error);
            return { success: false, message: "Failed to mark questionnaire as completed." };
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
                TodayWorkout,
                warmup,
                workout,
                loading,
                questionStatus,
                userGameData,
                ngrokAPI,
                userWorkoutData,
                fetchUserPosts,
                signUpUser,
                loginUser,
                logoutUser,
                fetchQuestionnaireCompletion,
                markQuestionnaireCompleted,
                fetchUserData, // Expose fetchUserData if needed elsewhere
                fetchGameData,
                fetchWorkout,
                fetchFollowingUsers,
                fetchFollowerUsers
            }}
        >
            {!loading && children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;