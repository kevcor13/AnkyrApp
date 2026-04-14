import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image} from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import icons from "@/constants/icons";
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useGlobal } from '@/context/GlobalProvider';
import WorkoutCard from '@/components/WorkoutCard';
import axios from 'axios';


const WorkoutOverview = () => {

    const {userWorkoutData, userData, selectedChallenges,fetchFitnessData,fetchWorkoutFocus} = useGlobal();
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [userFitnessData, setUserFitnessData] = useState('');
    const [userFitnessLevel, setUserFitnessLevel] = useState('');
    const [points, setPoints] = useState(Number);

    const theme = userData.defaultTheme;

    useEffect(() => {
        const fetchData = async () => {
            
            try {
                setPoints((userWorkoutData.warmup.length + userWorkoutData.workoutRoutine.length) * 5);
                setTimeEstimate(userWorkoutData.timeEstimate);
                setFocus(userWorkoutData.focus);
                const response = await fetchFitnessData(userData._id);
                setUserFitnessData(response);
                setUserFitnessLevel(response.fitnessLevel);
                console.log("Fetched fitness data:", response);

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
        } else{
            console.log("Error fetching workout focus");
        }
        
    }

    return (
        <LinearGradient
            colors={theme ? ["#000000", "#272727"] : ["#000000", "#272727"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Close Button */}
                <View style={styles.closeButtonContainer}>
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={icons.x} 
                            style={{width: 20, height: 20, tintColor: '#FFFFFF'}}
                        />
                    </TouchableOpacity>
                </View>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.workoutTitle}>{focus}</Text>
                </View>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeNumber}>{timeEstimate}</Text>
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

                {/* Primary CTA Button */}
                <CustomButton
                    title="Let's Go!"
                    handlePress={() => router.navigate('/(workout)/ActiveWorkoutScreen')}
                    buttonStyle={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                />

                {/* Overview Section */}
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
                    <WorkoutCard workoutRoutine={userWorkoutData.warmup} title='Warm-Up'/>
                    <WorkoutCard workoutRoutine={userWorkoutData.workoutRoutine} title='Main Workout'/>
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
        </LinearGradient>
    )
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    closeButtonContainer: {
        marginTop: 60,
        marginHorizontal: 20,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    headerContainer: {
        marginHorizontal: 20,
        marginTop: 32,
        marginBottom: 24,
    },
    workoutTitle: {
        fontSize: 40,
        color: '#FFFFFF',
        fontFamily: 'raleway-light',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 56,
        color: '#6477E7',
        lineHeight: 64,
    },
    timeUnit: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 20,
        color: '#6477E7',
        marginLeft: 4,
        opacity: 0.8,
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
})

export default WorkoutOverview