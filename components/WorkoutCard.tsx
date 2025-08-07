import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

interface Exercise {
  exerciseName: string;
  reps: string;
  sets: number;
}

interface WorkoutCategoryCardProps {
  workoutRoutine: Exercise[];
  title: string;
}

const WorkoutCategoryCard: React.FC<WorkoutCategoryCardProps> = ({ workoutRoutine, title } ) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {workoutRoutine.map((exercise, index) => (
        <View key={index} style={styles.card}>
          <View>
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            <Text style={styles.exerciseDetails}>{exercise.sets} sets</Text>
            <Text style={styles.exerciseDetails}>{exercise.reps} reps</Text>
          </View>
          <View style={styles.rewardBox}>
            <Text style={styles.rewardLabel}>REWARD:</Text>
            <View style={{flexDirection:'row', alignItems:'center'}}>
             <Text style={{fontFamily:'raleway-semibold', color:'#8AFFF9', fontSize:20}}>5 </Text>
             <Text style={{fontFamily:'raleway-semibold', color:'#8AFFF9', fontSize:16}}>xp</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
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
    backgroundColor: 'rgba(0, 255, 196, 0.26)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    paddingRight:80
  },
  exerciseDetails: {
    color: '#C3C3C3',
    fontSize: 14,
    fontFamily: 'poppins-regular',
    marginTop: 4,
  },
  rewardBox: {
    alignItems: 'flex-end',
    marginLeft: -80,
    
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
