import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '@/app/(workout)/styles'; // Import styles
import icons from "@/constants/icons";

interface Exercise {
    exercise: string;
    reps: number;
    // Add other properties if needed
}

interface ExerciseOverviewProps {
    exercise: Exercise;
    onStart: () => void;
}

const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({ exercise, onStart }) => {
    const screenWidth = Dimensions.get('window').width;

    // Animation values
    const slideAnim1 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim2 = useRef(new Animated.Value(-screenWidth)).current;
    const slideAnim3 = useRef(new Animated.Value(-screenWidth)).current;

    // Trigger animation when the component mounts
    useEffect(() => {
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
    }, [exercise]); // Re-run animation when the exercise changes

    return (
        <LinearGradient colors={['#FF0509', '#271293']} style={styles.overviewContainer}>
            <Animated.View style={{ transform: [{ translateX: slideAnim1 }] }}>
                <Text style={styles.overviewTitle}>{exercise.exercise}</Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateX: slideAnim2 }] }}>
                <Text style={styles.repsText}>{exercise.reps} reps</Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
                <TouchableOpacity style={styles.nextButtonOverview} onPress={() => {
                    // Call the onStart function passed from the parent
                    setTimeout(() => onStart(), 600);
                }}>
                    <Text style={styles.nextButtonText}>Start</Text>
                </TouchableOpacity>
            </Animated.View>

            <View style={styles.streakContainer}>
                <Image style={{ margin: 20 }} source={icons.blueStreak} />
            </View>
        </LinearGradient>
    );
};

export default ExerciseOverview;