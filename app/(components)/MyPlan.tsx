import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGlobal } from '@/context/GlobalProvider';
import AppIcon from '@/components/AppIcon';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 40;
const CURRENT_YEAR = new Date().getFullYear();

type Goal = 'BUILD' | 'CUT' | 'CUSTOM';

type FitnessData = {
    UserID?: string;
    gender?: string;
    age?: number;
    weight?: number;
    fitnessLevel?: string;
    workoutDays?: number;
    fitnessGoal?: string;
    selectedWorkoutDays?: string[];
    myPlanChangeCountYear?: number;
    myPlanChangeYear?: number;
    myPlanLastChangedAt?: string | null;
};

const GOAL_TO_BACKEND: Record<Goal, string> = {
    BUILD: 'Build Muscle',
    CUT: 'lose weight',
    CUSTOM: 'Custom Goal',
};

const SHORT_TO_FULL_DAY: Record<string, string> = {
    Mo: 'Monday',
    Tu: 'Tuesday',
    W: 'Wednesday',
    Th: 'Thursday',
    Fr: 'Friday',
    Sa: 'Saturday',
    Su: 'Sunday',
};

const FULL_TO_SHORT_DAY = Object.fromEntries(
    Object.entries(SHORT_TO_FULL_DAY).map(([shortDay, fullDay]) => [fullDay, shortDay])
) as Record<string, string>;

const DAY_ORDER = ['Mo', 'Tu', 'W', 'Th', 'Fr', 'Sa', 'Su'];

const normalizeGoal = (goal?: string): Goal => {
    const normalized = String(goal || '').trim().toLowerCase();

    if (normalized.includes('build')) return 'BUILD';
    if (normalized.includes('cut') || normalized.includes('lose')) return 'CUT';
    return 'CUSTOM';
};

const mapSelectedDaysToShortLabels = (selectedWorkoutDays?: string[]) => {
    if (!Array.isArray(selectedWorkoutDays)) return [];

    return selectedWorkoutDays
        .map((day) => FULL_TO_SHORT_DAY[day])
        .filter(Boolean)
        .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
};

interface CustomSliderProps {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
    label,
    value,
    onValueChange,
}) => {
    const translateX = useSharedValue((value * (SLIDER_WIDTH - 40)) / 100);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);

    useEffect(() => {
        translateX.value = (value * (SLIDER_WIDTH - 40)) / 100;
    }, [translateX, value]);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            isDragging.value = true;
            startX.value = translateX.value;
        })
        .onUpdate((event) => {
            const newTranslateX = Math.max(
                0,
                Math.min(SLIDER_WIDTH - 40, startX.value + event.translationX)
            );
            translateX.value = newTranslateX;
        })
        .onEnd(() => {
            isDragging.value = false;
            const percentage = Math.round((translateX.value / (SLIDER_WIDTH - 40)) * 100);
            runOnJS(onValueChange)(percentage);
        })
        .onFinalize(() => {
            isDragging.value = false;
        });

    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: withSpring(isDragging.value ? 1.1 : 1) },
        ],
    }));

    return (
        <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{label}</Text>
            <View style={styles.sliderTrack}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.sliderThumb, animatedThumbStyle]} />
                </GestureDetector>
            </View>
        </View>
    );
};

