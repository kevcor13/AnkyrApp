import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobal } from "@/context/GlobalProvider";
import WorkoutOverviewScreen from "@/app/(components)/workout/ExerciseOverview";
import WorkoutExerciseScreen from "@/app/(components)/workout/ExerciseScreen";
import RestScreen from "@/app/(components)/workout/RestScreen"; // Using your existing RestScreen
import { styles as globalStyles } from "@/constants/styles";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformedSet {
  reps: number;
  weight: number;
}

export interface Exercise {
  difficulty: string;
  exercise: string;
  reps: string;
  sets: number;
  videoUrl: string;
  phase: "warmup" | "workout";
  restBetweenSeconds: number;
  recommendedWeight: number;
  performedSets: PerformedSet[];
}

// Expanded flow state to handle inter-set rests
type FlowState = "OVERVIEW" | "EXERCISE" | "INTER_SET_REST" | "POST_EXERCISE_REST";

const ActiveWorkoutScreen = () => {
    const { warmup, workout, userGameData, userData, ngrokAPI, TodayWorkout, coolDown } = useGlobal();
    const [liveWorkout, setLiveWorkout] = useState<Exercise[] | null>(null);
    const [exerciseIndex, setExerciseIndex] = useState(0); // Tracks which EXERCISE we're on
    const [currentSetIndex, setCurrentSetIndex] = useState(0); // Tracks which SET we're on
    const [flowState, setFlowState] = useState<FlowState>("OVERVIEW");
    const [isFinishing, setIsFinishing] = useState(false);

    // useEffect for initializing the workout state
    useEffect(() => {

        
        const taggedWarmup = (warmup || []).map((ex: any) => ({ ...ex, phase: "warmup" as const }));
        const taggedWorkout = (workout || []).map((ex: any) => ({ ...ex, phase: "workout" as const }));
        const taggedCoolDown = (coolDown || []).map((ex: any) => ({ ...ex, phase: "cooldown" as const }));
        const combinedPlaylist = [...taggedWarmup, ...taggedWorkout, ...taggedCoolDown];
        if (combinedPlaylist.length > 0) {
            const workoutSession = combinedPlaylist.map(exercise => ({
                ...exercise,
                recommendedWeight: exercise.recommendedWeight,
                restBetweenSeconds: exercise.restBetweenSeconds || (exercise.phase === 'warmup' ? 30 : 60),
                performedSets: Array(exercise.sets).fill(null).map(() => ({
                    reps: parseInt(exercise.reps.split('-')[0], 10) || 8,
                    weight: -1 // Use -1 as a sentinel for "not yet set"
                }))
            }));

            setLiveWorkout(workoutSession);
            setExerciseIndex(0);
            setCurrentSetIndex(0);
        }
    }, [warmup, workout]);

    // This handler updates the weight in our state
    const handleSetUpdate = (exIndex: number, setIdx: number, weight: number) => {
        setLiveWorkout(currentWorkout => {
            if (!currentWorkout) return null;
            const updatedWorkout = JSON.parse(JSON.stringify(currentWorkout));
            updatedWorkout[exIndex].performedSets[setIdx].weight = weight;
            return updatedWorkout;
        });
    };

    // This function is called every time a set is logged
    const handleSetLogged = () => {
        if (!liveWorkout) return;
        const totalSetsForExercise = liveWorkout[exerciseIndex].sets;

        if (currentSetIndex >= totalSetsForExercise - 1) {
            if (exerciseIndex >= liveWorkout.length - 1) {
                handleFinishWorkout();
            } else {
                setFlowState("POST_EXERCISE_REST");
            }
        } else {
            setFlowState("INTER_SET_REST");
        }
    };

    // Called when the rest BETWEEN SETS is done
    const handleInterSetRestComplete = () => {
        setCurrentSetIndex(prev => prev + 1);
        setFlowState("EXERCISE");
    };

    // Called when the rest BETWEEN EXERCISES is done
    const handlePostExerciseRestComplete = () => {
        setExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        setFlowState("OVERVIEW");
    };

    // This function now contains the full API logic
    const handleFinishWorkout = async () => {
        if (!liveWorkout || isFinishing) return;
        setIsFinishing(true);

        const UserID = userData._id;
        if (!UserID) {
            Alert.alert("Error", "Could not identify user. Please log in again.");
            setIsFinishing(false);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');

            const workoutLogPayload = {
                userId: UserID,
                workoutName: TodayWorkout?.focus || "Completed Workout",
                durationSeconds: 3600, // Placeholder
                exercises: liveWorkout.map(ex => ({
                    name: ex.exercise,
                    sets: ex.performedSets.filter(set => set.weight >= 0).map(s => ({
                        reps: s.reps,
                        weight: s.weight
                    }))
                })).filter(ex => ex.sets.length > 0),
                points: liveWorkout.length * 5, // Example points calculation
            };
            
            // --- API CALLS ---
            await axios.post(`${ngrokAPI}/logWorkout`, workoutLogPayload);
            console.log("Workout log saved successfully.");

            const points = (userGameData?.points || 0) + (liveWorkout.length * 5);
            const streak = (userGameData?.streak || 0) + 1;
            await axios.post(`${ngrokAPI}/updatePointAndStreak`, { UserID, points, streak });
            console.log("Points and streak updated.");

            await axios.post(`${ngrokAPI}/recordWorkoutCompletion`, {UserID} );
            console.log("Workout completion recorded.");
            // --- END API CALLS ---

            Alert.alert("Workout Complete!", "Great job! Your progress has been saved.");
            router.replace("/(workout)/EndWorkoutScreen");

        } catch (error) {
            Alert.alert("Error", "There was a problem saving your workout.");
        } finally {
            setIsFinishing(false);
        }
    };

    const handleStartExercise = () => setFlowState("EXERCISE");
    const handleEnd = () => router.push("/(tabs)/home");

    if (!liveWorkout) {
        return <LinearGradient colors={["#FF0509", "#271293"]} style={globalStyles.loadingContainer}><Text style={{color: 'white', fontSize: 22}}>Loading...</Text></LinearGradient>;
    }
    
    const currentExercise = liveWorkout[exerciseIndex];

    const renderContent = () => {
        switch (flowState) {
            case "OVERVIEW":
                return <WorkoutOverviewScreen exercise={currentExercise} onStart={handleStartExercise} onEnd={handleEnd} currentExerciseIndex={exerciseIndex} totalExercises={liveWorkout.length} />;
            
            case "EXERCISE":
                return (
                    <WorkoutExerciseScreen
                        exercise={currentExercise}
                        exerciseIndex={exerciseIndex}
                        currentSetIndex={currentSetIndex}
                        onSetUpdate={handleSetUpdate}
                        onSetLogged={handleSetLogged}
                    />
                );
            
            case "INTER_SET_REST":
                return (
                    <RestScreen
                        duration={currentExercise.restBetweenSeconds}
                        onRestComplete={handleInterSetRestComplete}
                    />
                );
            
            case "POST_EXERCISE_REST":
                return (
                    <RestScreen
                        duration={currentExercise.restBetweenSeconds + 30} // Example: longer rest between exercises
                        onRestComplete={handlePostExerciseRestComplete}
                    />
                );

            default: return null;
        }
    };

    return <View style={{ flex: 1 }}>{renderContent()}</View>;
};

export default ActiveWorkoutScreen;