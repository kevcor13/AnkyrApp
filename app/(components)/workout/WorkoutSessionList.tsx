import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGlobal } from "@/context/GlobalProvider";
import type { WorkoutSessionItem } from "@/app/(components)/workout/workoutSession";
import AppIcon from "@/components/AppIcon";
import { router } from 'expo-router';
import GlassBackground from "@/components/GlassBackground";

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
  workoutDayLabel?: string;
};

const PHASE_BADGE: Record<string, { label: string; bg: string; border: string; text: string }> = {
  shadow: { label: "Shadow Mode", bg: "rgba(100,149,237,0.2)", border: "rgba(100,149,237,0.45)", text: "#A8C7FA" },
  grind: { label: "Grind", bg: "rgba(50,205,50,0.18)", border: "rgba(50,205,50,0.45)", text: "#6EF08B" },
};

const PHASE_INFO: Record<string, string> = {
  shadow: "You're in Shadow Mode. Focus on form over weight. Weights are set at 50% to build your movement foundation. No pressure — just move well.",
  grind: "You're in Grind. Progressive overload is active on your main lifts. Push for personal records — weights go up when you exceed 12 reps.",
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
  workoutDayLabel,
}) => {
  const { userData, advancePhase } = useGlobal();
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const pendingItems = items.filter(i => i.status !== 'done');
  const doneItems = items.filter(i => i.status === 'done');

  const remainingMins = pendingItems.reduce((sum, i) => {
    if (i.isTimeBased) return sum + Math.ceil((i.time ?? 30) / 60);
    return sum + (i.sets ?? 3) * 2;
  }, 0);

  return (
    <ImageBackground
      source={require('@/assets/images/SmokeDesignWRing.png')}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.closeButtonContainer}>
          <GlassBackground>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <AppIcon name="lessThan" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </GlassBackground>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.clockText}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <GlassBackground>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <AppIcon name="pencilIcon" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </GlassBackground>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            {workoutDayLabel ? (
              <Text style={styles.dayLabel}>{workoutDayLabel}</Text>
            ) : null}
            <Text style={styles.heroTitle}>{focus || 'Workout'}</Text>
            {/** 
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
             */}
            <Text style={styles.heroPercent}>{Math.round(progress * 100)}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
            </View>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.minsNumber}>{remainingMins}</Text>
            <Text style={styles.minsLabel}>mins left</Text>
          </View>
        </View>

        {phaseTransition ? (
          <View style={styles.phaseTransitionBanner}>
            <Text style={styles.phaseTransitionText}>Phase complete! Full results after your session.</Text>
          </View>
        ) : null}

        {/* Pending items */}
        {pendingItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>complete these sets:</Text>
            {pendingItems.map((item) => {
              const metaText = item.isTimeBased
                ? `${item.time ?? item.reps} sec`
                : `${item.sets} sets`;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.pendingCard}
                  activeOpacity={0.82}
                  onPress={() => onSelectItem(item.id)}
                >
                  <View style={styles.pendingCardLeft}>
                    <Text style={styles.pendingCardName}>{item.exerciseName}</Text>
                    <Text style={styles.pendingCardMeta}>{metaText}</Text>
                  </View>
                  <AppIcon name="upArrow" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Completed items */}
        {doneItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>completed:</Text>
            {doneItems.map((item) => (
              <View key={item.id} style={styles.doneCard}>
                <Text style={styles.doneCardName}>{item.exerciseName}</Text>
                <AppIcon name="checkMark" size={18} color="rgba(255,255,255,0.55)" />
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finishButton, !canFinish && styles.finishButtonDisabled]}
            onPress={onFinishWorkout}
            disabled={!canFinish || isFinishing}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>
              {isFinishing ? 'Saving...' : 'Finish Workout'}
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
            <View style={[styles.phaseModalCard, { borderColor: PHASE_BADGE[currentPhase]?.border ?? 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.phaseModalTitle, { color: PHASE_BADGE[currentPhase]?.text ?? '#FFFFFF' }]}>
                {PHASE_BADGE[currentPhase]?.label}
              </Text>
              <Text style={styles.phaseModalBody}>{PHASE_INFO[currentPhase]}</Text>
              {currentPhase === 'shadow' && (
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 48,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  closeButton: {
    width: 109,
    height: 50,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    marginBottom: 8,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 16,
  },
  dayLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Poppins-light',
    fontSize: 14,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-light',
    fontSize: 21,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroPercent: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 31,
    },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  heroRight: {
    alignItems: 'center',
  },
  minsNumber: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 91,
    lineHeight: 96,
  },
  minsLabel: {
    marginTop: -20,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
  },
  // Phase badge
  phaseBadge: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  phaseBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  phaseTransitionBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,180,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,180,0,0.4)',
  },
  phaseTransitionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#FFD060',
  },
  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 30,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-light',
    fontSize: 24,
    marginBottom: 14,
  },
  // Pending cards
  pendingCard: {
    backgroundColor: 'rgba(30,28,33,0.85)',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pendingCardLeft: {
    flex: 1,
  },
  pendingCardName: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pendingCardMeta: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Poppins-light',
    fontSize: 13,
  },
  // Done cards
  doneCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  doneCardName: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Footer
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  finishButton: {
    backgroundColor: 'rgba(43, 34, 72, 0.4)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.45,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  endButton: {
    backgroundColor: '#1B191e',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
  },
  // Phase modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  phaseModalCard: {
    backgroundColor: '#1B191E',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    width: '100%',
  },
  phaseModalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  phaseModalBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 20,
  },
  phaseAdvanceBtn: {
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38FFF5',
    alignItems: 'center',
    backgroundColor: 'rgba(56,255,245,0.1)',
  },
  phaseAdvanceBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#38FFF5',
  },
  phaseModalClose: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  phaseModalCloseText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default WorkoutSessionList;
