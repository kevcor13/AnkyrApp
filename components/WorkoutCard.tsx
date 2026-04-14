import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

interface Exercise {
  exerciseName: string;
  time?: number; 
  reps?: string | number; 
  sets?: number; 
}

interface WorkoutCategoryCardProps {
  workoutRoutine: Exercise[];
  title: string;
}

const WorkoutCategoryCard: React.FC<WorkoutCategoryCardProps> = ({ workoutRoutine, title }) => {
  const isWarmup = title === "Warm-Up";

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerAccent} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Exercise Cards */}
      <View style={styles.cardsContainer}>
        {workoutRoutine.map((exercise, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.exerciseContent}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <View style={styles.workoutInfo}>
                {isWarmup ? (
                  <Text style={styles.exerciseDetails}>
                    {exercise.time ? `${exercise.time} seconds` : 'N/A'}
                  </Text>
                ) : (
                  <View style={styles.setRepsContainer}>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets || 0} sets
                    </Text>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.exerciseDetails}>
                      {exercise.reps || 0} reps
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.rewardBox}>
              <Text style={styles.rewardLabel}>REWARD</Text>
              <View style={styles.rewardValueContainer}>
                <Text style={styles.rewardValue}>5</Text>
                <Text style={styles.rewardUnit}>xp</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerAccent: {
    width: 4,
    height: 24,
    backgroundColor: '#6477E7',
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#1B191E',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //borderWidth: 1,
    borderColor: '#6477E7',
    borderWidth: 0.25,
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'poppins-regular',
    marginBottom: 6,
    lineHeight: 22,
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setRepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDetails: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'poppins-regular',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
  },
  rewardBox: {
    alignItems: 'flex-end',
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'raleway-semibold',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rewardValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'raleway-semibold',
    color: '#6477E7',
    lineHeight: 28,
  },
  rewardUnit: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'raleway-semibold',
    color: '#6477E7',
    marginLeft: 3,
    opacity: 0.9,
  },
});

export default WorkoutCategoryCard