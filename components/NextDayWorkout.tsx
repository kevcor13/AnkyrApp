import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import icons from "@/constants/icons";
import images from "@/constants/images";

// ----- Interfaces for the Next-Day format you logged ----- //

export interface IPhaseExercise {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  exerciseName: string;
  reps: string;          // e.g., "30 seconds" or "12"
  sets: number;          // e.g., 3 or 4
  videoUrl?: string;     // optional URL
}

export interface INextDayWorkout {
  day: string;               // e.g., "Tuesday"
  focus: string;             // e.g., "Legs"
  timeEstimate: number;      // minutes, e.g., 45
  warmup: IPhaseExercise[];
  workoutRoutine: IPhaseExercise[];
  cooldown: IPhaseExercise[];
}

interface Props {
  workout: INextDayWorkout | null | undefined;
  // (Optional) you can pass the selected date if you want to show it somewhere
  // selectedDate?: string;
}

// ----- Component ----- //

const NextDayWorkout: React.FC<Props> = ({ workout }) => {
  if (!workout) return null;
  //const [isTodaysWorkout, setIsTodaysWorkout] = useState<boolean>()

  const today = new Date().toLocaleString("en-US", { weekday: "long" });
  const isTodaysWorkout = workout.day === today;



  const openVideo = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const Section = ({
    title,
    data,
  }: {
    title: string;
    data: IPhaseExercise[];
  }) => {
    if (!data || data.length === 0) return null;
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((ex, idx) => (
          <View key={`${title}-${idx}-${ex.exerciseName}`} style={styles.exerciseCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={styles.exerciseName}>{ex.exerciseName}</Text>

              {!!ex.videoUrl && (
                <TouchableOpacity 
                  onPress={() => openVideo(ex.videoUrl)} 
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  style={styles.videoButton}
                >
                  <Text style={styles.watchText}>Watch</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.setText}>
                {`${ex.sets} ${ex.sets === 1 ? 'set' : 'sets'} • ${ex.reps}`}
              </Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{ex.difficulty}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        {isTodaysWorkout ?  (
          <Text style={styles.headerKicker}>TODAY</Text>
        ):(
          <Text style={styles.headerKicker}>Next Workout</Text>
        )}
        <Text style={styles.workoutName}>{workout.focus}</Text>
        <Text style={styles.dayText}>{workout.day}</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeNumber}>{workout.timeEstimate}</Text>
          <Text style={styles.timeUnit}>mins</Text>
        </View>
        <Image 
          source={icons.blueStreak} 
          style={styles.streakImage}
          resizeMode="contain"
        />
      </View>

      {/* Sections */}
      <Section title="Warm-Up" data={workout.warmup} />
      <Section title="Main Workout" data={workout.workoutRoutine} />
      <Section title="Cool Down" data={workout.cooldown} />
    </View>
  );
};

export default NextDayWorkout;

// ----- Styles (iOS 18 inspired with modern glassmorphism) ----- //

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerKicker: {
    color: '#8AFFF9',
    fontFamily: 'raleway-semibold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.9,
    marginBottom: 8,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'raleway-light',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  dayText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontFamily: 'poppins-medium',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeNumber: {
    fontFamily: 'poppins-semibold',
    fontSize: 56,
    fontWeight: '700',
    color: '#8AFFF9',
    lineHeight: 64,
  },
  timeUnit: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    fontWeight: '600',
    color: '#8AFFF9',
    marginLeft: 6,
    opacity: 0.8,
  },
  streakImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  videoButton: {
    backgroundColor: 'rgba(138, 255, 249, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(138, 255, 249, 0.3)',
  },
  watchText: {
    color: '#8AFFF9',
    fontSize: 11,
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  setText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'poppins-regular',
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(138, 255, 249, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#8AFFF9',
    fontSize: 11,
    fontFamily: 'raleway-semibold',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});