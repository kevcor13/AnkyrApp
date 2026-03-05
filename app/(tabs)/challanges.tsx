import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarSelector from "@/components/CalendarView";
import CustomButton from "@/components/CustomButton";
import axios from "axios";
import LeagueHeader from "@/components/LeagueHeader";
import { LinearGradient } from "expo-linear-gradient";
import React, { use, useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image, Modal, Platform, Animated, Dimensions, PanResponder } from "react-native";
import icons from "@/constants/icons";
import images from '@/constants/images';
import { router } from "expo-router";
import GraphView from "@/components/GraphView";
import WorkoutLogDetail, { IWorkoutLog } from '@/components/WorkoutLogDetail'
import NextDayWorkout from "@/components/NextDayWorkout";
import LeagueMembers from "@/components/LeagueMembers";
import { SafeAreaView } from "react-native-safe-area-context";
import DateDropdown from "@/components/DateDropDown";
import { modalStyles as Mstyle } from '@/constants/modalStyles';


interface IChallenge {
    exercise: string;
    duration: string;
    xp: number;
    [key: string]: any;
}

const ChallengesPage: React.FC = () => {
    const [leagueOpen, setLeagueOpen] = useState(false);
    const { userData, userGameData, ngrokAPI, userWorkoutData, challenges, loggedWorkouts, addChallengesToWorkout, fetchWorkout, fetchGameData, fetchUserRoutine, fetchTemporaryUserRoutine } = useGlobal();
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showChallanges, setShowChallanges] = useState(false)
    const [currentDay, setCurrentDay] = useState('');
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isWorkoutAllowed, setIsWorkoutAllowed] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<IWorkoutLog | null>(null);
    const [showNextDayWorkout, setShowNextDayWorkout] = useState(false);
    const [nextDayWorkout, setNextDayWorkout] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isNotCompleted, setIsNotCompleted] = useState(false);
    const [locallySelectedChallenges, setLocallySelectedChallenges] = useState<IChallenge[]>([]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [userRoutine, setUserRoutine] = useState<any>(null);

    const [isRestDay, setIsRestDay] = useState(false);


    const panY = useRef(new Animated.Value(0)).current; // For swipe down
    const contentOpacity = useRef(new Animated.Value(1)).current; // For date switching
    const SCREEN_HEIGHT = Dimensions.get('screen').height;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const today = new Date().toLocaleString("en-US", { weekday: "long" });

                setCurrentDay(today);
                fetchGameData(token, userData._id);

                // Fetch routine when entering Challenges page - check temporary first, then regular
                if (userData?._id) {
                    // First, try to fetch temporary routine
                    let routineToUse = null;
                    const tempRoutine = await fetchTemporaryUserRoutine(userData._id);
                    
                    if (tempRoutine) {
                        console.log("Found temporary routine, using it:", JSON.stringify(tempRoutine, null, 2));
                        routineToUse = tempRoutine;
                    } else {
                        // If no temporary routine, fetch regular routine
                        console.log("No temporary routine found, fetching regular routine");
                        const fetchedRoutine = await fetchUserRoutine(userData._id);
                        if (fetchedRoutine) {
                            routineToUse = fetchedRoutine;
                            console.log("User Routine Schema:", JSON.stringify(fetchedRoutine, null, 2));
                        }
                    }
                    
                    if (routineToUse) {
                        setUserRoutine(routineToUse);
                    }
                }

                if (userWorkoutData) {
                    console.log("Fetched workout data:", userWorkoutData);
                    setTimeEstimate(userWorkoutData.timeEstimate);
                    setFocus(userWorkoutData.focus);
                } else {
                    setIsRestDay(true);
                }
            } catch (error) {
                console.error("Error fetching workout data:", error);
            }
        };
        fetchData();
    }, [userData, userWorkoutData]);

    useEffect(() => {
        if (userData) {
            const alreadyDoneToday = isSameDay(userData.lastWorkoutCompletionData, new Date());
            const workoutForDay = loggedWorkouts.find((log: IWorkoutLog) => isSameDay(log.date, new Date()));
            if (alreadyDoneToday) {
                setIsWorkoutAllowed(alreadyDoneToday);
                setSelectedWorkout(workoutForDay);
            }
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [userData]);

    // Automatically show today's workout from routine when routine is loaded and modal opens
    useEffect(() => {
        if (userRoutine && showDateModal) {
            // Small delay to ensure modal is rendered
            const timer = setTimeout(() => {
                const today = new Date();
                handleDateSelect(today);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userRoutine, showDateModal]);

    const isSameDay = (date1: string | number | Date, date2: string | number | Date) => {
        if (!date1 || !date2) return false;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getStatusForDate = (date: Date) => {
        const today = new Date();
        if (isSameDay(date, today)) {
            return loggedWorkouts.some((log: { date: string | number | Date; }) => isSameDay(log.date, today)) ? "completed" : "today";
        } else if (date < today) {
            return "upcoming";
        } else {
            return loggedWorkouts.some((log: { date: string | number | Date; }) => isSameDay(log.date, date)) ? "completed" : "missed";
        }
    }

    const handleDateSelect = async (selectedDate: Date) => {
        setSelectedDate(selectedDate);
        const today = new Date();
        const selectedDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

        // First check if there's a completed workout for this date
        const workoutForDay = loggedWorkouts.find((log: { date: string | number | Date; }) => isSameDay(log.date, selectedDate));
        
        if (workoutForDay) {
            // Show completed workout
            setSelectedWorkout(workoutForDay);
            setNextDayWorkout(null);
            setShowNextDayWorkout(false);
            setIsWorkoutAllowed(isSameDay(selectedDate, today));
        } else {
            // No completed workout, check routine for scheduled workout
            setSelectedWorkout(null);
            
            if (userRoutine?.routine) {
                // Find workout for this day in the routine
                const routineDay = userRoutine.routine.find((day: any) => day.day === selectedDayName);
                
                if (routineDay) {
                    // Format the routine day to match NextDayWorkout component structure
                    const formattedWorkout = {
                        day: routineDay.day,
                        focus: routineDay.focus || userWorkoutData?.focus || '',
                        timeEstimate: routineDay.timeEstimate || userWorkoutData?.timeEstimate || 0,
                        warmup: routineDay.warmup || [],
                        workoutRoutine: routineDay.workoutRoutine || [],
                        cooldown: routineDay.cooldown || []
                    };
                    setNextDayWorkout(formattedWorkout);
                    setShowNextDayWorkout(true);
                } else {
                    // No workout scheduled for this day
                    setNextDayWorkout(null);
                    setShowNextDayWorkout(false);
                }
            } else if (selectedDate > today) {
                // Fallback: fetch workout data from API if routine not available
                const token = await AsyncStorage.getItem("token");
                const UserID = userData._id;
                const date = selectedDate;
                try {
                    const response = await axios.post(`${ngrokAPI}/api/user/getWorkoutData`, {
                        token: token,
                        date,
                        UserID
                    });
                    setNextDayWorkout(response.data.data);
                    setShowNextDayWorkout(true);
                } catch (error) {
                    console.error("Error fetching workout data:", error);
                    setNextDayWorkout(null);
                    setShowNextDayWorkout(false);
                }
            } else {
                setNextDayWorkout(null);
                setShowNextDayWorkout(false);
                setIsNotCompleted(true);
            }
            
            setIsWorkoutAllowed(false);
        }
    };

    const handleRoutineUpdated = async (updatedRoutine: any) => {
        console.log("Routine updated in CalendarView, updating local state:", updatedRoutine);
        setUserRoutine(updatedRoutine);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            console.error("No authentication token found");
            return;
        }
        // Refresh the workout data from the server (this will update userWorkoutData in GlobalProvider)
        // fetchWorkout already sets userWorkoutData globally, so we don't need to set it here
        if (userData?._id) {
            await fetchWorkout(token, userData._id);
            console.log("Refreshed workout data from server");
        }
    };

    const handleChallengeSelection = (challengeToToggle: IChallenge) => {
        setLocallySelectedChallenges(prev => {
            const isAlreadySelected = prev.some(c => c.exercise === challengeToToggle.exercise);
            if (isAlreadySelected) {
                return prev.filter(c => c.exercise !== challengeToToggle.exercise);
            } else {
                return [...prev, challengeToToggle];
            }
        });
    };

    const handleAddSelectedChallenges = () => {
        addChallengesToWorkout(locallySelectedChallenges);
        setShowChallanges(false);
        setLocallySelectedChallenges([]);
    };

    const closeDateModal = () => {
        setShowDateModal(false);
            panY.setValue(0);
    };


    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dy > 0) panY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    closeDateModal();
                } else {
                    Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    const formatModalDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleModalDateClick = (date: Date) => {
        setShowDateModal(false);
        router.push({
            pathname: '../(workout)/FutureWorkout',
            params: { date: date.toISOString() }
        });
    };

    const handleViewFullWeek = () => {
        setShowDateModal(false);
        router.push('../(workout)/FullWeekView');
    };

const badgeMap: Record<string, any> = {
    OLYMPIAN: images.Olympian,
    TITAN:    images.titan,
    SKIPPER:  images.skipperBadge,
    PILOT:    images.pilot,
    PRIVATE:  images.Private,
    NOVICE:   images.novice,
};

const getLeagueImage = (league: string | undefined) => {
    if (!league) return images.novice;
    return badgeMap[league.toUpperCase()] ?? images.novice;
};


    return (

        // <LinearGradient
        //     colors={['#FF0509', '#271293']}
        //     style={styles.mainContainer}
        // >

        <View style={{ backgroundColor: "#000000" }}>
            {/** Stationary Gradient */}
            <LinearGradient
                colors={['#000000', '#000000', 'transparent']}
                locations={[0, 0.43, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 10 }}
            />

            {/** Stationary Header */}
            <SafeAreaView style={[styles.header, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }]}>
    <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
            setShowDateModal(true);
            handleDateSelect(new Date());
        }}
        activeOpacity={0.7}
    >
        <Text style={styles.dateButtonText}>
            {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            }).replace(',', ', ')}
        </Text>
        <Text style={styles.dateArrow}>▼</Text>
    </TouchableOpacity>

    {/* Stats Row */}
    <View style={styles.headerStats}>
        {/* Streak 
        <View style={styles.headerStat}>
            <Image source={icons.blueStreak} style={[styles.headerStatIcon, { tintColor: '#A855F7' }]} />
            <Text style={styles.headerStatValue}>{userGameData?.streak ?? 0}</Text>
        </View>

        {/* Losses / Lives 
        <View style={styles.headerStat}>
            <Image source={icons.loss} style={[styles.headerStatIcon, { tintColor: '#FFFFFF', opacity: 0.8 }]} />
            <Text style={styles.headerStatValue}>{userGameData?.losses ?? 0}</Text>
        </View>

        {/* XP *
        <View style={styles.headerStat}>
            <Text style={styles.headerXP}>
                {(userGameData?.points ?? 0).toLocaleString()}
                <Text style={styles.headerXPUnit}> XP</Text>
            </Text>
        </View>

        {/* League Badge */}
        <View style={styles.leagueBadgeWrapper}>
            <Image
                source={getLeagueImage(userGameData?.league)}
                style={styles.leagueBadgeIcon}
                resizeMode="contain"
            />
        </View>
    </View>
</SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Card */}
                <LinearGradient
                    style={styles.headerCard}
                    colors={['#FF0509', '#271293']}
                >
                    <Text style={styles.dayLabel}>YOUR</Text>
                    <Text style={styles.dayText}>{currentDay}</Text>
                    <Text style={styles.workoutLabel}>WORKOUT</Text>

                    {isWorkoutAllowed || selectedWorkout ? (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>✓ COMPLETED</Text>
                        </View>
                    ) : (
                        <View style={styles.workoutInfoContainer}>
                            <Text style={styles.focusText}>{focus}</Text>
                            <View style={styles.timeRow}>
                                <Image source={icons.blueStreak} style={styles.timeIcon} />
                                <Text style={styles.timeText}>{timeEstimate} min</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.iosButton}
                                onPress={() => router.navigate("/(workout)/WorkoutOverview")}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.iosButtonText}>Start Workout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </LinearGradient>

                {/* Calendar 
                <View style={styles.calendarContainer}>
                    <CalendarSelector onSelect={handleDateSelect} getStatusForDate={getStatusForDate} />
                </View>

                {selectedWorkout && <WorkoutLogDetail workout={selectedWorkout} />}
                {showNextDayWorkout && <NextDayWorkout workout={nextDayWorkout} />}
                */}
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Image source={icons.whiteZap} style={styles.statIcon} />
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                        <Text style={styles.statValue}>{userGameData.streak}</Text>
                        <Text style={styles.statUnit}>days</Text>
                        <Text style={styles.statCaption}>Keep it going!</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statLabel}>XP</Text>
                            <TouchableOpacity
                                onPress={() => setShowInfoModal(true)}
                                style={styles.infoButton}
                            >
                                <Image source={icons.infoIcon} style={styles.infoIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.statValue}>{userGameData.points}</Text>
                        <Text style={styles.statUnit}>points</Text>
                        <Text style={styles.statCaption}>Impressive progress</Text>
                    </View>
                </View>

                {/* Challenges Button */}
                <TouchableOpacity
                    style={styles.challengesButton}
                    onPress={() => setShowChallanges(true)}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['rgba(56, 255, 245, 0.2)', 'rgba(56, 255, 245, 0.05)']}
                        style={styles.challengesGradient}
                    >
                        <Text style={styles.challengesTitle}>WEEKLY</Text>
                        <Text style={styles.challengesSubtitle}>CHALLENGES</Text>
                        <Image source={icons.whiteZap} style={styles.challengesIcon} />
                    </LinearGradient>
                </TouchableOpacity>

                 League Section 
                <View style={styles.leagueSection}>
                    {/*
                    <Text style={styles.leagueTitle}>MY LEAGUE</Text>
                        <LeagueHeader league={userGameData.league} />
                    */}
                    <LeagueMembers />
                </View>
            </ScrollView>





            {/* Date Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDateModal}
                onRequestClose={closeDateModal}
            >
                <View style={Mstyle.modelContainer}>
                    <Animated.View
                        style={[
                            Mstyle.dateModalContainer,
                            { transform: [{ translateY: panY }] } // Connects the swipe gesture
                        ]}
                    >
                        {/* Attached panHandlers to the header area specifically */}
                        <View style={Mstyle.modalHeader} {...panResponder.panHandlers}>
                            <View style={Mstyle.modalHandle} />
                            <TouchableOpacity
                                style={Mstyle.modalCloseButton}
                                onPress={closeDateModal}
                            >
                                <Text style={Mstyle.modalCloseText}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={Mstyle.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.calendarContainer}>
                                <CalendarSelector
                                    onSelect={handleDateSelect}
                                    getStatusForDate={getStatusForDate}
                                    userRoutine={userRoutine}
                                    userData={userData}
                                    ngrokAPI={ngrokAPI}
                                    onRoutineUpdated={handleRoutineUpdated}
                                />
                            </View>

                            {/* This Animated.View handles the smooth date switching */}
                            <Animated.View style={{ opacity: contentOpacity }}>
                                {selectedWorkout && <WorkoutLogDetail workout={selectedWorkout} />}
                                {showNextDayWorkout && <NextDayWorkout workout={nextDayWorkout} />}
                            </Animated.View>

                            {/* <View style={Mstyle.legendSection}>
                                <View style={Mstyle.legendItem}>
                                    <View style={Mstyle.legendColor} />
                                    <Text style={Mstyle.legendText}>Body Energy</Text>
                                </View>
                            </View> 

                            <TouchableOpacity
                                style={Mstyle.fullWeekButton}
                                onPress={handleViewFullWeek}
                                activeOpacity={0.7}
                            >
                                <Text style={Mstyle.fullWeekButtonText}>Today</Text>
                            </TouchableOpacity>
                            */}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Challenges Modal */}
            <Modal
                animationType='slide'
                transparent={true}
                visible={showChallanges}
                onRequestClose={() => setShowChallanges(false)}
                presentationStyle="pageSheet"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalTitleContainer}>
                                <Text style={styles.modalTitle}>Daily Challenges</Text>
                                <Image source={icons.whiteZap} style={styles.modalTitleIcon} />
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowChallanges(false)}
                            >
                                <Text style={styles.modalCloseText}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <Text style={styles.modalSubtitle}>GET AHEAD</Text>

                            {challenges.map((challenge: IChallenge, index: number) => {
                                const isSelected = locallySelectedChallenges.some(c => c.exercise === challenge.exercise);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.challengeCard, isSelected && styles.challengeCardSelected]}
                                        onPress={() => handleChallengeSelection(challenge)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.challengeCheckbox}>
                                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                        </View>

                                        <View style={styles.challengeInfo}>
                                            <Text style={styles.challengeName}>{challenge.exercise}</Text>
                                            <Text style={styles.challengeDuration}>{challenge.duration}</Text>
                                        </View>

                                        <View style={styles.challengeXp}>
                                            <Text style={styles.xpLabel}>+{challenge.xp}</Text>
                                            <Text style={styles.xpUnit}>XP</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={handleAddSelectedChallenges}
                                style={styles.addButton}
                                disabled={locallySelectedChallenges.length === 0}
                            >
                                <Text style={styles.addButtonText}>
                                    Add {locallySelectedChallenges.length > 0 ? `(${locallySelectedChallenges.length})` : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Info Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showInfoModal}
                onRequestClose={() => setShowInfoModal(false)}
            >
                <View style={styles.infoModalOverlay}>
                    <View style={styles.infoModalContainer}>
                        <Text style={styles.infoTitle}>How XP Works</Text>
                        <Text style={styles.infoText}>
                            Earn XP by completing workouts and maintaining streaks to climb league ranks and unlock rewards.
                        </Text>
                        <Text style={styles.infoText}>
                            Complete daily challenges and join events for bonus XP!
                        </Text>
                        <TouchableOpacity
                            style={styles.infoButton}
                            onPress={() => setShowInfoModal(false)}
                        >
                            <Text style={styles.infoButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ChallengesPage;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
    },
    mainContainer: {
        flex: 1,
    },
    headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 16,
    paddingVertical: 8,
}, 
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 60 : 60,
        paddingBottom: 120,
    },
    headerCard: {
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginHorizontal: 20,
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        backdropFilter: 'blur(10px)',
    },
    dayLabel: {
        fontSize: 46,
        fontFamily: 'quicksand-bold',
        color: 'white',
        letterSpacing: -2,
        fontWeight: '700',
        marginBottom: -20,
    },
    dayText: {
        fontSize: 46,
        fontFamily: 'quicksand-bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: -20,
    },
    workoutLabel: {
        fontSize: 46,
        fontFamily: 'quicksand-bold',
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: -2,
    },
    statusBadge: {
        backgroundColor: 'rgba(56, 255, 245, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    missedBadge: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
    },
    statusText: {
        color: '#38FFF5',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
    workoutInfoContainer: {
        marginTop: -10,
    },
    focusText: {
        fontSize: 32,
        color: '#8B8BEA',
        fontWeight: '600',
        fontFamily: 'raleway-light',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    timeRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 16,
    },
    timeIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    timeText: {
        fontSize: 17,
        color: '#38FFF5',
        fontWeight: '600',
    },
    iosButton: {
        backgroundColor: '#38FFF5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#38FFF5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    iosButtonText: {
        color: '#000',
        fontSize: 17,
        fontWeight: '600',
    },
    calendarContainer: {
        //marginTop: 20,
        //marginHorizontal: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statIcon: {
        width: 20,
        height: 20,
        tintColor: '#78F5D8',
    },
    statLabel: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 36,
        color: '#78F5D8',
        fontWeight: '700',
        letterSpacing: -1,
    },
    statUnit: {
        fontSize: 15,
        color: '#78F5D8',
        fontWeight: '500',
        marginTop: 2,
    },
    statCaption: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 8,
        fontStyle: 'italic',
    },
    infoButton: {
        padding: 4,
    },
    infoIcon: {
        width: 20,
        height: 20,
        tintColor: 'rgba(255, 255, 255, 0.5)',
    },
    challengesButton: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#38FFF5',
    },
    challengesGradient: {
        padding: 24,
        alignItems: 'center',
    },
    challengesTitle: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 8,
    },
    challengesSubtitle: {
        fontSize: 32,
        color: '#38FFF5',
        fontWeight: '700',
        letterSpacing: -1,
        marginTop: -8,
    },
    challengesIcon: {
        width: 24,
        height: 24,
        tintColor: '#38FFF5',
        position: 'absolute',
        top: 24,
        right: 24,
    },
    leagueSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    leagueTitle: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 1,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 60 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContainer: {
        //backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalHandle: {
        width: 36,
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 20,
        color: '#38FFF5',
        fontWeight: '700',
        marginRight: 8,
    },
    modalTitleIcon: {
        width: 24,
        height: 24,
        tintColor: '#38FFF5',
    },
    modalCloseButton: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    modalCloseText: {
        fontSize: 17,
        color: '#38FFF5',
        fontWeight: '600',
    },
    modalScroll: {
        paddingHorizontal: 10,
    },
    modalSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
        letterSpacing: 2,
        marginTop: 20,
        marginBottom: 16,
    },
    challengeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    challengeCardSelected: {
        backgroundColor: 'rgba(56, 255, 245, 0.1)',
        borderColor: '#38FFF5',
    },
    challengeCheckbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkmark: {
        color: '#38FFF5',
        fontSize: 16,
        fontWeight: '700',
    },
    challengeInfo: {
        flex: 1,
    },
    challengeName: {
        fontSize: 17,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 4,
    },
    challengeDuration: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    challengeXp: {
        alignItems: 'flex-end',
    },
    xpLabel: {
        fontSize: 20,
        color: '#38FFF5',
        fontWeight: '700',
    },
    xpUnit: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    addButton: {
        backgroundColor: '#38FFF5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#000',
        fontSize: 17,
        fontWeight: '700',
    },
    // Info Modal
    infoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    infoModalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 12,
    },
    infoButtonText: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 12,
    },

    /// Date Button Styles ///
    dateButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    dateArrow: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '400',
        marginLeft: 12,
    },
    dateModalTitle: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'center',
    },
    dateModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'space-between',
        //backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 18,
        marginBottom: 12,
    },
    dateModalItemText: {
        fontSize: 17,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    dateChevron: {
        marginLeft: 10,
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '300',
    },
    dateChevronCyan: {
        color: '#38FFF5',
    },
    fullWeekItem: {
        backgroundColor: 'rgba(56, 255, 245, 0.1)',
        borderWidth: 1,
        borderColor: '#38FFF5',
        marginTop: 8,
    },
    fullWeekItemText: {
        fontSize: 17,
        color: '#38FFF5',
        fontWeight: '600',
    },
    leagueBadgeWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    },
    leagueBadgeIcon: {
    width: 36,
    height: 36,
},
});