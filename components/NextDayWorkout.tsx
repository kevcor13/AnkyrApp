import React from 'react';
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
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((ex, idx) => (
          <View key={`${title}-${idx}-${ex.exerciseName}`} style={styles.exerciseCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.exerciseName}>{ex.exerciseName}</Text>

              {!!ex.videoUrl && (
                <TouchableOpacity onPress={() => openVideo(ex.videoUrl)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Text style={styles.watchText}>watch ▶︎</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={styles.setText}>
                {`${ex.reps} x ${ex.sets} ${ex.sets === 1 ? 'set' : 'sets'}`}
              </Text>
              <Text style={styles.difficultyText}>{ex.difficulty}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ marginBottom: 6 }}>
        <Text style={styles.headerKicker}>Next Workout</Text>
        <Text style={styles.workoutName}>{`${workout.day} — ${workout.focus}`}</Text>
      </View>

      {/* Details Row: Time estimate and flair */}
      <View style={styles.detailsRow}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={styles.detailText}>{workout.timeEstimate}</Text>
          <Text style={styles.detailTextMins}>mins</Text>
        </View>
        <Image source={icons.blueStreak} style={{ width: 105, height: 106, marginLeft: 60 }} />
      </View>

      {/* Sections */}
      <Section title="Warm-up" data={workout.warmup} />
      <Section title="Workout" data={workout.workoutRoutine} />
      <Section title="Cooldown" data={workout.cooldown} />
    </View>
  );
};

export default NextDayWorkout;

// ----- Styles (kept close to your WorkoutLogDetail for consistency) ----- //

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    padding: 20,
    marginTop: 25,
  },
  headerKicker: {
    color: '#78F5D8',
    fontFamily: 'poppins-semibold',
    fontSize: 12,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 8,
  },
  detailText: {
    color: '#38FFF5',
    fontFamily: 'poppins-semiBold',
    fontSize: 64,
    lineHeight: 64,
  },
  detailTextMins: {
    color: '#38FFF5',
    fontFamily: 'poppins-semiBold',
    fontSize: 24,
    marginLeft: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'poppins-semibold',
    marginBottom: 12,
    textTransform: 'uppercase',
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
  },
  setText: {
    color: '#DDDDDD',
    fontSize: 14,
    fontFamily: 'poppins-regular',
  },
  difficultyText: {
    color: '#8AFFF9',
    fontSize: 12,
    fontFamily: 'raleway-semibold',
    textTransform: 'uppercase',
  },
  watchText: {
    color: '#8AFFF9',
    fontSize: 12,
    fontFamily: 'raleway-semibold',
    textTransform: 'uppercase',
  },
});
