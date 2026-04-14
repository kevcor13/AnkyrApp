import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface CircularTimerProps {
    secondsLeft: number;
    totalSeconds: number;
    timerStarted: boolean;
    isWarmup?: boolean;
    isCooldown?: boolean;
    onStart: () => void;
    onSkip?: () => void;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
    secondsLeft,
    timerStarted,
    onStart,
    onSkip,
}) => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return (
        <View style={styles.container}>
            <Text style={styles.timeText}>{timeString}</Text>

            {!timerStarted && (
                <TouchableOpacity style={styles.startButton} onPress={onStart}>
                    <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
            )}

            {timerStarted && secondsLeft > 0 && onSkip && (
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
    },
    timeText: {
        fontFamily: "poppins-light",
        fontSize: 72,
        color: "white",
        letterSpacing: 2,
        marginBottom: 24,
    },
    startButton: {
        backgroundColor: "rgba(43,34,72,0.40)",
        paddingVertical: 14,
        paddingHorizontal: 52,
        borderRadius: 24,
        borderColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
    },
    startButtonText: {
        fontFamily: "poppins-semibold",
        fontSize: 16,
        color: "white",
        letterSpacing: 0.5,
    },
    skipButton: {
        paddingVertical: 10,
        paddingHorizontal: 36,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    skipButtonText: {
        fontFamily: "poppins-medium",
        fontSize: 15,
        color: "rgba(255,255,255,0.6)",
    },
});

export default CircularTimer;
