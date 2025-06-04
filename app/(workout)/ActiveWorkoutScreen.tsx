import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';
import { Video, ResizeMode } from 'expo-av'; // Import Video and ResizeMode

// --- INTERFACES ---
interface ExerciseSchema {
    exercise: string;
    sets: number;
    reps: string;
    image?: string;
    videoUrl?: string; // Optional video URL for the exercise
    difficulty?: string; // From main_workout content
}

interface IndividualWorkoutRefContent {
    exercise: string;
    sets: number;
    reps: string;
    videoUrl?: string;
    difficulty?: string;
}

interface IndividualWorkoutRef {
    _id: string;
    contentHash: string;
    type: "warmup" | "main_workout";
    content: IndividualWorkoutRefContent[];
}

interface DayRoutineSchema {
    day: string;
    focus: string;
    timeEstimate: number;
    warmup: IndividualWorkoutRef; // Populated warmup routine
    workoutRoutineRef: IndividualWorkoutRef; // Populated main workout routine
    cooldownText?: string; // Cooldown as text
}

interface WorkoutPlanSchema {
    _id: string;
    UserID: string;
    routine: DayRoutineSchema[];
    generatedAt: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
// --- END INTERFACES ---


const ActiveWorkoutScreen: React.FC = () => {
    const { userData, fetchWorkout, userWorkoutData } = useGlobal();
    const [warmupExercises, setWarmupExercises] = useState<ExerciseSchema[]>([]);
    const [mainWorkoutExercises, setMainWorkoutExercises] = useState<ExerciseSchema[]>([]);
    const [cooldownText, setCooldownText] = useState<string | null>(null); // State for cooldown text
    const [dailyFocus, setDailyFocus] = useState<string>(''); // State for daily focus
    const [dailyTimeEstimate, setDailyTimeEstimate] = useState<number>(0); // State for time estimate

    const [currentPhase, setCurrentPhase] = useState<'warmup' | 'main' | 'cooldown' | 'completed'>('warmup');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    const videoRef = React.useRef<Video>(null);
    const [videoStatus, setVideoStatus] = useState<any>({});


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
            console.log("--- Starting loadWorkout ---");
            setIsLoading(true);
            setError(null);

            if (!userData?._id) {
                console.log("Error: User data not available.");
                setError('User data not available.');
                setIsLoading(false);
                return;
            }

            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.log("Error: Authentication token not found.");
                    setError('Authentication token not found.')
                    setIsLoading(false);
                    return;
                }
                console.log("Token found. Proceeding to fetch workout data.");

                // userWorkoutData is already the fetched and potentially populated plan
                const fullWorkoutPlan: WorkoutPlanSchema = userWorkoutData;
                console.log("Full Workout Plan (from userWorkoutData):", JSON.stringify(fullWorkoutPlan, null, 2));

