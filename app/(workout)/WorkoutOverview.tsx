import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import icons from "@/constants/icons";
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useGlobal } from '@/context/GlobalProvider';
import WorkoutCard from '@/components/WorkoutCard';
import RadialGradient from '@/components/RadialGradient';
import GlassBackground from '@/components/GlassBackground';
import axios from 'axios';
import AppIcon from '@/components/AppIcon';


const WorkoutOverview = () => {

    const { userWorkoutData, userData, selectedChallenges, fetchFitnessData, fetchWorkoutFocus, fetchUserRoutine } = useGlobal();
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [userFitnessData, setUserFitnessData] = useState('');
    const [userFitnessLevel, setUserFitnessLevel] = useState('');
    const [points, setPoints] = useState(Number);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workoutDayLabel, setWorkoutDayLabel] = useState('');

    const theme = userData.defaultTheme;

    const TRACK_WIDTH = Dimensions.get('window').width - 40;
    const THUMB_SIZE = 64;
    const MAX_SLIDE = TRACK_WIDTH - THUMB_SIZE - 8;

    const dragX = useSharedValue(0);
    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: Math.max(0, Math.min(dragX.value, MAX_SLIDE)) }],
    }));

    const chevronStyle = useAnimatedStyle(() => ({
        opacity: interpolate(dragX.value, [0, MAX_SLIDE * 0.5], [1, 0], 'clamp'),
    }));

    function navigateToWorkout() {
        router.navigate('/(workout)/ActiveWorkoutScreen');
    }

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            dragX.value = Math.max(0, Math.min(e.translationX, MAX_SLIDE));
        })
        .onEnd((e) => {
            if (e.translationX >= MAX_SLIDE * 0.8) {
                dragX.value = withSpring(MAX_SLIDE, {}, () => {
                    dragX.value = 0;
                    runOnJS(navigateToWorkout)();
                });
            } else {
                dragX.value = withSpring(0);
            }
        });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {

            try {
                setPoints(((userWorkoutData?.warmup?.length ?? 0) + (userWorkoutData?.workoutRoutine?.length ?? 0)) * 5);
                setTimeEstimate(userWorkoutData?.timeEstimate ?? '');
                setFocus(userWorkoutData?.focus ?? '');
                const response = await fetchFitnessData(userData._id);
                setUserFitnessData(response);
                setUserFitnessLevel(response.fitnessLevel);
                console.log("Fetched fitness data:", response);

                const routine = await fetchUserRoutine(userData._id);
                const routineArray = routine?.routine || [];
                if (routineArray.length) {
                    const workoutDays = routineArray.filter((d: any) => d.focus !== 'Rest');
                    const todayName = new Date().toLocaleString('en-US', { weekday: 'long' });
                    const dayIndex = workoutDays.findIndex((d: any) => d.day === todayName);
                    if (dayIndex !== -1) {
                        setWorkoutDayLabel(`Day ${dayIndex + 1} of ${workoutDays.length}`);
                    }
                }

            } catch (error) {
                console.error("Error fetching workout data:", error);
            }
        };

        fetchData();
    }, [userData]);



    async function handleEdit() {

        console.log("Fetching workout focus for:", focus, "at level:", userFitnessLevel);
        const res = await fetchWorkoutFocus(focus, userFitnessLevel);
        if (res) {
            router.push('/(components)/workout/EditWorkout');
        } else {
            console.log("Error fetching workout focus");
        }

    }

    return (
        <ImageBackground
            source={require('@/assets/images/OverviewBackground.png')}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Close Button */}
                <View style={styles.closeButtonContainer}>
                    <ImageBackground
                        source={require('@/assets/images/GradientButton.png')}
                        style={{ width: 109, height: 50 }}
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.closeButton}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="lessThan" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </ImageBackground>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SpaceGrotesk-Bold' }}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <ImageBackground
                        source={require('@/assets/images/GradientButton.png')}
                        style={{ width: 109, height: 50 }}
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.closeButton}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="pencilIcon" size={15} color="#FFFFFF" />
                        </TouchableOpacity>
                    </ImageBackground>
                </View>

                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-light' }}>{workoutDayLabel}</Text>
                </View>
                <GlassBackground style={styles.headerContainer}>
                    <Text style={styles.workoutTitle}>{focus}</Text>
                </GlassBackground>

                {/* Stats Card */}
                <View style={{ flex: 1, marginBottom: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'Poppins-light' }}>estimated</Text>
                    <Text style={styles.timeNumber}>{timeEstimate}</Text>
                    <Text style={styles.timeUnit}>mins</Text>
                </View>
                {/** 
                <View style={styles.statsCard}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeUnit}>mins</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.xpContainer}>
                        <Text style={styles.xpLabel}>TOTAL XP</Text>
                        <View style={styles.xpValueContainer}>
                            <Text style={styles.xpNumber}>+{points}</Text>
                            <Text style={styles.xpUnit}>xp</Text>
                        </View>
                    </View>
                </View>
        
                {/* Primary CTA Button 
                <CustomButton
                    title="Let's Go!"
                    handlePress={() => router.navigate('/(workout)/ActiveWorkoutScreen')}
                    buttonStyle={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                />

                {/* Overview Section 
                <View style={styles.overviewHeader}>
                    <Text style={styles.overviewTitle}>Workout Plan</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Workout Cards */}
                <View style={styles.workoutCardsContainer}>
                    <WorkoutCard workoutRoutine={userWorkoutData?.warmup ?? []} title='Warm-Up' />
                    <WorkoutCard workoutRoutine={userWorkoutData?.workoutRoutine ?? []} title='Main Workout' />
                    {/* <WorkoutCard workoutRoutine={userWorkoutData.cooldown} title='Cool Down'/> */}
                </View>

                {/* Bottom Decoration 
                <View style={styles.bottomDecoration}>
                    <Image 
                        source={icons.blueStreak} 
                        style={{height: 60, width: 60, opacity: 0.8}}
                    />
                </View>
                */}
            </ScrollView>

            {/* Slide to Start Button */}
            <View style={styles.slideContainer}>
                <View style={styles.slideTrack}>
                    <Reanimated.Text style={[styles.slideChevrons, chevronStyle]}>
                        {'›› ›'}
                    </Reanimated.Text>
                    <Text style={styles.slideLabel}>start workout</Text>
                    <GestureDetector gesture={panGesture}>
                        <Reanimated.View style={[styles.slideThumb, thumbStyle]}>
                            <Text style={{ color: '#FFFFFF', fontSize: 22 }}>→</Text>
                        </Reanimated.View>
                    </GestureDetector>
                </View>
            </View>
        </ImageBackground>
    )
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    closeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 60,
        marginHorizontal: 20,
    },
    closeButton: {
        width: 109,
        height: 50,
        borderRadius: 90,
        //backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    headerContainer: {
        marginHorizontal: 20,
        width: '90%',
        height: 57,
        marginTop: 32,
        marginBottom: 24,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    workoutTitle: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: 'Poppins-light',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    statsCard: {
        marginHorizontal: 20,
        backgroundColor: '#1B191E',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    timeContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timeNumber: {
        marginTop: -20,
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 154,
        color: '#FFFFFF',
    },
    timeUnit: {
        marginTop: -30,
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 26,
        color: '#FFFFFF',
    },
    divider: {
        width: 1,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 20,
    },
    xpContainer: {
        alignItems: 'flex-end',
    },
    xpLabel: {
        fontFamily: 'raleway-semibold',
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    xpValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    xpNumber: {
        fontFamily: 'raleway-semibold',
        fontSize: 32,
        fontWeight: '700',
        color: '#6477E7',
    },
    xpUnit: {
        fontFamily: 'raleway-semibold',
        fontSize: 14,
        fontWeight: '600',
        color: '#6477E7',
        marginLeft: 4,
        opacity: 0.8,
    },
    primaryButton: {
        backgroundColor: '#1B191E',
        borderRadius: 16,
        paddingVertical: 18,
        marginHorizontal: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#6477E7',
        shadowColor: '#6477E7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'poppins-regular',
        letterSpacing: 0.3,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
    },
    overviewTitle: {
        fontFamily: 'poppins-regular',
        fontSize: 24,
        color: '#FFFFFF',
    },
    editButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#1B191E',
        borderRadius: 12,
    },
    editButtonText: {
        fontFamily: 'poppins-semibold',
        fontSize: 14,
        fontWeight: '600',
        color: '#6477E7',
        letterSpacing: 0.5,
    },
    workoutCardsContainer: {
        marginTop: 8,
    },
    bottomDecoration: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        opacity: 0.6,
    },
    slideContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    slideTrack: {
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        overflow: 'hidden',
    },
    slideThumb: {
        position: 'absolute',
        left: 4,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(40, 40, 45, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    slideLabel: {
        flex: 1,
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-light',
        letterSpacing: 0.5,
    },
    slideChevrons: {
        position: 'absolute',
        right: 20,
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 20,
        letterSpacing: 2,
    },
})

export default WorkoutOverview