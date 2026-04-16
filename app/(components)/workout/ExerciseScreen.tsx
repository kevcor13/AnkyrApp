import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video, ResizeMode } from "expo-av";
import { styles as globalStyles } from "@/constants/styles";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CircularTimer from "@/components/CircularTimer";

interface PerformedSet { reps: number; weight: number; }

interface Exercise {
  exerciseName: string;
  phase: "warmup" | "workout" | "cooldown" | "challanges";
  videoUrl: string;
  sets: number;
  reps: string;
  restBetweenSeconds: number;
  recommendedWeight: number;
  performedSets: PerformedSet[];
  exerciseType?: "benchmark" | "accessory";
}

interface SetFeedback {
  outcomeFlag: "exceeded" | "hit" | "low" | null;
  nextWeight: number;
}

interface ExerciseScreenProps {
  exercise: Exercise;
  exerciseIndex: number;
  currentSetIndex: number;
  onSetUpdate: (exerciseIndex: number, setIndex: number, weight: number) => void;
  onSetLogged: () => void;
  aiMode?: boolean;
  currentPhase?: string | null;
  workoutLogId?: string | null;
  onWorkoutLogIdUpdate?: (id: string) => void;
  onPhaseTransition?: () => void;
  logWorkoutSet?: (
    userId: string,
    workoutLogId: string | null,
    exerciseName: string,
    setNumber: number,
    suggestedWeight: number,
    actualWeight: number,
    actualReps: number
  ) => Promise<any>;
}

const LBS_TO_KG_CONVERSION = 0.453592;

