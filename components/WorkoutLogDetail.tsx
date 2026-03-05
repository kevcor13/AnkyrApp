import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import images from "@/constants/images"
import { useGlobal } from '@/context/GlobalProvider';

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
  const { userGameData } = useGlobal();
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [XP, setXP] = useState(0);
  // If no workout is passed, the component renders nothing.
  if (!workout) {
    return null;
  }

  useEffect(() => {
      const fetchData = async () => {
        try {
          // Ensure the workout data exists and has the correct structure
          setXP(userGameData?.points || 0);
        } catch (error) {
          console.error("Error fetching workout data:", error);
        }
      };
  
      fetchData();
  }, [userGameData]);
  
  useEffect(() => {
    if (XP >= 30000) {
      setBadgeImage(images.Olympian);
    } else if (XP >= 20000) {
      setBadgeImage(images.titan);
    } else if (XP >= 12000) {
      setBadgeImage(images.skipper);
    } else if (XP >= 5000) {
      setBadgeImage(images.pilot);
    } else if (XP >= 1000) {
      setBadgeImage(images.Private);
    } else {
      setBadgeImage(images.novice);
    }
  }, [XP]);
  // Helper function to convert duration from seconds to a more readable "X mins" format.
  const durationMins = Math.max(1, Math.round(workout.durationSeconds / 60));

  return (
    <View style={styles.container}>
      {/* Workout Title (e.g., "Chest") */}
      <Text style={styles.workoutName}>{workout.workoutName}</Text>
      
      {/* Details Row: Duration and XP Earned */}
      <View style={styles.detailsRow}>
        <View style={styles.durationBlock}>
          <Text style={styles.detailText}>{durationMins}</Text>
          <Text style={styles.detailTextMins}>mins</Text>
        </View>
        {badgeImage && (
          <Image
            source={
              typeof badgeImage === "string"
                ? { uri: badgeImage }
                : badgeImage
            }
            style={styles.badgeImage}
          />
        )}
      </View>
      <View style={styles.detailsXProw}>
        <View style={styles.xpContainer}>
          <Text style={styles.xpTitle}>total XP earned:</Text>
          <View style={styles.xpValueRow}>
            <Text style={styles.xpSecondTitle}>+ {workout.points}</Text>
            <Text style={styles.xpThridTitle}>xp</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>You did:</Text>
      
      {/* List of Exercises */}
      {workout.exercises.map((exercise, index) => (
        <View key={exercise._id || index} style={styles.exerciseCard}>
          <View style={styles.exerciseHeaderRow}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.earnedLabel}>Earned</Text>
          </View>
          <View style={styles.exerciseDetailRow}>
            {exercise.sets && exercise.sets.length > 0 && (
              <Text style={styles.setText}>
                {`${exercise.sets[0].weight} lbs, ${exercise.sets[0].reps} reps x ${exercise.sets.length} sets`}
              </Text>
            )}
            <View style={styles.earnedXpRow}>
              <Text style={styles.earnedXpValue}>5</Text>
              <Text style={styles.earnedXpUnit}>xp</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
export default WorkoutLogDetail;
// --- Styles --- //

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  detailText: {
    color: '#38FFF5',
    fontFamily: 'poppins-semiBold',
    fontSize: 64,
  },
  detailTextMins:{
    color: '#38FFF5',
    fontFamily: 'poppins-semiBold',
    fontSize: 24,
    marginLeft: 8,
    marginBottom: 8,
  },
  detailsXProw:{
    flexDirection:'row',
    alignItems: 'center',
  },
  badgeImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  xpContainer:{
    marginTop: 8,
  },
  xpTitle:{
    fontFamily:'raleway-semibold',
    fontSize:16,
    color:'white',
    textTransform: 'uppercase',
  },
  xpValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  xpSecondTitle:{
    fontFamily:'raleway-semibold',
    fontSize:27,
    color:'#8AFFF9',
    textTransform: 'uppercase',
  },
  xpThridTitle:{
    fontFamily:'raleway-semibold',
    fontSize:13,
    color:'#8AFFF9',
    textTransform: 'uppercase',
    marginLeft: 6,
  },    
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'poppins-semibold',
    marginBottom: 12,
    marginTop: 6,
  },
  exerciseCard: {
    backgroundColor: '#1C1C20',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'poppins-medium',
    marginBottom: 5,
  },
  earnedLabel: {
    color: '#FFFFFF',
    fontFamily: 'raleway-semibold',
    fontSize: 11,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  setText: {
    color: '#DDDDDD',
    fontSize: 14,
    fontFamily: 'poppins-regular',
  },
  earnedXpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  earnedXpValue: {
    color:'#8AFFF9',
    fontFamily:'raleway-semibold',
    fontSize:20,
    textTransform: 'uppercase',
  },
  earnedXpUnit: {
    color:'#8AFFF9',
    fontFamily:'raleway-semibold',
    fontSize:13,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
});
