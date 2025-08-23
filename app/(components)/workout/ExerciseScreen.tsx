import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video, ResizeMode } from "expo-av";
import { styles as globalStyles } from "@/constants/styles";
import icons from "@/constants/icons";
import { useGlobal } from "@/context/GlobalProvider";

interface PerformedSet { reps: number; weight: number; }

interface Exercise {
  exerciseName: string;
  phase: "warmup" | "workout" | "cooldown" | "challanges";
  videoUrl: string;
  sets: number;
  reps: string;
  restBetweenSeconds: number;
  recommendedWeight: number;     // may come in as number but normalize anyway
  performedSets: PerformedSet[];
}

interface ExerciseScreenProps {
  exercise: Exercise;
  exerciseIndex: number;
  currentSetIndex: number;
  onSetUpdate: (exerciseIndex: number, setIndex: number, weight: number) => void;
  onSetLogged: () => void;
}

const LBS_TO_KG_CONVERSION = 0.453592;

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  exercise,
  exerciseIndex,
  currentSetIndex,
  onSetUpdate,
  onSetLogged,
}) => {
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [displayUnit, setDisplayUnit] = useState<"lbs" | "kg">("lbs");
  const { userData } = useGlobal();
  const theme = userData.defaultTheme;

  // ✅ Always work with a numeric recommendation (handles "35" strings or undefined)
  const recommendedLbs = Number(exercise.recommendedWeight ?? 0);

  // If a set weight is unset (-1) OR is 0 while we have a positive recommendation,
  // initialize it to the recommended weight.
  useEffect(() => {
    const setWeight = exercise.performedSets[currentSetIndex]?.weight;
    if (
      setWeight === -1 ||
      (setWeight === 0 && recommendedLbs > 0) ||
      typeof setWeight !== "number"
    ) {
      onSetUpdate(exerciseIndex, currentSetIndex, recommendedLbs);
    }
    setHasAdjusted(false);
  }, [exercise.exerciseName, currentSetIndex, recommendedLbs]);

  const isWarmup = exercise.phase === "warmup";
  const isCooldown = exercise.phase === "cooldown";
  const isBodyweight = recommendedLbs === 0;

  const handleLogSet = () => onSetLogged();

  const adjustWeight = (amount: number) => {
    const currentWeight = exercise.performedSets[currentSetIndex]?.weight;
    // ✅ If currentWeight is 0 but we have a positive recommendation,
    // use the recommendation as the base instead of 0.
    const baseWeight =
      typeof currentWeight === "number" &&
      (currentWeight > 0 || (currentWeight === 0 && recommendedLbs === 0))
        ? currentWeight
        : recommendedLbs;

    const newWeight = Math.max(0, baseWeight + amount);
    onSetUpdate(exerciseIndex, currentSetIndex, newWeight);
    setHasAdjusted(true);
  };

  const rawWeight = exercise.performedSets[currentSetIndex]?.weight;
  const weightInLbs =
    typeof rawWeight === "number"
      ? rawWeight > 0 || (rawWeight === 0 && recommendedLbs === 0)
        ? rawWeight
        : recommendedLbs
      : recommendedLbs;

  const displayWeight =
    displayUnit === "kg"
      ? Math.round(weightInLbs * LBS_TO_KG_CONVERSION)
      : Math.round(weightInLbs); // round lbs for a cleaner badge

  const adjustmentAmountLbs = weightInLbs - recommendedLbs;
  const displayAdjustmentAmount =
    displayUnit === "kg"
      ? Math.round(adjustmentAmountLbs * LBS_TO_KG_CONVERSION)
      : adjustmentAmountLbs;

  // --- TIMER / reps parsing (unchanged) --------------------------------------
  const isTimed = /\bseconds?\b/i.test(exercise.reps);
  const [secondsLeftMs, setSecondsLeftMs] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (isTimed) {
      const match = exercise.reps.match(/(\d+(?:\.\d+)?)\s*seconds?/i);
      const secs = match ? parseFloat(match[1]) : 0;
      const ms = Math.max(0, Math.round(secs * 1000));
      setSecondsLeftMs(ms);
      setTimerActive(ms > 0);
    } else {
      setSecondsLeftMs(null);
      setTimerActive(false);
    }
  }, [exercise.reps, exercise.exerciseName, currentSetIndex, isTimed]);

  useEffect(() => {
    if (!timerActive || !isTimed || secondsLeftMs == null || secondsLeftMs <= 0) return;
    const id = setInterval(() => {
      setSecondsLeftMs((prev) => {
        if (prev == null) return 0;
        const next = prev - 100;
        return next > 0 ? next : 0;
      });
    }, 100);
    return () => clearInterval(id);
  }, [timerActive, isTimed, secondsLeftMs]);

  useEffect(() => {
    if (secondsLeftMs === 0 && timerActive) setTimerActive(false);
  }, [secondsLeftMs, timerActive]);

  const repsText = exercise.reps ?? "";
  const perMatch = repsText.match(/\bper\s+.+/i);
  const isPer = !!perMatch && !isTimed;
  const repsNumberMatch = repsText.match(/(\d+(?:\.\d+)?)/);
  const repsNumber = repsNumberMatch ? repsNumberMatch[1] : repsText;
  const perPhrase = perMatch ? perMatch[0] : "";

  return (
    <View style={{ flex: 1 }}>
      <View style={globalStyles.header}>
        <Image
          source={{ uri: exercise.videoUrl }}
          style={globalStyles.video}
          resizeMode={ResizeMode.COVER}
        />
      </View>
      <LinearGradient
        colors={
          isWarmup
            ? ["#FF0509", "#E89750"]
            : isCooldown
            ? ["#A12287", "#1F059D"]
            : theme
            ? ["#FF0509", "#271293"]
            : ["#000000", "#272727"]
        }
        style={globalStyles.gradientContainer}
      >
        <ScrollView style={globalStyles.workoutCard}>
          <Text style={globalStyles.exerciseNameMain}>{exercise.exerciseName}</Text>

          <View style={globalStyles.repsContainer}>
            {isTimed ? (
              <>
                <Text style={globalStyles.repsSetsMain}>
                  {((secondsLeftMs ?? 0) / 1000).toFixed(1)}
                </Text>
                <Text style={globalStyles.repsLabel}>seconds</Text>
              </>
            ) : isPer ? (
              <>
                <Text style={globalStyles.repsSetsMain}>{repsNumber}</Text>
                <Text style={globalStyles.repsLabel}> reps</Text>
              </>
            ) : (
              <>
                <Text style={globalStyles.repsSetsMain}>{exercise.reps}</Text>
                <Text style={globalStyles.repsLabel}> reps</Text>
              </>
            )}
          </View>

          {!isTimed && isPer ? (
            <Text style={styles.perQualifier}>{perPhrase}</Text>
          ) : null}

          {recommendedLbs === 0 ? (
            <Text style={globalStyles.bodyweightText}>Bodyweight</Text>
          ) : (
            <View style={styles.weightAdjusterContainer}>
              {hasAdjusted && displayAdjustmentAmount !== 0 ? (
                <Text style={styles.adjustmentIndicatorText}>
                  {displayAdjustmentAmount > 0 ? `+${displayAdjustmentAmount}` : displayAdjustmentAmount}
                  <Text style={{ fontSize: 18 }}> {displayUnit}</Text>
                </Text>
              ) : (
                <Text style={styles.suggestedText}>suggested:</Text>
              )}

              <View style={styles.adjusterRow}>
                <TouchableOpacity onPress={() => adjustWeight(-5)} style={styles.adjusterButton}>
                  <Text style={styles.adjusterButtonText}>-</Text>
                </TouchableOpacity>
                <View style={styles.weightDisplay}>
                  {/* ✅ This will now show the recommended weight instead of 0 */}
                  <Text style={styles.weightDisplayText}>{displayWeight}</Text>
                </View>
                <TouchableOpacity onPress={() => adjustWeight(5)} style={styles.adjusterButton}>
                  <Text style={styles.adjusterButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.unitSelector}>
                <TouchableOpacity
                  style={[styles.unitButton, displayUnit === "lbs" && styles.unitButtonActive]}
                  onPress={() => setDisplayUnit("lbs")}
                >
                  <Text style={[styles.unitButtonText, displayUnit === "lbs" && styles.unitButtonTextActive]}>
                    lbs.
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitButton, displayUnit === "kg" && styles.unitButtonActive]}
                  onPress={() => setDisplayUnit("kg")}
                >
                  <Text style={[styles.unitButtonText, displayUnit === "kg" && styles.unitButtonTextActive]}>
                    kg.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(!isTimed || secondsLeftMs === 0) && (
            <TouchableOpacity style={globalStyles.nextButtonWorkout} onPress={handleLogSet}>
              <Text style={globalStyles.nextButtonTextWorkout}>
                {currentSetIndex >= exercise.sets - 1
                  ? "Finish Exercise"
                  : `Log Set ${currentSetIndex + 1} of ${exercise.sets}`}
              </Text>
            </TouchableOpacity>
          )}

          <View style={globalStyles.streakContainer}>
            <Image style={{ height: 74, width: 75 }} source={icons.blueStreak} />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  weightAdjusterContainer: { alignItems: "center", marginTop: 10, marginBottom: 20, minHeight: 220 },
  suggestedText: { fontFamily: "poppins-medium", fontSize: 16, color: "rgba(255, 255, 255, 0.8)", marginBottom: 10, height: 30 },
  adjustmentIndicatorText: { fontFamily: "poppins-semibold", fontSize: 24, color: "#8AFFF9", marginBottom: 10, height: 30 },
  adjusterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  adjusterButton: { paddingHorizontal: 20 },
  adjusterButtonText: { fontFamily: "poppins-light", fontSize: 60, color: "white" },
  weightDisplay: { width: 70, height: 70, borderRadius: 30, backgroundColor: "rgba(255, 255, 255, 0.15)", justifyContent: "center", alignItems: "center", marginHorizontal: 15 },
  weightDisplayText: { fontFamily: "poppins-light", fontSize: 36, color: "white" },
  currentSetIndicator: { fontFamily: "poppins-semibold", fontSize: 18, color: "white", textAlign: "center", marginTop: 20, opacity: 0.8 },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 20,
    padding: 4,
    marginTop: 15,
  },
  unitButton: { paddingVertical: 8, paddingHorizontal: 25, borderRadius: 18 },
  unitButtonActive: { backgroundColor: "white" },
  unitButtonText: { fontFamily: "poppins-semibold", fontSize: 14, color: "white" },
  unitButtonTextActive: { color: "#271293" },
  perQualifier: { fontFamily: "poppins-medium", fontSize: 14, color: "rgba(255, 255, 255, 0.85)", textAlign: "center", marginTop: 4 },
  nextButtonContainer: {},
});

export default ExerciseScreen;
