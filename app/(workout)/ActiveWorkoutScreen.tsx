import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobal } from "@/context/GlobalProvider";
import WorkoutOverviewScreen from "@/app/(components)/workout/ExerciseOverview";
import WorkoutExerciseScreen from "@/app/(components)/workout/ExerciseScreen";
import RestScreen from "@/app/(components)/workout/RestScreen";
import UpNextScreen from "@/app/(components)/workout/UpNextScreen";
import axios from "axios";
import { router } from "expo-router";
import ChangeThemeScreen from "../(components)/workout/ChangeThemeScreen";

export interface PerformedSet {
  reps: number;
  weight: number;
}

export interface Exercise {
  difficulty: string;
  exerciseName: string;
  reps: string;
  sets: number;
  videoUrl: string;
  phase: "warmup" | "workout" | "cooldown" | "challanges";
  restBetweenSeconds: number;
  recommendedWeight: number;
  performedSets: PerformedSet[];
}

type FlowState =
  | "OVERVIEW"
  | "EXERCISE"
  | "INTER_SET_REST"
  | "POST_EXERCISE_REST"
  | "UP_NEXT"
  | "CHANGE_THEME";

/** Lightweight in-memory snapshot to survive theme-triggered re-renders/remounts */
let PERSIST:
  | {
      liveWorkout: Exercise[] | null;
      exerciseIndex: number;
      currentSetIndex: number;
      flowState: FlowState;
      firstWorkoutIndex: number | null;
      hasShownThemePrompt: boolean;
    }
  | null = null;

