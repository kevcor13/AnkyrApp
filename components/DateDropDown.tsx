import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';

const WorkoutDateDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const today = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' } as const;

  // Generate the next 3 days
  const getNextDays = () => {
    return [1, 2, 3].map((offset) => {
      const date = new Date();
      date.setDate(today.getDate() + offset);
      return date;
    });
  };

  const handleDatePress = (date: Date) => {
    setIsOpen(false);
    // Navigating to a future workout page and passing the date string
    router.push({
      pathname: "../(workout)/FutureWorkout",
      params: { selectedDate: date.toISOString() }
    });
  };

  const handleFullWeekPress = () => {
    setIsOpen(false);
    router.push("../(workout)/FullWeekSchedule");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.trigger} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.todayText}>
          {today.toLocaleDateString('en-US', options)}
        </Text>
        <Text style={[styles.arrow, isOpen && styles.arrowUp]}>▼</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {getNextDays().map((date, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.item}
              onPress={() => handleDatePress(date)}
            >
              <Text style={styles.itemText}>
                {date.toLocaleDateString('en-US', options)}
              </Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.fullWeekButton}
            onPress={handleFullWeekPress}
          >
            <Text style={styles.fullWeekText}>View full week</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    marginHorizontal: 20,
    marginTop: 10,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 255, 245, 0.3)',
  },
  todayText: {
    color: '#38FFF5',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  arrow: {
    color: '#38FFF5',
    fontSize: 12,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  fullWeekButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  fullWeekText: {
    color: '#38FFF5',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default WorkoutDateDropdown;