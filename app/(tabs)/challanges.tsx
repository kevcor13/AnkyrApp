import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarSelector from "@/components/CalendarView";
import CustomButton from "@/components/CustomButton";
import axios from "axios";
import LeagueHeader from "@/components/LeagueHeader";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image, Modal } from "react-native";
import icons from "@/constants/icons";
import { router } from "expo-router";
import GraphView from "@/components/GraphView";
// --- 1. Import the new component and its type definition ---
import WorkoutLogDetail, { IWorkoutLog } from '@/components/WorkoutLogDetail'


const ChallengesPage: React.FC = () => {
    const [leagueOpen, setLeagueOpen] = useState(false);
    const { userData, userGameData, ngrokAPI, TodayWorkout, weeklyData, challenges, loggedWorkouts } = useGlobal();
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [currentDay, setCurrentDay] = useState('');
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isWorkoutAllowed, setIsWorkoutAllowed] = useState(false);
    const [workoutRoutine, setWorkoutRoutine] = useState([]);
    const [todayWorkout, setTodayWorkout] = useState(null); // State for today's workout

    // --- 2. Add state to hold the workout for the selected calendar date ---
    const [selectedWorkout, setSelectedWorkout] = useState<IWorkoutLog | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (TodayWorkout) {
                    setWorkoutRoutine(TodayWorkout);
                    const today = new Date().toLocaleString("en-US", { weekday: "long" });
                    setCurrentDay(today);
                    setTodayWorkout(TodayWorkout?.workoutRoutine || null);
                    setTimeEstimate(TodayWorkout.timeEstimate);
                    setFocus(TodayWorkout.focus);
                }
            } catch (error) {
                console.error("Error fetching workout data:", error);
            }
        };

        fetchData();
    }, [userData, TodayWorkout]);

    useEffect(() => {
        if (userData) {
            const alreadyDoneToday = isSameDay(userData.lastWorkoutCompletionDate, new Date());
            setIsWorkoutAllowed(alreadyDoneToday);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [userData]);


    const isSameDay = (date1: string | number | Date, date2: string | number | Date) => {
        if (!date1 || !date2) return false;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // --- 3. Create a handler function for when a date is selected ---
    const handleDateSelect = (selectedDate: Date) => {
        const workoutForDay = loggedWorkouts.find((log: IWorkoutLog) => isSameDay(log.date, selectedDate));
        if (workoutForDay) {
            // If a workout is found, update the state
            setSelectedWorkout(workoutForDay);
            setIsWorkoutAllowed(true);
        } else {
            // If no workout is found for that day, set the state to null
            setSelectedWorkout(null);
            setIsWorkoutAllowed(false)
        }
    };

    const showInfo = () => {
        const entry = {
            name: "Barbell Deadlift",
            description: "Lift a loaded barbell from the floor to a standing position, keeping your back straight.",
            videoUrl: "https://example.com/videos/deadlift.mp4",
            category: "Back",
            equipment: ["Barbell", "Weight Plates"],
            difficulty: "Advanced",
            recommendedSets: "3-5",
            recommendedReps: "3-6",
            isWarmupExercise: false,
            isCooldownExercise: false,
            tags: ["compound", "strength"]
        }
        axios.post(`${ngrokAPI}/test/add-exercise`, entry);
    }

    return (
        <LinearGradient
            colors={['#FF0509', '#271293']}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.headerContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.title}>YOUR{'\n'}{currentDay}{'\n'}WORKOUT</Text>
                    </View>
                    <Text style={styles.subtitle}>{focus}</Text>
                    {isWorkoutAllowed ? (
                        <View>
                            <Text style={{ color: '#38FFF5', fontFamily: 'raleway-light', fontSize: 40, marginTop: 20 }}>
                                COMPLETED
                            </Text>
                        </View>
                    ) : (
                        <><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Text style={styles.timeIndicator}>{timeEstimate} mins</Text>
                                <Image source={icons.blueStreak} style={styles.zapImage} />
                            </View><CustomButton
                                    title="My workout"
                                    handlePress={() => router.navigate("/(workout)/WorkoutOverview")}
                                    buttonStyle={{
                                        backgroundColor: 'rgba(217, 217, 217, 0.5)',
                                        borderRadius: 20,
                                        paddingVertical: 16,
                                        paddingHorizontal: 32,
                                        marginTop: 10,
                                        justifyContent: "center"
                                    }}
                                    textStyle={{
                                        color: '#FFFFFF',
                                        fontSize: 16,
                                        fontFamily: 'poppins-semiBold'
                                    }} /></>
                    )}
                </View>
                
                {/* --- 4. Pass the handler to the CalendarSelector --- */}
                <CalendarSelector onSelect={handleDateSelect} />
                {selectedWorkout && <WorkoutLogDetail workout={selectedWorkout} />}

                <View style={styles.container}>
                    <View style={styles.block}>
                        <Text style={styles.header}>My streak:</Text>
                        <View style={styles.valueRow}>
                            <Image source={icons.whiteZap} style={styles.icon} />
                            <Text style={{ color: '#78F5D8', fontFamily: 'raleway-semibold', fontWeight: '600', fontSize: 32 }}>{userGameData.streak}</Text>
                            <Text style={{ color: '#78F5D8', fontFamily: 'raleway-semibold', fontWeight: '600', fontSize: 18, marginLeft: 5 }}>days</Text>
                        </View>
                        <Text style={styles.caption}>
                            Woah. How long are you gonna keep this going?
                        </Text>
                    </View>
                    <View style={styles.block}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.header}>My xp:</Text>
                            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={{ marginLeft: 80, height: 20, width: 20 }}>
                                <Image source={icons.infoIcon} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.valueRow, { marginBottom: 4 }]}>
                            <Text style={{ color: '#78F5D8', fontFamily: 'raleway-semibold', fontWeight: '600', fontSize: 32 }}>{userGameData.points}</Text>
                            <Text style={{ color: '#78F5D8', fontFamily: 'raleway-semibold', fontWeight: '600', fontSize: 18, marginLeft: 5 }}> XP</Text>
                        </View>
                        <Text style={styles.caption}>Hm. That’s kind of a lot of xp.</Text>
                    </View>
                </View>
                <GraphView  weeklyData={weeklyData} />
                <View style={styles.container2}>
                    <TouchableOpacity style={{ flexDirection: 'row' }}
                        onPress={() => setLeagueOpen(!leagueOpen)}
                    >
                        <Text style={{ fontFamily: 'poppins-semibold', color: '#FFFFFF', fontSize: 24, marginLeft: 20 }}>MY LEAGUE</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 24, marginLeft: 180 }}>{leagueOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {leagueOpen && (
                        <LeagueHeader league={userGameData.league} />
                    )}
                </View>
                <TouchableOpacity style={styles.buttonContainer}>
                    <LinearGradient
                        colors={['#1E134B', '#8B0000']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.gradient}
                    >
                        <View style={styles.contentView}>
                            <Text style={styles.buttonText}>Daily Challenges</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showInfoModal}
                onRequestClose={() => setShowInfoModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                    <View style={{ backgroundColor: '#D9D9D9', padding: 40, borderRadius: 10, width: '80%', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10 }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => setShowInfoModal(false)}>
                            <Image source={icons.x} style={{width: 24, height: 24}} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10, fontFamily: 'poppins-semibold' }}>
                            How do I gain XP and what does it do?
                        </Text>
                        <Text style={{ color: 'black', fontFamily: 'poppins-medium' }}>
                            You earn xp by doing your workouts and streaks to go up league ranks and earn rewards.(And to flex on you friends.)
                        </Text>
                        <Text style={{ color: 'black', fontFamily: 'poppins-medium', marginTop: 10 }}>
                            You can also earn xp by completing challenges and participating in events.
                        </Text>
                        <Text style={{ color: '#5D9A97', fontFamily: 'poppins-bold', marginTop: 10, paddingTop: 20, textAlign: 'center', fontSize: 18 }}>GO GET MORE XP!</Text>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};
