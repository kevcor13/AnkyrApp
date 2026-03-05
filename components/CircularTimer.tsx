import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

interface CircularTimerProps {
    secondsLeft: number;
    totalSeconds: number;
    timerStarted: boolean;
    isWarmup?: boolean;
    isCooldown?: boolean;
    onStart: () => void;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
    secondsLeft,
    totalSeconds,
    timerStarted,
    isWarmup = true,
    isCooldown = false,
    onStart,
}) => {
    const size = 240;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
    const strokeDashoffset = circumference * (1 - progress);

    // Color theming
    const progressColor = isWarmup
        ? "#E89750"
        : isCooldown
        ? "#C084FC"
        : "#8AFFF9";

    const glowColor = isWarmup
        ? "#FF8C0040"
        : isCooldown
        ? "#A855F740"
        : "#8AFFF920";

    const startButtonColor = isWarmup
        ? "#E89750"
        : isCooldown
        ? "#C084FC"
        : "#8AFFF9";

    const startButtonTextColor = isWarmup ? "#1A0800" : "#271293";

    return (
        <View style={styles.timerCircleContainer}>
            {/* Outer glow ring */}
            <View
                style={[
                    styles.glowRing,
                    {
                        shadowColor: progressColor,
                        borderColor: glowColor,
                    },
                ]}
            />

            <Svg width={size} height={size} style={styles.timerSvg}>
                <Defs>
                    <RadialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={isWarmup ? "#FF9900" : isCooldown ? "#C084FC" : "#8AFFF9"} stopOpacity="0.15" />
                        <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                {/* Inner radial glow fill */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius - strokeWidth / 2}
                    fill="url(#warmGlow)"
                />

                {/* Background track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Dotted outer ring (like the screenshot) */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius + strokeWidth}
                    stroke={progressColor}
                    strokeWidth={1.5}
                    strokeOpacity={0.25}
                    fill="none"
                    strokeDasharray="2 6"
                />

                {/* Progress arc */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            {/* Center content */}
            <View style={styles.timerContent}>
                <Text style={[styles.timerText, { color: isWarmup ? "#E8A855" : "white" }]}>
                    {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                </Text>
                {!timerStarted && (
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: startButtonColor }]}
                        onPress={onStart}
                    >
                        <Text style={[styles.startButtonText, { color: startButtonTextColor }]}>
                            Start
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    timerCircleContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    glowRing: {
        position: "absolute",
        width: 268,
        height: 268,
        borderRadius: 134,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 24,
        elevation: 12,
    },
    timerSvg: {},
    timerContent: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    timerText: {
        fontFamily: "poppins-light",
        fontSize: 52,
        marginBottom: 8,
    },
    startButton: {
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 20,
        marginTop: 8,
    },
    startButtonText: {
        fontFamily: "poppins-semibold",
        fontSize: 16,
        letterSpacing: 0.5,
    },
});

export default CircularTimer;