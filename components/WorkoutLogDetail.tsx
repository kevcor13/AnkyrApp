import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// --- Interfaces for Type Safety --- //
// These interfaces define the shape of your workout data.

interface ISet {
  reps: number;
  weight: number;
  _id: string;
}

interface IExercise {
  name: string;
  sets: ISet[];
  _id: string;
}

export interface IWorkoutLog {
  _id: string;
  userId: string;
  workoutName: string;
  date: string;
  durationSeconds: number;
  exercises: IExercise[];
  points: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Props {
  workout: IWorkoutLog;
}

// --- The Component --- //

const WorkoutLogDetail: React.FC<Props> = ({ workout }) => {
  // If no workout is passed, the component renders nothing.
  if (!workout) {
    return null;
  }

  // Helper function to convert duration from seconds to a more readable "X mins" format.
  const formatDuration = (seconds: number) => {
    return `${Math.round(seconds / 60)} mins`;
  };

  return (
    <View style={styles.container}>
      {/* Workout Title (e.g., "Chest") */}
      <Text style={styles.workoutName}>{workout.workoutName}</Text>
      
      {/* Details Row: Duration and XP Earned */}
      <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{formatDuration(workout.durationSeconds)}</Text>
          <Text style={styles.pointsText}>+ {workout.points} XP Earned</Text>
      </View>

      <Text style={styles.sectionTitle}>You did:</Text>
      
      {/* List of Exercises */}
      {workout.exercises.map((exercise, index) => (
        <View key={exercise._id || index} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {exercise.sets.map((set, setIndex) => (
            <Text key={set._id || setIndex} style={styles.setText}>
              {`Set ${setIndex + 1}: ${set.reps} reps at ${set.weight} lbs`}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
export default WorkoutLogDetail;
// --- Styles --- //

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20, 20, 40, 0.7)', // A semi-transparent dark blue
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailText: {
    color: '#38FFF5',
    fontFamily: 'poppins-semiBold',
    fontSize: 18,
  },
  pointsText: {
      color: '#78F5D8',
      fontFamily: 'poppins-semiBold',
      fontSize: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'poppins-semibold',
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    marginBottom: 5,
  },
  setText: {
    color: '#DDDDDD',
    fontSize: 14,
    fontFamily: 'poppins-regular',
  },
});

