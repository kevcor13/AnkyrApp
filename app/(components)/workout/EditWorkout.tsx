// app/(workout)/EditWorkout.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";

type Exercise = {
  _id?: string;
  id?: string;
  // Catalog shape:
  name?: string;
  recommendedSets?: string;   // e.g. "4"
  recommendedReps?: string;   // e.g. "10" or "10 per leg"
  isWarmupExercise?: boolean;
  isCooldownExercise?: boolean;
  isMainWorkoutExercise?: boolean;

  // Plan shape:
  exerciseName?: string;      // what the rest of the app expects
  sets?: number | string;
  reps?: string;
  restBetweenSeconds?: number;
  recommendedWeight?: number;

  // Shared/meta:
  videoUrl?: string;
  description?: string;
  category?: string;
  equipment?: string[];
  difficulty?: string;
  tags?: string[];
};

type DayPlan = {
  warmup: Exercise[];
  workoutRoutine: Exercise[];
  cooldown: Exercise[];
  challanges?: Exercise[];
  focus?: string;
  timeEstimate?: string;
  [k: string]: any;
};

const getName = (ex: Exercise) => ex.name || ex.exerciseName || "Untitled";

/** Decide which phase a catalog item belongs to (for adding). */
const phaseFromFlags = (ex: Exercise): keyof DayPlan => {
  if (ex.isWarmupExercise) return "warmup";
  if (ex.isCooldownExercise) return "cooldown";
  return "workoutRoutine";
};

/** Convert an existing plan item to render-friendly shape (adds .name alias). */
const existingToRenderable = (ex: Exercise): Exercise => ({
  ...ex,
  name: ex.name ?? ex.exerciseName, // make sure <Text> can show it
});

/** Convert a catalog (or render) item to the app's expected *plan* shape. */
const toPlanShape = (ex: Exercise): Exercise => {
  // Prefer explicit plan fields if they already exist, otherwise derive from catalog fields.
  const setsNum =
    typeof ex.sets === "number"
      ? ex.sets
      : ex.sets
      ? parseInt(String(ex.sets), 10)
      : ex.recommendedSets
      ? parseInt(ex.recommendedSets, 10)
      : 0;

  return {
    ...ex,
    // Critical: app expects exerciseName
    exerciseName: ex.exerciseName ?? ex.name ?? "Untitled",
    // Normalize sets/reps
    sets: setsNum || 0,
    reps: ex.reps ?? ex.recommendedReps ?? "",
    // Provide sane defaults used by your ExerciseScreen
    restBetweenSeconds:
      typeof ex.restBetweenSeconds === "number"
        ? ex.restBetweenSeconds
        : 45,
    recommendedWeight:
      typeof ex.recommendedWeight === "number" ? ex.recommendedWeight : 0,
    // Keep video if present
    videoUrl: ex.videoUrl,
  };
};

