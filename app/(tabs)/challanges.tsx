import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarSelector from "@/components/CalendarView";
import CustomButton from "@/components/CustomButton";
import axios from "axios";
import LeagueHeader from "@/components/LeagueHeader";
import { LinearGradient } from "expo-linear-gradient";
import React, { use, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image, Modal, Pressable } from "react-native";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GraphView from "@/components/GraphView";



const ChallengesPage: React.FC = () => {
    const [leagueOpen, setLeagueOpen] = useState(false);
    const { userData, userGameData, ngrokAPI, TodayWorkout, weeklyData, challenges} = useGlobal()
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [currentDay, setCurrentDay] = useState('')
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isWorkoutAllowed, setIsWorkoutAllowed] = useState(false);
    const [workoutRoutine, setWorkoutRoutine] = useState([])
    const [todayWorkout, setTodayWorkout] = useState(null); // State for today's workout


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(userData.lastWorkoutCompletionDate);

                setWorkoutRoutine(TodayWorkout);
                const today = new Date().toLocaleString("en-US", { weekday: "long" });
                setCurrentDay(today);
                setTodayWorkout(TodayWorkout?.workoutRoutine || null);
                setTimeEstimate(TodayWorkout.timeEstimate);
                setFocus(TodayWorkout.focus)
                
                
            } catch (error) {
                console.error("Error fetching workout data:", error);
            }
        };

        fetchData();
    }, [userData]);

    useEffect(() => {
        // This effect checks permission to do the workout
        if (userData) {
            const alreadyDoneToday = isSameDay(userData.lastWorkoutCompletionDate, new Date());
            setIsWorkoutAllowed(!alreadyDoneToday);
            setIsLoading(false);
        } else {
            // If userData is not loaded yet, wait. If it's missing, default to not allowed.
            setIsLoading(true);
        }
    }, [userData]);

    const press = (name: any) => {

    }
    const isSameDay = (date1: string | number | Date, date2: string | number | Date) => {
        // If the first date is null, undefined, or doesn't exist, it's not the same day.
        if (!date1 || !date2) return false;

        const d1 = new Date(date1);
        const d2 = new Date(date2);

        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const showInfo = () => {
        //console.log(userGameData);
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

        axios.post(`${ngrokAPI}/test/add-exercise`, entry)
        console.log("test ran");


    }

    return (
        <LinearGradient
            colors={['#FF0509', '#271293']} // Gradient colors
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.headerContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.title}>YOUR{'\n'}{currentDay}{'\n'}WORKOUT</Text>
                    </View>
                    <Text style={styles.subtitle}>{focus}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <Text style={styles.timeIndicator}>{timeEstimate} mins</Text>
                        <Image source={icons.blueStreak} style={styles.zapImage} />
                    </View>
                    {!isWorkoutAllowed ? (
                        <Text style={{ color: '#FF0000', fontFamily: 'poppins-semiBold', fontSize: 16, marginTop: 10 }}>
                            You have already completed your workout for today.
                        </Text>
                    ) : (
                        <CustomButton
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
                            }}

                        />
                    )}
                </View>
                <CalendarSelector onSelect={(date) => {
                    console.log("Selected date:", date);

                }} />
                <View style={styles.container}>
                    {/* STREAK */}
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
                    {/* XP */}
                    <View style={styles.block}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.header}>My xp:</Text>
                            {/* XP 
                            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={{ marginLeft: 80, height: 20, width: 20 }}>
                                <Image source={icons.infoIcon} />
                            </TouchableOpacity>
                            */}
                            <TouchableOpacity onPress={() => showInfo()}>
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
            </ScrollView>


            <Modal
                animationType="fade"
                transparent={true}
                visible={showInfoModal}
                onRequestClose={() => setShowInfoModal(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }}>
                    <View style={{
                        backgroundColor: '#D9D9D9',
                        padding: 40,
                        borderRadius: 10,
                        width: '80%',
                        shadowColor: '#000',
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                    }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => setShowInfoModal(false)}>
                            <Image source={icons.x} className="w-10 h-10" />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: 'black',
                            marginBottom: 10,
                            fontFamily: 'poppins-semibold',
                        }}>
                            How do I gain XP and what does it do?
                        </Text>
                        <Text style={{ color: 'black', fontFamily: 'poppins-medium' }}>
                            You earn xp by doing your workouts and streaks to go up league ranks and earn rewards.(And to flex on you friends.)
                        </Text>
                        <Text style={{ color: 'black', fontFamily: 'poppins-medium', marginTop: 10 }}>
                            You can also earn xp by completing challenges and participating in events.</Text>
                        <Text style={{ color: '#5D9A97', fontFamily: 'poppins', fontWeight: 'bold', marginTop: 10, paddingTop: 20, textAlign: 'center', fontSize: 27, paddingHorizontal: 30, lineHeight: 16.2 }}>GO GET MORE XP!</Text>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};
const styles = StyleSheet.create({
    headerContainer: {
        marginTop: 60,
        padding: 10,
        marginRight: 20,
        // backgroundColor: '#1F059D',
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
        //marginLeft: 5,
    },
    timeIndicator: {
        textAlign: 'right',
        fontFamily: 'poppins-semiBold',
        fontSize: 24,
        color: '#38FFF5',
    },
    userNumbers: {
        color: '#38FFF5',
        fontFamily: 'poppins-semibold',
        fontSize: 40,
        marginLeft: 10
    },
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "black",
        height: 200,
        paddingHorizontal: 20,
        marginTop: 30,
    },
    container2: {
        justifyContent: "space-between",
        backgroundColor: "black",
        height: "100%",
        //paddingHorizontal: 20,
    },
    block: {
        flex: 1,
        paddingHorizontal: 8,
        marginTop: 30,
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
    valueText: {
        fontFamily: "Poppins-ExtraBold",
        fontSize: 48,
        lineHeight: 52,
    },
    streakGradientMask: {
        // transparent color so only gradient shows
        color: "transparent",
    },
    invisibleText: {
        // needed inside the gradient to occupy space
        opacity: 0,
        fontFamily: "Poppins-ExtraBold",
        fontSize: 48,
        lineHeight: 52,
    },
    xpText: {
        color: "#78F5D8",
    },
    unitText: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 24,
        lineHeight: 28,
        color: "#A12F8B",
        marginLeft: 4,
        marginBottom: 6,
    },
    caption: {
        fontFamily: "Poppins-Italic",
        fontSize: 14,
        color: "#666",
        marginTop: 6,
    },
})


export default ChallengesPage;