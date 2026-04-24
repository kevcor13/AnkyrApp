import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import icons from "@/constants/icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WorkoutLogDetail, { IWorkoutLog } from "@/components/WorkoutLogDetail";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  ZoomIn,
} from "react-native-reanimated";
import images from "@/constants/images";

const { width } = Dimensions.get("window");

// Badge map matching WorkoutLogDetail logic
const getBadgeImage = (xp: number) => {
  if (xp >= 30000) return images.Olympian;
  if (xp >= 20000) return images.titan;
  if (xp >= 12000) return images.skipper;
  if (xp >= 5000)  return images.pilot;
  if (xp >= 1000)  return images.Private;
  return images.novice;
};

// Group exercises by workout name
const groupExercises = (workout: IWorkoutLog | null) => {
  if (!workout) return [];
  return [{ name: workout.workoutName, exercises: workout.exercises }];
};

const EndWorkoutScreen = () => {
  const params = useLocalSearchParams<{
    previousStreak?: string;
    currentStreak?: string;
    xpEarned?: string;
    workoutName?: string;
    phaseAdvanced?: string;
  }>();

  const { userData, userGameData, loggedWorkouts, submitWorkoutFeedback, fetchLoggedWorkouts, fetchGameData, fetchUserData, fetchWorkout } = useGlobal() as any;

  const [completedWorkout, setCompletedWorkout] = useState<IWorkoutLog | null>(null);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [feeling, setFeeling] = useState<string | null>(null);

  useEffect(() => {
    const prevStreak = params.previousStreak
      ? parseInt(params.previousStreak, 10)
      : (userGameData?.streak || 1) - 1;
    const currStreak = params.currentStreak
      ? parseInt(params.currentStreak, 10)
      : userGameData?.streak || 0;
    const xp = params.xpEarned ? parseInt(params.xpEarned, 10) : 0;
    setPreviousStreak(prevStreak);
    setCurrentStreak(currStreak);
    setXpEarned(xp);
  }, [params, userGameData]);

  useEffect(() => {
    if (loggedWorkouts && loggedWorkouts.length > 0) {
      const sorted = [...loggedWorkouts].sort(
        (a: IWorkoutLog, b: IWorkoutLog) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setCompletedWorkout(sorted[0]);
    }
  }, [loggedWorkouts]);

  const streakIncrease = currentStreak - previousStreak;
  const durationMins = completedWorkout
    ? Math.max(1, Math.round(completedWorkout.durationSeconds / 60))
    : 0;
  // Rough calorie estimate: ~8 cal/min
  const calories = Math.round(durationMins * 8);
  const totalXP = userGameData?.points || 0;
  const badgeImage = getBadgeImage(totalXP);
  const groups = groupExercises(completedWorkout);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0010" }}>
      {/* Full-screen gradient background */}
      <LinearGradient
        colors={["#000000", "#272727"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow blobs 
      <View style={styles.glowBlobTop} />
      <View style={styles.glowBlobBottom} />
*/}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <Animated.View entering={FadeInDown.delay(0).duration(700)} style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.yourText}>YOUR</Text>
              <Text style={styles.workoutText}>WORKOUT</Text>
            </View>
            <Animated.View entering={ZoomIn.delay(300).duration(500)}>
              <Image source={icons.blueStreak} style={styles.heroIcon} />
            </Animated.View>
          </View>

          {/* Duration + Calories */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{durationMins}</Text>
              <Text style={styles.statUnit}>mins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>~{calories}</Text>
              <Text style={styles.statUnit}>calories</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ── XP + BADGE GLASS CARD ── */}
        <Animated.View entering={FadeInDown.delay(350).duration(600)} style={styles.xpCardWrapper}>
          <BlurView intensity={40} tint="dark" style={styles.xpCard}>
            <View style={styles.xpCardInner}>
              <Image source={badgeImage} style={styles.badgeImg} resizeMode="contain" />
              <View style={styles.xpTextBlock}>
                <Text style={styles.xpCardLabel}>TOTAL XP EARNED</Text>
                <View style={styles.xpValueRow}>
                  <Text style={styles.xpPlus}>+</Text>
                  <Text style={styles.xpAmount}>{xpEarned > 0 ? xpEarned : completedWorkout?.points ?? 0}</Text>
                  <Text style={styles.xpUnit}>XP</Text>
                </View>
              </View>

              {/* Streak pill — only if streak increased */}
              {streakIncrease > 0 && (
                <Animated.View entering={ZoomIn.delay(500)} style={styles.streakPill}>
                  <Text style={styles.streakPillText}>+ {currentStreak}</Text>
                </Animated.View>
              )}
            </View>
          </BlurView>
        </Animated.View>

        {/* ── PHASE ADVANCEMENT BANNER ── */}
        {params.phaseAdvanced === "true" && (
          <Animated.View entering={ZoomIn.delay(400).duration(500)} style={styles.phaseAdvanceBanner}>
            <Text style={styles.phaseAdvanceBannerTitle}>You've entered Grind mode!</Text>
            <Text style={styles.phaseAdvanceBannerSub}>Progressive overload is now active. Weights will increase as you get stronger.</Text>
          </Animated.View>
        )}

        {/* ── POST-WORKOUT SURVEY ── */}
        <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.surveyCard}>
          <Text style={styles.surveyLabel}>How did your workout feel?</Text>
          <View style={styles.surveyRow}>
            {(["too_easy", "good", "too_hard"] as const).map((option) => {
              const labels: Record<string, string> = { too_easy: "Too Easy", good: "Felt Good", too_hard: "Too Much" };
              const selected = feeling === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.surveyBtn, selected && styles.surveyBtnSelected]}
                  onPress={() => setFeeling(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.surveyBtnText, selected && styles.surveyBtnTextSelected]}>
                    {labels[option]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ── FINISH BUTTON (iOS 26 liquid glass) ── */}
        <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.finishWrapper}>
          <TouchableOpacity
            onPress={async () => {
              if (feeling && userData?._id) {
                const workoutName = params.workoutName || completedWorkout?.workoutName || "Completed Workout";
                try {
                  await submitWorkoutFeedback(userData._id, feeling, workoutName);
                } catch (e) {
                  console.error("Failed to submit workout feedback:", e);
                }
              }
              // Refresh all global state so every page reflects the completed workout
              try {
                const token = await AsyncStorage.getItem("token");
                await Promise.all([
                  fetchLoggedWorkouts(userData?._id),
                  fetchGameData(token, userData?._id),
                  fetchWorkout(token, userData?._id),
                  fetchUserData(token),
                ]);
              } catch (e) {
                console.error("Failed to refresh app state:", e);
              }
              router.navigate("/(tabs)/home");
            }}
            activeOpacity={0.85}
            style={styles.finishTouchable}
          >
            <BlurView intensity={60} tint="light" style={styles.finishBlur}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.28)", "rgba(255,255,255,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.finishGradient}
              >
                <Text style={styles.finishText}>Finish</Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* ── YOU DID ── */}
        {completedWorkout && (
          <Animated.View entering={SlideInDown.delay(600).duration(600)}>
            <Text style={styles.youDidLabel}>You did:</Text>

            {groups.map((group, gi) => (
              <View key={gi} style={styles.groupBlock}>
                {/* Group header */}
                <Text style={styles.groupName}>{group.name.toUpperCase()}</Text>

                {/* Exercise cards */}
                {group.exercises.map((exercise, ei) => (
                  <Animated.View
                    key={exercise._id || ei}
                    entering={FadeInUp.delay(700 + ei * 80).duration(400)}
                  >
                    <BlurView intensity={25} tint="dark" style={styles.exerciseCard}>
                      <LinearGradient
                        colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.03)"]}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.exerciseTop}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={styles.earnedBadge}>
                          <Text style={styles.earnedLabel}>EARNED</Text>
                          <View style={styles.earnedXpRow}>
                            <Text style={styles.earnedXpValue}>{exercise.xp ?? 5}</Text>
                            <Text style={styles.earnedXpUnit}> XP</Text>
                          </View>
                        </View>
                      </View>
                      {exercise.sets && exercise.sets.length > 0 && (
                        <Text style={styles.setsText}>
                          {`${exercise.sets[0].weight} lbs × ${exercise.sets[0].reps} reps × ${exercise.sets.length} sets`}
                        </Text>
                      )}
                    </BlurView>
                  </Animated.View>
                ))}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Bottom icon 
        <Animated.View entering={FadeIn.delay(900)} style={styles.bottomIcon}>
          <Image source={icons.blueStreak} style={styles.bottomStreakIcon} />
        </Animated.View>
        */}
      </ScrollView>
    </View>
  );
};

export default EndWorkoutScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 64 : 40,
    paddingBottom: 60,
  },

  // Ambient glow blobs
  glowBlobTop: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#FF050930",
  },
  glowBlobBottom: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#6B21A820",
  },

  // Hero
  heroSection: {
    paddingHorizontal: 28,
    marginBottom: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  yourText: {
    fontFamily: "poppins-light",
    fontSize: 52,
    color: "#FFFFFF",
    letterSpacing: -1,
    lineHeight: 56,
  },
  workoutText: {
    fontFamily: "poppins-light",
    fontSize: 52,
    color: "#FFFFFF",
    letterSpacing: -2,
    lineHeight: 56,
    marginTop: -6,
  },
  heroIcon: {
    width: 44,
    height: 44,
    marginTop: 8,
    tintColor: "#38FFF5",
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 0,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  statNumber: {
    fontFamily: "SpaceGrotesk-Bold",
    fontSize: 48,
    color: "#6477E7",
    letterSpacing: -2,
    lineHeight: 60,
  },
  statUnit: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#6477E7",
    opacity: 0.85,
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: "rgba(56,255,245,0.3)",
    marginHorizontal: 20,
  },

  // XP glass card
  xpCardWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1B191E",
    //borderWidth: 1,
    //borderColor: "rgba(255,255,255,0.15)",
  },
  xpCard: {
    borderRadius: 20,
  },
  xpCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 16,
  },
  badgeImg: {
    width: 64,
    height: 64,
  },
  xpTextBlock: {
    flex: 1,
  },
  xpCardLabel: {
    fontFamily: "raleway-semibold",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  xpValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  xpPlus: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: "#6477E7",
  },
  xpAmount: {
    fontFamily: "Poppins-Bold",
    fontSize: 36,
    color: "#6477E7",
    letterSpacing: -1,
  },
  xpUnit: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#6477E7",
    opacity: 0.75,
    marginLeft: 4,
    marginBottom: 2,
  },
  streakPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  streakPillText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },

  // Phase advancement banner
  phaseAdvanceBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "rgba(56,255,245,0.1)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#38FFF5",
    padding: 20,
    alignItems: "center",
  },
  phaseAdvanceBannerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#38FFF5",
    textAlign: "center",
    marginBottom: 6,
  },
  phaseAdvanceBannerSub: {
    fontFamily: "poppins-regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },

  // Survey
  surveyCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#1B191E",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  surveyLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 14,
    textAlign: "center",
  },
  surveyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  surveyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  surveyBtnSelected: {
    backgroundColor: "rgba(100,119,231,0.3)",
    borderColor: "#6477E7",
  },
  surveyBtnText: {
    fontFamily: "poppins-regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  surveyBtnTextSelected: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },

  // Finish button
  finishWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#152163",
  },
  finishTouchable: {
    borderRadius: 18,
    overflow: "hidden",
  },
  finishBlur: {
    borderRadius: 18,
  },
  finishGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  finishText: {
    fontFamily: "Poppins-Light",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // You did section
  youDidLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    color: "#FFFFFF",
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  groupBlock: {
    marginBottom: 20,
  },
  groupName: {
    fontFamily: "Poppins-Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 10,
    marginTop: 4,
  },

  // Exercise cards
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  exerciseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  exerciseName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  earnedBadge: {
    alignItems: "flex-end",
  },
  earnedLabel: {
    fontFamily: "raleway-semibold",
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  earnedXpRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  earnedXpValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: "#38FFF5",
  },
  earnedXpUnit: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#38FFF5",
    marginLeft: 3,
    opacity: 0.8,
  },
  setsText: {
    fontFamily: "poppins-regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
  },

  // Bottom
  bottomIcon: {
    alignItems: "center",
    marginTop: 32,
  },
  bottomStreakIcon: {
    width: 32,
    height: 32,
    tintColor: "#38FFF5",
    opacity: 0.5,
  },
});