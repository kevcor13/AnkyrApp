import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

interface Exercise {
  exercise: string;
  reps: string;
  sets: number;
}

interface WorkoutCategoryCardProps {
  workoutRoutine: Exercise[];
}

const WorkoutCategoryCard: React.FC<WorkoutCategoryCardProps> = ({ workoutRoutine }) => {
  return (
    <View style={styles.container}>
      {workoutRoutine.map((exercise, index) => (
        <View key={index} style={styles.card}>
          <View>
            <Text style={styles.exerciseName}>{exercise.exercise}</Text>
            <Text style={styles.exerciseDetails}>{exercise.reps}</Text>
          </View>
          <View style={styles.rewardBox}>
            <Text style={styles.rewardLabel}>REWARD:</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#3B3C8C',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'poppins-semibold',
  },
  exerciseDetails: {
    color: '#C3C3C3',
    fontSize: 14,
    fontFamily: 'poppins-regular',
    marginTop: 4,
  },
  rewardBox: {
    alignItems: 'flex-end',
  },
  rewardLabel: {
    fontSize: 12,
    fontFamily: 'raleway-semibold',
    color: '#C3C3C3',
  },
  rewardValue: {
    fontSize: 16,
    fontFamily: 'raleway-bold',
    color: '#8AFFF9',
    marginTop: 2,
  },
});

export default WorkoutCategoryCard;
