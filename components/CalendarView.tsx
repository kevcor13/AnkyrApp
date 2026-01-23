import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DayStatus = "completed" | "upcoming" | "missed" | "today" | "none";

interface WeekDay {
  date: Date;
  dayOfMonth: number;
  shortWeekday: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

const CalendarSelector: React.FC<{
  onSelect?: (d: Date) => void;
  getStatusForDate?: (d: Date) => DayStatus;
}> = ({ onSelect, getStatusForDate }) => {
  const [currentWeek, setCurrentWeek] = useState<WeekDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    generateCurrentWeek();
  }, []);

  const generateCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the Monday of current week
    const currentDay = today.getDay();
    const monday = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days, else go to Monday
    monday.setDate(today.getDate() + diff);
    
    const week: WeekDay[] = [];
    
    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const isToday = date.getTime() === today.getTime();
      
      week.push({
        date,
        dayOfMonth: date.getDate(),
        shortWeekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        isPast: date < today,
        isFuture: date > today,
      });
    }
    
    setCurrentWeek(week);
  };

  const handleDatePress = (day: WeekDay) => {
    setSelectedDate(day.date);
    onSelect?.(day.date);
  };

  return (
    <View style={styles.container}>
      {/* Weekday Headers */}
      <View style={styles.weekdaysHeader}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Week Days Grid */}
      <View style={styles.weekGrid}>
        {currentWeek.map((day, index) => {
          const status = getStatusForDate ? getStatusForDate(day.date) : "none";
          const isSelected = 
            day.date.getDate() === selectedDate.getDate() &&
            day.date.getMonth() === selectedDate.getMonth() &&
            day.date.getFullYear() === selectedDate.getFullYear();

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day.isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
                status === "completed" && styles.dayCellCompleted,
                status === "missed" && styles.dayCellMissed,
              ]}
              onPress={() => handleDatePress(day)}
              activeOpacity={0.7}
            >
              {day.isToday ? (
                <Text style={styles.todayLabel}>Today</Text>
              ) : (
                <>
                  <Text
                    style={[
                      styles.dayNumber,
                      day.isToday && styles.dayNumberToday,
                      isSelected && styles.dayNumberSelected,
                      status === "completed" && styles.dayNumberCompleted,
                      day.isFuture && styles.dayNumberFuture,
                    ]}
                  >
                    {day.dayOfMonth}
                  </Text>
                  {day.isPast && status !== "completed" && (
                    <Text style={styles.lockIcon}></Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CalendarSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 10,
  },
  weekdaysHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 217, 217, 0.27)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCellToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayCellSelected: {
    backgroundColor: 'rgba(56, 255, 245, 0.2)',
    borderColor: '#38FFF5',
    shadowColor: '#38FFF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dayCellCompleted: {
    backgroundColor: 'rgba(56, 255, 245, 0.2)',
    borderColor: '#38FFF5',
  },
  dayCellMissed: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumberToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: '#38FFF5',
    fontWeight: '700',
  },
  dayNumberCompleted: {
    color: '#38FFF5',
    fontWeight: '600',
  },
  dayNumberFuture: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  todayLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockIcon: {
    fontSize: 14,
    marginTop: 2,
  },
});