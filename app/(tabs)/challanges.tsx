import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarSelector from "@/components/CalendarView";
import CustomButton from "@/components/CustomButton";
import axios from "axios";
import LeagueHeader from "@/components/LeagueHeader";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet, Image, Modal, Platform, Animated, Dimensions, PanResponder, ImageBackground } from "react-native";
import icons from "@/constants/icons";
import images from '@/constants/images';
import { router } from "expo-router";
import GraphView from "@/components/GraphView";
import WorkoutLogDetail from '@/components/WorkoutLogDetail'
import type { IWorkoutLog } from '@/components/WorkoutLogDetail'
import NextDayWorkout from "@/components/NextDayWorkout";
import LeagueMembers from "@/components/LeagueMembers";
import { SafeAreaView } from "react-native-safe-area-context";
import DateDropdown from "@/components/DateDropDown";
import { modalStyles as Mstyle } from '@/constants/modalStyles';
import MaskedView from '@react-native-masked-view/masked-view';
import ThisWeekCard from "@/components/ThisWeekCard";
import AppIcon from "@/components/AppIcon";
import App from "./camera";


interface IChallenge {
    exercise: string;
    duration: string;
    xp: number;
    [key: string]: any;
}

const ChallengesPage: React.FC = () => {
    const [leagueOpen, setLeagueOpen] = useState(false);
    const { userData, userGameData, ngrokAPI, userWorkoutData, challenges, loggedWorkouts, addChallengesToWorkout, fetchWorkout, fetchGameData, fetchUserRoutine, fetchTemporaryUserRoutine, useFloatie, activateRecoveryMode, endRecoveryMode } = useGlobal();
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
    const [showFloatiePrompt, setShowFloatiePrompt] = useState(false);
    const [floatieTargetDate, setFloatieTargetDate] = useState<Date | null>(null);
    const [isUsingFloatie, setIsUsingFloatie] = useState(false);
    const [isRestDay, setIsRestDay] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveryDuration, setRecoveryDuration] = useState(7);
    const [retroactiveDays, setRetroactiveDays] = useState(0);
    const [isActivatingRecovery, setIsActivatingRecovery] = useState(false);
    const [isEndingRecovery, setIsEndingRecovery] = useState(false);

    const panY = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const floatieCheckDone = useRef(false);
    const SCREEN_HEIGHT = Dimensions.get('screen').height;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const today = new Date().toLocaleString("en-US", { weekday: "long" });

                setCurrentDay(today);
                fetchGameData(token, userData._id);

                if (userData?._id) {
                    let routineToUse = null;
                    const tempRoutine = await fetchTemporaryUserRoutine(userData._id);

                    if (tempRoutine) {
                        console.log("Found temporary routine, using it:", JSON.stringify(tempRoutine, null, 2));
                        routineToUse = tempRoutine;
                    } else {
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

    useEffect(() => {
        if (userRoutine && showDateModal) {
            const timer = setTimeout(() => {
                const today = new Date();
                handleDateSelect(today);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userRoutine, showDateModal]);

    useEffect(() => {
        if (!userData?._id || !userRoutine || floatieCheckDone.current) return;

        const checkFloatiePrompt = async () => {
            const storageKey = `@floatie_dismissed_${userData._id}`;
            const stored = await AsyncStorage.getItem(storageKey);
            const dismissed = new Set<string>(stored ? JSON.parse(stored) : []);
            const targetDate = getMostRecentEligibleMissedDate(dismissed);
            if (targetDate) {
                floatieCheckDone.current = true;
                setFloatieTargetDate(targetDate);
                setShowFloatiePrompt(true);
            }
        };

        checkFloatiePrompt();
    }, [userRoutine, userData?._id, loggedWorkouts, userGameData?.floatiesRemaining, userGameData?.coveredDateKeysCurrentMonth]);

    const isSameDay = (date1: string | number | Date, date2: string | number | Date) => {
        if (!date1 || !date2) return false;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const toDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const normalizeStartOfDay = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };

    const isInCurrentMonth = (date: Date) => {
        const today = new Date();
        return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
    };

    const getRoutineDayForDate = (date: Date) => {
        if (!userRoutine?.routine || !Array.isArray(userRoutine.routine)) return null;
        const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
        return userRoutine.routine.find((day: any) => day?.day === weekday) || null;
    };

    const isScheduledWorkoutDate = (date: Date) => {
        const routineDay = getRoutineDayForDate(date);
        if (!routineDay) return false;
        const focus = String(routineDay.focus || "").trim().toLowerCase();
        const exercises = Array.isArray(routineDay.workoutRoutine) ? routineDay.workoutRoutine : [];
        return focus !== "rest" && exercises.length > 0;
    };

    const hasLoggedWorkoutForDate = (date: Date) => {
        return loggedWorkouts.some((log: { date: string | number | Date }) => isSameDay(log.date, date));
    };

    const coveredDateKeys = Array.isArray(userGameData?.coveredDateKeysCurrentMonth)
        ? userGameData.coveredDateKeysCurrentMonth
        : [];

    const isAlreadyCoveredDateKey = (date: Date) => {
        return coveredDateKeys.includes(toDateKey(date));
    };

    const recoveryMode = userGameData?.recoveryMode ?? null;
    const tokensRemaining = recoveryMode?.tokensRemaining ?? (3 - (userGameData?.recoveryTokensUsed ?? 0));

    const handleActivateRecovery = async () => {
        setIsActivatingRecovery(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - retroactiveDays);
            const startDateKey = toDateKey(startDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + recoveryDuration);
            const endDateKey = toDateKey(endDate);
            await activateRecoveryMode(userData._id, startDateKey, endDateKey);
            setShowRecoveryModal(false);
            setRetroactiveDays(0);
            setRecoveryDuration(7);
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.data || e?.message || "Could not activate Recovery Mode.");
        } finally {
            setIsActivatingRecovery(false);
        }
    };

    const handleEndRecovery = async () => {
        setIsEndingRecovery(true);
        try {
            await endRecoveryMode(userData._id);
            setShowRecoveryModal(false);
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Could not end Recovery Mode.");
        } finally {
            setIsEndingRecovery(false);
        }
    };

    const getMostRecentEligibleMissedDate = (dismissed: Set<string> = new Set()) => {
        if (!userRoutine?.routine || !userData?._id) return null;
        if (Number(userGameData?.floatiesRemaining ?? 0) <= 0) return null;

        const today = normalizeStartOfDay(new Date());
        const cursor = new Date(today);
        cursor.setDate(cursor.getDate() - 1);

        // Walk back to find the single most recent scheduled workout day before today.
        // If it was completed, covered, or already dismissed → no prompt.
        // We stop at the first scheduled day we find, so old missed days
        // from earlier in the month never trigger the prompt.
        while (cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear()) {
            if (isScheduledWorkoutDate(cursor)) {
                const dateKey = toDateKey(cursor);
                const isCovered = hasLoggedWorkoutForDate(cursor) || isAlreadyCoveredDateKey(cursor);
                if (isCovered || dismissed.has(dateKey)) return null;
                return new Date(cursor);
            }
            cursor.setDate(cursor.getDate() - 1);
        }
        return null;
    };

    const formatCycleKey = (cycleKey: string | null | undefined) => {
        if (!cycleKey || !/^\d{4}-\d{2}$/.test(cycleKey)) return "";
        const [year, month] = cycleKey.split("-");
        const parsed = new Date(Number(year), Number(month) - 1, 1);
        return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    const getFloatieEligibility = (date: Date | null) => {
        if (!date) return { canUse: false, reason: "Select a date to use a floatie." };

        const selected = normalizeStartOfDay(new Date(date));
        const today = normalizeStartOfDay(new Date());
        const remaining = Number(userGameData?.floatiesRemaining ?? 0);

        if (selected >= today) return { canUse: false, reason: "Floaties can only be used for past dates." };
        if (!isInCurrentMonth(selected)) return { canUse: false, reason: "Floaties can only be used in the current month." };
        if (!isScheduledWorkoutDate(selected)) return { canUse: false, reason: "This date is a rest day or unscheduled." };
        if (hasLoggedWorkoutForDate(selected)) return { canUse: false, reason: "Workout already completed for this date." };
        if (isAlreadyCoveredDateKey(selected)) return { canUse: false, reason: "This date is already covered." };
        if (remaining <= 0) return { canUse: false, reason: "No floaties remaining this month." };

        return { canUse: true, reason: "" };
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

        const workoutForDay = loggedWorkouts.find((log: { date: string | number | Date; }) => isSameDay(log.date, selectedDate));

        if (workoutForDay) {
            setSelectedWorkout(workoutForDay);
            setNextDayWorkout(null);
            setShowNextDayWorkout(false);
            setIsWorkoutAllowed(isSameDay(selectedDate, today));
        } else {
            setSelectedWorkout(null);

            if (userRoutine?.routine) {
                const routineDay = userRoutine.routine.find((day: any) => day.day === selectedDayName);

                if (routineDay) {
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
                    setNextDayWorkout(null);
                    setShowNextDayWorkout(false);
                }
            } else if (selectedDate > today) {
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

    const handleDismissFloatiePrompt = async () => {
        if (floatieTargetDate && userData?._id) {
            const dateKey = toDateKey(floatieTargetDate);
            const storageKey = `@floatie_dismissed_${userData._id}`;
            const stored = await AsyncStorage.getItem(storageKey);
            const dismissed: string[] = stored ? JSON.parse(stored) : [];
            if (!dismissed.includes(dateKey)) {
                dismissed.push(dateKey);
                await AsyncStorage.setItem(storageKey, JSON.stringify(dismissed));
            }
        }
        setShowFloatiePrompt(false);
    };

    const handleUseFloatieForDate = async (date: Date | null, closePrompt = false) => {
        if (!date || !userData?._id || isUsingFloatie) return;

        const eligibility = getFloatieEligibility(date);
        if (!eligibility.canUse) {
            Alert.alert("Floatie unavailable", eligibility.reason);
            return;
        }

        try {
            setIsUsingFloatie(true);
            const response = await useFloatie(
                userData._id,
                date.toISOString(),
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                new Date().toISOString()
            );

            if (!response?.success) {
                Alert.alert("Unable to use floatie", response?.message || "Please try again.");
                return;
            }

            Alert.alert(
                "Floatie used",
                `Saved ${response.usedDateKey || toDateKey(date)}. ${response.floatiesRemaining} remaining this month.`
            );

            if (selectedDate && isSameDay(selectedDate, date)) {
                await handleDateSelect(new Date(selectedDate));
            }

            if (closePrompt) {
                setShowFloatiePrompt(false);
                setFloatieTargetDate(null);
            }
        } catch (error) {
            Alert.alert("Unable to use floatie", "Please try again.");
        } finally {
            setIsUsingFloatie(false);
        }
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
        TITAN: images.titan,
        SKIPPER: images.skipperBadge,
        PILOT: images.pilot,
        PRIVATE: images.Private,
        NOVICE: images.novice,
    };

    const getLeagueImage = (league: string | undefined) => {
        if (!league) return images.novice;
        return badgeMap[league.toUpperCase()] ?? images.novice;
    };

    const selectedDateFloatieEligibility = getFloatieEligibility(selectedDate);
    const floatieCycleLabel = formatCycleKey(userGameData?.floatiesCycleKey);

    return (
        <View style={{ backgroundColor: "#000000", alignContent: 'space-between' }}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showFloatiePrompt}
                onRequestClose={() => setShowFloatiePrompt(false)}
            >
                <View style={styles.floatiePromptOverlay}>
                    <View style={styles.floatiePromptCard}>
                        <Text style={styles.floatiePromptTitle}>Missed Workout Detected</Text>
                        <Text style={styles.floatiePromptText}>
                            {floatieTargetDate
                                ? `You missed ${formatModalDate(floatieTargetDate)}. Use one floatie to cover this day and protect your streak.`
                                : "You missed a scheduled workout. Use one floatie to protect your streak."}
                        </Text>
                        <Text style={styles.floatiePromptRemaining}>
                            Floaties remaining: {userGameData?.floatiesRemaining ?? 0}
                        </Text>
                        <View style={styles.floatiePromptActions}>
                            <TouchableOpacity
                                style={styles.floatiePromptDismiss}
                                onPress={handleDismissFloatiePrompt}
                            >
                                <Text style={styles.floatiePromptDismissText}>Not now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.floatiePromptUse, isUsingFloatie && styles.floatiePromptUseDisabled]}
                                disabled={isUsingFloatie}
                                onPress={() => handleUseFloatieForDate(floatieTargetDate, true)}
                            >
                                <Text style={styles.floatiePromptUseText}>
                                    {isUsingFloatie ? "Using..." : "Use Floatie"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Recovery Mode Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showRecoveryModal}
                onRequestClose={() => setShowRecoveryModal(false)}
            >
                <View style={styles.floatiePromptOverlay}>
                    <View style={styles.floatiePromptCard}>
                        {recoveryMode?.active ? (
                            // Active state: show info + end-early option
                            <>
                                <Text style={styles.floatiePromptTitle}>Recovery Mode Active</Text>
                                <Text style={styles.floatiePromptText}>
                                    Your streak is frozen at {recoveryMode.frozenStreak} days.{'\n'}
                                    Recovery ends on {recoveryMode.endDateKey}.
                                </Text>
                                <Text style={styles.floatiePromptRemaining}>
                                    Tokens remaining: {recoveryMode.tokensRemaining} / 3
                                </Text>
                                <View style={styles.floatiePromptActions}>
                                    <TouchableOpacity
                                        style={styles.floatiePromptDismiss}
                                        onPress={() => setShowRecoveryModal(false)}
                                    >
                                        <Text style={styles.floatiePromptDismissText}>Close</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.floatiePromptUse, isEndingRecovery && styles.floatiePromptUseDisabled]}
                                        disabled={isEndingRecovery}
                                        onPress={handleEndRecovery}
                                    >
                                        <Text style={styles.floatiePromptUseText}>
                                            {isEndingRecovery ? "Ending..." : "I'm feeling better"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            // Activation flow
                            <>
                                <Text style={styles.floatiePromptTitle}>Activate Recovery Mode</Text>
                                <Text style={styles.floatiePromptRemaining}>
                                    Tokens remaining: {tokensRemaining} / 3
                                </Text>
                                <Text style={[styles.floatiePromptText, { marginTop: 10 }]}>
                                    When did you start feeling sick?
                                </Text>
                                <View style={styles.recoveryOptionRow}>
                                    {[0, 1, 2].map((days) => (
                                        <TouchableOpacity
                                            key={days}
                                            style={[
                                                styles.recoveryOptionBtn,
                                                retroactiveDays === days && styles.recoveryOptionBtnActive,
                                            ]}
                                            onPress={() => setRetroactiveDays(days)}
                                        >
                                            <Text style={[
                                                styles.recoveryOptionText,
                                                retroactiveDays === days && styles.recoveryOptionTextActive,
                                            ]}>
                                                {days === 0 ? 'Today' : days === 1 ? '1 day ago' : '2 days ago'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={[styles.floatiePromptText, { marginTop: 14 }]}>
                                    How long do you need to recover?
                                </Text>
                                <View style={styles.recoveryDurationRow}>
                                    {[3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                                        <TouchableOpacity
                                            key={d}
                                            style={[
                                                styles.recoveryDurationBtn,
                                                recoveryDuration === d && styles.recoveryOptionBtnActive,
                                            ]}
                                            onPress={() => setRecoveryDuration(d)}
                                        >
                                            <Text style={[
                                                styles.recoveryDurationText,
                                                recoveryDuration === d && styles.recoveryOptionTextActive,
                                            ]}>
                                                {d}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={[styles.floatiePromptRemaining, { marginTop: 12 }]}>
                                    Your streak ({userGameData?.streak ?? 0} days) will be frozen for {recoveryDuration} days.
                                </Text>
                                <View style={styles.floatiePromptActions}>
                                    <TouchableOpacity
                                        style={styles.floatiePromptDismiss}
                                        onPress={() => setShowRecoveryModal(false)}
                                    >
                                        <Text style={styles.floatiePromptDismissText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.floatiePromptUse, (isActivatingRecovery || tokensRemaining <= 0) && styles.floatiePromptUseDisabled]}
                                        disabled={isActivatingRecovery || tokensRemaining <= 0}
                                        onPress={handleActivateRecovery}
                                    >
                                        <Text style={styles.floatiePromptUseText}>
                                            {isActivatingRecovery ? "Activating..." : "Activate"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Calendar and Header Card */}
                <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 10 }}>
                    <CalendarSelector
                        userRoutine={userRoutine}
                        recoveryModeActive={!!recoveryMode?.active}
                        onShieldPress={() => setShowRecoveryModal(true)}
                        completedToday={isWorkoutAllowed}
                    />
                    <ImageBackground source={images.squareGradient} imageStyle={{ height: 224 }}>
                        <View
                            style={styles.headerCard}
                        >
                            <Text style={styles.dayLabel}>YOUR</Text>
                            <Text style={styles.dayText}>{currentDay}</Text>
                            <Text style={styles.workoutLabel}>WORKOUT</Text>

                            <View style={styles.workoutInfoContainer}>
                                <Text style={styles.focusText}>{focus}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.timeText}>{timeEstimate}</Text>
                                    <Text style={styles.timeText2}>min</Text>
                                </View>
                            </View>
                            {/**    
                            {isWorkoutAllowed || selectedWorkout ? (
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>✓ COMPLETED</Text>
                                </View>
                            ) : (
                                <View style={styles.workoutInfoContainer}>
                                    <Text style={styles.focusText}>{focus}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.timeText}>{timeEstimate}</Text>
                                        <Text style={styles.timeText2}>min</Text>
                                    </View>
                                </View>
                            )}
                                */}
                        </View>
                    </ImageBackground>
                </View>

                {/* Overview and Quick Start Buttons */}
                <View style={styles.workoutButtons}>
                    <TouchableOpacity style={styles.actionCard}
                        activeOpacity={0.7}
                        onPress={() => {
                            if (isWorkoutAllowed || selectedWorkout) {
                                const xpEarned = selectedWorkout?.points ?? 0;
                                const currentStreak = userGameData?.streak ?? 0;
                                router.navigate({
                                    pathname: "/(components)/workout/FinishedWorkoutOverview",
                                    params: {
                                        previousStreak: String(currentStreak),
                                        currentStreak: String(currentStreak),
                                        xpEarned: String(xpEarned),
                                        floatiesRemaining: String(userGameData?.floatiesRemaining ?? 0),
                                    },
                                });
                            } else {
                                router.navigate("/(workout)/WorkoutOverview");
                            }
                        }}
                    >
                        <View style={styles.actionIconContainer}>
                            <AppIcon name="overviewBox" size={24} />
                        </View>
                        <Text style={styles.actionCardText}>overview</Text>
                    </TouchableOpacity>
                    {isWorkoutAllowed || selectedWorkout ? (
                        <View style={styles.actionCard}>
                            <Text style={styles.statusText}>✓ COMPLETED</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.actionCard}
                            activeOpacity={0.7}
                            onPress={() => router.navigate('/(workout)/ActiveWorkoutScreen')}
                        >
                            <View style={styles.actionIconContainer}>
                                <AppIcon name="upArrow" size={24} />
                            </View>
                            <Text style={styles.quickStartText}>quick start</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* My AI Overview */}
                <TouchableOpacity style={{ marginTop: 3, backgroundColor: "red", borderRadius: 35 }} activeOpacity={0.7}>
                    <LinearGradient
                        colors={['#1B191E', '#1F254B', '#2A42B7', '#A491FF']}
                        //locations={[0, 0.29, 0.52, 1]}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={{ borderRadius: 35 }}
                    >
                        <View style={styles.aiBoxContent}>
                            <AppIcon name="checkMark" size={20} fill="no fill" />
                            <Text style={styles.aiBoxText}>my Ai overview</Text>
                        </View>
                        {/** </ImageBackground>*/}
                    </LinearGradient>
                </TouchableOpacity>


                {/* Recovery Mode Active Banner */}
                {recoveryMode?.active && (
                    <View style={styles.recoveryBanner}>
                        <Text style={styles.recoveryBannerText}>❄️ Recovery Mode — streak frozen at {recoveryMode.frozenStreak}</Text>
                        <Text style={styles.recoveryBannerSubtext}>Ends {recoveryMode.endDateKey}</Text>
                    </View>
                )}

                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.myPlanCard} onPress={() => router.navigate("/(components)/MyPlan")} activeOpacity={0.7}>
                        <Text style={styles.myPlanTitle}>my plan</Text>
                        <View style={styles.myPlanIconContainer}>
                            <AppIcon name="doubleBox" size={24} fill="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.rightColumn}>
                        <View style={styles.streakCard}>
                            <Text style={styles.streakLabel}>streak</Text>
                            <View style={styles.streakContentRow}>
                                <View style={styles.streakIconWrapper}>
                                    <Image source={icons.whiteZap} style={styles.streakIcon} />
                                </View>
                                <Text style={styles.streakValue}>{userGameData.streak}</Text>
                            </View>
                            {recoveryMode?.active && (
                                <Text style={styles.frozenLabel}>❄️ frozen</Text>
                            )}
                        </View>
                        <View style={styles.xpCard}>
                            <Text style={styles.xpLabel}>XP</Text>
                            <Text style={styles.xpValue}>{userGameData.points}</Text>
                        </View>
                    </View>
                </View>

                {/* Weight Tracking and Weekly Challenges */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.myPlanCard} activeOpacity={0.7}>
                        <Text style={styles.myPlanTitle}>weight tracking</Text>
                        <View style={styles.myPlanIconContainer}>
                            <AppIcon name="weight" size={24} fill="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.myPlanCard} activeOpacity={0.7}>
                        <Text style={styles.weeklyChallengesTitle}>weekly challenges</Text>
                        <View style={styles.myPlanIconContainer}>
                            <AppIcon name="targetIcon" size={24} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Challenges Button
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
                */}
                {/* League Section */}
                <View style={styles.leagueSection}>
                    <LeagueMembers />
                </View>
            </ScrollView >

            {/* Date Selection Modal */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={showDateModal}
                onRequestClose={closeDateModal}
            >
                <View style={Mstyle.modelContainer}>
                    <Animated.View
                        style={[
                            Mstyle.dateModalContainer,
                            { transform: [{ translateY: panY }] }
                        ]}
                    >
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
                            <View style={styles.calendarContainer}></View>

                            <Animated.View style={{ opacity: contentOpacity }}>
                                {selectedWorkout && <WorkoutLogDetail workout={selectedWorkout} />}
                                {showNextDayWorkout && <NextDayWorkout workout={nextDayWorkout} />}
                            </Animated.View>

                            {selectedDate && (
                                <View style={styles.floatieDateCard}>
                                    <Text style={styles.floatieDateTitle}>Floatie</Text>
                                    <Text style={styles.floatieDateSubtitle}>
                                        {formatModalDate(selectedDate)}
                                    </Text>
                                    <Text style={styles.floatieDateReason}>
                                        {selectedDateFloatieEligibility.canUse
                                            ? "Use one floatie to cover this missed workout day."
                                            : selectedDateFloatieEligibility.reason}
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.floatieDateButton,
                                            (!selectedDateFloatieEligibility.canUse || isUsingFloatie) && styles.floatieDateButtonDisabled,
                                        ]}
                                        disabled={!selectedDateFloatieEligibility.canUse || isUsingFloatie}
                                        onPress={() => handleUseFloatieForDate(selectedDate)}
                                    >
                                        <Text style={styles.floatieDateButtonText}>
                                            {isUsingFloatie ? "Using..." : "Use Floatie"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal >

            {/* Challenges Modal */}
            < Modal
                animationType='slide'
                transparent={true}
                visible={showChallanges}
                onRequestClose={() => setShowChallanges(false)}
                presentationStyle="pageSheet"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
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
            </Modal >

            {/* Info Modal */}
            < Modal
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
            </Modal >
        </View >
    );
};

export default ChallengesPage;

const styles = StyleSheet.create({
    // AI Box
    aiBoxContent: {
        flexDirection: 'row',
        padding: 20,
        //marginHorizontal: 10,
        //marginTop: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    aiBoxText: {
        color: '#FFF',
        fontFamily: 'Poppins-regular',
        fontSize: 15,
        marginLeft: 8,
    },

    // Scroll Content
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 60 : 60,
        paddingBottom: 120,
    },

    // Header Card
    headerCard: {
        padding: 35,
    },
    dayLabel: {
        fontSize: 43,
        fontFamily: 'quicksand-bold',
        color: 'white',
        letterSpacing: -2,
        fontWeight: '700',
        //marginBottom: -20,
    },
    dayText: {
        fontSize: 43,
        fontFamily: 'quicksand-bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontWeight: '700',
        marginTop: -22,
    },
    workoutLabel: {
        fontSize: 43,
        fontFamily: 'quicksand-bold',
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: -2,
        marginTop: -22
    },
    statusBadge: {
        backgroundColor: 'rgba(56, 255, 245, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    statusText: {
        color: '#6477E7',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
    workoutInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 7
    },
    focusText: {
        fontSize: 21,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'poppins',
        marginBottom: 10,
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
        fontSize: 23,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    timeText2: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
        marginTop: 10
    },

    // Action Cards (Overview and Quick Start)
    workoutButtons: {
        flexDirection: 'row',
        marginTop: -15,
        gap: 5,
        paddingHorizontal: 0,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#1B191E',
        borderRadius: 35,
        padding: 16,
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    actionCardText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '300',
        letterSpacing: -1,
    },
    quickStartText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '300',
        letterSpacing: -1,
    },

    // Calendar Container
    calendarContainer: {},

    // Stats Container
    statsContainer: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 5,
    },
    myPlanCard: {
        flex: 1,
        backgroundColor: '#1B191E',
        borderRadius: 35,
        padding: 15,
        justifyContent: 'space-between',
        minHeight: 140,
    },
    myPlanTitle: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '300',
        letterSpacing: -1,
    },
    weeklyChallengesTitle: {
        fontSize: 15,
        color: '#6477E7',
        fontWeight: '300',
        letterSpacing: -1,
    },
    myPlanIconContainer: {
        marginTop: 'auto',
        alignSelf: 'flex-end',
    },

    // Right column (Streak and XP)
    rightColumn: {
        flex: 1,
        gap: 3,
    },
    streakCard: {
        backgroundColor: '#1B191E',
        borderRadius: 35,
        padding: 15,
        justifyContent: 'space-between',
    },
    streakLabel: {
        fontSize: 15,
        fontFamily: 'Poppins-regular',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    streakContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    streakIconWrapper: {
        width: 20,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakIcon: {
        width: 20,
        height: 25,
        tintColor: '#FFFFFF',
    },
    streakValue: {
        fontSize: 27,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: -1,
    },
    xpCard: {
        flex: 1,
        backgroundColor: '#1B191E',
        borderRadius: 35,
        padding: 15,
        justifyContent: 'space-between',
    },
    xpLabel: {
        fontSize: 15,
        color: '#6477E7',
        letterSpacing: -1,
    },
    xpValue: {
        fontSize: 27,
        color: '#6477E7',
        letterSpacing: -1,
        textAlign: 'right',
    },

    // Challenges Button
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

    // League Section
    leagueSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 60 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContainer: {
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
    infoButton: {
        padding: 4,
    },
    infoButtonText: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 12,
    },

    // Floatie Prompt
    floatiePromptOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    floatiePromptCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 18,
        backgroundColor: '#111111',
        //borderWidth: 1,
        //borderColor: 'rgba(56,255,245,0.4)',
        padding: 18,
    },
    floatiePromptTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
    },
    floatiePromptText: {
        color: 'rgba(255,255,255,0.86)',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    floatiePromptRemaining: {
        color: '#6477E7',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    floatiePromptActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    floatiePromptDismiss: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    floatiePromptDismissText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    floatiePromptUse: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#6477E7',
    },
    floatiePromptUseDisabled: {
        opacity: 0.7,
    },
    floatiePromptUseText: {
        color: '#000000',
        fontWeight: '700',
    },

    // Recovery Mode
    recoveryBanner: {
        marginTop: 8,
        padding: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(100, 180, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(100, 180, 255, 0.35)',
    },
    recoveryBannerText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    recoveryBannerSubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 4,
    },
    frozenLabel: {
        color: 'rgba(100, 180, 255, 0.9)',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    recoveryOptionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    recoveryOptionBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
    },
    recoveryOptionBtnActive: {
        backgroundColor: '#6477E7',
    },
    recoveryOptionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
    },
    recoveryOptionTextActive: {
        color: '#000000',
    },
    recoveryDurationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    recoveryDurationBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recoveryDurationText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '600',
    },

    // Floatie Date Card
    floatieDateCard: {
        marginTop: 16,
        marginBottom: 18,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(56, 255, 245, 0.35)',
        backgroundColor: 'rgba(56, 255, 245, 0.08)',
    },
    floatieDateTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    floatieDateSubtitle: {
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 3,
        marginBottom: 8,
        fontSize: 13,
    },
    floatieDateReason: {
        color: '#D4D4D4',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    floatieDateButton: {
        borderRadius: 10,
        backgroundColor: '#38FFF5',
        paddingVertical: 12,
        alignItems: 'center',
    },
    floatieDateButtonDisabled: {
        backgroundColor: 'rgba(56,255,245,0.35)',
    },
    floatieDateButtonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
});