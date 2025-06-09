import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobal } from '@/context/GlobalProvider';
import ExerciseOverview from '@/app/(components)/workout/ExerciseOverview'; // Import the new screen
import ExerciseScreen from '@/app/(components)/workout/ExerciseScreen'; // Import the new screen
import { styles } from './styles'; // Import styles
import { router } from 'expo-router';

// You can keep the Exercise interface here or move it to a types file
export interface Exercise {
    difficulty: string;
    exercise: string;
    reps: number;
    sets: number;
    videoUrl: string;
    phase: 'warmup' | 'workout';
}

const ActiveWorkoutScreen = () => {
    const { warmup, workout } = useGlobal();
    const [exercisePlaylist, setExercisePlaylist] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false); // New state to control which screen to show

    useEffect(() => {
        const taggedWarmup = (warmup || []).map((ex: any) => ({ ...ex, phase: 'warmup' as const }));
        const taggedWorkout = (workout || []).map((ex: any) => ({ ...ex, phase: 'workout' as const }));
        const combinedPlaylist = [...taggedWarmup, ...taggedWorkout];

        if (combinedPlaylist.length > 0) {
            setExercisePlaylist(combinedPlaylist);
            setCurrentIndex(0);
        }
    }, [warmup, workout]);

    const handleCompleteExercise = () => {
        if (currentIndex < exercisePlaylist.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsWorkoutActive(false); // Go back to the overview screen for the next exercise
        } else {
            Alert.alert("Workout Complete!", "Great job!");
            router.navigate('/(tabs)/home'); // Navigate to home or any other screen
            // Here you might want to navigate away from the workout flow
        }
    };

    const currentExercise = exercisePlaylist[currentIndex];

    if (!currentExercise) {
        return (
            <LinearGradient colors={['#FF0509', '#271293']} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Workout...</Text>
            </LinearGradient>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {isWorkoutActive ? (
                <ExerciseScreen
                    exercise={currentExercise}
                    onCompleteExercise={handleCompleteExercise}
                    exercisePlaylist={exercisePlaylist}
                    currentIndex={currentIndex}
                />
            ) : (
                <ExerciseOverview
                    exercise={currentExercise}
                    onStart={() => setIsWorkoutActive(true)}
                />
            )}
        </View>
    );
};

export default ActiveWorkoutScreen;