const OUTCOME_CONFIG = {
  exceeded: { dot: "#6EF08B", text: "↑ Weight goes up next session" },
  hit: { dot: "#AAAAAA", text: "✓ Weight is right" },
  low: { dot: "#FFD060", text: "↓ Weight adjusted down" },
};

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  exercise,
  exerciseIndex,
  currentSetIndex,
  onSetUpdate,
  onSetLogged,
  aiMode = true,
  currentPhase,
  workoutLogId,
  onWorkoutLogIdUpdate,
  onPhaseTransition,
  logWorkoutSet,
}) => {
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [displayUnit, setDisplayUnit] = useState<"lbs" | "kg">("lbs");
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState("");

  // First-time exercise guidance modal
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // AMRAP modal state
  const [showAmrapModal, setShowAmrapModal] = useState(false);
  const [amrapReps, setAmrapReps] = useState(8);
  const [isSubmittingSet, setIsSubmittingSet] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Per-set feedback from backend
  const [setFeedback, setSetFeedback] = useState<Record<number, SetFeedback>>({});

  // AI-suggested weights per set index (updated from backend responses)
  const [aiSuggestedWeights, setAiSuggestedWeights] = useState<Record<number, number>>({});

  const { userData } = useGlobal();
  const theme = userData?.defaultTheme;

  const recommendedLbs = Number(exercise.recommendedWeight ?? 0);

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
    setIsEditingWeight(false);
  }, [exercise.exerciseName, currentSetIndex, recommendedLbs]);

  // Reset feedback and suggested weights when exercise changes
  useEffect(() => {
    setSetFeedback({});
    setAiSuggestedWeights({});
  }, [exercise.exerciseName]);

  // Check if user has seen this exercise before; show guidance modal if not
  useEffect(() => {
    if (!userData?._id || isBodyweight || isTimed) return;
    const checkSeen = async () => {
      const key = `@seenExercises_${userData._id}`;
      const stored = await AsyncStorage.getItem(key);
      const seen: string[] = stored ? JSON.parse(stored) : [];
      if (!seen.includes(exercise.exerciseName)) {
        setIsFirstTime(true);
        setShowFirstTimeModal(true);
      } else {
        setIsFirstTime(false);
        setShowFirstTimeModal(false);
      }
    };
    checkSeen();
  }, [exercise.exerciseName, userData?._id]);

  // Preload AMRAP reps from exercise target when set changes
  useEffect(() => {
    const match = exercise.reps.match(/(\d+)/);
    setAmrapReps(match ? parseInt(match[1], 10) : 8);
  }, [currentSetIndex, exercise.reps]);

  const isWarmup = exercise.phase === "warmup";
  const isCooldown = exercise.phase === "cooldown";
  const isBodyweight = recommendedLbs === 0;
  const isTimed = /\bseconds?\b/i.test(exercise.reps);
  const isDumbbell = /dumbbell/i.test(exercise.exerciseName);

  // Whether to show the AMRAP popup for this exercise/phase
  const shouldShowAmrap =
    aiMode &&
    !!logWorkoutSet &&
    currentPhase !== "shadow" &&
    currentPhase != null &&
    exercise.phase === "workout" &&
    !isTimed;

  const adjustWeight = (amount: number) => {
    const currentWeight = exercise.performedSets[currentSetIndex]?.weight;
    const baseWeight =
      typeof currentWeight === "number" &&
        (currentWeight > 0 || (currentWeight === 0 && recommendedLbs === 0))
        ? currentWeight
        : recommendedLbs;
    const newWeight = Math.max(0, baseWeight + amount);
    onSetUpdate(exerciseIndex, currentSetIndex, newWeight);
    setHasAdjusted(true);
  };

  const handleWeightDisplayPress = () => {
    setWeightInputValue(String(displayWeight));
    setIsEditingWeight(true);
  };

  const handleWeightInputSubmit = () => {
    const parsed = parseFloat(weightInputValue);
    if (!isNaN(parsed) && parsed > 0) {
      const inLbs = displayUnit === "kg"
        ? Math.round(parsed / LBS_TO_KG_CONVERSION)
        : Math.round(parsed);
      onSetUpdate(exerciseIndex, currentSetIndex, inLbs);
      setHasAdjusted(true);
    }
    setIsEditingWeight(false);
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
      : Math.round(weightInLbs);

  const adjustmentAmountLbs = weightInLbs - recommendedLbs;
  const displayAdjustmentAmount =
    displayUnit === "kg"
      ? Math.round(adjustmentAmountLbs * LBS_TO_KG_CONVERSION)
      : adjustmentAmountLbs;

  // --- Timer logic ---
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const totalSecondsRef = useRef<number>(0);

  useEffect(() => {
    if (isTimed) {
      const match = exercise.reps.match(/(\d+(?:\.\d+)?)\s*seconds?/i);
      const secs = match ? Math.ceil(parseFloat(match[1])) : 0;
      totalSecondsRef.current = secs;
      setSecondsLeft(secs);
      setTimerActive(false);
      setTimerStarted(false);
      startTimeRef.current = null;
    } else {
      setSecondsLeft(0);
      setTimerActive(false);
      setTimerStarted(false);
    }
  }, [exercise.reps, exercise.exerciseName, currentSetIndex, isTimed]);

  useEffect(() => {
    if (!timerActive || !isTimed) return;
    const id = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalSecondsRef.current - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) setTimerActive(false);
    }, 100);
    return () => clearInterval(id);
  }, [timerActive, isTimed]);

  const handleStartTimer = () => {
    if (!timerStarted) {
      startTimeRef.current = Date.now();
      setTimerActive(true);
      setTimerStarted(true);
    }
  };

  // --- Log set button handler ---
  const handleLogSet = () => {
    if (shouldShowAmrap) {
      setSubmitError(null);
      setShowAmrapModal(true);
    } else {
      onSetLogged();
    }
  };

  // --- AMRAP confirm handler ---
  const handleConfirmReps = async () => {
    if (!logWorkoutSet || !userData?._id) {
      setShowAmrapModal(false);
      onSetLogged();
      return;
    }

    setIsSubmittingSet(true);
    setSubmitError(null);

    const suggestedWeight = aiSuggestedWeights[currentSetIndex] ?? recommendedLbs;
    const actualWeight = weightInLbs;

    try {
      const result = await logWorkoutSet(
        userData._id,
        workoutLogId ?? null,
        exercise.exerciseName,
        currentSetIndex + 1,
        suggestedWeight,
        actualWeight,
        amrapReps
      );

      if (result?.workoutLogId && onWorkoutLogIdUpdate) {
        onWorkoutLogIdUpdate(result.workoutLogId);
      }

      if (result?.outcomeFlag !== undefined) {
        setSetFeedback(prev => ({
          ...prev,
          [currentSetIndex]: {
            outcomeFlag: result.outcomeFlag,
            nextWeight: result.nextWeight ?? suggestedWeight,
          },
        }));
      }

      // Update next set's suggested weight with backend recommendation
      if (result?.nextWeight && currentSetIndex + 1 < exercise.sets) {
        const nextIdx = currentSetIndex + 1;
        setAiSuggestedWeights(prev => ({ ...prev, [nextIdx]: result.nextWeight }));
        onSetUpdate(exerciseIndex, nextIdx, result.nextWeight);
      }

      if (result?.phaseTransition && onPhaseTransition) {
        onPhaseTransition();
      }

      setShowAmrapModal(false);
      onSetLogged();
    } catch {
      setSubmitError("Couldn't save this set. Check your connection and try again.");
    } finally {
      setIsSubmittingSet(false);
    }
  };

  // --- Skip AMRAP (proceed without calling API) ---
  const handleSkipAmrap = () => {
    setShowAmrapModal(false);
    onSetLogged();
  };

  // --- Mark exercise as seen and close first-time modal ---
  const handleDismissFirstTimeModal = async () => {
    if (userData?._id) {
      const key = `@seenExercises_${userData._id}`;
      const stored = await AsyncStorage.getItem(key);
      const seen: string[] = stored ? JSON.parse(stored) : [];
      if (!seen.includes(exercise.exerciseName)) {
        seen.push(exercise.exerciseName);
        await AsyncStorage.setItem(key, JSON.stringify(seen));
      }
    }
    setIsFirstTime(false);
    setShowFirstTimeModal(false);
  };

  const repsText = exercise.reps ?? "";
  const perMatch = repsText.match(/\bper\s+.+/i);
  const isPer = !!perMatch && !isTimed;
  const repsNumberMatch = repsText.match(/(\d+(?:\.\d+)?)/);
  const repsNumber = repsNumberMatch ? repsNumberMatch[1] : repsText;
  const perPhrase = perMatch ? perMatch[0] : "";

  const previousFeedback = currentSetIndex > 0 ? setFeedback[currentSetIndex - 1] : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={globalStyles.header}>
        <Video
          source={{ uri: exercise.videoUrl }}
          style={{ width: "100%", height: "100%" }}
          shouldPlay={true}
          isLooping
          isMuted={true}
          resizeMode={ResizeMode.COVER}
          useNativeControls={false}
        />
      </View>
      <LinearGradient
        colors={
          isWarmup
            ? ["#000000", "#6C4A23"]
            : isCooldown
              ? ["#A12287", "#1F059D"]
              : theme
                ? ["#FF0509", "#271293"]
                : ["#000000", "#272727"]
        }
        style={globalStyles.gradientContainer}
      >
        <ScrollView style={globalStyles.workoutCard}>
          <View style={localStyles.exerciseNameRow}>
            <Text style={[globalStyles.exerciseNameMain, { flex: 1 }]}>{exercise.exerciseName}</Text>
            {!isFirstTime && !isTimed && !isBodyweight && (
              <TouchableOpacity
                onPress={() => setShowFirstTimeModal(true)}
                style={localStyles.infoButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={localStyles.infoButtonText}>ⓘ</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={globalStyles.repsContainer}>
            {isTimed ? (
              <View className="flex-1">
                <Text style={globalStyles.repsSetsMain}></Text>
              </View>
            ) : isPer ? (
              <>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
                  <Text style={globalStyles.repsSetsMain}>{repsNumber}</Text>
                  <Text style={globalStyles.repsLabel}> reps</Text>
                </View>
              </>
            ) : (
              <>
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 20 }}>
                    <Text style={globalStyles.repsSetsMain}>Set</Text>
                    <Text style={globalStyles.repsSetsMain}>{currentSetIndex + 1} of {exercise.sets}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 5 }}>
                    <Text style={globalStyles.repsSetsMain}>Target Reps</Text>
                    <Text style={globalStyles.repsSetsMain}>{repsText}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {!isTimed && isPer ? (
            <Text style={localStyles.perQualifier}>{perPhrase}</Text>
          ) : null}

          {isTimed ? (
            <View style={localStyles.timerSection}>
              <CircularTimer
                secondsLeft={secondsLeft}
                totalSeconds={totalSecondsRef.current}
                timerStarted={timerStarted}
                onStart={handleStartTimer}
                onSkip={() => { setSecondsLeft(0); setTimerActive(false); }}
              />
            </View>
          ) : null}

          {!isTimed && recommendedLbs === 0 ? (
            <Text style={globalStyles.bodyweightText}>Bodyweight</Text>
          ) : null}

          {!isTimed && recommendedLbs > 0 ? (
            <View style={localStyles.weightAdjusterContainer}>
              {hasAdjusted && displayAdjustmentAmount !== 0 ? (
                <Text style={localStyles.adjustmentIndicatorText}>
                  {displayAdjustmentAmount > 0 ? `+${displayAdjustmentAmount}` : displayAdjustmentAmount}
                  <Text style={{ fontSize: 18 }}> {displayUnit}</Text>
                </Text>
              ) : (
                <Text style={localStyles.suggestedText}>suggested:</Text>
              )}
              <View style={{ backgroundColor: "rgba(24, 21, 30, 0.47)", padding: 20, paddingHorizontal: 50, borderRadius: 45 }}>
                <View>
                  <View style={localStyles.adjusterRow}>
                    <TouchableOpacity onPress={() => adjustWeight(-5)} style={localStyles.adjusterButton}>
                      <Text style={localStyles.adjusterButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={localStyles.weightDisplay}
                      onPress={handleWeightDisplayPress}
                      activeOpacity={0.7}
                    >
                      {isEditingWeight ? (
                        <TextInput
                          style={localStyles.weightDisplayText}
                          value={weightInputValue}
                          onChangeText={setWeightInputValue}
                          keyboardType="numeric"
                          autoFocus
                          selectTextOnFocus
                          onBlur={handleWeightInputSubmit}
                          onSubmitEditing={handleWeightInputSubmit}
                          textAlign="center"
                        />
                      ) : (
                        <Text style={localStyles.weightDisplayText}>{displayWeight}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => adjustWeight(5)} style={localStyles.adjusterButton}>
                      <Text style={localStyles.adjusterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={localStyles.unitSelectorRow}>
                    {isDumbbell && (
                      <Text style={localStyles.perSideLabel}>per</Text>
                    )}
                    <View style={localStyles.unitSelector}>
                      <TouchableOpacity
                        style={[localStyles.unitButton, displayUnit === "lbs" && localStyles.unitButtonActive]}
                        onPress={() => setDisplayUnit("lbs")}
                      >
                        <Text style={[localStyles.unitButtonText, displayUnit === "lbs" && localStyles.unitButtonTextActive]}>
                          lbs.
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[localStyles.unitButton, displayUnit === "kg" && localStyles.unitButtonActive]}
                        onPress={() => setDisplayUnit("kg")}
                      >
                        <Text style={[localStyles.unitButtonText, displayUnit === "kg" && localStyles.unitButtonTextActive]}>
                          kg.
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isDumbbell && (
                      <Text style={localStyles.perSideLabel}>side</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* Previous set feedback row */}
          {previousFeedback?.outcomeFlag && OUTCOME_CONFIG[previousFeedback.outcomeFlag] ? (
            <View style={localStyles.feedbackRow}>
              <View style={[localStyles.feedbackDot, { backgroundColor: OUTCOME_CONFIG[previousFeedback.outcomeFlag].dot }]} />
              <Text style={[localStyles.feedbackText, { color: OUTCOME_CONFIG[previousFeedback.outcomeFlag].dot }]}>
                {OUTCOME_CONFIG[previousFeedback.outcomeFlag].text}
              </Text>
            </View>
          ) : null}

          {/* Shadow mode cue */}
          {currentPhase === "shadow" && exercise.phase === "workout" && !isTimed ? (
            <View style={localStyles.shadowCue}>
              <Text style={localStyles.shadowCueText}>
                Do {repsNumber} reps at this weight. Focus on your form, not how heavy it feels.
              </Text>
            </View>
          ) : null}

          {(!isTimed || secondsLeft === 0) && (
            <TouchableOpacity style={globalStyles.nextButtonWorkout} onPress={handleLogSet}>
              <Text style={globalStyles.nextButtonTextWorkout}>
                {currentSetIndex >= exercise.sets - 1
                  ? "Finish Exercise"
                  : `Log Set ${currentSetIndex + 1} of ${exercise.sets}`}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>

      {/* First-Time Exercise Guidance Modal */}
      <Modal
        visible={showFirstTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => isFirstTime ? handleDismissFirstTimeModal() : setShowFirstTimeModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>First Time? Start Light</Text>
            <Text style={[localStyles.modalSubtitle, { textAlign: "center", marginBottom: 24 }]}>
              {`Pick a weight you can comfortably do 8 reps for ${exercise.sets} sets.\nThe app will adjust from there based on your performance.`}
            </Text>
            <TouchableOpacity
              style={localStyles.confirmButton}
              onPress={isFirstTime ? handleDismissFirstTimeModal : () => setShowFirstTimeModal(false)}
            >
              <Text style={localStyles.confirmButtonText}>
                {isFirstTime ? "Got it" : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AMRAP Modal */}
      <Modal
        visible={showAmrapModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipAmrap}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>How many reps did you complete?</Text>
            <Text style={localStyles.modalSubtitle}>Set {currentSetIndex + 1} of {exercise.sets}</Text>

            <View style={localStyles.amrapRow}>
              <TouchableOpacity
                style={localStyles.amrapButton}
                onPress={() => setAmrapReps(prev => Math.max(1, prev - 1))}
                disabled={isSubmittingSet}
              >
                <Text style={localStyles.amrapButtonText}>-</Text>
              </TouchableOpacity>
              <View style={localStyles.amrapValueBox}>
                <Text style={localStyles.amrapValueText}>{amrapReps}</Text>
              </View>
              <TouchableOpacity
                style={localStyles.amrapButton}
                onPress={() => setAmrapReps(prev => Math.min(30, prev + 1))}
                disabled={isSubmittingSet}
              >
                <Text style={localStyles.amrapButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {submitError ? (
              <Text style={localStyles.errorText}>{submitError}</Text>
            ) : null}

            <TouchableOpacity
              style={[localStyles.confirmButton, isSubmittingSet && { opacity: 0.6 }]}
              onPress={handleConfirmReps}
              disabled={isSubmittingSet}
            >
              {isSubmittingSet ? (
                <ActivityIndicator color="#271293" />
              ) : (
                <Text style={localStyles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkipAmrap} disabled={isSubmittingSet}>
              <Text style={localStyles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  exerciseNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoButton: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center", marginTop: 4, marginRight: 4, flexShrink: 0 },
  infoButtonText: { fontFamily: "Poppins-Medium", fontSize: 15, color: "rgba(255,255,255,0.5)" },
  weightAdjusterContainer: { alignItems: "center", marginTop: 30, marginBottom: 20, minHeight: 220, },
  suggestedText: { fontFamily: "poppins-medium", fontSize: 16, color: "rgba(255, 255, 255, 0.8)", marginBottom: 10, height: 30 },
  adjustmentIndicatorText: { fontFamily: "poppins-semibold", fontSize: 24, color: "#8AFFF9", marginBottom: 10, height: 30 },
  adjusterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  adjusterButton: { paddingHorizontal: 20 },
  adjusterButtonText: { fontFamily: "poppins-light", fontSize: 40, color: "white" },
  weightDisplay: { width: 70, height: 70, borderRadius: 30, backgroundColor: "#18151E", justifyContent: "center", alignItems: "center", marginHorizontal: 15 },
  weightDisplayText: { fontFamily: "poppins-light", fontSize: 36, color: "white" },
  unitSelectorRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 15, gap: 8 },
  perSideLabel: { fontFamily: "poppins-medium", fontSize: 13, color: "rgba(255,255,255,0.45)" },
  unitSelector: { flexDirection: "row", backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: 20, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  unitButton: { paddingVertical: 8, paddingHorizontal: 25, borderRadius: 18 },
  unitButtonActive: { backgroundColor: "white" },
  unitButtonText: { fontFamily: "poppins-semibold", fontSize: 14, color: "white" },
  unitButtonTextActive: { color: "#271293" },
  perQualifier: { fontFamily: "poppins-medium", fontSize: 14, color: "rgba(255, 255, 255, 0.85)", textAlign: "center", marginTop: 4 },
  timerSection: { minHeight: 100, alignItems: "center", justifyContent: "center", marginTop: -20, marginBottom: 12, paddingHorizontal: 20, paddingVertical: 10 },
  feedbackRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 6, marginBottom: 4, gap: 8 },
  feedbackDot: { width: 8, height: 8, borderRadius: 4 },
  feedbackText: { fontFamily: "Poppins-Medium", fontSize: 13 },
  shadowCue: { marginHorizontal: 20, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "rgba(100,149,237,0.18)", borderWidth: 1, borderColor: "rgba(100,149,237,0.4)" },
  shadowCueText: { fontFamily: "Poppins-Medium", fontSize: 13, color: "#A8C7FA", textAlign: "center" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  modalCard: { width: "100%", backgroundColor: "#1A1A2E", borderRadius: 24, padding: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  modalTitle: { fontFamily: "Poppins-SemiBold", fontSize: 18, color: "white", textAlign: "center", marginBottom: 4 },
  modalSubtitle: { fontFamily: "Poppins-Medium", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 28 },
  amrapRow: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 28 },
  amrapButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  amrapButtonText: { fontFamily: "Poppins-Light", fontSize: 32, color: "white", lineHeight: 40 },
  amrapValueBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(138,255,249,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "rgba(138,255,249,0.4)" },
  amrapValueText: { fontFamily: "Poppins-SemiBold", fontSize: 38, color: "#8AFFF9" },
  errorText: { fontFamily: "Poppins-Medium", fontSize: 13, color: "#FF6B6B", textAlign: "center", marginBottom: 12 },
  confirmButton: { width: "100%", backgroundColor: "#8AFFF9", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 14 },
  confirmButtonText: { fontFamily: "Poppins-SemiBold", fontSize: 16, color: "#271293" },
  skipText: { fontFamily: "Poppins-Medium", fontSize: 14, color: "rgba(255,255,255,0.45)" },
});

export default ExerciseScreen;
