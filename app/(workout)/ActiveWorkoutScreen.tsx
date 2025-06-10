import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobal } from '@/context/GlobalProvider';
import WorkoutOverviewScreen from '@/app/(components)/workout/ExerciseOverview';
import WorkoutExerciseScreen from '@/app/(components)/workout/ExerciseScreen';
import RestScreen from '@/app/(components)/workout/RestScreen'; // Import the new RestScreen
import { styles } from './styles';
import axios from 'axios';
import { router } from 'expo-router';

export interface Exercise {
    difficulty: string;
    exercise: string;
    reps: string;
    sets: number;
    videoUrl: string;
    phase: 'warmup' | 'workout';
    restBetweenSeconds: number; // Ensure this is here
}

// Define the possible states for our workout flow
type FlowState = 'OVERVIEW' | 'EXERCISE' | 'REST';

const ActiveWorkoutScreen = () => {
    const { warmup, workout, userGameData, userData, ngrokAPI, TodayWorkout } = useGlobal();
    const [exercisePlaylist, setExercisePlaylist] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    // New state to manage the flow, starting with the overview
    const [flowState, setFlowState] = useState<FlowState>('OVERVIEW');

    useEffect(() => {
        const taggedWarmup = (warmup || []).map((ex: any) => ({ ...ex, phase: 'warmup' as const, restBetweenSeconds: ex.restBetweenSeconds || 30 }));
        const taggedWorkout = (workout || []).map((ex: any) => ({ ...ex, phase: 'workout' as const, restBetweenSeconds: ex.restBetweenSeconds || 60 }));
        const combinedPlaylist = [...taggedWarmup, ...taggedWorkout];

        if (combinedPlaylist.length > 0) {
            setExercisePlaylist(combinedPlaylist);
            setCurrentIndex(0);
        }
    }, [warmup, workout]);

    // Called from WorkoutExerciseScreen
    const handleCompleteExercise = () => {
        // Check if it's the last exercise
        if (currentIndex >= exercisePlaylist.length - 1) {

            const points = (TodayWorkout.warmup.length + TodayWorkout.workoutRoutine.length) * 5;
            const streak = userGameData.streak + 1;
            const UserID = userData?._id || '';

            axios.post(`${ngrokAPI}/updatePointAndStreak`, { UserID, points, streak })
                .then(response => { console.log("Points and streak updated successfully:", response.data); })
                .catch(error => {
                    console.error("Error updating points and streak:", error);
                })


            Alert.alert("Workout Complete!", "Great job!");
            // Navigate away or reset the state
            return;
        }

        // Transition to the REST state
        setFlowState('REST');
    };

    // Called from RestScreen
    const handleRestComplete = () => {
        // Move to the next exercise and back to the OVERVIEW state
        setCurrentIndex(prev => prev + 1);
        setFlowState('OVERVIEW');
    };

    // Called from WorkoutOverviewScreen
    const handleStartExercise = () => {
        setFlowState('EXERCISE');
    };

    const handleEnd = () => {
        router.push('/(tabs)/home');
    }

    const currentExercise = exercisePlaylist[currentIndex];

    if (!currentExercise) {
        return (
            <LinearGradient colors={['#FF0509', '#271293']} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Workout...</Text>
            </LinearGradient>
        );
    }

    // Use a function to render the correct screen based on the flowState
    const renderContent = () => {
        switch (flowState) {
            case 'OVERVIEW':
                return (
                    <WorkoutOverviewScreen
                        exercise={currentExercise}
                        onStart={handleStartExercise}
                        onEnd={handleEnd}
                        currentExerciseIndex={currentIndex}
                        totalExercises={exercisePlaylist.length}
                    />
                );
            case 'EXERCISE':
                return (
                    <WorkoutExerciseScreen
                        exercise={currentExercise}
                        onCompleteExercise={handleCompleteExercise}
                        exercisePlaylist={exercisePlaylist}
                        currentIndex={currentIndex}
                    />
                );
            case 'REST':
                return (
                    <RestScreen
                        duration={currentExercise.restBetweenSeconds}
                        onRestComplete={handleRestComplete}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {renderContent()}
        </View>
    );
};

export default ActiveWorkoutScreen;