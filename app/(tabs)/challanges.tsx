import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from "react-native";
import icons from "@/constants/icons";

const ChallengesPage: React.FC = () => {
    const [dailyChallengesOpen, setDailyChallengesOpen] = useState(false);
    const { userData, fetchWorkout, userGameData } = useGlobal()
    const [mondayWorkoutOpen, setMondayWorkoutOpen] = useState(false);
    const [random, setRandom] = useState('legs')
    const [currentDay, setCurrentDay] = useState('')
    const [workoutRoutine, setWorkoutRoutine] = useState([])
    const [todayWorkout, setTodayWorkout] = useState(null); // State for today's workout
    const [randomData, setRandomData] = useState('');

/*
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
*/

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

    return(
        <LinearGradient
        colors={['#FF3C3C', '#A12287', '#1F059D']} // Gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
    >
        <ScrollView className="h-full">
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>YOUR MONDAY WORKOUT</Text>
                <Image source={icons.whiteZap} style={styles.zapImage}/>
            </View>

        </ScrollView>
    </LinearGradient>
    );
};
const styles = StyleSheet.create({
    headerContainer: {
        marginTop: 60,
        //padding: 10,
        marginRight:80,
        flexDirection: 'row',
        backgroundColor: '#1F059D',
        borderRadius: 10,
        //margin: 40,
    },
    headerText: {
        fontSize: 50,
        fontFamily: 'Poppins-semiBold',
        color: '#FFFFFF',
        lineHeight: 55 
       },
    zapImage: {
        width: 60,
        height: 60,
        marginTop: 10,
        marginRight: 60,
    }
})


export default ChallengesPage;