                if (fullWorkoutPlan && fullWorkoutPlan.routine && fullWorkoutPlan.routine.length > 0) {
                    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
                    console.log("Today is:", today);

                    const todayRoutine = fullWorkoutPlan.routine.find(
                        (dayRoutine: DayRoutineSchema) => dayRoutine.day === today
                    );

                    if (todayRoutine) {
                        console.log("Found today's routine:", JSON.stringify(todayRoutine, null, 2));

                        // Access content from the populated refs
                        const warmupContent = todayRoutine.warmup?.content || [];
                        const mainWorkoutContent = todayRoutine.workoutRoutineRef?.content || [];
                        const cooldownTextContent = todayRoutine.cooldownText || null;

                        console.log("Warmup Content:", warmupContent);
                        console.log("Main Workout Content:", mainWorkoutContent);
                        console.log("Cooldown Text:", cooldownTextContent);

                        setWarmupExercises(warmupContent);
                        setMainWorkoutExercises(mainWorkoutContent);
                        setCooldownText(cooldownTextContent);
                        setDailyFocus(todayRoutine.focus);
                        setDailyTimeEstimate(todayRoutine.timeEstimate);

                        const hasWarmup = warmupContent.length > 0;
                        const hasMainWorkout = mainWorkoutContent.length > 0;

                        if (hasWarmup) {
                            console.log("Starting with Warmup phase.");
                            setCurrentPhase('warmup');
                        } else if (hasMainWorkout) {
                            console.log("No warmup, starting with Main workout phase.");
                            setCurrentPhase('main');
                        } else if (cooldownTextContent) {
                            console.log("No warmup or main workout, starting with Cooldown phase (text only).");
                            setCurrentPhase('cooldown');
                        } else {
                            console.log(`Error: No workout content (warmup, main, or cooldown) scheduled for ${today}.`);
                            setError(`No workout content scheduled for ${today}.`);
                        }
                        setCurrentIndex(0); // Reset index for the new phase
                    } else {
                        console.log(`Error: No workout routine found for ${today}.`);
                        setError(`No workout routine found for ${today}.`);
                    }
                } else {
                    console.log('Error: Workout plan is empty or not in the expected format.');
                    setError('Workout plan is empty or not in the expected format.');
                }
            } catch (e) {
                console.error('Failed to load workout:', e);
                setError('Failed to load workout. Please try again.');
            } finally {
                setIsLoading(false);
                console.log("--- Finished loadWorkout ---");
            }
        };
        loadWorkout();
    }, [userData, fetchWorkout, userWorkoutData]);


    const currentExercise = useCallback((): ExerciseSchema | null => {
        if (currentPhase === 'warmup' && warmupExercises[currentIndex]) {
            console.log("Current phase: Warmup, Exercise:", warmupExercises[currentIndex]);
            return warmupExercises[currentIndex];
        }
        if (currentPhase === 'main' && mainWorkoutExercises[currentIndex]) {
            console.log("Current phase: Main, Exercise:", mainWorkoutExercises[currentIndex]);
            return mainWorkoutExercises[currentIndex];
        }
        console.log("Current phase:", currentPhase, "No exercise found at index:", currentIndex);
        return null;
    }, [currentPhase, currentIndex, warmupExercises, mainWorkoutExercises]);


    // Initialize or reset timer and load video based on current exercise
    useEffect(() => {
        const exercise = currentExercise();
        console.log("useEffect [currentIndex, currentPhase, currentExercise] triggered. Exercise:", exercise);
        if (exercise) {
            const duration = parseDurationFromReps(exercise.reps);
            if (duration > 0) {
                console.log(`Exercise is timed: ${duration} seconds.`);
                setTimerSeconds(duration);
                setIsTimerActive(false); // Reset timer to inactive on new exercise
            } else {
                console.log("Exercise is rep-based, no timer.");
                setTimerSeconds(0);
                setIsTimerActive(false);
            }

            // If there's a video, load it
            if (videoRef.current && exercise.videoUrl) {
                console.log("Loading video:", exercise.videoUrl);
                // Ensure video is loaded but not playing automatically
                videoRef.current.loadAsync({ uri: exercise.videoUrl }, { shouldPlay: false, isLooping: true }, false)
                    .then(() => console.log("Video loaded successfully."))
                    .catch(e => console.error("Video load error:", e));
            } else {
                console.log("No video URL found for this exercise.");
                // Unload any previously loaded video if switching to an exercise without video
                if (videoRef.current) {
                    videoRef.current.unloadAsync()
                        .then(() => console.log("Video unloaded."))
                        .catch(e => console.error("Video unload error:", e));
                }
            }
        } else if (currentPhase === 'cooldown') {
            // No exercise for cooldown, ensure video is off
            console.log("Currently in Cooldown phase, no active exercise.");
            if (videoRef.current) {
                videoRef.current.unloadAsync()
                    .then(() => console.log("Video unloaded (cooldown)."))
                    .catch(e => console.error("Video unload error (cooldown):", e));
            }
            setTimerSeconds(0);
            setIsTimerActive(false);
        } else {
            console.log("No current exercise to display.");
        }
    }, [currentIndex, currentPhase, currentExercise]);

    // Timer countdown logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerActive && timerSeconds > 0) {
            console.log("Timer active, counting down:", timerSeconds);
            interval = setInterval(() => {
                setTimerSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else if (isTimerActive && timerSeconds === 0) {
            console.log("Timer finished.");
            setIsTimerActive(false); // Timer finished
            // Optionally auto-advance here or prompt user
        }
        return () => {
            if (interval) {
                console.log("Clearing timer interval.");
                clearInterval(interval);
            }
        };
    }, [isTimerActive, timerSeconds]);

    const handleStartPauseResume = async () => {
        const exercise = currentExercise();
        console.log("handleStartPauseResume triggered. Current timer active:", isTimerActive);

        // Control video playback based on timer state
        if (videoRef.current && exercise?.videoUrl) {
            if (isTimerActive) {
                console.log("Pausing video.");
                await videoRef.current.pauseAsync();
            } else {
                console.log("Playing video.");
                await videoRef.current.playAsync();
            }
        }

        if (currentPhase === 'warmup' || currentPhase === 'main') {
            const duration = parseDurationFromReps(exercise?.reps);
            if (duration > 0) { // Only toggle timer if it's a timed exercise
                setIsTimerActive(!isTimerActive);
                console.log("Toggling timer active state to:", !isTimerActive);
            } else {
                console.log("Exercise is rep-based, no timer action.");
            }
        } else if (currentPhase === 'cooldown') {
            // For cooldown, if it's text-based, maybe "Next" just moves to completed.
            // If it were a timed cooldown (e.g., "5 min stretch"), you could add a timer here.
            console.log("Start/Pause/Resume not applicable for text-based cooldown.");
            handleNext(); // Assuming "Start" on cooldown means "complete cooldown"
        }
    };

    const handleNext = async () => {
        console.log("handleNext triggered. Current phase:", currentPhase, "Current index:", currentIndex);
        setIsTimerActive(false); // Stop timer when moving
        if (videoRef.current) {
            console.log("Stopping video for next exercise.");
            await videoRef.current.stopAsync(); // Stop current video
        }

        if (currentPhase === 'warmup') {
            if (currentIndex < warmupExercises.length - 1) {
                setCurrentIndex(currentIndex + 1);
                console.log("Moving to next warmup exercise.");
            } else {
                if (mainWorkoutExercises.length > 0) {
                    setCurrentPhase('main');
                    setCurrentIndex(0);
                    console.log("Warmup finished, moving to main workout.");
                } else if (cooldownText) {
                    setCurrentPhase('cooldown');
                    setCurrentIndex(0); // Reset for cooldown (though index might not be used for text)
                    console.log("Warmup finished, no main workout, moving to cooldown.");
                } else {
                    setCurrentPhase('completed');
                    console.log("Workout complete (warmup only).");
                }
            }
        } else if (currentPhase === 'main') {
            if (currentIndex < mainWorkoutExercises.length - 1) {
                setCurrentIndex(currentIndex + 1);
                console.log("Moving to next main workout exercise.");
            } else {
                if (cooldownText) {
                    setCurrentPhase('cooldown');
                    setCurrentIndex(0); // Reset for cooldown
                    console.log("Main workout finished, moving to cooldown.");
                } else {
                    setCurrentPhase('completed');
                    console.log("Workout complete (main workout only).");
                }
            }
        } else if (currentPhase === 'cooldown') {
            setCurrentPhase('completed');
            console.log("Cooldown finished, workout complete.");
        }
    };

    const handlePrevious = async () => {
        console.log("handlePrevious triggered. Current phase:", currentPhase, "Current index:", currentIndex);
        setIsTimerActive(false); // Stop timer when moving
        if (videoRef.current) {
            console.log("Stopping video for previous exercise.");
            await videoRef.current.stopAsync(); // Stop current video
        }

        if (currentPhase === 'main') {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                console.log("Moving to previous main workout exercise.");
            } else {
                if (warmupExercises.length > 0) {
                    setCurrentPhase('warmup');
                    setCurrentIndex(warmupExercises.length - 1);
                    console.log("Main workout start, moving to last warmup exercise.");
                } else {
                    // This scenario means previous doesn't make sense if no warmup
                    console.log("Cannot go back from main workout if no warmup exists.");
                }
            }
        } else if (currentPhase === 'warmup') {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                console.log("Moving to previous warmup exercise.");
            } else {
                // Cannot go further back
                console.log("At the start of warmup, cannot go back further.");
            }
        } else if (currentPhase === 'cooldown') {
            if (mainWorkoutExercises.length > 0) {
                setCurrentPhase('main');
                setCurrentIndex(mainWorkoutExercises.length - 1);
                console.log("Coming back from cooldown to last main workout exercise.");
            } else if (warmupExercises.length > 0) {
                setCurrentPhase('warmup');
                setCurrentIndex(warmupExercises.length - 1);
                console.log("Coming back from cooldown to last warmup exercise (no main).");
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

    let displayExerciseName = "";
    let displayExerciseDetail = "";
    let mediaUrl: string | undefined = undefined; // Unified variable for image or video URL
    let isCurrentTimed = false;
    let totalExercisesInPhase = 0;
    let exerciseNumberInPhase = currentIndex + 1;
    let phaseTitle = '';

    if (currentPhase === 'warmup') {
        phaseTitle = 'WARMUP';
        if (exerciseToDisplay) {
            displayExerciseName = exerciseToDisplay.exercise;
            isCurrentTimed = parseDurationFromReps(exerciseToDisplay.reps) > 0;
            displayExerciseDetail = isCurrentTimed ? formatTime(timerSeconds) : `${exerciseToDisplay.sets} sets x ${exerciseToDisplay.reps}`;
            mediaUrl = exerciseToDisplay.videoUrl || exerciseToDisplay.image;
            totalExercisesInPhase = warmupExercises.length;
        }
    } else if (currentPhase === 'main') {
        phaseTitle = 'WORKOUT';
        if (exerciseToDisplay) {
            displayExerciseName = exerciseToDisplay.exercise;
            isCurrentTimed = parseDurationFromReps(exerciseToDisplay.reps) > 0;
            displayExerciseDetail = isCurrentTimed ? formatTime(timerSeconds) : `${exerciseToDisplay.sets} sets x ${exerciseToDisplay.reps}`;
            mediaUrl = exerciseToDisplay.videoUrl || exerciseToDisplay.image;
            totalExercisesInPhase = mainWorkoutExercises.length;
        }
    } else if (currentPhase === 'cooldown') {
        phaseTitle = 'COOLDOWN';
        displayExerciseName = "Cooldown";
        displayExerciseDetail = cooldownText || "Light stretching"; // Show cooldown text
        mediaUrl = undefined; // No media for text-based cooldown
        totalExercisesInPhase = 1; // Treat cooldown as a single "step"
        exerciseNumberInPhase = 1; // Always 1/1 for cooldown phase
        isCurrentTimed = false; // Cooldown isn't timed by reps/sets in this schema
    }

    let buttonText = "Next Exercise";
    let buttonAction = handleNext;

    if (currentPhase === 'cooldown') {
        buttonText = "FINISH WORKOUT";
        buttonAction = handleNext;
    } else if (isCurrentTimed) {
        const initialDuration = parseDurationFromReps(exerciseToDisplay?.reps);
        if (isTimerActive) {
            buttonText = "Pause";
            buttonAction = handleStartPauseResume;
        } else if (timerSeconds > 0 && timerSeconds < initialDuration) {
            buttonText = "Resume";
            buttonAction = handleStartPauseResume;
        } else if (timerSeconds === 0 && initialDuration > 0) {
            buttonText = "Next Exercise"; // Timer finished, proceed to next
            buttonAction = handleNext;
        } else if (timerSeconds === initialDuration && initialDuration > 0) {
            buttonText = "Start";
            buttonAction = handleStartPauseResume;
        }
    }

    const canGoPrevious = (currentPhase === 'main' && currentIndex > 0) ||
        (currentPhase === 'main' && currentIndex === 0 && warmupExercises.length > 0) ||
        (currentPhase === 'warmup' && currentIndex > 0) ||
        (currentPhase === 'cooldown' && (mainWorkoutExercises.length > 0 || warmupExercises.length > 0));


    return (
        <LinearGradient colors={['#FF3C3C', '#A12287', '#1F059D']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerNav}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Image source={icons.x} style={styles.backIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <Text style={styles.phaseTitle}>{phaseTitle}</Text>
                    {currentPhase !== 'cooldown' && ( // Don't show progress for cooldown if it's 1/1
                        <Text style={styles.progressText}>
                            {exerciseNumberInPhase} / {totalExercisesInPhase}
                        </Text>
                    )}
                </View>

                {/* Display Daily Info */}
                <View style={styles.dailyInfoContainer}>
                    <Text style={styles.dailyInfoText}>Focus: {dailyFocus}</Text>
                    <Text style={styles.dailyInfoText}>Est. Time: {dailyTimeEstimate} mins</Text>
                </View>


                {/* Conditional rendering for Video or Image or Placeholder */}
                {mediaUrl ? (
                    mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov') || mediaUrl.endsWith('.webm') ? ( // Simple check for video file extension
                        <Video
                            ref={videoRef}
                            style={styles.exerciseMedia}
                            source={{ uri: mediaUrl }}
                            useNativeControls={false}
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping
                            shouldPlay={isTimerActive}
                            onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
                            onError={(e) => console.error("Video Error:", e)}
                        />
                    ) : (
                        <Image source={{ uri: mediaUrl }} style={styles.exerciseMedia} onError={() => console.log("Failed to load image: " + mediaUrl)} />
                    )
                ) : (
                    <View style={styles.placeholderMedia}>
                        <Text style={styles.placeholderText}>No Media Available</Text>
                    </View>
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
    dailyInfoContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    dailyInfoText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginBottom: 5,
    },
    exerciseInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 20,
    },
    exerciseMedia: {
        width: '100%',
        height: 220,
        borderRadius: 15,
        marginBottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    placeholderMedia: {
        width: '100%',
        height: 220,
        borderRadius: 15,
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#E0E0E0',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
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