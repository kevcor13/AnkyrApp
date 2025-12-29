import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DayItem = {
  date: Date;
  shortWeekday: string;
  dayOfMonth: number;
};

type DayStatus = "completed" | "upcoming" | "missed" | "today" | "none";

const CalendarSelector: React.FC<{
  onSelect?: (d: Date) => void;
  getStatusForDate?: (d: Date) => DayStatus;
}> = ({ onSelect, getStatusForDate }) => {
  const [days, setDays] = useState<DayItem[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());

  useEffect(() => {
    const today = new Date();
    const items: DayItem[] = [];
    
    for (let offset = -2; offset <= 2; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      items.push({
        date: d,
        shortWeekday: d.toLocaleString("en-US", { weekday: "short" }),
        dayOfMonth: d.getDate(),
      });
    }
    setDays(items);
    setSelected(today);
  }, []);

  const handlePress = (d: DayItem) => {
    setSelected(d.date);
    onSelect?.(d.date);
  };

  return (
    <View style={styles.calendarWrapper}>
      <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.6}>
        <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {days.map((d) => {
          const status = getStatusForDate ? getStatusForDate(d.date) : "none";
          const isActive =
            d.dayOfMonth === selected.getDate() &&
            d.date.getMonth() === selected.getMonth();
          
          return (
            <TouchableOpacity
              key={d.date.toISOString()}
              style={[
                styles.dayItem,
                isActive && styles.dayItemActive,
                status === "completed" && styles.dayCompleted,
                status === "missed" && styles.dayMissed,
                status === "today" && styles.dayToday,
              ]}
              onPress={() => handlePress(d)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.weekdayText,
                  isActive && styles.weekdayTextActive,
                  status === "completed" && styles.textCompleted,
                ]}
              >
                {d.shortWeekday}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isActive && styles.dateTextActive,
                  status === "completed" && styles.textCompleted,
                ]}
              >
                {d.dayOfMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.6}>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  );
};

export default CalendarSelector;

const styles = StyleSheet.create({
  calendarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  arrowBtn: {
    padding: 10,
    borderRadius: 20,
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  dayItem: {
    width: 56,
    height: 76,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  } as any,
  dayItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(120, 245, 216, 0.4)",
    shadowColor: "#78F5D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dayCompleted: {
    backgroundColor: "rgba(56, 255, 245, 0.2)",
    borderColor: "rgba(56, 255, 245, 0.5)",
    shadowColor: "#38FFF5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dayMissed: {
    backgroundColor: "rgba(136, 136, 136, 0.25)",
    borderColor: "rgba(255, 59, 48, 0.5)",
    borderWidth: 1.5,
  },
  dayToday: {
    borderColor: "#78F5D8",
    borderWidth: 2,
    shadowColor: "#78F5D8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  weekdayText: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  weekdayTextActive: {
    color: "#78F5D8",
    fontWeight: "600",
  },
  dateText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  dateTextActive: {
    color: "#78F5D8",
    fontWeight: "700",
  },
  textCompleted: {
    color: "#38FFF5",
  },
});