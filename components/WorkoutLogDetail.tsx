import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image} from 'react-native';
import icons from "@/constants/icons";
import images from "@/constants/images"
import { useGlobal } from '@/context/GlobalProvider';
import WorkoutCard from './WorkoutCard';

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
  const {userData, userGameData} = useGlobal();
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [points, setPoints] = useState(Number);
  const [XP, setXP] = useState(Number);
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
    }, [userData]);
  
    useEffect(() => {
      if (XP === null) return;
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
    }, [points]);
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
          <Text style={styles.detailText}>{Math.round(workout.durationSeconds / 60)}</Text>
          <Text style={styles.detailTextMins}>mins</Text>
          <Image source={icons.blueStreak} style={{width:105, height:106, marginLeft:60}}/>
      </View>
      <View style={styles.detailsXProw}>
        {badgeImage && (
        <Image
          source={
            typeof badgeImage === "string"
              ? { uri: badgeImage }
              : badgeImage
          }
          className="w-28 h-28"
        />
        )}
        <View style={styles.xpContainer}>
          <Text style={styles.xpTitle}>total XP earned:</Text>
          <View style={styles.detailsXProw}>
            <Text style={styles.xpSecondTitle}>+ {workout.points}</Text>
            <Text style={styles.xpThridTitle}>xp</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>You did:</Text>
      
      {/* List of Exercises */}
      {workout.exercises.map((exercise, index) => (
        <View key={exercise._id || index} style={styles.exerciseCard}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={{color:'white', fontFamily:'raleway-semibold', fontSize:11, textTransform: 'uppercase', marginLeft:-10}}>Earned:</Text>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          {exercise.sets && exercise.sets.length > 0 && (
            <Text style={styles.setText}>
              {`${exercise.sets[0].weight} lbs, ${exercise.sets[0].reps} reps x ${exercise.sets.length} sets`}
            </Text>
          )}
          <View style={styles.detailsXProw}>
            <Text style={{color:'#8AFFF9', fontFamily:'raleway-semibold', fontSize:20, textTransform: 'uppercase', marginLeft:-10}}>5</Text>
            <Text style={{color:'#8AFFF9', fontFamily:'raleway-semibold', fontSize:13, textTransform: 'uppercase', margin:5}}>xp</Text>
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
    backgroundColor: '#000000', // A semi-transparent dark blue
    padding: 20,
    marginTop: 25,
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
    justifyContent: 'space-around',
    paddingBottom: 10,
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
    marginTop:40,
    marginLeft:-10
  },
  detailsXProw:{
    flexDirection:'row',
  },
  xpContainer:{
    marginTop:20,
    marginLeft:10
  },
  xpTitle:{
    fontFamily:'raleway-semibold',
    fontSize:16,
    color:'white',
    textTransform: 'uppercase',
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
    margin:5,
    marginTop:15
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
    backgroundColor: '#1C1C20',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'poppins-medium',
    marginBottom: 5,
  },
  setText: {
    color: '#DDDDDD',
    fontSize: 14,
    fontFamily: 'poppins-regular',
  },
});

