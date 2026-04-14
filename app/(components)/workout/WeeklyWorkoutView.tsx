import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoutineDay {
  day: string;
  focus?: string;
  timeEstimate?: number;
  warmup?: any[];
  workoutRoutine?: any[];
  cooldown?: any[];
  [key: string]: any;
}

interface WeekRow {
  key: string;
  label: string;
  routineDay: RoutineDay;
}

// Fixed date slot — built once from the calendar, never reorders
interface DateSlot {
  dateLabel: string;
  isToday: boolean;
  isPast: boolean;   // true for any slot before today
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CARD_HEIGHT = 82;
const CARD_MARGIN = 12;
const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getMondayOfCurrentWeek = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday;
};

const formatDateLabel = (date: Date): string => {
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  return `${month}\n${day}`;
};

const isRestDay = (routineDay: RoutineDay | undefined): boolean => {
  if (!routineDay) return true;
  const focus = String(routineDay.focus || "").trim().toLowerCase();
  const exercises = Array.isArray(routineDay.workoutRoutine) ? routineDay.workoutRoutine : [];
  return focus === "rest" || exercises.length === 0;
};

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

// ─── Draggable Row ────────────────────────────────────────────────────────────

interface DraggableRowProps {
  item: WeekRow;
  index: number;
  dateSlot: DateSlot;
  // UI-thread shared values — no React state, no runOnJS during drag
  activeIndexSV: SharedValue<number>;
  targetIndexSV: SharedValue<number>;
  // JS-thread callbacks — only called ONCE on drag start/end
  onDragStart: (index: number) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  item,
  index,
  dateSlot,
  activeIndexSV,
  targetIndexSV,
  onDragStart,
  onDragEnd,
}) => {
  const dragTranslateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);

  const isToday = dateSlot.isToday;
  const isPast = dateSlot.isPast;
  const isLocked = isPast;

  // ── All shift logic runs entirely on the UI thread via useDerivedValue ──
  // No React state, no useEffect, no runOnJS — pure Reanimated
  const shiftY = useDerivedValue(() => {
    const active = activeIndexSV.value;
    const target = targetIndexSV.value;

    // Not dragging, or this IS the dragged card → no shift
    if (active === -1 || active === index) return 0;

    // Locked cards never shift
    if (isLocked) return 0;

    const draggingDown = target > active;
    const draggingUp = target < active;

    if (draggingDown && index > active && index <= target) {
      return withSpring(-ITEM_HEIGHT, { damping: 40, stiffness: 400 });
    }
    if (draggingUp && index < active && index >= target) {
      return withSpring(ITEM_HEIGHT, { damping: 40, stiffness: 400 });
    }
    return withSpring(0, { damping: 40, stiffness: 400 });
  });

  // ── Gesture — target index calculated entirely on UI thread ──────────────
  const activePanGesture = Gesture.Pan()
    .activateAfterLongPress(180)
    .onBegin(() => {
      'worklet';
      activeIndexSV.value = index;
      targetIndexSV.value = index;
      dragTranslateY.value = 0;
      runOnJS(onDragStart)(index);
      scale.value = withSpring(1.04, { damping: 40, stiffness: 400 });
      shadowOpacity.value = withTiming(0.5, { duration: 150 });
    })
    .onChange((e) => {
      'worklet';
      dragTranslateY.value = e.translationY;
      // Target index calculated HERE on UI thread — zero React involvement
      const raw = index + Math.round(e.translationY / ITEM_HEIGHT);
      targetIndexSV.value = clamp(raw, 0, DAYS_OF_WEEK.length - 1);
    })
    .onFinalize(() => {
      'worklet';
      const toIndex = targetIndexSV.value;
      
      // Animate scale and shadow back
      scale.value = withTiming(1, { duration: 120 });
      shadowOpacity.value = withTiming(0, { duration: 120 });
      
      // Calculate final position offset
      const finalOffset = (toIndex - index) * ITEM_HEIGHT;
      
      // Smoothly animate to final position
      dragTranslateY.value = withTiming(finalOffset, { duration: 200 }, () => {
        // After animation completes, call JS to update state
        runOnJS(onDragEnd)(index, toIndex);
      });
    });

  const lockedGesture = Gesture.Pan().enabled(false);
  const panGesture = isLocked ? lockedGesture : activePanGesture;

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const isDragging = activeIndexSV.value === index;
    return {
      transform: [
        { translateY: isDragging ? dragTranslateY.value : shiftY.value },
        { scale: scale.value },
      ],
      zIndex: isDragging ? 100 : 0,
      shadowOpacity: shadowOpacity.value,
    };
  });

  const rest = isRestDay(item.routineDay);
  const focus = item.routineDay?.focus || "Rest";

  return (
    <View style={styles.rowWrapper}>
      {/* Date Column — completely static */}
      <View style={styles.dateColumn}>
        {isToday && <View style={styles.todayDot} />}
        <Text style={[styles.dateLabel, isToday && styles.dateLabelToday]}>
          {dateSlot.dateLabel}
        </Text>
      </View>

      {/* Divider — static */}
      <View style={styles.dividerLine} />

      {/* Animated card only */}
      <Animated.View style={[styles.cardAnimatedWrapper, cardAnimatedStyle]}>
        <View
          style={[
            styles.workoutCard,
            rest && styles.workoutCardRest,
            activeIndexSV.value === index && styles.workoutCardActive,
            isToday && styles.workoutCardToday,
            isLocked && !isToday && styles.workoutCardLocked,
          ]}
        >
          <View style={styles.cardInner}>
            <View style={styles.cardLeft}>
              {isPast && <Text style={styles.pastBadge}>PAST</Text>}
              <Text
                style={[
                  styles.focusText,
                  rest && styles.focusTextRest,
                  isLocked && !isToday && styles.focusTextLocked,
                ]}
                numberOfLines={1}
              >
                {focus}
              </Text>
              {!rest && item.routineDay.timeEstimate ? (
                <Text style={[
                  styles.timeText,
                  isLocked && !isToday && styles.timeTextLocked,
                ]}>
                  {item.routineDay.timeEstimate} min
                </Text>
              ) : null}
            </View>

            {!isLocked ? (
              <GestureDetector gesture={panGesture}>
                <View style={styles.dragHandle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <View style={styles.handleLines}>
                    <View style={[styles.handleLine, activeIndexSV.value === index && styles.handleLineActive]} />
                    <View style={[styles.handleLine, activeIndexSV.value === index && styles.handleLineActive]} />
                    <View style={[styles.handleLine, activeIndexSV.value === index && styles.handleLineActive]} />
                  </View>
                </View>
              </GestureDetector>
            ) : (
              <View style={styles.lockIconWrapper}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WeeklyWorkoutView: React.FC = () => {
  const { userData, ngrokAPI, fetchWorkout, fetchUserRoutine } = useGlobal() as any;
  const [rows, setRows] = useState<WeekRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preListHeight, setPreListHeight] = useState(0);
  const scrollRef = useRef<any>(null);
  // UI-thread shared values — drives all shift animations without touching React
  const activeIndexSV = useSharedValue<number>(-1);  // -1 = nothing being dragged
  const targetIndexSV = useSharedValue<number>(-1);

  // Fixed date slots — built once from the calendar, NEVER reorder with cards
  const [dateSlots] = useState<DateSlot[]>(() => {
    const monday = getMondayOfCurrentWeek();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return DAYS_OF_WEEK.map((_, i) => {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + i);
      return {
        dateLabel: formatDateLabel(dateObj),
        isToday: dateObj.getTime() === today.getTime(),
        isPast: dateObj.getTime() < today.getTime(),
      };
    });
  });


  // ── Build rows ─────────────────────────────────────────────────────────────
  const buildRows = useCallback((routine: any): WeekRow[] => {
    return DAYS_OF_WEEK.map((dayName) => {
      const routineDay: RoutineDay = routine?.routine?.find(
        (d: RoutineDay) => d.day === dayName
      ) ?? { day: dayName, focus: "Rest" };

      return {
        key: dayName,
        label: dayName,
        routineDay,
      };
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        let routine = null;
        if (userData?._id) {
          routine = await fetchUserRoutine(userData._id);
        }
        if (routine) {
          setRows(buildRows(routine));
        }
      } catch (e) {
        console.error("WeeklyWorkoutView init error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ── Auto-scroll to today on mount ─────────────────────────────────────────
  useEffect(() => {
    if (isLoading || preListHeight === 0) return;
    const todayIndex = dateSlots.findIndex((s) => s.isToday);
    if (todayIndex <= 0) return;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: preListHeight + todayIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
  }, [isLoading, preListHeight]);

  // ── Drag callbacks — only called ONCE each, never per-frame ──────────────
  const handleDragStart = useCallback((_index: number) => {
    // activeIndexSV is already set on the UI thread in onBegin
  }, []);

  const handleDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    const todaySlotIndex = dateSlots.findIndex((s) => s.isToday);
    const minDrop = todaySlotIndex === -1 ? 0 : todaySlotIndex;
    const clampedTo = Math.min(Math.max(toIndex, minDrop), DAYS_OF_WEEK.length - 1);

    if (clampedTo !== fromIndex) {
      // Update state
      setRows((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(clampedTo, 0, moved);
        return next.map((row, i) => ({
          ...row,
          routineDay: { ...row.routineDay, day: DAYS_OF_WEEK[i] },
        }));
      });
      setHasChanges(true);
      
      // Wait for next frame to ensure state has committed before clearing drag state
      requestAnimationFrame(() => {
        activeIndexSV.value = -1;
        targetIndexSV.value = -1;
      });
    } else {
      // No change, clear immediately
      activeIndexSV.value = -1;
      targetIndexSV.value = -1;
    }
  }, [dateSlots, activeIndexSV, targetIndexSV]);

  
  // ── Save (temporary only) ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userData?._id || !ngrokAPI || isSaving) return;
    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token");

      const updatedRoutineArray = rows.map((row) => row.routineDay);

      const response = await axios.post(
        `${ngrokAPI}/api/workout/updateRoutineTemporarily`,
        { token, UserID: userData._id, modifiedUserRoutine: updatedRoutineArray }
      );

      if (response.data.status === "success") {
        await fetchWorkout(token, userData._id);
        setHasChanges(false);
        Alert.alert("Saved!", "Your week has been updated.", [
          { text: "Done", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Could not save. Try again.");
      }
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#38FFF5" size="large" />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {/* Scrollable header — measured so we know where the list starts */}
        <View onLayout={(e) => setPreListHeight(e.nativeEvent.layout.height)}>
          <SafeAreaView edges={["top"]} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>Rearrange</Text>
            <Text style={styles.titleMain}>your week</Text>
            <Text style={styles.titleSub}>so that it works best for you.</Text>
          </View>

          <View style={styles.hintRow}>
            <Text style={styles.hintText}>Hold</Text>
            <View style={styles.hintHandleLines}>
              <View style={styles.hintHandleLine} />
              <View style={styles.hintHandleLine} />
              <View style={styles.hintHandleLine} />
            </View>
            <Text style={styles.hintText}>to drag a workout</Text>
          </View>
        </View>

        {/* List */}
        <View style={styles.listContent}>
          {rows.map((item, index) => (
            <DraggableRow
              key={item.key}
              item={item}
              index={index}
              dateSlot={dateSlots[index]}
              activeIndexSV={activeIndexSV}
              targetIndexSV={targetIndexSV}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </View>
      </Animated.ScrollView>

      {/* Fixed save button */}
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasChanges ? "Save Changes" : "No Changes"}
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default WeeklyWorkoutView;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  backButton: {
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#6477E7",
    fontSize: 16,
    fontWeight: "600",
  },

  // Title
  titleBlock: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 6,
  },
  titleMain: {
    color: "#FFFFFF",
    fontSize: 36,
    letterSpacing: -2,
    lineHeight: 38,
    textTransform: "lowercase",
    fontFamily: "Poppins-Light",
  },
  titleSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 15,
    marginTop: 6,
    fontFamily: "Poppins-Regular",
  },

  // Hint
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 6,
  },
  hintText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontWeight: "500",
  },
  hintHandleLines: {
    gap: 3,
    justifyContent: "center",
  },
  hintHandleLine: {
    width: 14,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 1,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Row — static layout container, never animates
  rowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: CARD_MARGIN,
    height: CARD_HEIGHT,
  },

  // Only the card portion animates during drag
  cardAnimatedWrapper: {
    flex: 1,
    shadowColor: "#6477E7",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },

  // Date column
  dateColumn: {
    width: 52,
    alignItems: "center",
    marginRight: 4,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6477E7",
    marginBottom: 4,
  },
  dateLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontFamily:'SpaceGrotesk-Regular',
    fontWeight: "500",
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  dateLabelToday: {
    color: "#6477E7",
  },

  // Divider
  dividerLine: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 14,
    alignSelf: "center",
  },

  // Workout card
  workoutCard: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  workoutCardRest: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  workoutCardActive: {
    //backgroundColor: "rgba(56, 255, 245, 0.12)",
    //borderColor: "#38FFF5",
  },
  workoutCardToday: {
    borderColor: "#6477E7",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
    gap: 3,
  },
  focusText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins-Light",
  },
  focusTextRest: {
    color: "rgba(255,255,255,0.35)",
    fontWeight: "500",
    fontSize: 16,
  },
  timeText: {
    color: "#6477E7",
    fontSize: 12,
    fontWeight: "600",
    fontFamily:"SpaceGrotesk-Regular",
    marginTop: 2,
  },

  // Drag handle
  dragHandle: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  handleLines: {
    gap: 4,
    justifyContent: "center",
  },
  handleLine: {
    width: 22,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
  },
  handleLineActive: {
    //backgroundColor: "#38FFF5",
  },

  // Lock icon (replaces drag handle for past/today)
  lockIconWrapper: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 14,
    opacity: 0.3,
  },

  // Locked card (past days) — dimmed, not today
  workoutCardLocked: {
    opacity: 0.4,
  },

  // Locked text styles
  focusTextLocked: {
    color: "rgba(255,255,255,0.4)",
  },
  timeTextLocked: {
    color: "rgba(255,255,255,0.25)",
  },

  // Badges
  todayBadge: {
    color: "#6477E7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  pastBadge: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#000000",
  },
  saveButton: {
    backgroundColor: "#6478e7d5",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    //shadowColor: "#38FFF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveButtonDisabled: {
    backgroundColor: "#6478e763",
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});