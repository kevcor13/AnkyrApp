import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '@/constants/styles'; // Import styles
import icons from "@/constants/icons";

interface Exercise {
    exercise: string;
    reps: String;
    // Add other properties if needed
}

interface ExerciseOverviewProps {
    exercise: Exercise;
    onStart: () => void;
    onEnd: () => void;
    currentExerciseIndex: number; // The index of the current exercise (e.g., 0, 1, 2...)
    totalExercises: number;       // The total number of exercises in the workout
}

const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({
    exercise,
    onStart,
    onEnd,
    currentExerciseIndex,
    totalExercises
}) => {
    const screenWidth = Dimensions.get('window').width;

    // Animation values
    const slideAnim1 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim2 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim3 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim4 = useRef(new Animated.Value(-screenWidth)).current;
    const progressAnim = useRef(new Animated.Value(0)).current; // Animation for the progress bar

    // Calculate progress
    const progress = totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

    // Trigger animation when the component mounts or exercise changes
    useEffect(() => {
        // Animate the progress bar
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 700,
            useNativeDriver: false, // width animation not supported by native driver
        }).start();

        // Stagger animation for the text and buttons
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
            Animated.timing(slideAnim4, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
    }, [exercise, currentExerciseIndex]); // Re-run animation when the exercise changes

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <LinearGradient colors={['#FF0509', '#271293']} style={styles.overviewContainer}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>
            <View style={{justifyContent:'center', marginTop: 200}}>
            <Animated.View style={{ transform: [{ translateX: slideAnim1 }] }}>
                <Text style={styles.overviewTitle}>{exercise.exercise}</Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateX: slideAnim2 }] }}>
                <Text style={styles.repsText}>{exercise.reps} reps</Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
                <TouchableOpacity style={styles.nextButtonOverview} onPress={() => {
                    setTimeout(() => onStart(), 600);
                }}>
                    <Text style={styles.nextButtonText}>Start</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateX: slideAnim4 }] }}>
                <TouchableOpacity style={styles.endButton} onPress={onEnd}>
                    <Text style={styles.endButtonText}>End</Text>
                </TouchableOpacity>
            </Animated.View>
            </View>
            <View style={styles.streakContainer}>
                <Image style={{ margin: 20 }} source={icons.blueStreak} />
            </View>
        </LinearGradient>
    );
};

export default ExerciseOverview;