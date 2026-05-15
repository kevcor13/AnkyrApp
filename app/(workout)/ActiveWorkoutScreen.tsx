import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobal } from "@/context/GlobalProvider";
import WorkoutOverviewScreen from "@/app/(components)/workout/ExerciseOverview";
import WorkoutExerciseScreen from "@/app/(components)/workout/ExerciseScreen";
import RestScreen from "@/app/(components)/workout/RestScreen";
import WorkoutSessionList from "@/app/(components)/workout/WorkoutSessionList";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChangeThemeScreen from "../(components)/workout/ChangeThemeScreen";
import type { WorkoutSessionItem } from "@/app/(components)/workout/workoutSession";

type ScreenState =
  | "LIST"
  | "ITEM_OVERVIEW"
  | "ITEM_EXERCISE"
  | "INTER_SET_REST"
  | "CHANGE_THEME";

const XP_PER_ITEM = 5; // default for items without an assigned xp value

const buildSessionItemId = (phase: WorkoutSessionItem["phase"], index: number, value: any) =>
  `${phase}-${index}-${value?._id ?? value?.exerciseName ?? value?.exercise ?? "item"}`;

const ActiveWorkoutScreen = () => {
  const {
    userWorkoutData,
    userData,
    ngrokAPI,
    selectedChallenges,
    fetchLoggedWorkouts,
    fetchGameData,
    aiMode,
    logWorkoutSet,
    currentPhase,
    fetchUserRoutine,
  } = useGlobal();

  const [workoutDayLabel, setWorkoutDayLabel] = useState('');

  const [sessionItems, setSessionItems] = useState<WorkoutSessionItem[] | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [screenState, setScreenState] = useState<ScreenState>("LIST");
  const [isFinishing, setIsFinishing] = useState(false);
  const [firstWorkoutItemId, setFirstWorkoutItemId] = useState<string | null>(null);
  const [hasShownThemePrompt, setHasShownThemePrompt] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [phaseTransitionFlag, setPhaseTransitionFlag] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!userData?._id) return;
    fetchUserRoutine(userData._id).then((routine: any) => {
      const routineArray = routine?.routine || [];
      if (!routineArray.length) return;
      const workoutDays = routineArray.filter((d: any) => d.focus !== 'Rest');
      const todayName = new Date().toLocaleString('en-US', { weekday: 'long' });
      const dayIndex = workoutDays.findIndex((d: any) => d.day === todayName);
      if (dayIndex !== -1) {
        setWorkoutDayLabel(`day ${dayIndex + 1} of ${workoutDays.length}`);
      }
    }).catch(() => {});
  }, [userData]);

  useEffect(() => {
    const hasWorkoutData =
      Array.isArray(userWorkoutData?.warmup) ||
      Array.isArray(userWorkoutData?.workoutRoutine) ||
      (Array.isArray(selectedChallenges) && selectedChallenges.length > 0);

    if (hasInitialized.current || !hasWorkoutData) return;

    console.log("🏋️ Initializing workout...");

    // Process WARMUP exercises (time-based, no sets/reps/weight)
    const taggedWarmup: WorkoutSessionItem[] = (userWorkoutData.warmup || []).map((ex: any, index: number) => {
      const timeValue = ex.time || 60;

      return {
        id: buildSessionItemId("warmup", index, ex),
        order: index,
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
        status: "todo",
        performedSets: [{
          reps: timeValue,
          weight: 0
        }]
      };
    });

    // Process WORKOUT exercises (set/rep-based with weight)
    const taggedWorkout: WorkoutSessionItem[] = (userWorkoutData.workoutRoutine || []).map((ex: any, index: number) => {
      const sets = ex.sets || 3;
      const reps = ex.reps || 10;
      const recommendedWeight = ex.recommendedWeight || 0;

      return {
        id: buildSessionItemId("workout", index, ex),
        order: taggedWarmup.length + index,
        exerciseName: ex.exerciseName || "Unknown Exercise",
        difficulty: ex.difficulty || "medium",
        reps: String(reps),
        sets: sets,
        videoUrl: ex.videoUrl || "",
        phase: "workout" as const,
        recommendedWeight: recommendedWeight,
        restBetweenSeconds: ex.time || 180,
        isTimeBased: false,
        xp: ex.xp ?? XP_PER_ITEM,
        status: "todo",
        performedSets: Array(sets).fill(null).map(() => ({
          reps: reps,
          weight: recommendedWeight
        }))
      };
    });
    
    // Process CHALLENGES (could be either time or rep-based)
    const taggedChallenges: WorkoutSessionItem[] = (selectedChallenges || []).map((ex: any, index: number) => {
      const hasTime = ex.time !== undefined && ex.time !== null;
      const timeValue = ex.time || 60;
      const reps = ex.reps || 10;
      const sets = ex.sets || 1;
      const recommendedWeight = ex.recommendedWeight || 0;

      return {
        id: buildSessionItemId("challanges", index, ex),
        order: taggedWarmup.length + taggedWorkout.length + index,
        exerciseName: ex.exercise || ex.exerciseName || ex.name || "Unknown Challenge",
        difficulty: ex.difficulty || "hard",
        reps: hasTime ? `${timeValue} seconds` : String(reps),
        sets: sets,
        videoUrl: ex.videoUrl || "",
        phase: "challanges" as const,
        recommendedWeight: recommendedWeight,
        restBetweenSeconds: ex.time || 180,
        isTimeBased: hasTime,
        time: hasTime ? timeValue : undefined,
        status: "todo",
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

    if (!combined.length) {
      Alert.alert("Error", "No exercises found in your workout plan.");
      return;
    }

    setSessionItems(combined);
    setSelectedItemId(null);
    setCurrentSetIndex(0);
    setScreenState("LIST");
    setFirstWorkoutItemId(taggedWorkout.length > 0 ? taggedWorkout[0].id : null);
    setHasShownThemePrompt(Boolean(userData?.askedThemeQuestion));

    hasInitialized.current = true;
  }, [userWorkoutData, selectedChallenges, userData]);

  const selectedItemIndex = useMemo(() => {
    if (!sessionItems || !selectedItemId) return -1;
    return sessionItems.findIndex((item) => item.id === selectedItemId);
  }, [sessionItems, selectedItemId]);

  const selectedItem = selectedItemIndex >= 0 && sessionItems
    ? sessionItems[selectedItemIndex]
    : null;

  const completedCount = sessionItems?.filter((item) => item.status === "done").length ?? 0;
  const totalCount = sessionItems?.length ?? 0;
  const canFinishWorkout = totalCount > 0 && completedCount === totalCount;

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentSetIndex(0);
    setSessionItems((curr) => {
      if (!curr) return null;
      return curr.map((item) =>
        item.id === itemId && item.status === "todo"
          ? { ...item, status: "in_progress" }
          : item
      );
    });
    setScreenState("ITEM_OVERVIEW");
  };

  const handleBackToList = () => {
    setCurrentSetIndex(0);
    setScreenState("LIST");
  };

  const handleSetUpdate = (exIndex: number, setIdx: number, weight: number) => {
    setSessionItems((curr) => {
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
    if (!selectedItem || selectedItemIndex < 0) return;

    if (currentSetIndex >= selectedItem.sets - 1) {
      setSessionItems((curr) => {
        if (!curr) return null;
        return curr.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                status: "done",
                completedAt: new Date().toISOString(),
              }
            : item
        );
      });

      const askedBefore = Boolean(userData?.askedThemeQuestion);
      const shouldShowTheme =
        selectedItem.phase === "workout" &&
        selectedItem.id === firstWorkoutItemId &&
        !askedBefore &&
        !hasShownThemePrompt;

      setCurrentSetIndex(0);

      if (shouldShowTheme) {
        setHasShownThemePrompt(true);
        setScreenState("CHANGE_THEME");
        return;
      }

      handleBackToList();
    } else {
      setScreenState("INTER_SET_REST");
    }
  };

  const handleInterSetRestComplete = () => {
    setCurrentSetIndex((prev) => prev + 1);
    setScreenState("ITEM_EXERCISE");
  };

  const handleChangeTheme = () => {
    setSelectedItemId(null);
    setScreenState("LIST");
  };

  const handleFinishWorkout = async () => {
    if (!sessionItems || isFinishing || !canFinishWorkout) return;
    setIsFinishing(true);

    const UserID = userData?._id;
    if (!UserID) {
      Alert.alert("Error", "Could not identify user.");
      setIsFinishing(false);
      return;
    }

    try {
      const exercises = sessionItems
        .filter((item) => item.status === "done")
        .map((ex) => ({
          name: ex.exerciseName,
          xp: ex.xp ?? XP_PER_ITEM,
          sets: ex.performedSets
            .filter((set) => set.weight >= 0)
            .map((s, idx) => ({ setNumber: idx + 1, reps: s.reps, weight: s.weight })),
        }))
        .filter((ex) => ex.sets.length > 0);

      const totalXP = sessionItems
        .filter((item) => item.status === "done")
        .reduce((sum, item) => sum + (item.xp ?? XP_PER_ITEM), 0);

      const workoutLogPayload = {
        userId: UserID,
        workoutName: userWorkoutData?.focus || "Completed Workout",
        durationSeconds: 3600,
        exercises,
        points: totalXP,
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
      const phaseAdvanced = Boolean(completionData.phaseAdvanced);

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
          : totalXP;
      
      router.replace({
        pathname: "/(workout)/EndWorkoutScreen",
        params: {
          previousStreak: previousStreak.toString(),
          currentStreak: currentStreak.toString(),
          xpEarned: xpEarned.toString(),
          floatiesRemaining: Number.isFinite(floatiesRemaining)
            ? floatiesRemaining.toString()
            : "0",
          workoutName: userWorkoutData?.focus || "Completed Workout",
          phaseAdvanced: phaseAdvanced ? "true" : "false",
        }
      });
    } catch {
      Alert.alert("Error", "There was a problem saving your workout.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleStartExercise = () => setScreenState("ITEM_EXERCISE");

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

  if (!sessionItems) {
    return (
      <LinearGradient colors={["#FF0509", "#271293"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing your workout...</Text>
      </LinearGradient>
    );
  }

  if (selectedItemId && !selectedItem) {
    return null;
  }

  const renderContent = () => {
    switch (screenState) {
      case "LIST":
        return (
          <WorkoutSessionList
            focus={userWorkoutData?.focus || "Workout"}
            items={sessionItems}
            completedCount={completedCount}
            totalCount={totalCount}
            canFinish={canFinishWorkout}
            isFinishing={isFinishing}
            onSelectItem={handleSelectItem}
            onFinishWorkout={handleFinishWorkout}
            onEndWorkout={handleEnd}
            currentPhase={currentPhase}
            phaseTransition={phaseTransitionFlag}
            workoutDayLabel={workoutDayLabel}
          />
        );
      case "ITEM_OVERVIEW":
        if (!selectedItem) return null;
        return (
          <WorkoutOverviewScreen
            exercise={selectedItem}
            onStart={handleStartExercise}
            onEnd={handleEnd}
            onBackToList={handleBackToList}
            currentExerciseIndex={selectedItemIndex}
            totalExercises={sessionItems.length}
          />
        );
      case "CHANGE_THEME":
        return <ChangeThemeScreen onConfirm={handleChangeTheme} />;
      case "ITEM_EXERCISE":
        if (!selectedItem) return null;
        return (
          <WorkoutExerciseScreen
            exercise={selectedItem}
            exerciseIndex={selectedItemIndex}
            currentSetIndex={currentSetIndex}
            onSetUpdate={handleSetUpdate}
            onSetLogged={handleSetLogged}
            aiMode={aiMode}
            currentPhase={currentPhase}
            workoutLogId={workoutLogId}
            onWorkoutLogIdUpdate={(id) => setWorkoutLogId(id)}
            onPhaseTransition={() => setPhaseTransitionFlag(true)}
            logWorkoutSet={logWorkoutSet}
          />
        );
      case "INTER_SET_REST":
        if (!selectedItem) return null;
        return (
          <RestScreen
            duration={selectedItem.restBetweenSeconds}
            onRestComplete={handleInterSetRestComplete}
            onBackToList={handleBackToList}
            onEndWorkout={handleEnd}
            currentExerciseIndex={selectedItemIndex}
            totalExercises={sessionItems.length}
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
