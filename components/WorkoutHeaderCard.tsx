import { requireNativeComponent, Platform, View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

interface WorkoutHeaderCardProps {
  day: string;
  focus: string;
  timeEstimate: number;
  isRestDay?: boolean;
  style?: ViewStyle;
}

// Only available on iOS — native component is not registered on Android
const NativeWorkoutHeaderCard = Platform.OS === 'ios'
  ? requireNativeComponent<WorkoutHeaderCardProps>('WorkoutHeaderCardManager')
  : null;

export default function WorkoutHeaderCard({
  day,
  focus,
  timeEstimate,
  isRestDay = false,
  style,
}: WorkoutHeaderCardProps) {
  if (!NativeWorkoutHeaderCard) {
    // Android fallback — render nothing (or a plain View placeholder)
    return <View style={[styles.fallback, style]} />;
  }

  return (
    <NativeWorkoutHeaderCard
      day={day}
      focus={focus}
      timeEstimate={timeEstimate}
      isRestDay={isRestDay}
      style={[styles.card, style]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    height: 188,
    width: '100%',
  },
  fallback: {
    height: 188,
    width: '100%',
    backgroundColor: '#292739',
    borderRadius: 35,
  },
});
