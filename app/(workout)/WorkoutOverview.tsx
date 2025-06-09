import { View, Text, ScrollView, StyleSheet, Touchable, TouchableOpacity, Image} from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import icons from "@/constants/icons";
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useGlobal } from '@/context/GlobalProvider';
import WorkoutCard from '@/components/WorkoutCard';


const WorkoutOverview = () => {

    const {userWorkoutData, userData, warmup, workout} = useGlobal();
    const [currentDay, setCurrentDay] = useState('');
    const [workoutRoutine, setworkoutRoutine] = useState([])
    const [focus, setFocus] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ensure the workout data exists and has the correct structure
                const routineArray = userWorkoutData?.routine || [];

                // Get the current day
                const today = new Date().toLocaleString("en-US", { weekday: "long" })
                
                // Find today's workout in the routine array
                const workoutOfTheDay = routineArray.find((dayRoutine: { day: string; }) => dayRoutine.day === today);
                setTimeEstimate(workoutOfTheDay.timeEstimate);
                setFocus(workoutOfTheDay.focus)
                setworkoutRoutine(routineArray.find((dayRoutine:{day: string;}) => dayRoutine.day === 'Monday')?.workoutRoutine)
                
                
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
                            <Text style={{fontFamily:'raleway-semibold', color:'#8AFFF9', fontSize:24}}>+ 27</Text>
                            <Text style={{fontFamily:'raleway-semibold', color:'#8AFFF9', fontSize:13, marginTop: 10}}>  xp</Text>
                        </View>
                    </View>
                </View>
                <CustomButton
                        title="Okay let's go!"
                        handlePress={() => router.navigate('/(workout)/ActiveWorkoutScreen')}
                        buttonStyle={{
                            backgroundColor: 'rgba(217, 217, 217, 0.5)',
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
                        <Text style={{fontFamily:'poppins-semibold', fontSize:20, color:'white'}}>Overview</Text>
                        <TouchableOpacity style={{alignItems:'center', justifyContent: 'flex-end'}}>
                            <Text>Hello</Text>
                        </TouchableOpacity>
                </View>
                <WorkoutCard workoutRoutine={warmup}/>
                <WorkoutCard workoutRoutine={workout}/>
            </ScrollView>
        </LinearGradient>
    )
};

const styles = StyleSheet.create({
    backButton:{
        backgroundColor: 'rgba(217, 217, 217, 0.5)',
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
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
    },

})

export default WorkoutOverview