import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import icons from '@/constants/icons';
import { router } from 'expo-router';
import { useGlobal } from '@/context/GlobalProvider';
import type { WorkoutSessionItem } from '@/app/(components)/workout/workoutSession';

/**
 * Props for the UpNextScreen component.
 * @interface UpNextScreenProps
 * @property {Exercise} nextExercise - The exercise object for the upcoming exercise.
 * @property {() => void} onStart - Function to call when the "Start" button is pressed.
 * @property {number} xpEarned - The amount of XP earned from the previous exercise.
 * @property {number} currentExerciseIndex - The index of the upcoming exercise.
 * @property {number} totalExercises - The total number of exercises in the workout.
 */
interface UpNextScreenProps {
  nextExercise: WorkoutSessionItem;
  onStart: () => void;
  onEnd: () => void;
  xpEarned: number;
  currentExerciseIndex: number;
  totalExercises: number;
}

const UpNextScreen: React.FC<UpNextScreenProps> = ({
  nextExercise,
  onStart,
  onEnd,
  xpEarned,
  currentExerciseIndex,
  totalExercises,
}) => {
  const { userData } = useGlobal();
  const theme = userData.defaultTheme;

  // Calculate progress percentage
  const progress = totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  // Interpolate the animated value to a percentage string
  const progressWidth = `${progress * 100}%` as `${number}%`;

  return (
    <LinearGradient colors={theme ? ['#FF0509', '#271293'] : ["#000000", "#272727"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Section with Progress Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Image source={icons.halfArrow} style={styles.iconImage} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            {/* Changed from Animated.View to View */}
            <View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => onEnd}>
            <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.screen}>
          <View style={styles.topContent}>
            {/* Removed Animated.View wrapper */}
            <Text style={styles.nicelyDoneText}>Nicely Done.</Text>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Text style={styles.xpNumber}>+ {xpEarned}</Text>
              <Text style={styles.xpText}>XP</Text>
            </View>
          </View>
        </View>

        {/* Middle Section */}
        <View style={styles.middleSection}>
          {/* Removed Animated.View wrapper */}
          <Text style={styles.upNextLabel}>Up next:</Text>
          
          {/* Removed Animated.View wrapper */}
          <Text style={styles.exerciseName}>
            {nextExercise.exerciseName.toUpperCase()}
          </Text>
          
          {/* Removed Animated.View wrapper */}
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Image source={icons.whiteZap} style={styles.zapIcon} resizeMode='contain' />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        width: '100%',
    },
    iconButton: {
        backgroundColor: "rgba(217, 217, 217, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 22.5,
        height: 45,
        width: 45,
    },
    iconImage: {
        height: 24,
        width: 24,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        marginHorizontal: 15,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    screen:{
        margin:5
    },
    topContent: {
        flexDirection:'row',
        paddingHorizontal: 30,
    },
    middleSection: {
        width: '100%',
        paddingHorizontal: 30,
    },
    bottomSection: {
        height: 60,

    },
    nicelyDoneText: {
        paddingTop:30,
        fontFamily: 'Poppins-Bold',
        fontSize: 55,
        lineHeight:40,
        letterSpacing:-2,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    xpText:{
        fontFamily:'raleway-semibold',
        fontSize:13,
        position:'absolute',
        color:'#8AFFF9',
        top:75
    },
    xpNumber: {
        fontFamily: 'raleway-semibold',
        fontSize: 27,
        color: '#8AFFF9',
        position: 'absolute',
        right: 10,
        top: 60,
    },
    upNextLabel: {
        fontFamily: 'Poppins-semibold',
        fontSize: 24,
        color: '#8AFFF9',
    },
    exerciseName: {
        fontFamily: 'Poppins-bold',
        fontStyle:'italic',
        fontSize: 40,
        color: '#FFFFFF',
        letterSpacing:-1,
        paddingTop:35,
        lineHeight:30,
        textTransform: 'uppercase',
    },
    startButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 30,
        paddingVertical: 18,
        marginTop:20,
        width: '90%',
        alignItems: 'center',
    },
    startButtonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: '#FFFFFF',
    },
    zapIcon: {
        width: 40,
        height: 40,
    },
});

export default UpNextScreen;
