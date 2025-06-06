import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image, Animated,
    Dimensions,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobal } from '@/context/GlobalProvider';
import icons from "@/constants/icons";
import { Video, ResizeMode } from 'expo-av';

// Interface with the 'phase' property
export interface Exercise {
    difficulty: string;
    exercise: string;
    reps: string;
    sets: number;
    videoUrl: string;
    phase: 'warmup' | 'workout';
}

const ActiveWorkoutScreen = () => {
    const { warmup, workout } = useGlobal();
    const [exercisePlaylist, setExercisePlaylist] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [overview, setOverview] = useState(true);

    const screenWidth = Dimensions.get('window').width;

    // Animation values
    const slideAnim1 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim2 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim3 = useRef(new Animated.Value(-screenWidth)).current;

    // Trigger animation every time the overview screen appears
    useEffect(() => {
        if (overview) {
            slideAnim1.setValue(-screenWidth);
            slideAnim2.setValue(-screenWidth);
            slideAnim3.setValue(-screenWidth);

            Animated.stagger(400, [
                Animated.timing(slideAnim1, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim2, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim3, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [overview]);


    useEffect(() => {
        const taggedWarmup = (warmup || []).map((ex: any) => ({ ...ex, phase: 'warmup' as const }));
        const taggedWorkout = (workout || []).map((ex: any) => ({ ...ex, phase: 'workout' as const }));

        const combinedPlaylist = [...taggedWarmup, ...taggedWorkout];

        if (combinedPlaylist.length > 0) {
            setExercisePlaylist(combinedPlaylist);
            setCurrentIndex(0);
        }
    }, [warmup, workout]);

    // --- FIX #2 STARTS HERE ---
    // Added a delay to the transition when moving to the next exercise.
    const handleNextExercise = () => {
        setTimeout(() => {
            const currentPhase = exercisePlaylist[currentIndex]?.phase;
            const nextPhase = exercisePlaylist[currentIndex + 1]?.phase;
            if (currentPhase === 'warmup' && nextPhase === 'workout') {
                setCurrentIndex(prev => prev + 1);
            } else if (currentIndex < exercisePlaylist.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                Alert.alert("Workout Complete!", "Great job!");
            }
        }, 1000); // 400ms delay before showing the next overview
    };
    // --- FIX #2 ENDS HERE ---

    const currentExercise = exercisePlaylist[currentIndex];
    setOverview(true);
    if (!currentExercise) {
        return (
            <LinearGradient colors={['#FF0509', '#271293']} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Workout...</Text>
            </LinearGradient>
        );
    }

    if (overview) {
        return (
            <LinearGradient colors={['#FF0509', '#271293']} style={styles.overviewContainer}>
                <Animated.View style={{ transform: [{ translateX: slideAnim1 }] }}>
                    <Text style={styles.overviewTitle}>{currentExercise.exercise}</Text>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateX: slideAnim2 }] }}>
                    <Text style={styles.repsText}>{currentExercise.reps} reps </Text>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
                    {/* --- FIX #1 STARTS HERE --- */}
                    {/* Added a delay to the transition when starting an exercise. */}
                    <TouchableOpacity style={styles.nextButtonOverview} onPress={() => {
                        setTimeout(() => setOverview(false), 1200); // 400ms delay
                    }}>
                        {/* --- FIX #1 ENDS HERE --- */}
                        <Text style={styles.nextButtonText}>Start</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.streakContainer}>
                    <Image style={{ margin: 20 }} source={icons.blueStreak} />
                </View>

            </LinearGradient>
        );
    }

    const isWarmup = currentExercise.phase === 'warmup';
    const phaseExercises = exercisePlaylist.filter(ex => ex.phase === currentExercise.phase);
    const phaseCurrentIndex = phaseExercises.findIndex(ex => ex.exercise === currentExercise.exercise);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Video
                    source={{ uri: currentExercise.videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isLooping
                    isMuted
                />
            </View>
            <LinearGradient colors={isWarmup ? ['#FF0509', '#271293'] : ['#A12287', '#1F059D']} style={styles.gradientContainer}>
                <View style={styles.workoutCard}>
                    <Text style={styles.exerciseNameMain}>{currentExercise.exercise}</Text>
                    <View style={styles.repsContainer}>
                        <Text style={styles.repsSetsMain}>{currentExercise.sets} x {currentExercise.reps}</Text>
                        <Text style={styles.repsLabel}> reps</Text>
                    </View>
                    <Text style={styles.bodyweightText}>BodyWeight</Text>
                    <Text style={styles.weightText}>45Ibs + 45Ibs</Text>
                    <TouchableOpacity style={styles.nextButtonWorkout} onPress={handleNextExercise}>
                        <Text style={styles.nextButtonTextWorkout}>
                            {isWarmup && phaseCurrentIndex === phaseExercises.length - 1
                                ? 'Finish Warm Up'
                                : `Log Set`
                            }
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.streakContainer}>
                        <Image source={icons.blueStreak} />
                    </View>
                </View>
            </LinearGradient>
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, borderRadius: 20, marginTop: -15 },
    gradientContainer: { flex: 1, borderRadius: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', fontSize: 22, fontFamily: 'poppins-semibold' },
    overviewContainer: { flex: 1, justifyContent: 'center' },
    overviewTitle: { color: 'white', fontSize: 40, fontFamily: 'poppins-bold', marginHorizontal: 20 },
    repsText: { color: '#8AFFF9', fontSize: 40, fontFamily: 'poppins-semibold', marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
    header: {
        width: '100%',
        height: 300,
        backgroundColor: 'black',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    workoutCard: { padding: 30 },
    exerciseNameMain: { fontFamily: 'poppins-semibold', fontStyle: 'italic', color: 'white', fontSize: 40 },
    repsContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
    repsSetsMain: { fontFamily: 'poppins-semibold', fontSize: 64, color: '#8AFFF9' },
    repsLabel: { fontFamily: 'poppins-semibold', fontSize: 24, color: '#8AFFF9' },
    bodyweightText: { marginTop: 40, fontFamily: 'poppins-medium', color: 'white', fontSize: 24 },
    weightText: { fontFamily: 'poppins-light', color: 'white', fontSize: 19 },
    nextButtonOverview: {
        backgroundColor: 'white',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20
    },
    nextButtonWorkout: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 40
    },
    nextButtonText: { color: '#271293', fontSize: 20, fontFamily: 'poppins-bold' },
    // Added a separate style for the workout button text to change color
    nextButtonTextWorkout: { color: 'white', fontSize: 20, fontFamily: 'poppins-bold' },
    streakContainer: { alignItems: 'center', marginTop: 40 },
});

export default ActiveWorkoutScreen;