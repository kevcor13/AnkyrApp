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
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  phase: "warmup" | "workout" | "challanges";
  restBetweenSeconds: number;
  recommendedWeight: number;
  performedSets: PerformedSet[];
  isTimeBased: boolean;
  time?: number;
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
    userData,
    ngrokAPI,
    selectedChallenges,
    fetchLoggedWorkouts,
    fetchGameData,
  } = useGlobal();

  const [liveWorkout, setLiveWorkout] = useState<Exercise[] | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>("OVERVIEW");
  const [isFinishing, setIsFinishing] = useState(false);
  const [xpFromLastExercise] = useState(5);
  const [firstWorkoutIndex, setFirstWorkoutIndex] = useState<number | null>(null);
  const [hasShownThemePrompt, setHasShownThemePrompt] = useState(false);
  ////video preloading state
  const [videosPreloaded, setVideosPreloaded] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !userWorkoutData) return;

    console.log("🏋️ Initializing workout...");

    // Process WARMUP exercises (time-based, no sets/reps/weight)
    const taggedWarmup = (userWorkoutData.warmup || []).map((ex: any) => {
      const timeValue = ex.time || 60;
      
      console.log(`Warmup: ${ex.exerciseName} - ${timeValue} seconds`);
      
      return {
        _id: ex._id,
        exerciseName: ex.exerciseName || "Unknown Warmup",
        difficulty: "easy",
        reps: `${timeValue} seconds`,
        sets: 1,
        videoUrl: ex.videoUrl || "",
        phase: "warmup" as const,
        recommendedWeight: 0,
        restBetweenSeconds: 0,
        isTimeBased: true,
        time: timeValue,
        performedSets: [{
          reps: timeValue,
          weight: 0
        }]
      };
    });

    // Process WORKOUT exercises (set/rep-based with weight)
    const taggedWorkout = (userWorkoutData.workoutRoutine || []).map((ex: any) => {
      const sets = ex.sets || 3;
      const reps = ex.reps || 10;
      const recommendedWeight = ex.recommendedWeight || 0;
      
      console.log(`Workout: ${ex.exerciseName} - ${sets} sets × ${reps} reps @ ${recommendedWeight} lbs`);
      
      return {
        _id: ex._id,
        exerciseName: ex.exerciseName || "Unknown Exercise",
        difficulty: ex.difficulty || "medium",
        reps: String(reps),
        sets: sets,
        videoUrl: ex.videoUrl || "",
        phase: "workout" as const,
        recommendedWeight: recommendedWeight,
        restBetweenSeconds: ex.restBetweenSeconds || 60,
        isTimeBased: false,
        performedSets: Array(sets).fill(null).map(() => ({
          reps: reps,
          weight: recommendedWeight
        }))
      };
    });
    
    // Process CHALLENGES (could be either time or rep-based)
    const taggedChallenges = (selectedChallenges || []).map((ex: any) => {
      const hasTime = ex.time !== undefined && ex.time !== null;
      const timeValue = ex.time || 60;
      const reps = ex.reps || 10;
      const sets = ex.sets || 1;
      const recommendedWeight = ex.recommendedWeight || 0;
      
      console.log(`Challenge: ${ex.exercise || ex.exerciseName} - ${hasTime ? `${timeValue} seconds` : `${sets} sets × ${reps} reps`}`);
      
      return {
        _id: ex._id,
        exerciseName: ex.exercise || ex.exerciseName || ex.name || "Unknown Challenge",
        difficulty: ex.difficulty || "hard",
        reps: hasTime ? `${timeValue} seconds` : String(reps),
        sets: sets,
        videoUrl: ex.videoUrl || "",
        phase: "challanges" as const,
        recommendedWeight: recommendedWeight,
        restBetweenSeconds: ex.restBetweenSeconds || 60,
        isTimeBased: hasTime,
        time: hasTime ? timeValue : undefined,
        performedSets: Array(sets).fill(null).map(() => ({
          reps: hasTime ? timeValue : reps,
          weight: hasTime ? 0 : recommendedWeight
        }))
      };
    });

    const combined = [
      ...taggedWarmup,
      ...taggedWorkout,
      ...taggedChallenges,
    ];

    console.log(`📋 Total exercises: ${combined.length} (${taggedWarmup.length} warmup, ${taggedWorkout.length} workout, ${taggedChallenges.length} challenges)`);

    if (!combined.length) {
      Alert.alert("Error", "No exercises found in your workout plan.");
      return;
    }

    setLiveWorkout(combined);
    setExerciseIndex(0);
    setCurrentSetIndex(0);
    setFlowState("OVERVIEW");
    setFirstWorkoutIndex(taggedWorkout.length > 0 ? taggedWarmup.length : null);
    setHasShownThemePrompt(Boolean(userData?.askedThemeQuestion));


    // preload videos
    {/** 
    const preloadAllVideos = async () => {
      try {
        await videoPreloader.initialize();
        
        const videoUrls = combined
          .map(ex => ex.videoUrl)
          .filter(url => url && url.length > 0);
  
        console.log(`🎬 Preloading ${videoUrls.length} videos...`);
  
        // Preload videos one by one to track progress
        for (let i = 0; i < videoUrls.length; i++) {
          await videoPreloader.preloadVideo(videoUrls[i]);
          setPreloadProgress(((i + 1) / videoUrls.length) * 100);
        }
  
        setVideosPreloaded(true);
        console.log("✅ All videos preloaded!");
  
        // Update workout with cached URIs
        const updatedCombined = combined.map(ex => ({
          ...ex,
          videoUrl: videoPreloader.getCachedUri(ex.videoUrl) || ex.videoUrl
        }));
        
        setLiveWorkout(updatedCombined);
      } catch (error) {
        console.error("Failed to preload videos:", error);
        setVideosPreloaded(true); // Continue anyway with original URLs
      }
    };

    preloadAllVideos();
    */} 
    
    
    
    hasInitialized.current = true;
    console.log("✅ Initialization complete");
  }, [userWorkoutData, selectedChallenges, userData]);




  const handleSetUpdate = (exIndex: number, setIdx: number, weight: number) => {
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
    if (!liveWorkout) return;
    
    const currentExercise = liveWorkout[exerciseIndex];
    const totalSets = currentExercise.sets;

    if (currentSetIndex >= totalSets - 1) {
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
    const prevIndex = exerciseIndex;
    const nextIndex = prevIndex + 1;

    setExerciseIndex(nextIndex);
    setCurrentSetIndex(0);

    const askedBefore = Boolean(userData?.askedThemeQuestion);
    const shouldShowTheme =
      firstWorkoutIndex !== null &&
      prevIndex === firstWorkoutIndex &&
      !askedBefore &&
      !hasShownThemePrompt;

    if (shouldShowTheme) {
      setHasShownThemePrompt(true);
      setFlowState("CHANGE_THEME");
      return;
    }

    if (firstWorkoutIndex !== null && nextIndex <= firstWorkoutIndex) {
      setFlowState("OVERVIEW");
    } else {
      setFlowState("UP_NEXT");
    }
  };

  const handleChangeTheme = () => {
    setFlowState("UP_NEXT");
  };

  const handleFinishWorkout = async () => {
    if (!liveWorkout || isFinishing) return;
    setIsFinishing(true);
    
    const UserID = userData?._id;
    if (!UserID) {
      Alert.alert("Error", "Could not identify user.");
      setIsFinishing(false);
      return;
    }

    try {
      const exercises = liveWorkout
        .map((ex) => ({
          name: ex.exerciseName,
          sets: ex.performedSets
            .filter((set) => set.weight >= 0)
            .map((s) => ({ reps: s.reps, weight: s.weight })),
        }))
        .filter((ex) => ex.sets.length > 0);

      const workoutLogPayload = {
        userId: UserID,
        workoutName: userWorkoutData?.focus || "Completed Workout",
        durationSeconds: 3600,
        exercises,
        points: liveWorkout.length * 5,
      };

      const completionResponse = await axios.post(`${ngrokAPI}/api/update/completeWorkout`, {
        UserID,
        workoutLogPayload,
        clientTimestamp: new Date().toISOString(),
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const completionData = completionResponse?.data?.data || {};
      const previousStreak = Number(completionData.previousStreak);
      const currentStreak = Number(completionData.currentStreak);
      const floatiesRemaining = Number(completionData.floatiesRemaining ?? 0);

      if (
        !Number.isFinite(previousStreak) ||
        !Number.isFinite(currentStreak)
      ) {
        Alert.alert("Error", "Workout saved, but streak data was invalid.");
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (token) {
        await fetchGameData(token, UserID);
      }
      await fetchLoggedWorkouts(UserID);

      const xpEarned =
        Number.isFinite(Number(completionData.xpEarned))
          ? Number(completionData.xpEarned)
          : liveWorkout.length * 5;
      
      router.replace({
        pathname: "/(workout)/EndWorkoutScreen",
        params: {
          previousStreak: previousStreak.toString(),
          currentStreak: currentStreak.toString(),
          xpEarned: xpEarned.toString(),
          floatiesRemaining: Number.isFinite(floatiesRemaining)
            ? floatiesRemaining.toString()
            : "0",
        }
      });
    } catch {
      Alert.alert("Error", "There was a problem saving your workout.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleStartExercise = () => setFlowState("EXERCISE");

  const handleEnd = () => {
    Alert.alert(
      "End Workout?",
      "Are you sure you want to end your workout early? Your progress will not be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End Workout", style: "destructive", onPress: () => router.push("/(tabs)/home") }
      ]
    );
  };

  if (!liveWorkout) {
    return (
      <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
        {videosPreloaded 
          ? "Preparing your workout..." 
          : `Loading videos... ${Math.round(preloadProgress)}%`
        }
      </Text>
      </LinearGradient>
    );
  }

  const currentExercise = liveWorkout[exerciseIndex];
  if (!currentExercise) return null;

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
            currentExerciseIndex={exerciseIndex}
            totalExercises={liveWorkout.length}
          />
        );
      case "POST_EXERCISE_REST":
        return (
          <RestScreen
            duration={currentExercise.restBetweenSeconds + 20}
            onRestComplete={handlePostExerciseRestComplete}
            currentExerciseIndex={exerciseIndex}
            totalExercises={liveWorkout.length}
          />
        );
      default:
        return null;
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
