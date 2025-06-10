import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { styles } from '@/app/(workout)/styles'; // Import styles
import icons from "@/constants/icons";

interface Exercise {
    exercise: string;
    phase: string;
    videoUrl: string;
    sets: number;
    reps: String;
    // Add other properties as needed
}

interface ExerciseScreenProps {
    exercise: Exercise;
    onCompleteExercise: () => void;
    exercisePlaylist: Exercise[];
    currentIndex: number;
}

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({ exercise, onCompleteExercise, exercisePlaylist, currentIndex }) => {
    const isWarmup = exercise.phase === 'warmup';
    const phaseExercises = exercisePlaylist.filter(ex => ex.phase === exercise.phase);
    const phaseCurrentIndex = phaseExercises.findIndex(ex => ex.exercise === exercise.exercise);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Video
                    source={{ uri: exercise.videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isLooping
                    isMuted
                />
            </View>
            <LinearGradient colors={isWarmup ? ['#FF0509', '#271293'] : ['#A12287', '#1F059D']} style={styles.gradientContainer}>
                
                <ScrollView style={styles.workoutCard}>
                    <Text style={styles.exerciseNameMain}>{exercise.exercise}</Text>
                    <View style={styles.repsContainer}>
                        <Text style={styles.repsSetsMain}>{exercise.sets} x {exercise.reps}</Text>
                        <Text style={styles.repsLabel}> reps</Text>
                    </View>
                    <Text style={styles.bodyweightText}>BodyWeight</Text>
                    <Text style={styles.weightText}>45Ibs + 45Ibs</Text>
                    <TouchableOpacity style={styles.nextButtonWorkout} onPress={onCompleteExercise}>
                        <Text style={styles.nextButtonTextWorkout}>
                            {isWarmup && phaseCurrentIndex === phaseExercises.length - 1
                                ? 'Finish Warm Up'
                                : 'Log Set'}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.streakContainer}>
                        <Image source={icons.blueStreak} />
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

export default ExerciseScreen;