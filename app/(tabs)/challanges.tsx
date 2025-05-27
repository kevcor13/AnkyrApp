import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ChallengesPage: React.FC = () => {
    const [dailyChallengesOpen, setDailyChallengesOpen] = useState(false);
    const { userData, fetchWorkout, userGameData } = useGlobal()
    const [mondayWorkoutOpen, setMondayWorkoutOpen] = useState(false);
    const [random, setRandom] = useState('legs')
    const [currentDay, setCurrentDay] = useState('')
    const [workoutRoutine, setWorkoutRoutine] = useState([])
    const [todayWorkout, setTodayWorkout] = useState(null); // State for today's workout
    const [randomData, setRandomData] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const workout = await fetchWorkout(token, userData._id);


                // Ensure the workout data exists and has the correct structure
                const routineArray = workout?.routine || [];
                setWorkoutRoutine(routineArray);

                // Get the current day
                const today = new Date().toLocaleString("en-US", { weekday: "long" });
                setCurrentDay(today);

                // Find today's workout in the routine array
                const workoutOfTheDay = routineArray.find((dayRoutine: { day: string; }) => dayRoutine.day === today);

                // Extract today's workoutRoutine if available, otherwise set to null
                setTodayWorkout(workoutOfTheDay?.workoutRoutine || null);

                console.log("Workout for today:", workoutOfTheDay);
            } catch (error) {
                console.error("Error fetching workout data:", error);
            }
        };

        fetchData();
    }, [userData]);


    const press= (name: any) =>{

    }

    const renderExercises = (exercises: any[]) =>
        exercises.map((exercise, index) => (
            <TouchableOpacity onPress={() => press(exercise.exercise)}>
            <View
                key={index}
                className="flex-row items-center bg-gray-800 rounded-lg p-4 mb-4"
            >
                {/* Exercise Image
                <View className="w-16 h-16 bg-gray-900 rounded-full overflow-hidden mr-4">
                    <Image
                        source={{ uri: exercise.image || 'https://via.placeholder.com/150' }} // Replace with actual image URL if available
                        className="w-full h-full object-cover"
                    />
                </View>
                */}
                {/* Exercise Details */}
                <View>
                    <Text className="text-white font-bold text-lg">{exercise.exercise}</Text>
                    <Text className="text-gray-400">
                        {exercise.sets
                            ? `${exercise.sets} sets x ${exercise.reps} reps`
                            : exercise.duration}
                    </Text>
                </View>
            </View>
            </TouchableOpacity>
        ));

    const AI = async () => {
        try {
            const message = `"Generate a full week workout plan with warmups, exercises, and sets/reps for each day."`;
            const UserID = userData._id;
            console.log("Requesting workout plan with message:", message);

            // Send the request to the new endpoint
            const response = await axios.post("http://localhost:5001/aI", {message, UserID});

            // Log the response from the server
            console.log("Workout saved successfully! Response:", response.data);
        } catch (error) {
            console.error("Error generating and saving workout:");
        }
    };

    return(
        <LinearGradient
        colors={['#FF3C3C', '#A12287', '#1F059D']} // Gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
    >
        <ScrollView className="h-full">
            <View className=" mt-16">
                <Text className="text-white text-[55px] font-poppins-semibold leading-none tracking-tight">YOUR MONDAY WORKOUT</Text>
            </View>
        </ScrollView>
    </LinearGradient>
    );
};

export default ChallengesPage;