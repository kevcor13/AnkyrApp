import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import icons from "@/constants/icons";
import { useGlobal } from "@/context/GlobalProvider";
import type { WorkoutSessionItem } from "@/app/(components)/workout/workoutSession";

type WorkoutSessionListProps = {
  focus: string;
  items: WorkoutSessionItem[];
  completedCount: number;
  totalCount: number;
  canFinish: boolean;
  isFinishing: boolean;
  onSelectItem: (itemId: string) => void;
  onFinishWorkout: () => void;
  onEndWorkout: () => void;
  currentPhase?: string | null;
  phaseTransition?: boolean;
};

const phaseOrder: WorkoutSessionItem["phase"][] = ["warmup", "workout", "challanges"];

const phaseLabels: Record<WorkoutSessionItem["phase"], string> = {
  warmup: "Warm-Up",
  workout: "Main Workout",
  challanges: "Challenges",
};

const PHASE_BADGE: Record<string, { label: string; bg: string; border: string; text: string }> = {
  shadow:      { label: "Shadow Mode", bg: "rgba(100,149,237,0.2)",  border: "rgba(100,149,237,0.45)", text: "#A8C7FA" },
  calibration: { label: "Calibration",  bg: "rgba(255,180,0,0.18)",  border: "rgba(255,180,0,0.45)",   text: "#FFD060" },
  grind:       { label: "Grind",         bg: "rgba(50,205,50,0.18)",  border: "rgba(50,205,50,0.45)",   text: "#6EF08B" },
};

