import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoutineDay {
  day: string;
  focus?: string;
  timeEstimate?: number;
  workoutRoutine?: any[];
  [key: string]: any;
}

interface Props {
  userRoutine?: { routine?: RoutineDay[] } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PREVIEW_COUNT = 4; // How many days to show in the card

const getMondayOfCurrentWeek = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday;
};

const isRestDay = (routineDay: RoutineDay | undefined): boolean => {
  if (!routineDay) return true;
  const focus = String(routineDay.focus || "").trim().toLowerCase();
  const exercises = Array.isArray(routineDay.workoutRoutine) ? routineDay.workoutRoutine : [];
  return focus === "rest" || exercises.length === 0;
};

// ─── Component ───────────────────────────────────────────────────────────────

const ThisWeekCard: React.FC<Props> = ({ userRoutine }) => {
  // Build the 7-day week, then slice to preview count
  const weekRows = useMemo(() => {
    const monday = getMondayOfCurrentWeek();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return DAYS_ORDER.map((dayName, i) => {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + i);

      const routineDay = userRoutine?.routine?.find((d) => d.day === dayName);
      const focus = routineDay?.focus || "Rest";
      const rest = isRestDay(routineDay);
      const isToday = dateObj.getTime() === today.getTime();

      const month = dateObj
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
      const day = dateObj.getDate();

      return { dayName, dateObj, focus, rest, isToday, month, day };
    });
  }, [userRoutine]);

  const previewRows = weekRows.slice(0, PREVIEW_COUNT);
  const remainingCount = weekRows.length - PREVIEW_COUNT;

  return (
    <View style={styles.cardWrapper}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardLabel}>THIS WEEK</Text>
          <Text style={styles.cardSublabel}>Your workout schedule</Text>
        </View>
        <View style={styles.weekPill}>
          <Text style={styles.weekPillText}>7 days</Text>
        </View>
      </View>

      {/* Preview Rows */}
      <View style={styles.previewList}>
        {previewRows.map((row, index) => (
          <View key={row.dayName} style={styles.previewRow}>
            {/* Date */}
            <View style={styles.dateBadge}>
              <Text style={[styles.dateMonth, row.isToday && styles.dateToday]}>
                {row.month}
              </Text>
              <Text style={[styles.dateDay, row.isToday && styles.dateToday]}>
                {row.day}
              </Text>
            </View>

            {/* Connector dot */}
            <View style={styles.connectorDot} />

            {/* Workout pill */}
            <View
              style={[
                styles.workoutPill,
                row.rest && styles.workoutPillRest,
                row.isToday && styles.workoutPillToday,
              ]}
            >
              {row.isToday && (
                <View style={styles.todayIndicator} />
              )}
              <Text
                style={[
                  styles.workoutPillText,
                  row.rest && styles.workoutPillTextRest,
                ]}
                numberOfLines={1}
              >
                {row.focus}
              </Text>
            </View>
          </View>
        ))}

        {/* Fade-out overflow hint */}
        {remainingCount > 0 && (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={styles.fadeOverlay}
            pointerEvents="none"
          />
        )}
      </View>

      {/* Footer: more indicator + CTA */}
      <View style={styles.cardFooter}>
        <Text style={styles.moreText}>+{remainingCount} more days</Text>
        <TouchableOpacity
          style={styles.seeFullButton}
          onPress={() => router.push("/(components)/workout/WeeklyWorkoutView")}
          activeOpacity={0.7}
        >
          <Text style={styles.seeFullText}>See Full Week →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ThisWeekCard;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 0,
  },

  // Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "raleway-bold",
  },
  cardSublabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  weekPill: {
    backgroundColor: "rgba(56, 255, 245, 0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(56, 255, 245, 0.3)",
  },
  weekPillText: {
    color: "#38FFF5",
    fontSize: 12,
    fontWeight: "700",
  },

  // Preview rows
  previewList: {
    gap: 10,
    position: "relative",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Date badge
  dateBadge: {
    width: 38,
    alignItems: "center",
  },
  dateMonth: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dateDay: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
  },
  dateToday: {
    color: "#38FFF5",
  },

  // Connector
  connectorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Workout pill
  workoutPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  workoutPillRest: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.04)",
  },
  workoutPillToday: {
    borderColor: "rgba(56, 255, 245, 0.35)",
    backgroundColor: "rgba(56, 255, 245, 0.08)",
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38FFF5",
  },
  workoutPillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  workoutPillTextRest: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: "400",
  },

  // Fade overlay
  fadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  moreText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    fontWeight: "500",
  },
  seeFullButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(56, 255, 245, 0.15)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 255, 245, 0.4)",
  },
  seeFullText: {
    color: "#38FFF5",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});