const EditWorkout: React.FC = () => {
  const {
    focusWorkouts,         // catalog list for today's focus
    userWorkoutData,       // today's plan in user-plan shape
    setUserWorkoutData,    // updater
    userData
  }: any = useGlobal();
  const theme = userData.defaultTheme;

  // Local working copy for editing
  const [plan, setPlan] = useState<DayPlan>({
    warmup: [],
    workoutRoutine: [],
    cooldown: [],
    challanges: [],
  });

  // When swapping, store target slot
  const [swapTarget, setSwapTarget] = useState<{ phase: keyof DayPlan; index: number } | null>(null);

  // Seed from current plan; add .name so titles render in this screen
  useEffect(() => {
    if (!userWorkoutData) return;
    setPlan({
      warmup: (userWorkoutData.warmup ?? []).map(existingToRenderable),
      workoutRoutine: (userWorkoutData.workoutRoutine ?? []).map(existingToRenderable),
      cooldown: (userWorkoutData.cooldown ?? []).map(existingToRenderable),
      challanges: (userWorkoutData.challanges ?? userWorkoutData.selectedChallenges ?? []).map(existingToRenderable),
      focus: userWorkoutData.focus,
      timeEstimate: userWorkoutData.timeEstimate,
      ...userWorkoutData,
    });
  }, [userWorkoutData]);

  // Group focus workouts by phase for a tidy catalog
  const focusByPhase = useMemo(() => {
    const groups: Record<"warmup" | "workoutRoutine" | "cooldown", Exercise[]> = {
      warmup: [],
      workoutRoutine: [],
      cooldown: [],
    };
    (focusWorkouts ?? []).forEach((raw: Exercise) => {
      const ex = { ...raw, name: raw.name ?? raw.exerciseName };
      groups[phaseFromFlags(ex)].push(ex);
    });
    return groups;
  }, [focusWorkouts]);

  const addToPlan = (ex: Exercise) => {
    const item = { ...ex, name: getName(ex) };
    if (swapTarget) {
      setPlan((prev) => {
        const next = { ...prev } as DayPlan;
        const arr = [...((next[swapTarget.phase] as Exercise[]) ?? [])];
        arr[swapTarget.index] = item;
        next[swapTarget.phase] = arr;
        return next;
      });
      setSwapTarget(null);
      return;
    }
    const phase = phaseFromFlags(item);
    setPlan((prev) => ({
      ...prev,
      [phase]: [...((prev[phase] as Exercise[]) ?? []), item],
    }));
  };

  const removeFromPlan = (phase: keyof DayPlan, index: number) => {
    setPlan((prev) => {
      const copy = [...((prev[phase] as Exercise[]) ?? [])];
      copy.splice(index, 1);
      return { ...prev, [phase]: copy };
    });
    if (swapTarget && swapTarget.phase === phase && swapTarget.index === index) {
      setSwapTarget(null);
    }
  };

  const beginSwap = (phase: keyof DayPlan, index: number) => setSwapTarget({ phase, index });
  const cancelSwap = () => setSwapTarget(null);

  /** Save ONLY to context in the exact plan shape your app expects, then go back. */
  const saveLocallyAndBack = () => {
    const payload = {
      warmup: (plan.warmup ?? []).map(toPlanShape),
      workoutRoutine: (plan.workoutRoutine ?? []).map(toPlanShape),
      cooldown: (plan.cooldown ?? []).map(toPlanShape),
      challanges: (plan.challanges ?? []).map(toPlanShape),
      focus: plan.focus,
      timeEstimate: plan.timeEstimate,
    };
    
    setUserWorkoutData(payload);

    Alert.alert("Saved", "Your workout was updated.");
    router.back();
  };

  const Section = ({ title, phaseKey }: { title: string; phaseKey: keyof DayPlan }) => {
    const items: Exercise[] = (plan[phaseKey] as Exercise[]) ?? [];
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No exercises yet.</Text>
        ) : (
          items.map((ex, idx) => (
            <View key={`${getName(ex)}-${idx}`} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{getName(ex)}</Text>
                <Text style={styles.cardMeta}>
                  {ex.recommendedSets || ex.sets ? `${ex.recommendedSets ?? ex.sets} sets` : ""}
                  {ex.recommendedReps || ex.reps ? ` • ${ex.recommendedReps ?? ex.reps}` : ""}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    swapTarget &&
                      swapTarget.phase === phaseKey &&
                      swapTarget.index === idx &&
                      styles.actionBtnActive,
                  ]}
                  onPress={() => beginSwap(phaseKey, idx)}
                >
                  <Text style={styles.actionText}>SWAP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.removeBtn]}
                  onPress={() => removeFromPlan(phaseKey, idx)}
                >
                  <Text style={styles.actionText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const FocusSection = ({ title, items }: { title: string; items: Exercise[] }) => {
    if (!items?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {swapTarget && (
          <View style={styles.swapBanner}>
            <Text style={styles.swapText}>
              Swap mode: choose a replacement, or{" "}
              <Text onPress={cancelSwap} style={styles.swapCancel}>
                cancel
              </Text>
              .
            </Text>
          </View>
        )}
        {items.map((ex) => (
          <View key={ex._id || ex.id || getName(ex)} style={styles.cardAlt}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{getName(ex)}</Text>
              <Text style={styles.cardMeta}>
                {ex.recommendedSets ? `${ex.recommendedSets} sets` : ""}
                {ex.recommendedReps ? ` • ${ex.recommendedReps}` : ""}
              </Text>
            </View>
            <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={() => addToPlan(ex)}>
              <Text style={styles.actionText}>{swapTarget ? "REPLACE" : "ADD"}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={theme? ['#FF0509', '#271293'] : ["#000000", "#272727"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Workout</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.headerLink}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Current plan */}
        <Section title="WARM-UP" phaseKey="warmup" />
        <Section title="MAIN WORKOUT" phaseKey="workoutRoutine" />
        <Section title="COOL DOWN" phaseKey="cooldown" />
        {/* <Section title="CHALLENGES" phaseKey="challanges" /> */}

        {/* Focus catalog */}
        <View style={styles.divider} />
        <Text style={styles.catalogTitle}>Available Exercises (Focus)</Text>
        <FocusSection title="Warm-Up" items={focusByPhase.warmup} />
        <FocusSection title="Main Workout" items={focusByPhase.workoutRoutine} />
        <FocusSection title="Cool Down" items={focusByPhase.cooldown} />

        {/* Save */}
        <View style={styles.saveBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={saveLocallyAndBack}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { color: "#fff", fontSize: 28, fontFamily: "poppins-semibold" },
  headerLink: { color: "#8AFFF9", fontSize: 14, fontFamily: "poppins-medium" },

  section: { paddingHorizontal: 20, marginTop: 12 },
  sectionTitle: {
    color: "#fff",
    opacity: 0.9,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "poppins-medium",
  },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14, paddingVertical: 6 },

  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardAlt: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: { color: "#fff", fontSize: 16, fontFamily: "poppins-semibold" },
  cardMeta: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 3,
    fontFamily: "poppins-regular",
  },

  cardActions: { flexDirection: "row", gap: 8, marginLeft: 10 },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionBtnActive: { backgroundColor: "#8AFFF9" },
  removeBtn: { backgroundColor: "rgba(255, 80, 80, 0.35)" },
  addBtn: { backgroundColor: "rgba(138, 255, 249, 0.25)" },
  actionText: { color: "#fff", fontSize: 12, fontFamily: "poppins-semibold", letterSpacing: 1 },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 6,
  },
  catalogTitle: { color: "#fff", fontSize: 16, fontFamily: "poppins-semibold", paddingHorizontal: 20, marginBottom: 8 },

  swapBanner: { backgroundColor: "rgba(138,255,249,0.18)", borderRadius: 10, padding: 10, marginBottom: 8 },
  swapText: { color: "#8AFFF9", fontFamily: "poppins-medium" },
  swapCancel: { textDecorationLine: "underline" },

  saveBar: { paddingHorizontal: 20, paddingVertical: 24 },
  saveBtn: { backgroundColor: "#fff", alignItems: "center", paddingVertical: 16, borderRadius: 16 },
  saveText: { color: "#271293", fontSize: 16, fontFamily: "poppins-bold" },
});

export default EditWorkout;
