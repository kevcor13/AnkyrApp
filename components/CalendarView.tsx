import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // for the chevron icons

type DayItem = {
  date: Date;
  shortWeekday: string; // e.g. "Tu", "W", "Th"
  dayOfMonth: number;   // e.g. 24, 25
};

const CalendarSelector: React.FC<{
  onSelect?: (d: Date) => void;
}> = ({ onSelect }) => {
  const [days, setDays] = useState<DayItem[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());

  // build the 5-day window (today ±2 days)
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
      <TouchableOpacity style={styles.arrowBtn}>
        <Ionicons name="chevron-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {days.map((d) => {
          const isActive =
            d.dayOfMonth === selected.getDate() &&
            d.date.getMonth() === selected.getMonth();
          return (
            <TouchableOpacity
              key={d.date.toISOString()}
              style={[
                styles.dayItem,
                isActive && styles.dayItemActive,
              ]}
              onPress={() => handlePress(d)}
            >
              <Text
                style={[
                  styles.weekdayText,
                  isActive && styles.weekdayTextActive,
                ]}
              >
                {d.shortWeekday}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isActive && styles.dateTextActive,
                ]}
              >
                {d.dayOfMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.arrowBtn}>
        <Ionicons name="chevron-forward" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default CalendarSelector;

const styles = StyleSheet.create({
  calendarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom:20
  },
  arrowBtn: {
    padding: 8,
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayItem: {
    width: 50,
    height: 70,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  } as any,
  dayItemActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  weekdayText: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 4,
  },
  weekdayTextActive: {
    color: "#78F5D8",
    fontWeight: "700",
  },
  dateText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  dateTextActive: {
    color: "#78F5D8",
  },
});