// --- Styles (no changes needed here) ---
const styles = StyleSheet.create({
    buttonContainer: {
        margin: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    gradient: {
        borderRadius: 15,
    },
    contentView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 25,
    },
    buttonText: {
        color: '#059669',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerContainer: {
        marginTop: 60,
        padding: 10,
        marginRight: 20,
        borderRadius: 10,
        margin: 10,
    },
    subtitle: {
        fontFamily: 'raleway-light',
        color: '#8B8BEA',
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 32,
    },
    title: {
        fontSize: 55,
        fontFamily: 'Poppins-semiBold',
        color: '#FFFFFF',
        lineHeight: 35,
        letterSpacing: -2,
        textTransform: 'uppercase',
        paddingTop: 30
    },
    zapImage: {
        width: 54,
        height: 54,
        marginTop: 10,
    },
    timeIndicator: {
        textAlign: 'right',
        fontFamily: 'poppins-semiBold',
        fontSize: 24,
        color: '#38FFF5',
    },
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "black",
        minHeight: 200,
        paddingHorizontal: 20,
        //marginTop: 30,
        paddingTop: 30,
        paddingBottom: 20,
    },
    container2: {
        backgroundColor: "black",
        paddingVertical: 20,
    },
    block: {
        flex: 1,
        paddingHorizontal: 8,
    },
    header: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#FFF",
        marginBottom: 8,
    },
    valueRow: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 6,
    },
    caption: {
        fontFamily: "Poppins-Italic",
        fontSize: 14,
        color: "#666",
        marginTop: 6,
    },
});

export default ChallengesPage;
