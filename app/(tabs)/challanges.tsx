import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "@/components/CustomButton";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from "react-native";
import icons from "@/constants/icons";
import { router } from "expo-router";

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
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.title}>YOUR{'\n'}WEDNESDAY{'\n'}WORKOUT</Text>
                    <Image
                        source={icons.whiteZap}
                        style={styles.zapImage}/>
                </View>
                <Text style={styles.subtitle}>CHEST & TRIS</Text> 
                <Text style={styles.timeIndicator}>50 mins</Text>
                <CustomButton
                            title="My workout"
                            handlePress={()=> router.navigate("/Onboard")}
                            buttonStyle={{
                                backgroundColor: 'rgba(217, 217, 217, 0.5)', 
                                borderRadius: 20, 
                                paddingVertical: 16, 
                                paddingHorizontal: 32, 
                                marginTop: 10, 
                                justifyContent: "center"
                            }}
                            textStyle={{
                                color: '#FFFFFF', 
                                fontSize: 16, 
                                fontFamily: 'poppins-semiBold'
                            }}

                        />
            </View>
        </ScrollView>
    </LinearGradient>
    );
};
const styles = StyleSheet.create({
    headerContainer: {
        marginTop: 60,
        padding: 10,
        marginRight: 20,
       // backgroundColor: '#1F059D',
        borderRadius: 10,
        margin: 10,
    },
    subtitle: {
        fontFamily:'poppins-semiBold',
        color: '#8B8BEA',
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 28,
    },
    title: {
        fontSize: 50,
        fontFamily: 'Poppins-semiBold',
        color: '#FFFFFF',
        lineHeight: 57, 
        letterSpacing: -2,
        textTransform: 'uppercase',
        margin:0,
        padding:0
    },
    zapImage: {
        width: 60,
        height: 60,
        marginTop: 10,
        marginLeft: 10,
    },
    timeIndicator: {
        textAlign: 'right',
        fontFamily: 'poppins-semiBold',
        fontSize: 24,
        color: '#38FFF5',
        marginLeft: 10,
    }
})


export default ChallengesPage;