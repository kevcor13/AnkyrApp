import React, { useState } from "react";
import {
  Image,
  Modal,
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
  shadow: { label: "Shadow Mode", bg: "rgba(100,149,237,0.2)", border: "rgba(100,149,237,0.45)", text: "#A8C7FA" },
  grind:  { label: "Grind",       bg: "rgba(50,205,50,0.18)",  border: "rgba(50,205,50,0.45)",   text: "#6EF08B" },
};

const PHASE_INFO: Record<string, string> = {
  shadow: "You're in Shadow Mode. Focus on form over weight. Weights are set at 50% to build your movement foundation. No pressure — just move well.",
  grind:  "You're in Grind. Progressive overload is active on your main lifts. Push for personal records — weights go up when you exceed 12 reps.",
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
  const { userData, advancePhase } = useGlobal();
  const theme = userData?.defaultTheme;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const [showPhaseModal, setShowPhaseModal] = useState(false);

  return (
    <LinearGradient
      colors={["#000000", "#272727"]}
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
            <TouchableOpacity
              onPress={() => setShowPhaseModal(true)}
              style={[styles.phaseBadge, { backgroundColor: PHASE_BADGE[currentPhase].bg, borderColor: PHASE_BADGE[currentPhase].border }]}
              activeOpacity={0.75}
            >
              <Text style={[styles.phaseBadgeText, { color: PHASE_BADGE[currentPhase].text }]}>
                {PHASE_BADGE[currentPhase].label}  ⓘ
              </Text>
            </TouchableOpacity>
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
            <Text style={styles.statValue}>+{items.reduce((sum, item) => sum + (item.xp ?? 5), 0)}</Text>
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
                      activeOpacity={isDone ? 1 : 0.82}
                      disabled={isDone}
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
                          <Text style={styles.rewardValue}>{item.xp ?? 5}</Text>
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

      {/* Phase info modal */}
      {currentPhase && PHASE_INFO[currentPhase] ? (
        <Modal
          visible={showPhaseModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPhaseModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPhaseModal(false)}
          >
            <View style={[styles.phaseModalCard, { borderColor: PHASE_BADGE[currentPhase]?.border ?? "rgba(255,255,255,0.2)" }]}>
              <Text style={[styles.phaseModalTitle, { color: PHASE_BADGE[currentPhase]?.text ?? "#FFFFFF" }]}>
                {PHASE_BADGE[currentPhase]?.label}
              </Text>
              <Text style={styles.phaseModalBody}>{PHASE_INFO[currentPhase]}</Text>
              {currentPhase === "shadow" && (
                <TouchableOpacity
                  style={styles.phaseAdvanceBtn}
                  onPress={async () => {
                    if (userData?._id) await advancePhase(userData._id);
                    setShowPhaseModal(false);
                  }}
                >
                  <Text style={styles.phaseAdvanceBtnText}>I'm ready for Grind →</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowPhaseModal(false)} style={styles.phaseModalClose}>
                <Text style={styles.phaseModalCloseText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      ) : null}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  phaseModalCard: {
    backgroundColor: "#1B191E",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    width: "100%",
  },
  phaseModalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginBottom: 12,
  },
  phaseModalBody: {
    fontFamily: "poppins-regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    marginBottom: 20,
  },
  phaseAdvanceBtn: {
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#38FFF5",
    alignItems: "center",
    backgroundColor: "rgba(56,255,245,0.1)",
  },
  phaseAdvanceBtnText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#38FFF5",
  },
  phaseModalClose: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  phaseModalCloseText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
});

export default WorkoutSessionList;
