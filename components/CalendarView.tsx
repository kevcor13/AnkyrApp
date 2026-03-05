import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DayStatus = "completed" | "upcoming" | "missed" | "today" | "none";

interface WeekDay {
  date: Date;
  dayOfMonth: number;
  shortWeekday: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
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
  onSelect?: (d: Date) => void;
  getStatusForDate?: (d: Date) => DayStatus;
  userRoutine?: any;
  userData?: any;
  ngrokAPI?: string;
  onRoutineUpdated?: (updatedRoutine: any) => void;
}> = ({ onSelect, getStatusForDate, userRoutine, userData, ngrokAPI, onRoutineUpdated }) => {
  const [currentWeek, setCurrentWeek] = useState<WeekDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalRoutine, setOriginalRoutine] = useState<any>(null);
  const [modifiedRoutine, setModifiedRoutine] = useState<any>(null);
  const [firstSelectedIndex, setFirstSelectedIndex] = useState<number | null>(null);
  const [secondSelectedIndex, setSecondSelectedIndex] = useState<number | null>(null);
  
  // Map routine to days for easy lookup
  const getWorkoutForDay = (date: Date, routine?: any): RoutineDay | null => {
    const routineToUse = routine || userRoutine;
    if (!routineToUse?.routine) return null;
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return routineToUse.routine.find((day: RoutineDay) => day.day === dayName) || null;
  };

  useEffect(() => {
    generateCurrentWeek();
  }, []);

  // Initialize modified routine when entering edit mode
  useEffect(() => {
    if (isEditMode && userRoutine && !originalRoutine) {
      // Deep copy the original routine
      const routineCopy = JSON.parse(JSON.stringify(userRoutine));
      setOriginalRoutine(routineCopy);
      setModifiedRoutine(routineCopy);
    }
  }, [isEditMode, userRoutine]);

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

  const handleDatePress = (day: WeekDay, index: number) => {
    if (isEditMode) {
      // In edit mode, handle day selection for swapping
      // Only allow selecting today and future days
      if (day.isPast && !day.isToday) {
        return; // Can't select past days
      }

      if (firstSelectedIndex === null) {
        // First selection
        setFirstSelectedIndex(index);
        setSecondSelectedIndex(null);
      } else if (firstSelectedIndex === index) {
        // Clicking the same day again deselects it
        setFirstSelectedIndex(null);
        setSecondSelectedIndex(null);
      } else if (secondSelectedIndex === null) {
        // Second selection
        setSecondSelectedIndex(index);
      } else if (secondSelectedIndex === index) {
        // Clicking the second selected day deselects it
        setSecondSelectedIndex(null);
      } else {
        // New selection - replace first selection
        setFirstSelectedIndex(index);
        setSecondSelectedIndex(null);
      }
    } else {
      // Normal mode - just select the date
      setSelectedDate(day.date);
      onSelect?.(day.date);
    }
  };

  const handleEditRoutine = () => {
    setIsEditMode(true);
    setFirstSelectedIndex(null);
    setSecondSelectedIndex(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFirstSelectedIndex(null);
    setSecondSelectedIndex(null);
    setModifiedRoutine(null);
    setOriginalRoutine(null);
  };

  const performSwap = () => {
    if (firstSelectedIndex === null || secondSelectedIndex === null || !modifiedRoutine) {
      return null;
    }

    const firstDay = currentWeek[firstSelectedIndex];
    const secondDay = currentWeek[secondSelectedIndex];

    // Get day names (e.g., "Monday", "Wednesday")
    const firstDayName = firstDay.date.toLocaleDateString('en-US', { weekday: 'long' });
    const secondDayName = secondDay.date.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the routine day objects for these day names
    const firstRoutineDay = modifiedRoutine.routine.find((day: RoutineDay) => day.day === firstDayName);
    const secondRoutineDay = modifiedRoutine.routine.find((day: RoutineDay) => day.day === secondDayName);

    if (!firstRoutineDay || !secondRoutineDay) {
      return null;
    }

    // Create a deep copy of the modified routine
    const newRoutine = JSON.parse(JSON.stringify(modifiedRoutine));

    // Find the indices of these days in the routine array
    const firstRoutineIndex = newRoutine.routine.findIndex((day: RoutineDay) => day.day === firstDayName);
    const secondRoutineIndex = newRoutine.routine.findIndex((day: RoutineDay) => day.day === secondDayName);

    // Store day names to preserve them
    const firstDayNameToKeep = firstRoutineDay.day;
    const secondDayNameToKeep = secondRoutineDay.day;

    // Create new objects with swapped data but preserved day names
    // First day gets second day's workout data but keeps its day name
    const firstDaySwapped: RoutineDay = {
      day: firstDayNameToKeep,
      focus: secondRoutineDay.focus,
      timeEstimate: secondRoutineDay.timeEstimate,
      warmup: secondRoutineDay.warmup,
      workoutRoutine: secondRoutineDay.workoutRoutine,
      cooldown: secondRoutineDay.cooldown,
    };

    // Second day gets first day's workout data but keeps its day name
    const secondDaySwapped: RoutineDay = {
      day: secondDayNameToKeep,
      focus: firstRoutineDay.focus,
      timeEstimate: firstRoutineDay.timeEstimate,
      warmup: firstRoutineDay.warmup,
      workoutRoutine: firstRoutineDay.workoutRoutine,
      cooldown: firstRoutineDay.cooldown,
    };

    // Copy any additional properties that might exist
    Object.keys(secondRoutineDay).forEach(key => {
      if (!['day', 'focus', 'timeEstimate', 'warmup', 'workoutRoutine', 'cooldown'].includes(key)) {
        (firstDaySwapped as any)[key] = (secondRoutineDay as any)[key];
      }
    });

    Object.keys(firstRoutineDay).forEach(key => {
      if (!['day', 'focus', 'timeEstimate', 'warmup', 'workoutRoutine', 'cooldown'].includes(key)) {
        (secondDaySwapped as any)[key] = (firstRoutineDay as any)[key];
      }
    });

    // Apply the swapped data
    newRoutine.routine[firstRoutineIndex] = firstDaySwapped;
    newRoutine.routine[secondRoutineIndex] = secondDaySwapped;

    setModifiedRoutine(newRoutine);
    setFirstSelectedIndex(null);
    setSecondSelectedIndex(null);
    
    return newRoutine;
  };

  const handleChangePermanently = async () => {
    console.log("Change Permanently button pressed");
    
    // Perform swap if two days are selected
    const swappedRoutine = performSwap();
    const routineToUpdate = swappedRoutine || modifiedRoutine;
    
    if (!routineToUpdate || !userData?._id || !ngrokAPI) {
      console.error("Missing required data for permanent update");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Extract the routine array from the routine object
      let routineArray = null;
      if (Array.isArray(routineToUpdate)) {
        routineArray = routineToUpdate;
      } else if (routineToUpdate?.routine && Array.isArray(routineToUpdate.routine)) {
        routineArray = routineToUpdate.routine;
      } else {
        console.error("Routine is not in the expected format:", routineToUpdate);
        console.error("Routine structure:", JSON.stringify(routineToUpdate, null, 2));
        return;
      }

      // Validate that we have a valid array
      if (!routineArray || !Array.isArray(routineArray)) {
        console.error("Invalid routine array - not an array:", routineArray);
        console.error("Original routineToUpdate:", JSON.stringify(routineToUpdate, null, 2));
        return;
      }

      console.log("Sending permanent routine update (as array):", JSON.stringify(routineArray, null, 2));
      
      const response = await axios.post(`${ngrokAPI}/api/workout/updateRoutinePermanently`, {
        token,
        UserID: userData._id,
        modifiedUserRoutine: routineArray
      });

      if (response.data.status === "success") {
        console.log("Routine updated permanently:", response.data);
        
        // Update the displayed routine to show the modified routine
        setModifiedRoutine(routineToUpdate);
        
        // Exit edit mode
        setIsEditMode(false);
        setFirstSelectedIndex(null);
        setSecondSelectedIndex(null);
        setOriginalRoutine(null);
        
        // Notify parent component that routine has been updated
        if (onRoutineUpdated) {
          onRoutineUpdated(routineToUpdate);
        }
      } else {
        console.error("Failed to update routine permanently:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error updating routine permanently:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
      }
    }
  };

  const handleChangeTemporarily = async () => {
    console.log("Change Temporarily button pressed");
    
    // Perform swap if two days are selected
    const swappedRoutine = performSwap();
    const routineToUpdate = swappedRoutine || modifiedRoutine;
    
    if (!routineToUpdate || !userData?._id || !ngrokAPI) {
      console.error("Missing required data for temporary update");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Extract the routine array from the routine object
      let routineArray = null;
      if (Array.isArray(routineToUpdate)) {
        routineArray = routineToUpdate;
      } else if (routineToUpdate?.routine && Array.isArray(routineToUpdate.routine)) {
        routineArray = routineToUpdate.routine;
      } else {
        console.error("Routine is not in the expected format:", routineToUpdate);
        console.error("Routine structure:", JSON.stringify(routineToUpdate, null, 2));
        return;
      }

      // Validate that we have a valid array
      if (!routineArray || !Array.isArray(routineArray)) {
        console.error("Invalid routine array - not an array:", routineArray);
        console.error("Original routineToUpdate:", JSON.stringify(routineToUpdate, null, 2));
        return;
      }

      console.log("Sending temporary routine update (as array):", JSON.stringify(routineArray, null, 2));
      
      const response = await axios.post(`${ngrokAPI}/api/workout/updateRoutineTemporarily`, {
        token,
        UserID: userData._id,
        modifiedUserRoutine: routineArray
      });

      if (response.data.status === "success") {
        console.log("Routine updated temporarily:", response.data);
        
        // Update the displayed routine to show the modified routine
        setModifiedRoutine(routineToUpdate);
        
        // Exit edit mode
        setIsEditMode(false);
        setFirstSelectedIndex(null);
        setSecondSelectedIndex(null);
        setOriginalRoutine(null);
        
        // Notify parent component that routine has been updated
        if (onRoutineUpdated) {
          onRoutineUpdated(routineToUpdate);
        }
      } else {
        console.error("Failed to update routine temporarily:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error updating routine temporarily:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
      }
    }
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
            !isEditMode &&
            day.date.getDate() === selectedDate.getDate() &&
            day.date.getMonth() === selectedDate.getMonth() &&
            day.date.getFullYear() === selectedDate.getFullYear();
          
          // In edit mode, check if this day is selected for swapping
          const isFirstSelected = isEditMode && firstSelectedIndex === index;
          const isSecondSelected = isEditMode && secondSelectedIndex === index;
          const isSwapSelected = isFirstSelected || isSecondSelected;
          
          // Get workout for this day from routine (use modified routine in edit mode)
          const routineToUse = isEditMode ? modifiedRoutine : userRoutine;
          const dayWorkout = getWorkoutForDay(day.date, routineToUse);
          const hasWorkout = dayWorkout !== null;
          const workoutFocus = dayWorkout?.focus || '';

          // In edit mode, disable past days (except today)
          const isDisabled = isEditMode && day.isPast && !day.isToday;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day.isToday && styles.dayCellToday,
                isSelected && !isEditMode && styles.dayCellSelected,
                status === "completed" && styles.dayCellCompleted,
                status === "missed" && styles.dayCellMissed,
                hasWorkout && !day.isPast && styles.dayCellHasWorkout,
                isSwapSelected && styles.dayCellSwapSelected,
                isDisabled && styles.dayCellDisabled,
              ]}
              onPress={() => handleDatePress(day, index)}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              {day.isToday ? (
                <>
                  <Text style={styles.todayLabel}>{day.dayOfMonth}</Text>
                  {hasWorkout && workoutFocus && (
                    <Text style={styles.workoutFocusLabel}>{workoutFocus}</Text>
                  )}
                  {isFirstSelected && (
                    <View style={styles.swapIndicatorContainer}>
                      <Text style={styles.swapIndicatorText}>1</Text>
                    </View>
                  )}
                  {isSecondSelected && (
                    <View style={styles.swapIndicatorContainer}>
                      <Text style={styles.swapIndicatorText}>2</Text>
                    </View>
                  )}
                </>
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
                  {hasWorkout && workoutFocus && !day.isPast && (
                    <Text style={styles.workoutFocusText} >
                      {workoutFocus}
                    </Text>
                  )}
                  {day.isPast && status !== "completed" && (
                    <Text style={styles.lockIcon}></Text>
                  )}
                  {isFirstSelected && (
                    <View style={styles.swapIndicatorContainer}>
                      <Text style={styles.swapIndicatorText}>1</Text>
                    </View>
                  )}
                  {isSecondSelected && (
                    <View style={styles.swapIndicatorContainer}>
                      <Text style={styles.swapIndicatorText}>2</Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Edit Mode Controls */}
      {!isEditMode && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditRoutine}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>Edit Routine</Text>
        </TouchableOpacity>
      )}

      {isEditMode && (
        <View style={styles.editModeContainer}>
          {firstSelectedIndex !== null && secondSelectedIndex !== null && (
            <View style={styles.swapButtonsContainer}>
              <TouchableOpacity
                style={[styles.saveButton, styles.changePermanentButton]}
                onPress={handleChangePermanently}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Change Permanently</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, styles.changeTemporaryButton]}
                onPress={handleChangeTemporarily}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Change Temporarily</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelEdit}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
    margin: -2.5,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 217, 217, 0.40)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCellToday: {
    backgroundColor: 'rgba(56, 255, 245, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayCellSelected: {
    backgroundColor: 'rgba(217, 217, 217, 0.0)',
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
    //backgroundColor: 'rgba(255, 59, 48, 0.15)',
    //borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    //marginBottom: 4,
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
    //color: 'rgba(255, 255, 255, 0.4)',
  },
  todayLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  lockIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  dayCellHasWorkout: {
    borderColor: 'rgba(56, 255, 245, 0.4)',
    borderWidth: 1,
  },
  workoutFocusLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  workoutFocusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  dayCellSwapSelected: {
    backgroundColor: 'rgba(217, 217, 217, 0.0)',
    borderColor: '#000000',
    borderWidth: 2,
  },
  dayCellDisabled: {
    opacity: 0.4,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: 'rgba(56, 255, 245, 0.2)',
    borderColor: '#38FFF5',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#38FFF5',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  editModeContainer: {
    marginTop: 20,
    gap: 12,
  },
  swapButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePermanentButton: {
    backgroundColor: 'rgba(56, 255, 245, 0.3)',
    borderColor: '#38FFF5',
    borderWidth: 2,
  },
  changeTemporaryButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    borderColor: '#FFC107',
    borderWidth: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255, 59, 48, 1)',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  swapIndicatorContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFC107',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapIndicatorText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
});