const ActiveWorkoutScreen = () => {
  const {
    userWorkoutData,
    userGameData,
    userData,
    ngrokAPI,
    selectedChallenges,
  } = useGlobal();

  // ---- State ----
  const [liveWorkout, setLiveWorkout] = useState<Exercise[] | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>("OVERVIEW");
  const [isFinishing, setIsFinishing] = useState(false);
  const [xpFromLastExercise] = useState(5);

  // first "workout" (not warmup) index within the combined playlist
  const [firstWorkoutIndex, setFirstWorkoutIndex] = useState<number | null>(null);
  // session guard so we don't show CHANGE_THEME twice in the same workout
  const [hasShownThemePrompt, setHasShownThemePrompt] = useState(false);

  // 1) On mount, try to restore prior progress
  useEffect(() => {
    if (PERSIST?.liveWorkout) {
      setLiveWorkout(PERSIST.liveWorkout);
      setExerciseIndex(PERSIST.exerciseIndex);
      setCurrentSetIndex(PERSIST.currentSetIndex);
      setFlowState(PERSIST.flowState);
      setFirstWorkoutIndex(PERSIST.firstWorkoutIndex);
      setHasShownThemePrompt(PERSIST.hasShownThemePrompt);
      PERSIST = null; // consumed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Only initialize playlist if we did NOT restore
  useEffect(() => {
    if (liveWorkout || !userWorkoutData) return;

    const taggedWarmup = (userWorkoutData.warmup || []).map((ex: any) => ({
      ...ex,
      phase: "warmup" as const,
    }));
    const taggedWorkout = (userWorkoutData.workoutRoutine || []).map(
      (ex: any) => ({ ...ex, phase: "workout" as const })
    );
    const taggedCoolDown = (userWorkoutData.cooldown || []).map((ex: any) => ({
      ...ex,
      phase: "cooldown" as const,
    }));
    const taggedChallanges = (selectedChallenges || []).map((ex: any) => ({
      ...ex,
      phase: "challanges" as const,
    }));

    const combined = [
      ...taggedWarmup,
      ...taggedWorkout,
      ...taggedCoolDown,
      ...taggedChallanges,
    ];
    if (!combined.length) return;

    const workoutSession = combined.map((exercise) => ({
      ...exercise,
      recommendedWeight: exercise.recommendedWeight,
      restBetweenSeconds:
        exercise.restBetweenSeconds ||
        (exercise.phase === "warmup" ? 30 : 60),
      performedSets: Array(exercise.sets)
        .fill(null)
        .map(() => ({
          reps: parseInt(String(exercise.reps).split("-")[0], 10) || 8,
          weight: 0,
        })),
    }));

    setLiveWorkout(workoutSession);
    setExerciseIndex(0);
    setCurrentSetIndex(0);
    setFirstWorkoutIndex(taggedWorkout.length > 0 ? taggedWarmup.length : null);
  }, [userWorkoutData, selectedChallenges, liveWorkout]);

  // 3) Keep snapshot updated so we can survive a remount
  useEffect(() => {
    PERSIST = {
      liveWorkout,
      exerciseIndex,
      currentSetIndex,
      flowState,
      firstWorkoutIndex,
      hasShownThemePrompt,
    };
  }, [
    liveWorkout,
    exerciseIndex,
    currentSetIndex,
    flowState,
    firstWorkoutIndex,
    hasShownThemePrompt,
  ]);

  // ---- Handlers ----
  const handleSetUpdate = (exIndex: number, setIdx: number, weight: number) => {
    setLiveWorkout((curr) => {
      if (!curr) return null;
      const updated = JSON.parse(JSON.stringify(curr));
      updated[exIndex].performedSets[setIdx].weight = weight;
      return updated;
    });
  };

  const handleSetLogged = () => {
    if (!liveWorkout) return;
    const totalSetsForExercise = liveWorkout[exerciseIndex].sets;

    if (currentSetIndex >= totalSetsForExercise - 1) {
      if (exerciseIndex >= liveWorkout.length - 1) {
        handleFinishWorkout();
      } else {
        setFlowState("POST_EXERCISE_REST");
      }
    } else {
      setFlowState("INTER_SET_REST");
    }
  };

  const handleInterSetRestComplete = () => {
    setCurrentSetIndex((prev) => prev + 1);
    setFlowState("EXERCISE");
  };

  const handlePostExerciseRestComplete = () => {
    const prevIndex = exerciseIndex; // just completed
    const nextIndex = prevIndex + 1;

    setExerciseIndex(nextIndex);
    setCurrentSetIndex(0);

    // Show CHANGE_THEME exactly once after the FIRST workout-phase exercise,
    // only if user hasn't been asked server-side yet.
    const askedBefore = Boolean(userData?.askedThemeQuestion);
    if (
      firstWorkoutIndex !== null &&
      prevIndex === firstWorkoutIndex &&
      !askedBefore &&
      !hasShownThemePrompt
    ) {
      setHasShownThemePrompt(true);

      // snapshot before switching views (defensive)
      PERSIST = {
        liveWorkout,
        exerciseIndex: nextIndex, // we've advanced
        currentSetIndex: 0,
        flowState: "CHANGE_THEME",
        firstWorkoutIndex,
        hasShownThemePrompt: true,
      };

      setFlowState("CHANGE_THEME");
      return;
    }

    // Normal flow: Overview for first two exercises, then Up Next
    if (nextIndex > 2) {
      setFlowState("UP_NEXT");
    } else {
      setFlowState("OVERVIEW");
    }
  };

  const handleChangeTheme = () => {
    // Snapshot immediately to guard against any re-render/remount from theme changes
    PERSIST = {
      liveWorkout,
      exerciseIndex,
      currentSetIndex,
      flowState: "UP_NEXT",
      firstWorkoutIndex,
      hasShownThemePrompt: true,
    };
    setFlowState("UP_NEXT");
  };

  const handleFinishWorkout = async () => {
    if (!liveWorkout || isFinishing) return;
    setIsFinishing(true);
    const UserID = userData?._id;
    if (!UserID) {
      Alert.alert("Error", "Could not identify user. Please log in again.");
      setIsFinishing(false);
      return;
    }

    try {
      const workoutLogPayload = {
        userId: UserID,
        workoutName: userWorkoutData?.focus || "Completed Workout",
        durationSeconds: 3600,
        exercises: liveWorkout
          .map((ex) => ({
            name: ex.exerciseName,
            sets: ex.performedSets
              .filter((set) => set.weight >= 0)
              .map((s) => ({ reps: s.reps, weight: s.weight })),
          }))
          .filter((ex) => ex.sets.length > 0),
        points: liveWorkout.length * 5,
      };

      await axios.post(`${ngrokAPI}/api/update/logWorkout`, workoutLogPayload);

      const points = (userGameData?.points || 0) + liveWorkout.length * 5;
      const streak = (userGameData?.streak || 0) + 1;

      let league = "NOVICE";
      if (points >= 30000) league = "OLYMPIAN";
      else if (points >= 20000) league = "TITAN";
      else if (points >= 12000) league = "SKIPPER";
      else if (points >= 5000) league = "PILOT";
      else if (points >= 1000) league = "PRIVATE";

      await axios.post(`${ngrokAPI}/api/update/updatePointsAndStreak`, {
        UserID,
        points,
        streak,
        league,
      });
      await axios.post(`${ngrokAPI}/api/update/recordWorkoutCompletion`, {
        UserID,
      });

      Alert.alert("Workout Complete!", "Great job! Your progress has been saved.");
      router.replace("/(workout)/EndWorkoutScreen");
    } catch (error) {
      console.error("Failed to save workout:", error);
      Alert.alert("Error", "There was a problem saving your workout.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleStartExercise = () => setFlowState("EXERCISE");
  const handleEnd = () => router.push("/(tabs)/home");

  // ---- Render ----
  if (!liveWorkout) {
    return (
      <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  const currentExercise = liveWorkout[exerciseIndex];

  const renderContent = () => {
    switch (flowState) {
      case "OVERVIEW":
        return (
          <WorkoutOverviewScreen
            exercise={currentExercise}
            onStart={handleStartExercise}
            onEnd={handleEnd}
            currentExerciseIndex={exerciseIndex}
            totalExercises={liveWorkout.length}
          />
        );
      case "UP_NEXT":
        return (
          <UpNextScreen
            nextExercise={currentExercise}
            onStart={handleStartExercise}
            onEnd={handleEnd}
            xpEarned={xpFromLastExercise}
            currentExerciseIndex={exerciseIndex}
            totalExercises={liveWorkout.length}
          />
        );
      case "CHANGE_THEME":
        return <ChangeThemeScreen onConfirm={handleChangeTheme} />;
      case "EXERCISE":
        return (
          <WorkoutExerciseScreen
            exercise={currentExercise}
            exerciseIndex={exerciseIndex}
            currentSetIndex={currentSetIndex}
            onSetUpdate={handleSetUpdate}
            onSetLogged={handleSetLogged}
          />
        );
      case "INTER_SET_REST":
        return (
          <RestScreen
            duration={currentExercise.restBetweenSeconds}
            onRestComplete={handleInterSetRestComplete}
          />
        );
      case "POST_EXERCISE_REST":
        return (
          <RestScreen
            duration={currentExercise.restBetweenSeconds + 20}
            onRestComplete={handlePostExerciseRestComplete}
          />
        );
      default:
        return null;
    }
  };

  return <View style={{ flex: 1 }}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "white", fontSize: 22, fontFamily: "Poppins-SemiBold" },
});

export default ActiveWorkoutScreen;
