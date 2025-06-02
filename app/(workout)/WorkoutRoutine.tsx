// WorkoutRoutine.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";


// 1) Define a TypeScript interface for each kind of step.
type WarmupStep = {
  type: "warmup";
  day: string; // e.g. "Monday"
  durationSeconds: number;
  exercises: string[]; // e.g. ["Jumping Jacks", "Arm Circles"]
};

type ExerciseStep = {
  type: "exercise";
  exerciseName: string;
  sets: number;
  reps: string; // can be "8-10" or "10" etc.
  weight?: string; // e.g. "45 lbs + 45 lbs"
};

type RestStep = {
  type: "rest";
  durationSeconds: number;
};

type CooldownStep = {
  type: "cooldown";
  instructions: string; // e.g. "Stretch hamstrings for 2 minutes"
};

type Step = WarmupStep | ExerciseStep | RestStep | CooldownStep;

// 2) Example routine array. In real use, pass this in via props or fetch it.
const EXAMPLE_ROUTINE: Step[] = [
  {
    type: "warmup",
    day: "Monday",
    durationSeconds: 120, // 2 mins
    exercises: ["Push Ups (17-20 reps x4 sets)"],
  },
  {
    type: "exercise",
    exerciseName: "Bench Press (Flat Bench)",
    sets: 3,
    reps: "9-10",
    weight: "45 lbs + 45 lbs",
  },
  {
    type: "rest",
    durationSeconds: 160,
  },
  {
    type: "exercise",
    exerciseName: "Bench Press (Flat Bench)",
    sets: 3,
    reps: "9-10",
    weight: "45 lbs + 45 lbs",
  },
  {
    type: "cooldown",
    instructions: "Light stretching for chest and shoulders (2 mins)",
  },
  // …and so on, for each day & each workout within that day…
];

export default function WorkoutRoutine() {
  // If you’re using expo-router or React Navigation, you could get a `routine` param via route params.
  // const route = useRoute();
  // const { routine } = route.params as { routine: Step[] };

  // Instead of fetching from route params, we’ll just use the example above:
  const [routine, setRoutine] = useState<Step[]>(EXAMPLE_ROUTINE);

  // 3) Track which step we’re on:
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // 4) For timer‐based steps (warmup or rest), we need countdown state.
  const [countdown, setCountdown] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Whenever currentStepIndex changes, reset countdown if needed
    const step = routine[currentStepIndex];
    if (step && (step.type === "warmup" || step.type === "rest")) {
      setCountdown(step.durationSeconds);
      startTimer();
    } else {
      // If it's not a timed step, ensure timer is cleared
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStepIndex]);

  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Start a 1-second interval
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // When it reaches zero, auto‐advance to next step
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          advanceStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const advanceStep = () => {
    if (currentStepIndex < routine.length - 1) {
      setCurrentStepIndex((idx) => idx + 1);
    } else {
      // Reached the end of the routine
      // You could navigate back home or show a “Workout Complete” UI.
      // For now, let’s just stay on the last step
      console.log("Workout complete!");
    }
  };

  const goBackStep = () => {
    // Optional: allow user to go back one step
    if (currentStepIndex > 0) {
      setCurrentStepIndex((idx) => idx - 1);
    }
  };

  // 5) Render UI based on step.type
  const renderStep = () => {
    const step = routine[currentStepIndex];
    if (!step) return null;

    switch (step.type) {
      case "warmup":
        return (
          <View style={styles.card}>
            <Text style={styles.headerText}>Warm Up</Text>
            <Text style={styles.subText}>
              {step.day} — {Math.ceil(step.durationSeconds / 60)}{" "}
              {step.durationSeconds >= 60 ? "mins" : "secs"}
            </Text>
            <Text style={styles.largeTimer}>{countdown}s</Text>
            <Text style={styles.exerciseText}>Exercises:</Text>
            {step.exercises.map((ex, i) => (
              <Text key={i} style={styles.itemText}>
                • {ex}
              </Text>
            ))}
            <TouchableOpacity style={styles.primaryButton} onPress={startTimer}>
              <Text style={styles.buttonText}>Start Warm Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={advanceStep}
            >
              <Text style={styles.buttonText}>Skip Warm Up</Text>
            </TouchableOpacity>
          </View>
        );

      case "exercise":
        return (
          <View style={styles.card}>
            <Text style={styles.headerText}>{step.exerciseName}</Text>
            <Text style={styles.subText}>
              {step.reps} reps × {step.sets} sets
            </Text>
            {step.weight ? (
              <Text style={styles.itemText}>Weight: {step.weight}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={advanceStep}
            >
              <Text style={styles.buttonText}>Log Set & Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={goBackStep}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        );

      case "rest":
        return (
          <View style={styles.card}>
            <Text style={styles.headerText}>Rest</Text>
            <Text style={styles.largeTimer}>{countdown}s</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={advanceStep}
            >
              <Text style={styles.buttonText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        );

      case "cooldown":
        return (
          <View style={styles.card}>
            <Text style={styles.headerText}>Cooldown</Text>
            <Text style={styles.itemText}>{step.instructions}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={advanceStep}
            >
              <Text style={styles.buttonText}>Finish Workout</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderStep()}

      {/* Optional: show a progress indicator at bottom */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {routine.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // black background
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  headerText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 12,
  },
  subText: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 8,
  },
  largeTimer: {
    fontSize: 48,
    color: "#00e5ff",
    fontWeight: "600",
    marginVertical: 16,
  },
  exerciseText: {
    fontSize: 20,
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  itemText: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  progressText: {
    color: "#888",
    fontSize: 14,
  },
});