const MyPlan: React.FC = () => {
    const {
        userData,
        userFitnessData,
        fetchFitnessData,
        saveFitnessPreferences,
    } = useGlobal() as {
        userData: { _id?: string } | null;
        userFitnessData: FitnessData | null;
        fetchFitnessData: (userId: string) => Promise<FitnessData | []>;
        saveFitnessPreferences: (payload: FitnessData) => Promise<{
            success: boolean;
            data?: FitnessData | null;
            message?: string;
        }>;
    };

    const [selectedGoal, setSelectedGoal] = useState<Goal>('CUSTOM');
    const [intensity, setIntensity] = useState(75);
    const [cardioFrequency, setCardioFrequency] = useState(60);
    const [restDays, setRestDays] = useState(30);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [savedFitnessData, setSavedFitnessData] = useState<FitnessData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadFitnessData = async () => {
            if (!userData?._id) {
                if (isMounted) setIsLoading(false);
                return;
            }

            setIsLoading(true);

            const existingData =
                userFitnessData && Object.keys(userFitnessData).length > 0
                    ? userFitnessData
                    : await fetchFitnessData(userData._id);

            if (!isMounted) return;

            if (existingData && !Array.isArray(existingData)) {
                setSavedFitnessData(existingData);
            }

            setIsLoading(false);
        };

        loadFitnessData();

        return () => {
            isMounted = false;
        };
    }, [fetchFitnessData, userData?._id, userFitnessData]);

    useEffect(() => {
        if (!savedFitnessData || isEditing) return;

        setSelectedGoal(normalizeGoal(savedFitnessData.fitnessGoal));
        setSelectedDays(mapSelectedDaysToShortLabels(savedFitnessData.selectedWorkoutDays));
    }, [isEditing, savedFitnessData]);

    const remainingChanges = useMemo(() => {
        const dataYear = Number(savedFitnessData?.myPlanChangeYear ?? CURRENT_YEAR);
        const usedChanges =
            dataYear === CURRENT_YEAR
                ? Number(savedFitnessData?.myPlanChangeCountYear ?? 0)
                : 0;

        return Math.max(0, 3 - usedChanges);
    }, [savedFitnessData]);

    const limitReached = remainingChanges <= 0;

    const toggleDay = (day: string) => {
        if (!isEditing) return;

        setSelectedDays((prev) =>
            prev.includes(day)
                ? prev.filter((selectedDay) => selectedDay !== day)
                : [...prev, day].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
        );
    };

    const handleEditToggle = () => {
        if (!isEditing && limitReached) {
            Alert.alert('Plan Limit Reached', `You have used all 3 My Plan changes for ${CURRENT_YEAR}.`);
            return;
        }

        if (isEditing && savedFitnessData) {
            setSelectedGoal(normalizeGoal(savedFitnessData.fitnessGoal));
            setSelectedDays(mapSelectedDaysToShortLabels(savedFitnessData.selectedWorkoutDays));
            setErrorMessage('');
        }

        setIsEditing((prev) => !prev);
    };

    const handleSave = async () => {
        if (!userData?._id || !savedFitnessData) return;

        if (selectedDays.length === 0) {
            Alert.alert('Select Workout Days', 'Choose at least one workout day before saving your plan.');
            return;
        }

        setIsSaving(true);
        setErrorMessage('');

        const selectedWorkoutDays = selectedDays.map((day) => SHORT_TO_FULL_DAY[day]);
        const nextGoal =
            selectedGoal === 'CUSTOM'
                ? savedFitnessData.fitnessGoal || GOAL_TO_BACKEND.CUSTOM
                : GOAL_TO_BACKEND[selectedGoal];
        const nextPayload: FitnessData = {
            ...savedFitnessData,
            UserID: userData._id,
            fitnessGoal: nextGoal,
            selectedWorkoutDays,
            workoutDays: selectedWorkoutDays.length,
        };

        const result = await saveFitnessPreferences(nextPayload);
        setIsSaving(false);

        if (!result.success) {
            const message = result.message || 'Unable to save your plan right now.';
            setErrorMessage(message);
            Alert.alert('Could Not Save Plan', message);
            if (savedFitnessData) {
                setSelectedGoal(normalizeGoal(savedFitnessData.fitnessGoal));
                setSelectedDays(mapSelectedDaysToShortLabels(savedFitnessData.selectedWorkoutDays));
            }
            setIsEditing(false);
            return;
        }

        const updatedData = result.data || nextPayload;
        setSavedFitnessData(updatedData);
        setSelectedGoal(normalizeGoal(updatedData.fitnessGoal));
        setSelectedDays(mapSelectedDaysToShortLabels(updatedData.selectedWorkoutDays));
        setIsEditing(false);
        Alert.alert('Plan Updated', 'Your workout plan preferences have been saved.');
    };

    const workoutDaysText = `${selectedDays.length}-day-lift week`;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading your plan...</Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <View>
                                <View style={{ marginBottom: -25 }}>
                                    <Text style={styles.title}>MY</Text>
                                </View>
                                <View>
                                    <Text style={styles.title}>PLAN</Text>
                                </View>
                                <Text style={styles.changesText}>
                                    {limitReached
                                        ? `You have used all 3 plan changes for ${CURRENT_YEAR}`
                                        : `${remainingChanges} change${remainingChanges === 1 ? '' : 's'} left this year`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.settingsButton,
                                    limitReached && !isEditing && styles.settingsButtonDisabled,
                                ]}
                                onPress={handleEditToggle}
                                activeOpacity={0.7}
                            >
                                <AppIcon name="gearIcon" width={20} height={20} color="#FFFFFF"/> 
                            </TouchableOpacity>
                        </View>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <View style={styles.goalSection}>
                            <View style={{paddingHorizontal:20}}>
                                <Text style={styles.sectionTitle}>GOAL:</Text>
                            </View>
                            {/** 
                            <Text style={styles.currentGoalText}>
                                {savedFitnessData?.fitnessGoal || 'No goal saved yet'}
                            </Text>
                            */}
                            <View style={styles.goalButtons}>
                                {(['BUILD', 'CUT', 'CUSTOM'] as Goal[]).map((goal) => (
                                    <TouchableOpacity
                                        key={goal}
                                        style={[
                                            styles.goalButton,
                                            selectedGoal === goal && styles.goalButtonSelected,
                                        ]}
                                        onPress={() => isEditing && setSelectedGoal(goal)}
                                        activeOpacity={isEditing ? 0.7 : 1}
                                        disabled={!isEditing}
                                    >
                                        <Text
                                            style={[
                                                styles.goalButtonText,
                                                selectedGoal === goal && styles.goalButtonTextSelected,
                                                !isEditing && styles.readOnlyButtonText,
                                            ]}
                                        >
                                            {goal}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.slidersSection}>
                            <CustomSlider
                                label="Intensity:"
                                value={intensity}
                                onValueChange={setIntensity}
                            />
                            <CustomSlider
                                label="Cardio Frequency:"
                                value={cardioFrequency}
                                onValueChange={setCardioFrequency}
                            />
                            <CustomSlider
                                label="Rest days:"
                                value={restDays}
                                onValueChange={setRestDays}
                            />
                        </View>

                        <View style={styles.scheduleSection}>
                            <Text style={styles.scheduleTitle}>{workoutDaysText}</Text>
                            <View style={styles.daysContainer}>
                                {DAY_ORDER.map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayButton,
                                            selectedDays.includes(day) && styles.dayButtonSelected,
                                        ]}
                                        onPress={() => toggleDay(day)}
                                        activeOpacity={isEditing ? 0.7 : 1}
                                        disabled={!isEditing}
                                    >
                                        <Text
                                            style={[
                                                styles.dayButtonText,
                                                selectedDays.includes(day) && styles.dayButtonTextSelected,
                                                !isEditing && styles.readOnlyButtonText,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                     </View>

                        {isEditing ? (
                            <TouchableOpacity
                                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                activeOpacity={0.8}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    loadingState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 32,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        //marginBottom: 20,
    },
    title: {
        fontSize: 55,
        //fontWeight: '900',
        color: '#FFFFFF',
        fontFamily: 'Poppins-Bold',
        lineHeight: 60,
    },
    changesText: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginTop: 12,
        maxWidth: 220,
    },
    settingsButton: {
        minWidth: 82,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    settingsButtonDisabled: {
        opacity: 0.45,
    },
    settingsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        paddingHorizontal: 32,
        //marginBottom: 20,
    },
    goalSection: {
        paddingHorizontal: 5,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'Poppins-Bold',
        marginBottom: 20,
    },
    goalButtons: {
        flexDirection: 'row',
        //gap: 10,
    },
    currentGoalText: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        marginBottom: 16,
    },
    goalButton: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    goalButtonSelected: {
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
    },
    goalButtonText: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.3)',
        fontFamily: 'Poppins-regular',
    },
    goalButtonTextSelected: {
        color: '#FFFFFF',
    },
    readOnlyButtonText: {
        opacity: 0.8,
    },
    slidersSection: {
        paddingHorizontal: 20,
        gap: 32,
        marginBottom: 60,
    },
    sliderContainer: {
        width: '100%',
    },
    sliderLabel: {
        fontSize: 20,
        //fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 16,
    },
    sliderTrack: {
        width: SLIDER_WIDTH,
        height: 30,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    sliderThumb: {
        width: 28,
        height: 28,
       borderRadius: 100,
        borderColor: '#FFFFFF',
        backgroundColor: 'rgba(217,217,217,0.27)',
        position: 'absolute',
        left: 4,
        right: 4,
    },
    scheduleSection: {
        paddingHorizontal: 20,
    },
    scheduleTitle: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 24,
    },
    daysContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        gap: 4,
    },
    dayButton: {
        width: 50,
        height: 71,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayButtonSelected: {
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
    },
    dayButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.3)',
        fontFamily: 'Poppins-SemiBold',
    },
    dayButtonTextSelected: {
        color: '#FFFFFF',
    },
    saveButton: {
        marginTop: 36,
        marginHorizontal: 32,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#000000',
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
    },
});

export default MyPlan;
