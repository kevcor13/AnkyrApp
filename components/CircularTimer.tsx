import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  timerStarted: boolean;
  onStart: () => void;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  secondsLeft,
  totalSeconds,
  timerStarted,
  onStart,
}) => {
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.timerCircleContainer}>
      <Svg width={size} height={size} style={styles.timerSvg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8AFFF9"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.timerContent}>
        <Text style={styles.timerText}>
          {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
        </Text>
        {!timerStarted && (
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>Start</Text>
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
  timerSvg: {
    transform: [{ rotate: "0deg" }],
  },
  timerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontFamily: "poppins-light",
    fontSize: 56,
    color: "white",
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#8AFFF9",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 8,
  },
  startButtonText: {
    fontFamily: "poppins-semibold",
    fontSize: 16,
    color: "#271293",
    letterSpacing: 0.5,
  },
});

export default CircularTimer;