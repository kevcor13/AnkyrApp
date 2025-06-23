import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/constants/styles"; // Import styles
import icons from "@/constants/icons";
import { router } from "expo-router";

interface Exercise {
  exercise: string;
  reps: String;
  phase: "warmup" | "workout" | "cooldown";
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
  const screenWidth = Dimensions.get("window").width;

  const isWarmup = exercise.phase === 'warmup';
  // Animation values
  const slideAnim1 = useRef(new Animated.Value(-screenWidth)).current;
  const slideAnim2 = useRef(new Animated.Value(-screenWidth)).current;
  const slideAnim3 = useRef(new Animated.Value(-screenWidth)).current;
  const slideAnim4 = useRef(new Animated.Value(-screenWidth)).current;
  const progressAnim = useRef(new Animated.Value(0)).current; // Animation for the progress bar

  // Calculate progress
  const progress =
    totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

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
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={isWarmup ? ['#FF0509', '#E89750'] : ['#000000', '#272727']}
      style={styles.overviewContainer}
    >
      {/* Progress Bar */}

      <View style={{ flexDirection: "row", marginTop: 70, margin: 30}}>
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
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
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
        <Animated.View style={{ transform: [{ translateX: slideAnim1 }] }}>
          <Text style={styles.overviewTitle}>{exercise.exercise}</Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateX: slideAnim2 }] }}>
          <Text style={styles.repsText}>{exercise.reps} reps</Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
          <TouchableOpacity
            style={styles.nextButtonOverview}
            onPress={() => {
              setTimeout(() => onStart(), 600);
            }}
          >
            <Text style={styles.nextButtonText}>Start</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.streakContainer}>
        <Image style={{ height:74, width:75 }} source={icons.blueStreak} />
      </View>
    </LinearGradient>
  );
};

export default ExerciseOverview;
