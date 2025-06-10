import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

type RestScreenProps = {
    duration: number;
    onRestComplete: () => void;
};

const RestScreen: React.FC<RestScreenProps> = ({ duration, onRestComplete }) => {
    const [countdown, setCountdown] = useState(duration);
    const [isRestFinished, setIsRestFinished] = useState(false);
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;

    // Timer countdown logic
    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);

            // Cleanup function to clear the interval if the component unmounts
            return () => clearInterval(timer);
        } else {
            // When countdown finishes, update the state
            setIsRestFinished(true);
        }
    }, [countdown]);

    // Animation logic for the "Next" button
    useEffect(() => {
        if (isRestFinished) {
            // Slide the button into view
            Animated.timing(slideAnim, {
                toValue: 0, // Slide to the center
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isRestFinished]);

    return (
        <LinearGradient colors={['#2980B9', '#6DD5FA']} style={styles.container}>
            <Text style={styles.title}>REST</Text>
            <Text style={styles.timer}>{countdown}</Text>

            {/* --- "NEXT WORKOUT" BUTTON (appears after rest) --- */}
            {isRestFinished && (
                 <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
                    <TouchableOpacity style={styles.nextButton} onPress={onRestComplete}>
                        <Text style={styles.nextButtonText}>NEXT WORKOUT</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* --- "SKIP" BUTTON (appears during rest) --- */}
            {/* This button is only visible when the timer is running */}
            {!isRestFinished && (
                <TouchableOpacity style={styles.skipButton} onPress={onRestComplete}>
                    <Text style={styles.skipButtonText}>SKIP</Text>
                </TouchableOpacity>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'poppins-bold',
        fontSize: 48,
        color: 'white',
        letterSpacing: 10,
        marginBottom: 20,
    },
    timer: {
        fontFamily: 'poppins-semibold',
        fontSize: 120,
        color: 'white',
        // Adjusted margin to accommodate the skip button below
        marginBottom: 40,
    },
    nextButton: {
        backgroundColor: 'white',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 20,
        // Added margin top for spacing
        marginTop: 40,
    },
    nextButtonText: {
        color: '#2980B9',
        fontSize: 20,
        fontFamily: 'poppins-bold',
    },
    // --- STYLES FOR THE NEW SKIP BUTTON ---
    skipButton: {
        marginTop: 40, // Match the margin of the next button for consistent spacing
        paddingVertical: 10,
        paddingHorizontal: 35,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'transparent',
    },
    skipButtonText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontFamily: 'poppins-semibold',
    },
});

export default RestScreen;