const WorkoutSessionList: React.FC<WorkoutSessionListProps> = ({
  focus,
  items,
  completedCount,
  totalCount,
  canFinish,
  isFinishing,
  onSelectItem,
  onFinishWorkout,
  onEndWorkout,
  currentPhase,
  phaseTransition,
}) => {
  const { userData } = useGlobal();
  const theme = userData?.defaultTheme;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <LinearGradient
      colors={theme ? ["#FF0509", "#271293"] : ["#000000", "#272727"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/** 
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onEndWorkout}
            activeOpacity={0.7}
          >
            <Image source={icons.halfArrow} style={styles.iconImage} />
          </TouchableOpacity>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onEndWorkout}
            activeOpacity={0.7}
          >
            <Image source={icons.stopButton} style={styles.iconImage} />
          </TouchableOpacity>
        </View>
        */}

        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>ACTIVE SESSION</Text>
          <Text style={styles.title}>{focus || "Workout"}</Text>
          <Text style={styles.summary}>
            {completedCount} of {totalCount} complete
          </Text>
          {currentPhase && PHASE_BADGE[currentPhase] ? (
            <View style={[styles.phaseBadge, { backgroundColor: PHASE_BADGE[currentPhase].bg, borderColor: PHASE_BADGE[currentPhase].border }]}>
              <Text style={[styles.phaseBadgeText, { color: PHASE_BADGE[currentPhase].text }]}>
                {PHASE_BADGE[currentPhase].label}
              </Text>
            </View>
          ) : null}
          {phaseTransition ? (
            <View style={styles.phaseTransitionBanner}>
              <Text style={styles.phaseTransitionText}>Phase complete! Full results after your session.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>PROGRESS</Text>
            <Text style={styles.statValue}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View>
            <Text style={styles.statLabel}>TOTAL XP</Text>
            <Text style={styles.statValue}>+{totalCount * 5}</Text>
          </View>
        </View>

        {phaseOrder.map((phase) => {
          const phaseItems = items.filter((item) => item.phase === phase);
          if (phaseItems.length === 0) return null;

          return (
            <View key={phase} style={styles.section}>
              <Text style={styles.sectionTitle}>{phaseLabels[phase]}</Text>
              <View style={styles.sectionCards}>
                {phaseItems.map((item) => {
                  const isDone = item.status === "done";
                  const detailText = item.isTimeBased
                    ? `${item.time ?? item.reps} sec`
                    : `${item.sets} sets / ${item.reps} reps`;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.itemCard, isDone && styles.itemCardDone]}
                      activeOpacity={0.82}
                      onPress={() => onSelectItem(item.id)}
                    >
                      <View style={styles.itemMain}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.exerciseName}</Text>
                          <View style={[styles.statusPill, isDone && styles.statusPillDone]}>
                            <Text style={[styles.statusText, isDone && styles.statusTextDone]}>
                              {isDone ? "DONE" : "START"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.itemMeta}>{detailText}</Text>
                      </View>

                      <View style={styles.rewardBox}>
                        <Text style={styles.rewardLabel}>REWARD</Text>
                        <View style={styles.rewardValueRow}>
                          <Text style={styles.rewardValue}>5</Text>
                          <Text style={styles.rewardUnit}>xp</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finishButton, !canFinish && styles.finishButtonDisabled]}
            onPress={onFinishWorkout}
            disabled={!canFinish || isFinishing}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>
              {isFinishing ? "Saving..." : "Finish Workout"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endButton}
            onPress={onEndWorkout}
            activeOpacity={0.75}
          >
            <Text style={styles.endButtonText}>End Workout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomDecoration}>
          <Image source={icons.blueStreak} style={styles.bottomDecorationImage} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 64,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
  },
  iconButton: {
    backgroundColor: "#1B191E",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22.5,
    height: 45,
    width: 45,
  },
  iconImage: {
    height: 24,
    width: 24,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#1B191E",
    borderRadius: 5,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
  heroSection: {
    marginTop: 28,
    marginHorizontal: 20,
  },
  eyebrow: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: "Raleway-Semibold",
    fontSize: 12,
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Raleway-Light",
    fontSize: 38,
    textTransform: "uppercase",
  },
  summary: {
    color: "#6477E7",
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginTop: 6,
  },
  statCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(27, 25, 30, 1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.65)",
    fontFamily: "Raleway-Semibold",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  statValue: {
    color: "#6477E7",
    fontFamily: "Poppins-SemiBold",
    fontSize: 30,
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    marginHorizontal: 20,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    marginBottom: 12,
  },
  sectionCards: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: "rgba(43, 34, 72, 0.40)",
    //borderWidth: 1,
    //borderColor: "rgba(138, 255, 249, 0.18)",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemCardDone: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  itemMain: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemName: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Light",
    fontSize: 17,
    flex: 1,
  },
  itemMeta: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: "Poppins",
    fontSize: 14,
    marginTop: 6,
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(87, 84, 92, 0.18)",
  },
  statusPillDone: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  statusText: {
    color: "#6477E7",
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  statusTextDone: {
    color: "#FFFFFF",
  },
  rewardBox: {
    alignItems: "flex-end",
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.14)",
  },
  rewardLabel: {
    color: "rgba(255, 255, 255, 0.62)",
    fontFamily: "Raleway-Semibold",
    fontSize: 11,
    letterSpacing: 1,
  },
  rewardValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  rewardValue: {
    color: "#6477E7",
    fontFamily: "Raleway-Semibold",
    fontSize: 24,
  },
  rewardUnit: {
    color: "#6477E7",
    fontFamily: "Raleway-Semibold",
    fontSize: 13,
    marginLeft: 3,
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  finishButton: {
    backgroundColor: "rgba(43, 34, 72, 0.4)",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    //borderWidth: 1,
    //borderColor: "rgba(138, 255, 249, 0.3)",
  },
  finishButtonDisabled: {
    opacity: 0.45,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  endButton: {
    backgroundColor: "#1B191e",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    //borderWidth: 1,
    //borderColor: "rgba(255, 255, 255, 0.14)",
  },
  endButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
  },
  bottomDecoration: {
    alignItems: "center",
    marginTop: 28,
  },
  bottomDecorationImage: {
    width: 70,
    height: 70,
    opacity: 0.9,
  },
  phaseBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  phaseBadgeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  phaseTransitionBanner: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,180,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,180,0,0.4)",
  },
  phaseTransitionText: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#FFD060",
  },
});

export default WorkoutSessionList;
