import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { styles as globalStyles } from '@/constants/styles';
import icons from "@/constants/icons";

interface PerformedSet {
  reps: number;
  weight: number;
}

interface Exercise {
    exercise: string;
    phase: 'warmup' | 'workout';
    videoUrl: string;
    sets: number;
    reps: string;
    restBetweenSeconds: number;
    recommendedWeight: number;
    performedSets: PerformedSet[];
}

// --- MODIFICATION 1: Update Props ---
interface ExerciseScreenProps {
    exercise: Exercise;
    exerciseIndex: number;
    currentSetIndex: number; // Received from parent
    onSetUpdate: (exerciseIndex: number, setIndex: number, weight: number) => void;
    onSetLogged: () => void; // Renamed from onCompleteExercise
}

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({ exercise, exerciseIndex, currentSetIndex, onSetUpdate, onSetLogged }) => {
    
    // This useEffect still pre-fills the weight for the current set
    useEffect(() => {
        if (exercise.performedSets[currentSetIndex]?.weight === -1) {
            onSetUpdate(exerciseIndex, currentSetIndex, exercise.recommendedWeight);
        }
    }, [exercise.exercise, currentSetIndex]);

    const isWarmup = exercise.phase === 'warmup';
    const isBodyweight = exercise.recommendedWeight === 0;

    // This function is now very simple: it just tells the parent a set was logged.
    const handleLogSet = () => {
        onSetLogged();
    };

    const adjustWeight = (amount: number) => {
        const currentWeight = exercise.performedSets[currentSetIndex].weight || 0;
        const newWeight = Math.max(0, currentWeight + amount);
        onSetUpdate(exerciseIndex, currentSetIndex, newWeight);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={globalStyles.header}>
                <Video source={{ uri: exercise.videoUrl }} style={globalStyles.video} resizeMode={ResizeMode.COVER} shouldPlay isLooping isMuted />
            </View>
            <LinearGradient colors={isWarmup ? ['#FF0509', '#E89750'] : ['#A12287', '#1F059D']} style={globalStyles.gradientContainer}>
                <ScrollView style={globalStyles.workoutCard}>
                    <Text style={globalStyles.exerciseNameMain}>{exercise.exercise}</Text>
                    <View style={globalStyles.repsContainer}>
                      <Text style={globalStyles.repsSetsMain}>{exercise.sets} x {exercise.reps}</Text>
                      <Text style={globalStyles.repsLabel}> reps</Text>
                    </View>
                    
                    <Text style={styles.currentSetIndicator}>Set {currentSetIndex + 1} of {exercise.sets}</Text>
                    
                    {isBodyweight ? (
                        <Text style={globalStyles.bodyweightText}>Bodyweight Exercise</Text>
                    ) : (
                        <View style={styles.weightAdjusterContainer}>
                            <Text style={styles.suggestedText}>Log Weight:</Text>
                            <View style={styles.adjusterRow}>
                                <TouchableOpacity onPress={() => adjustWeight(-5)} style={styles.adjusterButton}><Text style={styles.adjusterButtonText}>-</Text></TouchableOpacity>
                                <View style={styles.weightDisplay}>
                                    <Text style={styles.weightDisplayText}>
                                        {exercise.performedSets[currentSetIndex]?.weight === -1 ? exercise.recommendedWeight : exercise.performedSets[currentSetIndex].weight}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => adjustWeight(5)} style={styles.adjusterButton}><Text style={styles.adjusterButtonText}>+</Text></TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <TouchableOpacity style={globalStyles.nextButtonWorkout} onPress={handleLogSet}>
                        <Text style={globalStyles.nextButtonTextWorkout}>
                            {currentSetIndex >= exercise.sets - 1 ? 'Finish Exercise' : `Log Set ${currentSetIndex + 1}`}
                        </Text>
                    </TouchableOpacity>
                    <View style={globalStyles.streakContainer}><Image source={icons.blueStreak} /></View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

// --- NEW: Add specific styles for the weight adjuster ---
const styles = StyleSheet.create({
    weightAdjusterContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    suggestedText: {
        fontFamily: 'poppins-medium',
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 10,
    },
    adjusterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    adjusterButton: {
        paddingHorizontal: 20,
    },
    adjusterButtonText: {
        fontFamily: 'poppins-light',
        fontSize: 60,
        color: 'white',
    },
    weightDisplay: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    weightDisplayText: {
        fontFamily: 'poppins-semibold',
        fontSize: 50,
        color: 'white',
    },
    unitSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 20,
        padding: 4,
        marginTop: 15,
    },
    unitButton: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 18,
    },
    unitButtonActive: {
        backgroundColor: 'white',
    },
    unitButtonText: {
        fontFamily: 'poppins-semibold',
        fontSize: 14,
        color: 'white',
    },
    unitButtonTextActive: {
        color: '#271293', // Match your button text color
    },
    currentSetIndicator: {
        fontFamily: 'poppins-semibold',
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        opacity: 0.8
    },
});

export default ExerciseScreen;