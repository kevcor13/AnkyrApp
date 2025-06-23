import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Exercise } from '@/app/(workout)/ActiveWorkoutScreen';
import icons from '@/constants/icons';
import { router } from 'expo-router';

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
  nextExercise: Exercise;
  onStart: () => void;
  onEnd: () => void;
  xpEarned: number;
  currentExerciseIndex: number;
  totalExercises: number;
}
const screenWidth = Dimensions.get("window").width;

const UpNextScreen: React.FC<UpNextScreenProps> = ({
  nextExercise,
  onStart,
  onEnd,
  xpEarned,
  currentExerciseIndex,
  totalExercises,
}) => {
  // Animation for the progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(-screenWidth)).current;
  const slideAnim2 = useRef(new Animated.Value(-screenWidth)).current;
  const slideAnim3 = useRef(new Animated.Value(-screenWidth)).current;
  const slideAnim4 = useRef(new Animated.Value(-screenWidth)).current;

  // Calculate progress percentage
  const progress = totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  useEffect(() => {
    // Animate the progress bar to its new value
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 700,
      useNativeDriver: false, // 'width' is not supported by the native driver
    }).start();
    Animated.stagger(400, [
          Animated.timing(slideAnim1, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim2, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim3, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim4, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start();


  }, [currentExerciseIndex, totalExercises]); // Rerun animation if the index changes

  // Interpolate the animated value to a percentage string
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={['#FF0509', '#271293']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Section with Progress Bar */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                 <Image source={icons.halfArrow} style={styles.iconImage} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => onEnd}>
                <Image source={icons.stopButton} style={{ height: 24, width: 24 }}/>
            </TouchableOpacity>
        </View>

        <View style={styles.screen}>
            <View style={styles.topContent}>
              <Animated.View style={{ transform: [{ translateX: slideAnim1 }] }}>
                <Text style={styles.nicelyDoneText}>Nicely Done.</Text>
              </Animated.View>
                <View style={{flexDirection:'row', flex:1}}>
                    <Text style={styles.xpNumber}>+ {xpEarned}</Text>
                    <Text style={styles.xpText}>XP</Text>
                </View>
            </View>
        </View>

        {/* Middle Section */}
        <View style={styles.middleSection}>
          <Animated.View style={{ transform: [{ translateX: slideAnim2 }] }}>
            <Text style={styles.upNextLabel}>Up next:</Text>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
          <Text style={styles.exerciseName}>
            {nextExercise.exercise.toUpperCase()}
          </Text>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: slideAnim3 }] }}>
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
          </Animated.View>
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
