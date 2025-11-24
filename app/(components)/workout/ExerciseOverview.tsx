import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions, // No longer needed, but leaving in case styles use it
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/constants/styles"; // Import styles
import icons from "@/constants/icons";
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";

interface Exercise {
  exerciseName: string;
  reps: String;
  phase: "warmup" | "workout" | "cooldown" | "challanges";
  // Add other properties if needed
}

interface ExerciseOverviewProps {
  exercise: Exercise;
  onStart: () => void;
  onEnd: () => void;
  currentExerciseIndex: number; // The index of the current exercise (e.g., 0, 1, 2...)
  totalExercises: number; // The total number of exercises in the workout
}

const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({
  exercise,
  onStart,
  onEnd,
  currentExerciseIndex,
  totalExercises,
}) => {
  const { userData } = useGlobal();
  const theme = userData.defaultTheme;
  console.log(theme);

  const isWarmup = exercise.phase === "warmup";

  // Calculate progress
  const progress =
    totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  // Convert progress (0 to 1) to a percentage string (e.g., "50%")
  const progressWidth = `${progress * 100}%`;

  return (
    <LinearGradient
      colors={
        isWarmup
          ? ["#FF0509", "#E89750"]
          : theme
          ? ["#FF0509", "#271293"]
          : ["#000000", "#272727"]
      }
      style={styles.overviewContainer}
    >
      {/* Progress Bar */}
      <View style={{ flexDirection: "row", marginTop: 70, margin: 30 }}>
        <TouchableOpacity
          style={{
            //marginLeft: 40,
            //marginTop: 30,
            backgroundColor: "rgba(217,217, 217, 0.27)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "100%",
            height: 45,
            width: 45,
          }}
          onPress={router.back}
        >
          <Image source={icons.halfArrow} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          {/* Changed from Animated.View to View */}
          <View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(217,217, 217, 0.27)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "100%",
            height: 45,
            width: 45,
          }}
          onPress={onEnd}
        >
          <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>
      </View>
      <View style={{ justifyContent: "center", marginTop: 100 }}>
        {/* Removed Animated.View wrapper */}
        <Text style={styles.overviewTitle}>{exercise.exerciseName}</Text>

        {/* Removed Animated.View wrapper */}
        <Text style={styles.repsText}>{exercise.reps} reps</Text>

        {/* Removed Animated.View wrapper */}
        <TouchableOpacity
          style={styles.nextButtonOverview}
          onPress={() => {
            setTimeout(() => onStart(), 600);
          }}
        >
          <Text style={styles.nextButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.streakContainer}>
        <Image style={{ height: 74, width: 75 }} source={icons.blueStreak} />
      </View>
    </LinearGradient>
  );
};

export default ExerciseOverview;