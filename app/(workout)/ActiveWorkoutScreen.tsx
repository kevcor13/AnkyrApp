import React, { useState, useEffect, useRef } from "react";
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
  const [firstWorkoutIndex, setFirstWorkoutIndex] = useState<number | null>(null);
  const [hasShownThemePrompt, setHasShownThemePrompt] = useState(false);
  
  // Track initialization
  const hasInitialized = useRef(false);

  // Debug: Log context data
  useEffect(() => {
    console.log("=== CONTEXT DATA ===");
    console.log("userWorkoutData:", JSON.stringify(userWorkoutData, null, 2));
    console.log("selectedChallenges:", JSON.stringify(selectedChallenges, null, 2));
    console.log("userData:", userData ? "exists" : "null");
    console.log("userGameData:", userGameData ? "exists" : "null");
    console.log("====================");
  }, [userWorkoutData, selectedChallenges, userData, userGameData]);

  // Initialize workout - runs ONCE
  useEffect(() => {
    if (hasInitialized.current) {
      console.log("⏭️ Skipping initialization - already initialized");
      return;
    }

    if (!userWorkoutData) {
      console.log("⏸️ Waiting for userWorkoutData...");
      return;
    }

    console.log("🚀 === INITIALIZING WORKOUT ===");
    
    // Tag exercises by phase
    const taggedWarmup = (userWorkoutData.warmup || []).map((ex: any, idx: number) => {
      console.log(`Warmup ${idx}:`, ex.exerciseName || ex.name);
      return {
        ...ex,
        exerciseName: ex.exerciseName || ex.name || "Unknown Exercise",
        phase: "warmup" as const,
      };
    });
    
    const taggedWorkout = (userWorkoutData.workoutRoutine || []).map((ex: any, idx: number) => {
      console.log(`Workout ${idx}:`, ex.exerciseName || ex.name);
      return {
        ...ex,
        exerciseName: ex.exerciseName || ex.name || "Unknown Exercise",
        phase: "workout" as const,
      };
    });
    
    const taggedCoolDown = (userWorkoutData.cooldown || []).map((ex: any, idx: number) => {
      console.log(`Cooldown ${idx}:`, ex.exerciseName || ex.name);
      return {
        ...ex,
        exerciseName: ex.exerciseName || ex.name || "Unknown Exercise",
        phase: "cooldown" as const,
      };
    });
    
    const taggedChallenges = (selectedChallenges || []).map((ex: any, idx: number) => {
      console.log(`Challenge ${idx}:`, ex.exercise || ex.exerciseName || ex.name);
      return {
        ...ex,
        exerciseName: ex.exercise || ex.exerciseName || ex.name || "Unknown Challenge",
        phase: "challanges" as const,
      };
    });

    const combined = [
      ...taggedWarmup,
      ...taggedWorkout,
      ...taggedCoolDown,
      ...taggedChallenges,
    ];

    console.log(`📋 Total exercises combined: ${combined.length}`);

    if (!combined.length) {
      console.error("❌ No exercises found! Cannot start workout.");
      Alert.alert("Error", "No exercises found in your workout plan.");
      return;
    }

    // Build workout session with all required data
    const workoutSession: Exercise[] = combined.map((exercise, idx) => {
      const sets = exercise.sets || 3;
      const repsString = String(exercise.reps || "8-12");
      const repsValue = parseInt(repsString.split("-")[0], 10) || 8;
      
      const processed: Exercise = {
        ...exercise,
        exerciseName: exercise.exerciseName,
        difficulty: exercise.difficulty || "medium",
        reps: repsString,
        sets: sets,
        videoUrl: exercise.videoUrl || "",
        phase: exercise.phase,
        recommendedWeight: exercise.recommendedWeight || 0,
        restBetweenSeconds: exercise.restBetweenSeconds || (exercise.phase === "warmup" ? 30 : 60),
        performedSets: Array(sets).fill(null).map(() => ({
          reps: repsValue,
          weight: 0,
        })),
      };

      console.log(`✅ Exercise ${idx + 1}: ${processed.exerciseName} (${processed.phase}) - ${processed.sets} sets`);
      return processed;
    });

    console.log("🎯 First workout phase starts at index:", taggedWarmup.length);
    console.log("📊 Workout session created:", workoutSession.length, "exercises");

    // Set state
    setLiveWorkout(workoutSession);
    setExerciseIndex(0);
    setCurrentSetIndex(0);
    setFlowState("OVERVIEW");
    setFirstWorkoutIndex(taggedWorkout.length > 0 ? taggedWarmup.length : null);
    setHasShownThemePrompt(Boolean(userData?.askedThemeQuestion));
    
    hasInitialized.current = true;
    console.log("✅ === INITIALIZATION COMPLETE ===\n");
  }, [userWorkoutData, selectedChallenges, userData]);

  // Debug: Log state changes
  useEffect(() => {
    if (liveWorkout) {
      console.log(`📍 STATE: ${flowState} | Exercise ${exerciseIndex + 1}/${liveWorkout.length} | Set ${currentSetIndex + 1}/${liveWorkout[exerciseIndex]?.sets || 0}`);
    }
  }, [flowState, exerciseIndex, currentSetIndex, liveWorkout]);

  // ---- Handlers ----
  const handleSetUpdate = (exIndex: number, setIdx: number, weight: number) => {
    console.log(`💪 Set update: Exercise ${exIndex}, Set ${setIdx}, Weight ${weight}kg`);
    
    setLiveWorkout((curr) => {
      if (!curr) return null;
      
      const updated = [...curr];
      updated[exIndex] = {
        ...updated[exIndex],
        performedSets: updated[exIndex].performedSets.map((set, idx) =>
          idx === setIdx ? { ...set, weight } : set
        ),
      };
      
      return updated;
    });
  };

  const handleSetLogged = () => {
    if (!liveWorkout) {
      console.error("❌ handleSetLogged: No liveWorkout");
      return;
    }
    
    const currentExercise = liveWorkout[exerciseIndex];
    const totalSets = currentExercise.sets;
    
    console.log(`\n✅ SET LOGGED: Set ${currentSetIndex + 1}/${totalSets} complete`);
    console.log(`Current exercise: ${currentExercise.exerciseName} (${exerciseIndex + 1}/${liveWorkout.length})`);

    // Check if this was the last set of the exercise
    if (currentSetIndex >= totalSets - 1) {
      console.log("🏁 Last set of exercise complete!");
      
      // Check if this was the last exercise
      if (exerciseIndex >= liveWorkout.length - 1) {
        console.log("🎉 WORKOUT COMPLETE! Starting finish sequence...");
        handleFinishWorkout();
      } else {
        console.log("➡️ Moving to POST_EXERCISE_REST");
        setFlowState("POST_EXERCISE_REST");
      }
    } else {
      console.log("⏸️ Moving to INTER_SET_REST");
      setFlowState("INTER_SET_REST");
    }
  };

  const handleInterSetRestComplete = () => {
    console.log(`\n⏭️ Inter-set rest complete. Moving to set ${currentSetIndex + 2}`);
    setCurrentSetIndex((prev) => prev + 1);
    setFlowState("EXERCISE");
  };

  const handlePostExerciseRestComplete = () => {
    const prevIndex = exerciseIndex;
    const nextIndex = prevIndex + 1;

    console.log(`\n⏭️ Post-exercise rest complete. Moving from exercise ${prevIndex + 1} to ${nextIndex + 1}`);

    setExerciseIndex(nextIndex);
    setCurrentSetIndex(0);

    // Check if we should show theme prompt
    const askedBefore = Boolean(userData?.askedThemeQuestion);
    const shouldShowTheme = firstWorkoutIndex !== null 
      && prevIndex === firstWorkoutIndex 
      && !askedBefore 
      && !hasShownThemePrompt;

    console.log(`Theme check: firstWorkoutIndex=${firstWorkoutIndex}, prevIndex=${prevIndex}, askedBefore=${askedBefore}, hasShown=${hasShownThemePrompt}`);

    if (shouldShowTheme) {
      console.log("🎨 Showing CHANGE_THEME screen");
      setHasShownThemePrompt(true);
      setFlowState("CHANGE_THEME");
      return;
    }

    // Show OVERVIEW for first 2 exercises, then UP_NEXT
    if (nextIndex <= 1) {
      console.log("📋 Showing OVERVIEW screen");
      setFlowState("OVERVIEW");
    } else {
      console.log("⏭️ Showing UP_NEXT screen");
      setFlowState("UP_NEXT");
    }
  };

  const handleChangeTheme = () => {
    console.log("🎨 Theme change confirmed, continuing to UP_NEXT");
    setFlowState("UP_NEXT");
  };

  const handleFinishWorkout = async () => {
    if (!liveWorkout || isFinishing) {
      console.log("⚠️ Already finishing or no workout data");
      return;
    }
    
    console.log("\n🏁 === FINISHING WORKOUT ===");
    setIsFinishing(true);
    
    const UserID = userData?._id;
    if (!UserID) {
      console.error("❌ No UserID found");
      Alert.alert("Error", "Could not identify user. Please log in again.");
      setIsFinishing(false);
      return;
    }

    try {
      // Prepare workout log
      const exercises = liveWorkout.map((ex) => ({
        name: ex.exerciseName,
        sets: ex.performedSets
          .filter((set) => set.weight >= 0)
          .map((s) => ({ reps: s.reps, weight: s.weight })),
      })).filter((ex) => ex.sets.length > 0);

      console.log("📤 Logging workout with", exercises.length, "exercises");

      const workoutLogPayload = {
        userId: UserID,
        workoutName: userWorkoutData?.focus || "Completed Workout",
        durationSeconds: 3600,
        exercises,
        points: liveWorkout.length * 5,
      };

      console.log("Workout log payload:", JSON.stringify(workoutLogPayload, null, 2));

      await axios.post(`${ngrokAPI}/api/update/logWorkout`, workoutLogPayload);
      console.log("✅ Workout logged successfully");

      // Calculate new points and streak
      const points = (userGameData?.points || 0) + liveWorkout.length * 5;
      const streak = (userGameData?.streak || 0) + 1;

      let league = "NOVICE";
      if (points >= 30000) league = "OLYMPIAN";
      else if (points >= 20000) league = "TITAN";
      else if (points >= 12000) league = "SKIPPER";
      else if (points >= 5000) league = "PILOT";
      else if (points >= 1000) league = "PRIVATE";

      console.log(`📊 New stats: ${points} XP, ${streak} day streak, ${league} league`);

      // Update points and streak
      await axios.post(`${ngrokAPI}/api/update/updatePointsAndStreak`, {
        UserID,
        points,
        streak,
        league,
      });
      console.log("✅ Points and streak updated");

      // Record completion
      await axios.post(`${ngrokAPI}/api/update/recordWorkoutCompletion`, {
        UserID,
      });
      console.log("✅ Workout completion recorded");

      console.log("🎉 === WORKOUT SAVED SUCCESSFULLY ===\n");

      Alert.alert("Workout Complete!", "Great job! Your progress has been saved.");
      router.replace("/(workout)/EndWorkoutScreen");
    } catch (error) {
      console.error("❌ Failed to save workout:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response:", error.response?.data);
        console.error("Status:", error.response?.status);
      }
      Alert.alert("Error", "There was a problem saving your workout.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleStartExercise = () => {
    console.log("▶️ Starting exercise");
    setFlowState("EXERCISE");
  };

  const handleEnd = () => {
    console.log("🚪 User requested to end workout early");
    Alert.alert(
      "End Workout?",
      "Are you sure you want to end your workout early? Your progress will not be saved.",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => console.log("End workout cancelled")
        },
        { 
          text: "End Workout", 
          style: "destructive",
          onPress: () => {
            console.log("🚪 Ending workout early - navigating to home");
            router.push("/(tabs)/home");
          }
        }
      ]
    );
  };

  // ---- Render ----
  if (!liveWorkout) {
    return (
      <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {hasInitialized.current ? "Loading workout..." : "Preparing your workout..."}
        </Text>
      </LinearGradient>
    );
  }

  const currentExercise = liveWorkout[exerciseIndex];

  if (!currentExercise) {
    console.error("❌ No current exercise at index", exerciseIndex);
    return (
      <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error: Exercise not found</Text>
      </LinearGradient>
    );
  }

  const renderContent = () => {
    console.log(`🖼️ Rendering: ${flowState}`);

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
        console.error("❌ Unknown flow state:", flowState);
        return (
          <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Unknown state: {flowState}</Text>
          </LinearGradient>
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    color: "white", 
    fontSize: 22, 
    fontFamily: "Poppins-SemiBold" 
  },
});

export default ActiveWorkoutScreen;