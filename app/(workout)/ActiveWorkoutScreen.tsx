import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';
// Updated interfaces based on the new Mongoose schema
interface ExerciseSchema { // For items in warmup and workoutRoutine
    exercise: string;
    sets: number;
    reps: string; // Can be "10-12 reps" or "120 seconds"
    image?: string; // Optional: if you have images for exercises
}
interface DayRoutineSchema {
    day: string;
    focus: string;
    timeEstimate: number;
    warmup: ExerciseSchema[]; // Array of warm-up exercise objects
    workoutRoutine: ExerciseSchema[];
    title?: string;
    estimatedTime?: string;
    xpYield?: number;
}
interface WorkoutPlanSchema {
    UserID: string;
    routine: DayRoutineSchema[];
    createdAt: string;
}
const ActiveWorkoutScreen: React.FC = () => {
    const { userData, fetchWorkout, userWorkoutData} = useGlobal();
    const [warmupExercises, setWarmupExercises] = useState<ExerciseSchema[]>([]); // Changed from string[]
    const [mainWorkoutExercises, setMainWorkoutExercises] = useState<ExerciseSchema[]>([]);
    const [currentPhase, setCurrentPhase] = useState<'warmup' | 'main' | 'completed'>('warmup')
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    
    
    const parseDurationFromReps = (repsStr?: string): number => {
        if (!repsStr) return 0;
        const lowerRepsStr = repsStr.toLowerCase();
        if (lowerRepsStr.includes('min')) {
            return parseInt(repsStr, 10) * 60;
        }
        if (lowerRepsStr.includes('sec')) {
            return parseInt(repsStr, 10);
        }
        return 0;
    };



    useEffect(() => {
        const loadWorkout = async () => {
            setIsLoading(true); // Ensure loading state is true at the beginning
            setError(null); // Reset error state
            if (!userData?._id) {
                setError('User data not available.');
                setIsLoading(false);
                return;
            }
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found.')
                    setIsLoading(false);
                    return;
                }
                const fullWorkoutPlan: WorkoutPlanSchema = userWorkoutData;
                console.log(fullWorkoutPlan);
                
                if (fullWorkoutPlan && fullWorkoutPlan.routine && fullWorkoutPlan.routine.length > 0) {
                    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
                    const todayRoutine = fullWorkoutPlan.routine.find(
                        (dayRoutine: DayRoutineSchema) => dayRoutine.day === today
                    );
                    if (todayRoutine) {
                        const hasWarmup = todayRoutine.warmup && todayRoutine.warmup.length > 0;
                        const hasMainWorkout = todayRoutine.workoutRoutine && todayRoutine.workoutRoutine.length > 0;
                        setWarmupExercises(todayRoutine.warmup || []);
                        setMainWorkoutExercises(todayRoutine.workoutRoutine || []);
                        if (hasWarmup) {
                            setCurrentPhase('warmup');
                        } else if (hasMainWorkout) {
                            setCurrentPhase('main');
                        } else {
                            setError(`No warmup or workout exercises scheduled for ${today}.`);
                        }
                        setCurrentIndex(0); // Reset index for the new phase
                    } else {
                        setError(`No workout routine found for ${today}.`);
                    }
                } else {
                    setError('Workout plan is empty or not in the expected format.');
                }
            } catch (e) {
                console.error('Failed to load workout:', e);
                setError('Failed to load workout. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        loadWorkout();
    }, [userData, fetchWorkout]);
    
    
    const currentExercise = useCallback((): ExerciseSchema | null => {
        if (currentPhase === 'warmup' && warmupExercises[currentIndex]) {
            return warmupExercises[currentIndex];
        }
        if (currentPhase === 'main' && mainWorkoutExercises[currentIndex]) {
            return mainWorkoutExercises[currentIndex];
        }
        return null;
    }, [currentPhase, currentIndex, warmupExercises, mainWorkoutExercises]);
    
    
    // Initialize or reset timer based on current exercis
    useEffect(() => {
        const exercise = currentExercise();
        if (exercise) {
            const duration = parseDurationFromReps(exercise.reps);
            if (duration > 0) {
                setTimerSeconds(duration);
                setIsTimerActive(false);
            } else {
                setTimerSeconds(0);
                setIsTimerActive(false);
            }
        } else {
            setTimerSeconds(0);
            setIsTimerActive(false);
        }
    }, [currentIndex, currentPhase, currentExercise]); // Depend on currentExercise callback
    // Timer countdown logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerActive && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else if (isTimerActive && timerSeconds === 0) {
            setIsTimerActive(false); // Timer finished
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerActive, timerSeconds]);
    
    
    const handleStartPauseResume = () => {
        const exercise = currentExercise();
        if (exercise) {
            const duration = parseDurationFromReps(exercise.reps);
            if (duration > 0 && timerSeconds > 0) { // Ensure timer is for current exercise and has time left
                setIsTimerActive(!isTimerActive);
            } else if (duration > 0 && timerSeconds === 0 && !isTimerActive) { // Timer finished, allow restart if needed (or handle differently)
                // This case might need specific logic if "Start" should re-initiate a finished timer
                // For now, it won't do anything if timer is at 0 and not active
            }
        }
    };
    const handleNext = () => {
        setIsTimerActive(false);
        if (currentPhase === 'warmup') {
            if (currentIndex < warmupExercises.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                if (mainWorkoutExercises.length > 0) {
                    setCurrentPhase('main');
                    setCurrentIndex(0);
                } else {
                    setCurrentPhase('completed');
                }
            }
        } else if (currentPhase === 'main') {
            if (currentIndex < mainWorkoutExercises.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentPhase('completed');
            }
        }
    };
    const handlePrevious = () => {
        setIsTimerActive(false);
        if (currentPhase === 'main') {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            } else {
                if (warmupExercises.length > 0) {
                    setCurrentPhase('warmup');
                    setCurrentIndex(warmupExercises.length - 1);
                }
            }
        } else if (currentPhase === 'warmup') {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };
    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    if (isLoading) {
        return (
            <LinearGradient colors={['#FF3C3C', '#A12287', '#1F059D']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading Workout...</Text>
            </LinearGradient>
        );
    }
    if (error) {
        return (
            <LinearGradient colors={['#FF3C3C', '#A12287', '#1F059D']} style={styles.loadingContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAbsolute}>
                    <Image source={icons.x} style={styles.backIcon} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={styles.errorText}>{error}</Text>
                <CustomButton title="Go Back" handlePress={() => router.back()} buttonStyle={styles.errorButton} textStyle={styles.errorButtonText} />
            </LinearGradient>
        );
    }
    if (currentPhase === 'completed') {
        return (
            <LinearGradient colors={['#FF3C3C', '#A12287', '#1F059D']} style={styles.container}>
                <View style={styles.completionContainer}>
                    <Text style={styles.completionTitle}>Workout Complete!</Text>
                    <Image source={icons.whiteZap} style={styles.completionIcon} resizeMode="contain" />
                    <Text style={styles.completionSubtitle}>Great job finishing your workout for today!</Text>
                    <CustomButton
                        title="Back to Overview"
                        handlePress={() => router.replace('/(workout)/WorkoutOverview')}
                        buttonStyle={styles.actionButton}
                        textStyle={styles.actionButtonText}
                    />
                </View>
            </LinearGradient>
        );
    }
    
    const exerciseToDisplay = currentExercise();
    
    //variables to be filled up 
    let displayExerciseName = "";
    let displayExerciseDetail = "";
    let exerciseImage: string | undefined = undefined;
    let isCurrentTimed = false;
    let totalExercisesInPhase = 0;
    let exerciseNumberInPhase = currentIndex + 1;



    if (exerciseToDisplay) {
        displayExerciseName = exerciseToDisplay.exercise;
        isCurrentTimed = parseDurationFromReps(exerciseToDisplay.reps) > 0;  {/** false because theres its reps not timed*/}
        if (isCurrentTimed) {
            displayExerciseDetail = formatTime(timerSeconds);
        } else {
            displayExerciseDetail = `${exerciseToDisplay.sets} sets x ${exerciseToDisplay.reps}`;
        }
        exerciseImage = exerciseToDisplay.image;
        totalExercisesInPhase = currentPhase === 'warmup' ? warmupExercises.length : mainWorkoutExercises.length;
    } else if (!isLoading && !error) {
        return (
            <LinearGradient colors={['#FF3C3C', '#A12287', '#1F059D']} style={styles.loadingContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAbsolute}>
                    <Image source={icons.x} style={styles.backIcon} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={styles.errorText}>No exercises found for today's workout.</Text>
                <CustomButton title="Go Back" handlePress={() => router.back()} buttonStyle={styles.errorButton} textStyle={styles.errorButtonText} />
            </LinearGradient>
        );
    }
    let buttonText = "Next Exercise";
    let buttonAction = handleNext;
    if (isCurrentTimed) {
        const initialDuration = parseDurationFromReps(exerciseToDisplay?.reps);
        if (isTimerActive) {
            buttonText = "Pause";
            buttonAction = handleStartPauseResume;
        } else if (timerSeconds > 0 && timerSeconds < initialDuration) {
            buttonText = "Resume";
            buttonAction = handleStartPauseResume;
        } else if (timerSeconds === 0 && initialDuration > 0) {
            buttonText = "Next Exercise";
            buttonAction = handleNext;
        } else if (timerSeconds === initialDuration && initialDuration > 0) {
            buttonText = "Start";
            buttonAction = handleStartPauseResume;
        }
    }
    const canGoPrevious = (currentPhase === 'main' && currentIndex > 0) ||
        (currentPhase === 'main' && currentIndex === 0 && warmupExercises.length > 0) ||
        (currentPhase === 'warmup' && currentIndex > 0);
    
    
    
        return (
        <LinearGradient colors={['#FF3C3C', '#A12287', '#1F059D']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerNav}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Image source={icons.x} style={styles.backIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <Text style={styles.phaseTitle}>{currentPhase === 'warmup' ? "WARMUP" : "WORKOUT"}</Text>
                    <Text style={styles.progressText}>
                        {exerciseNumberInPhase} / {totalExercisesInPhase}
                    </Text>
                </View>
                {exerciseImage && (
                    <Image source={{ uri: exerciseImage }} style={styles.exerciseImage} onError={() => console.log("Failed to load image: " + exerciseImage)} />
                )}
                <View style={styles.exerciseInfoContainer}>
                    <Text style={styles.exerciseName}>{displayExerciseName.toUpperCase()}</Text>
                    <Text style={styles.exerciseDetail}>{displayExerciseDetail}</Text>
                </View>
                <View style={styles.controlsContainer}>
                    {canGoPrevious && (
                        <TouchableOpacity onPress={handlePrevious} style={[styles.navButton, styles.prevButton]}>
                            <Text style={styles.navButtonText}>PREVIOUS</Text>
                        </TouchableOpacity>
                    )}
                    <CustomButton
                        title={buttonText}
                        handlePress={buttonAction}
                        buttonStyle={[styles.actionButton, (buttonText === "Pause" || buttonText === "Resume") && styles.pauseResumeButton]}
                        textStyle={styles.actionButtonText}
                        disabled={isTimerActive && timerSeconds === 0 && buttonText !== "Next Exercise"}
                    />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};
interface CustomButtonProps {
    title: string;
    handlePress: () => void;
    buttonStyle?: object | object[];
    textStyle?: object;
    disabled?: boolean;
}
const CustomButton: React.FC<CustomButtonProps> = ({ title, handlePress, buttonStyle, textStyle, disabled }) => (
    <TouchableOpacity onPress={handlePress} style={[styles.dummyButton, buttonStyle, disabled && styles.disabledButton]} disabled={disabled}>
        <Text style={[styles.dummyButtonText, textStyle, disabled && styles.disabledButtonText]}>{title}</Text>
    </TouchableOpacity>
);
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        marginTop: 15,
    },
    errorText: {
        color: '#FFD700',
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
    },
    errorButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    headerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    backButtonAbsolute: {
        position: 'absolute',
        top: 60,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        zIndex: 10,
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFFFFF',
    },
    phaseTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
    exerciseInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 20,
    },
    exerciseImage: {
        width: '80%',
        height: 180,
        borderRadius: 15,
        marginBottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    exerciseName: {
        color: '#FFFFFF',
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 40,
    },
    exerciseDetail: {
        color: '#E0E0E0',
        fontSize: 22,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
        marginBottom: 20,
    },
    controlsContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 10,
        position: 'relative',
        minHeight: 80,
    },
    actionButton: {
        backgroundColor: 'rgba(217, 217, 217, 0.5)',
        paddingVertical: 16,
        paddingHorizontal: 35,
        borderRadius: 28,
        width: '75%',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Poppins-SemiBold',
    },
    pauseResumeButton: {
        backgroundColor: 'rgba(255, 165, 0, 0.6)',
    },
    navButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 18,
    },
    prevButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        position: 'absolute',
        bottom: 12,
        left: 0,
    },
    navButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Poppins-Medium',
    },
    completionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    completionTitle: {
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    completionIcon: {
        width: 80,
        height: 80,
        tintColor: '#78F5D8',
        marginBottom: 20,
    },
    completionSubtitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        color: '#E0E0E0',
        textAlign: 'center',
        marginBottom: 40,
    },
    dummyButton: {
        backgroundColor: 'rgba(217, 217, 217, 0.5)',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 20,
        alignItems: 'center',
    },
    dummyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    disabledButton: {
        backgroundColor: 'rgba(217, 217, 217, 0.2)',
    },
    disabledButtonText: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
});
export default ActiveWorkoutScreen;