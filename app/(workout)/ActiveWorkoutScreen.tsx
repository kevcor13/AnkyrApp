import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobal } from "@/context/GlobalProvider";
import WorkoutOverviewScreen from "@/app/(components)/workout/ExerciseOverview";
import WorkoutExerciseScreen from "@/app/(components)/workout/ExerciseScreen";
import RestScreen from "@/app/(components)/workout/RestScreen";
import UpNextScreen from "@/app/(components)/workout/UpNextScreen";
import { styles as globalStyles } from "@/constants/styles";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChangeThemeScreen from "../(components)/workout/ChangeThemeScreen";

export interface PerformedSet {
    reps: number;
    weight: number;
}

export interface Exercise {
    difficulty: string;
    exerciseName: string;
    reps: string;
    sets: number;
    videoUrl: string;
    phase: "warmup" | "workout" | "cooldown" | "challanges";
    restBetweenSeconds: number;
    recommendedWeight: number;
    performedSets: PerformedSet[];
}

type FlowState = "OVERVIEW" | "EXERCISE" | "INTER_SET_REST" | "POST_EXERCISE_REST" | "UP_NEXT" | "CHANGE_THEME";

const ActiveWorkoutScreen = () => {
    const { userWorkoutData, warmup, workout, coolDown, userGameData, userData, ngrokAPI, TodayWorkout, selectedChallenges} = useGlobal();
    const [changeTheme, setchangeTheme] = useState(Boolean);
    const [liveWorkout, setLiveWorkout] = useState<Exercise[] | null>(null);
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [flowState, setFlowState] = useState<FlowState>("OVERVIEW");
    const [isFinishing, setIsFinishing] = useState(false);
    const [xpFromLastExercise, setXpFromLastExercise] = useState(5);

    useEffect(() => {
        const taggedWarmup = (userWorkoutData.warmup || []).map((ex: any) => ({ ...ex, phase: "warmup" as const }));
        const taggedWorkout = (userWorkoutData.workoutRoutine || []).map((ex: any) => ({ ...ex, phase: "workout" as const }));
        //const taggedCoolDown = (coolDown || []).map((ex: any) => ({ ...ex, phase: "cooldown" as const }));
        const taggedChallanges = (selectedChallenges || []).map((ex:any) => ({...ex,phase:'challanges' as const}))
        const combinedPlaylist = [...taggedWarmup, ...taggedWorkout,...taggedChallanges];

        if (combinedPlaylist.length > 0) {
            const workoutSession = combinedPlaylist.map(exercise => ({
                ...exercise,
                recommendedWeight: exercise.recommendedWeight,
                restBetweenSeconds: exercise.restBetweenSeconds || (exercise.phase === 'warmup' ? 30 : 60),
                performedSets: Array(exercise.sets).fill(null).map(() => ({
                    reps: parseInt(exercise.reps.split('-')[0], 10) || 8,
                    weight: -1
                }))
            }));
            setLiveWorkout(workoutSession);
            setExerciseIndex(0);
            setCurrentSetIndex(0);
            setchangeTheme(userData.askedThemeQuestion);
        }
    }, [warmup, workout, coolDown]);

    const handleSetUpdate = (exIndex: number, setIdx: number, weight: number) => {
        setLiveWorkout(currentWorkout => {
            if (!currentWorkout) return null;
            const updatedWorkout = JSON.parse(JSON.stringify(currentWorkout));
            updatedWorkout[exIndex].performedSets[setIdx].weight = weight;
            return updatedWorkout;
        });
    };

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

    const handleInterSetRestComplete = () => {
        setCurrentSetIndex(prev => prev + 1);
        setFlowState("EXERCISE");
    };

    // CHANGED: This function now controls when to show the "Up Next" screen.
    const handlePostExerciseRestComplete = () => {
        const nextIndex = exerciseIndex + 1;
        setExerciseIndex(nextIndex);
        setCurrentSetIndex(0);

        // Show the full Overview screen for the first two exercises (index 0 and 1).
        // After the second exercise is done, switch to the "Up Next" screen for all subsequent exercises.
        if (nextIndex >= 2) {
            if(!changeTheme){
                setFlowState("CHANGE_THEME")
            } else {
                setFlowState("UP_NEXT");
            }
        } else {
            setFlowState("OVERVIEW");
        }
    };
    const handleChangeTheme = () => {
        setFlowState("UP_NEXT");
    }
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
            const workoutLogPayload = {
                userId: UserID,
                workoutName: TodayWorkout?.focus || "Completed Workout",
                durationSeconds: 3600,
                exercises: liveWorkout.map(ex => ({
                    name: ex.exerciseName,
                    sets: ex.performedSets.filter(set => set.weight >= 0).map(s => ({
                        reps: s.reps,
                        weight: s.weight
                    }))
                })).filter(ex => ex.sets.length > 0),
                points: liveWorkout.length * 5,
            };

            await axios.post(`${ngrokAPI}/logWorkout`, workoutLogPayload);
            const points = (userGameData?.points || 0) + (liveWorkout.length * 5);
            const streak = (userGameData?.streak || 0) + 1;
            await axios.post(`${ngrokAPI}/updatePointAndStreak`, { UserID, points, streak });
            await axios.post(`${ngrokAPI}/recordWorkoutCompletion`, { UserID });

            Alert.alert("Workout Complete!", "Great job! Your progress has been saved.");
            router.replace("/(workout)/EndWorkoutScreen");
        } catch (error) {
            console.error("Failed to save workout:", error);
            Alert.alert("Error", "There was a problem saving your workout.");
        } finally {
            setIsFinishing(false);
        }
    };

    const handleStartExercise = () => setFlowState("EXERCISE");
    const handleEnd = () => router.push("/(tabs)/home");

    if (!liveWorkout) {
        return (
            <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </LinearGradient>
        );
    }

    const currentExercise = liveWorkout[exerciseIndex];

    const renderContent = () => {
        switch (flowState) {
            // This case now handles both the first and second exercises (index 0 and 1)
            case "OVERVIEW":
                return (
                    <WorkoutOverviewScreen
                        exercise={currentExercise}
                        onStart={handleStartExercise}
                        onEnd={handleEnd}
                        currentExerciseIndex={exerciseIndex}
                        totalExercises={liveWorkout.length}
                    />
                );

            // This case handles all exercises from the third one onwards
            case "UP_NEXT":
                return (
                    <UpNextScreen
                        nextExercise={currentExercise}
                        onStart={handleStartExercise}
                        onEnd={handleEnd}
                        xpEarned={xpFromLastExercise}
                        currentExerciseIndex={exerciseIndex}
                        totalExercises={liveWorkout.length}
                    />
                );
            case "CHANGE_THEME":
                return (
                    <ChangeThemeScreen onConfirm={handleChangeTheme}/>
                )
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
                        duration={currentExercise.restBetweenSeconds + 20}
                        onRestComplete={handlePostExerciseRestComplete}
                    />
                );

            default: return null;
        }
    };

    return <View style={{ flex: 1 }}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'Poppins-SemiBold'
    }
})

export default ActiveWorkoutScreen;
