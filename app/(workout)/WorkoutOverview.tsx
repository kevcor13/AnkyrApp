import { View, Text, ScrollView, StyleSheet, Touchable, TouchableOpacity, Image} from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import icons from "@/constants/icons";
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useGlobal } from '@/context/GlobalProvider';
import WorkoutCard from '@/components/WorkoutCard';


const WorkoutOverview = () => {

    const {userWorkoutData, userData, warmup, workout, coolDown, TodayWorkout, selectedChallenges} = useGlobal();
    const [currentDay, setCurrentDay] = useState('');
    const [workoutRoutine, setworkoutRoutine] = useState([])
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [points, setPoints] = useState(Number)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ensure the workout data exists and has the correct structure
                const routineArray = userWorkoutData?.routine || [];
                setPoints((TodayWorkout.warmup.length + TodayWorkout.workoutRoutine.length) * 5);
                console.log(selectedChallenges);
                

                
                
                // Get the current day
                const today = new Date().toLocaleString("en-US", { weekday: "long" })
                
                // Find today's workout in the routine array
                const workoutOfTheDay = routineArray.find((dayRoutine: { day: string; }) => dayRoutine.day === today);
                setTimeEstimate(workoutOfTheDay.timeEstimate);
                setFocus(workoutOfTheDay.focus);
                
                
            } catch (error) {
                console.error("Error fetching workout data:", error);
            }
        };

        fetchData();
    }, [userData]);

    

    return (
        <LinearGradient
            colors={['#FF0509', '#271293']} // Gradient colors
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <ScrollView>
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.backButton}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Image
                                source={icons.x} style={{width:24, height:24}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.header}>
                    <Text style={styles.textHeader}>{focus}</Text>
                </View>
                    {/* the workout time and xp details */}
                <View style={{flexDirection:'row', flex:1, marginLeft:38, marginRight:38, marginTop:20}}>
                    <Text style={{fontFamily:'poppins-semibold', fontSize:64, color:'#8AFFF9'}}>{timeEstimate}</Text>
                    <Text style={{fontFamily:'poppins-semibold', fontSize:24, color:'#8AFFF9', marginTop:40, marginLeft:5}}>mins</Text>
                    <View style={{alignItems:'flex-end', flex:1}}>
                        <Text style={{fontFamily:'raleway-semibold', color:'white', fontSize:16}}>TOTAL XP:</Text>
                        <View style={{flexDirection:'row',  marginTop: 10}}>
                            <Text style={{fontFamily:'raleway-semibold', color:'#8AFFF9', fontSize:24}}>+ {points}</Text>
                            <Text style={{fontFamily:'raleway-semibold', color:'#8AFFF9', fontSize:13, marginTop: 10}}>  xp</Text>
                        </View>
                    </View>
                </View>
                <CustomButton
                        title="Okay let's go!"
                        handlePress={() => router.navigate('/(workout)/ActiveWorkoutScreen')}
                        buttonStyle={{
                            backgroundColor: 'rgba(217, 217, 217, 0.26)',
                            borderRadius: 20,
                            paddingVertical: 16,
                            marginHorizontal: 38,
                            marginTop: 10,
                            justifyContent: "center"
                        }}
                        textStyle={{
                            color: '#FFFFFF',
                            fontSize: 16,
                            fontFamily: 'poppins-semiBold'
                        }}

                    />
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 38, marginTop: 60}}>
                        <Text style={{fontFamily:'poppins-semibold', fontSize:20, color:'white'}}>Overview: </Text>
                        <TouchableOpacity style={{alignItems:'center', justifyContent: 'flex-end'}}>
                            <Text>Hello</Text>
                        </TouchableOpacity>
                </View>
                <WorkoutCard workoutRoutine={warmup} title='Warm-Up'/>
                <WorkoutCard workoutRoutine={workout} title='Main Workout'/>
                {/** <WorkoutCard workoutRoutine={coolDown} title='Cool Down'/>*/}
                {selectedChallenges && <WorkoutCard workoutRoutine={selectedChallenges} title='Challanges'/> }
                <View style={styles.bottomStreak}>
                    <Image source={icons.blueStreak} style={{height: 75, width: 74,}}/>
                </View>
            </ScrollView>
        </LinearGradient>
    )
};

const styles = StyleSheet.create({

    backButton:{
        backgroundColor: 'rgba(217, 217, 217, 0.26)',
        marginTop: 60,
        marginLeft: 38,
        borderRadius: 50,
        padding: 10,
    }, 
    header:{
        marginLeft: 38,
        marginTop: 40,
    },
    textHeader: {
        fontSize: 43,
        textTransform: 'uppercase',
        color: '#FFFFFF',
        fontFamily: 'raleway-light',
    },
    bottomStreak: {
        alignItems: 'center',
        justifyContent: 'center', 
        marginTop: 20,
        paddingBottom: 40,
    },
    buttonContainer: {
        marginHorizontal: 20,
        marginTop: 20, // Add space from the league section
        borderRadius: 15,
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
        color: '#00FFBF',
        fontSize: 20,
        fontFamily: 'Poppins-Bold', // Use specific font family if available
    },
})

export default WorkoutOverview