import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AppIcon from "./AppIcon";
import { router } from "expo-router";

interface WeekDay {
  date: Date;
  dayOfMonth: number;
  shortWeekday: string;
  isToday: boolean;
  isRestDay: boolean;
  isWorkoutDay: boolean;
}

interface RoutineDay {
  day: string;
  focus?: string;
  timeEstimate?: number;
  warmup?: any[];
  workoutRoutine?: any[];
  cooldown?: any[];
  [key: string]: any;
}

const CalendarSelector: React.FC<{
  userRoutine?: any;
}> = ({ userRoutine }) => {
  const [currentWeek, setCurrentWeek] = useState<WeekDay[]>([]);

  useEffect(() => {
    generateCurrentWeek();
  }, [userRoutine]);

  const isRestDay = (date: Date): boolean => {
    if (!userRoutine?.routine) return false;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const routineDay = userRoutine.routine.find((day: RoutineDay) => day.day === dayName);

    if (!routineDay) return true; // No routine = rest day

    const focus = String(routineDay.focus || "").trim().toLowerCase();
    const exercises = Array.isArray(routineDay.workoutRoutine) ? routineDay.workoutRoutine : [];

    // Rest day if focus is "rest" or no exercises
    return focus === "rest" || exercises.length === 0;
  };

  const generateCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the Monday of current week
    const currentDay = today.getDay();
    const monday = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + diff);

    const week: WeekDay[] = [];

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const isToday = date.getTime() === today.getTime();
      const isRest = isRestDay(date);

      week.push({
        date,
        dayOfMonth: date.getDate(),
        shortWeekday: date
          .toLocaleDateString('en-US', { weekday: 'short' })
          .slice(0, 2)
          .toLowerCase(),
        isToday,
        isRestDay: isRest,
        isWorkoutDay: !isRest,
      });
    }

    setCurrentWeek(week);
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekGrid}>
        {currentWeek.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayCell,
              day.isRestDay && styles.dayCellRest,
            ]}
          >
            {/* Weekday abbreviation */}
            <Text style={[
              styles.weekdayText,
              day.isRestDay && { color: '#5843F6' },
              day.isToday && styles.todayText,
            ]}>
              {day.shortWeekday}
            </Text>

            {/* Date number */}
            <Text style={[
              styles.dateNumber,
              day.isRestDay && { color: '#5843F6' },
              day.isToday && styles.todayText,
            ]}>
              {day.dayOfMonth}
            </Text>

            {/* Icon - Moon for rest, Activity/Heartbeat for workout */}
            <View style={styles.iconContainer}>
              {day.isRestDay ? (
                // Moon icon placeholder - replace with your actual moon icon
                <Text style={[
                  styles.iconText,
                  day.isToday && styles.todayText,
                ]}>
                  <AppIcon name="moon" width={20} height={20} />
                </Text>
              ) : day.isToday ? (
                // Activity/Heartbeat icon placeholder - replace with your actual icon
                <Text style={[
                  styles.iconText,
                ]}>
                  <AppIcon name="activity" width={20} height={20} />
                </Text>
              ) : (
                <Text style={[
                  styles.todayText,
                ]}>
                  <AppIcon name="activityG" width={20} height={20} />
                </Text>
              )}
            </View>
          </View>
        ))}
        <View style={{justifyContent:'space-between'}}>
          <TouchableOpacity 
            style={{borderRadius:30, backgroundColor:'#1B191E', padding:14 }}
            onPress={() => router.navigate('/workout/WeeklyWorkoutView')}
          >
            <AppIcon name="calendar" width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{borderRadius:30, backgroundColor:'#1B191E', padding:14, marginTop:5 }}
            onPress={() => router.navigate('/(workout)/WorkoutOverview')}  
          >
            <AppIcon name="shieldOff" width={20} height={20} />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

export default CalendarSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //gap: -10,
  },
  dayCell: {
    flex: 1,
    //backgroundColor: 'rgba(50, 50, 50, 0.6)',
    //borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  dayCellRest: {
    //backgroundColor: 'rgba(114, 99, 255, 0.4)', // Purple background for rest days
  },
  weekdayText: {
    color: '#565464',
    fontSize: 15,
    fontFamily: 'poppins',
    textTransform: 'lowercase',
    marginBottom: 4,
  },
  dateNumber: {
    color: '#565464',
    fontSize: 15,
    fontFamily: 'poppins',
    marginBottom: 8,
  },
  todayText: {
    color: '#FFFFFF', // White for today's date
    //fontWeight: '700',

  },
  iconContainer: {
    marginTop: 4,
  },
  iconText: {
    fontSize: 20,
    //color: 'rgba(255, 255, 255, 0.5)',
  },
});
