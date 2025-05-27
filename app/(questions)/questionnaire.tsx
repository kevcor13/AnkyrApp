import images from "@/constants/images";
import { useGlobal } from "@/context/GlobalProvider";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const Questionnaire = () => {
    const {userData, logoutUser, markQuestionnaireCompleted, ngrokAPI} = useGlobal()
    const [loading, setLoading] = useState(false);
    const [gender, setGender] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [age, setAge] = useState(0);
    const [weight, setWeight] = useState(0);
    const [fitness, setFitness] = useState('')
    const [workoutDays, setWorkoutDays] = useState(0)
    const [selectedDays, setSelectedDays] = useState({
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false
    });
    const [goal, setGoal] = useState('')
    const [equipmentAvailable, setEquipmentAvailable] = useState('');
    const [medicalCondition, setMedicalCondition] = useState(false);
    const [injuryType, setInjuryType] = useState('');
    const [sleepQuality, setSleepQuality] = useState('');
    const [stressLevel, setStressLevel] = useState('');
    const [nutritionQuality, setNutritionQuality] = useState('')
    const [changeDays, setChangeDays] = useState(false)

    useEffect(() => {
        // Count selected days for workout total
        const dayCount = Object.values(selectedDays).filter(value => value).length;
        setWorkoutDays(dayCount);
    }, [selectedDays]);

    const getSelectedDayNames = () => {
        const dayMap = {
            Sunday: "Sunday",
            Monday: "Monday",
            Tuesday: "Tuesday",
            Wednesday: "Wednesday",
            Thursday: "Thursday",
            Friday: "Friday",
            Saturday: "Saturday"
        };

        const selectedDayNames: any[] = [];
        Object.entries(selectedDays).forEach(([key, isSelected]) => {
            if (isSelected) {
                // @ts-ignore
                selectedDayNames.push(dayMap[key]);
            }
        });

        return selectedDayNames;
    };

    const handleSubmit = () => {
        setLoading(true);
        console.log(userData)
        try {
            const fitnessData = {
                UserID: userData._id,
                gender: gender,
                age: age,
                weight: weight,
                fitnessLevel: fitness,
                workoutDays: workoutDays,
                fitnessGoal: goal,
            };
            const points = {
                UserID: userData._id,
                streak: 0,
                points: 10
            }
            const selectedDayNames = getSelectedDayNames();
            const daysList = selectedDayNames.join(", ");

            const message = `
            Generate a detailed weekly workout plan for a ${gender}, ${age} years old, weighing ${weight} lbs, with a fitness level of ${fitness}, whose primary goal is to ${goal}.
            
            SPECIFIC WORKOUT DAYS:
            - Create structured workouts for these days: ${daysList}
            - Total of ${workoutDays} workout days per week
            
            EQUIPMENT:
            - Available equipment: ${equipmentAvailable}
            
            HEALTH FACTORS:
            - ${medicalCondition ? `Has injury/condition: ${injuryType}` : `No known medical conditions`}
            - Sleep quality: ${sleepQuality}
            - Stress level: ${stressLevel}
            
            FORMAT:
            For each workout day, provide:
            - "day": name of the day (e.g., "Monday")
            - "focus": area of focus (e.g., "Upper Body", "Lower Body", "Cardio")
            - "timeEstimate": estimated workout duration in minutes (e.g., 45)
            - "warmup": array of warm-up exercise names
            - "workoutRoutine": array of 4-6 exercises with:
                - "exercise": name of exercise
                - "sets": number
                - "reps": number or range (e.g., "8-10")
                - Optional: suggest difficulty level as "easy", "moderate", or "hard"
            - "cooldown": brief cooldown recommendation (text)
            
            DO NOT include rest days.
            
            Return the full structured data in pure JSON format, no extra commentary.
            `;
            
            const UserID = userData._id // Pass the userID here

            axios.post(`${ngrokAPI}/fitnessInfo`, fitnessData)
                .then(res => {
                    console.log("hello 1 ", res.data)
                    axios.post(`${ngrokAPI}/userSettings`, {UserID})
                        .then(res => {
                            console.log("user Settings created", res.data)
                            axios.post(`${ngrokAPI}/gameSystem`, points)
                                .then((res) => {
                                    console.log("game system created", res.data)
                                    axios.post(`${ngrokAPI}/aI`, {message, UserID})
                                        .then(res => {
                                            console.log("Workout saved successfully! Response:", res.data)
                                            router.replace('/LoadingScreen');
                                        })
                                })
                        })
                })
                .catch(e => console.log(e));

        } catch (error) {
            console.log(error)
        }
    }

    const handleSignOut = async () => {
        await logoutUser();
    }

    const handleNext = async () => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(questionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSelection = (setter, value) => {
        setter(value);
        handleNext();
    };

    const toggleDaySelection = (day) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const handleDaysConfirm = () => {
        // Count selected days
        const dayCount = Object.values(selectedDays).filter(value => value).length;
        if (dayCount > 0) {
            setWorkoutDays(dayCount);
            handleNext();
        }
        // If no days selected, don't proceed
    };

    const questions = [
        {
            // AGE QUESTION
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins mt-20">Let's start off simple.</Text>
                    <View className="mt-40 px-20">
                        <Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">How old are you?</Text>
                        <TextInput
                            className="bg-gray-800 mt-16 text-white p-6 rounded"
                            keyboardType="numeric"
                            placeholder="Enter your age"
                            placeholderTextColor="#888"
                            value={age.toString()}
                            onChangeText={(text) => setAge(parseFloat(text) || 0)}
                        />
                        <TouchableOpacity className="bg-white p-4 rounded mt-16" onPress={handleNext}>
                            <Text className="text-black text-center font-bold">Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ),
        },
        {
            // GENDER QUESTION
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins">A thing or two about you.</Text>
                    <Text className="text-white text-lg font-bold mb-4 mt-60 font-poppins text-center">Where you born a male or female?</Text>
                    <View className="flex-row px-20">
                        <View className="flex-row mt-6">
                            <Image source={images.womanIcon} resizeMode="cover"></Image>
                            <View className="flex-row px-40">
                                <Image source={images.maleIcon} resizeMode="cover"></Image>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row px-9 space-x-4 mt-6">
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-14" onPress={() => handleSelection(setGender, 'Male')}>
                            <Text className="text-center text-black">Male</Text>
                        </TouchableOpacity>
                        <View className="flex-row px-10">
                            <TouchableOpacity className="bg-white p-4 rounded-2xl px-14" onPress={() => handleSelection(setGender, 'Female')}>
                                <Text className="text-center text-black">Female</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ),
        },
        {
            // WEIGHT QUESTION
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins">A thing or two about you.</Text>
                    <View className="mt-40 px-">
                        <Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What is your current weight?</Text>
                    </View>
                    <View className="mt-7 px-28">
                        <TextInput
                            className="bg-gray-800 mt-16 text-white p-6 rounded"
                            keyboardType="numeric"
                            placeholder="Enter your weight"
                            placeholderTextColor="#888"
                            value={weight.toString()}
                            onChangeText={(text) => setWeight(parseFloat(text) || 0)}
                        />
                        <TouchableOpacity className="bg-white p-4 rounded mt-16" onPress={handleNext}>
                            <Text className="text-black text-center font-bold">Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ),
        },
        // WORKOUT DAYS QUESTIONS
        {
            question: (
                <View>
                    <Text className="mt-10 text-white text-3xl font-bold font-poppins">A thing or two about you.</Text>
                    <View className="mt-20 px-14">
                        <Text className="text-white text-2xl font-bold mb-4">How  many days a week are you currently working out?</Text>
                    </View>
                    <View className="mt-7 px-16">
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-14" onPress={() => handleSelection(setWorkoutDays, 0)}>
                            <Text className="text-center font-poppins-semibold text-black">0, that's why I'm here</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 2)}>
                            <Text className="text-center font-poppins-semibold text-black">1-2 day(s) a week</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 4)}>
                            <Text className="text-center font-poppins-semibold text-black">3-4 days a week</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 6)}>
                            <Text className="text-center font-poppins-semibold text-black">5-6 days a week</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 7)}>
                            <Text className="text-center font-poppins-semibold text-black">Everyday</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="mt-20 px-20 items-center flex justify-center">
                        <Image source={images.ankyrIcon} className="h-[55px] w-[50px]"></Image>
                    </View>
                </View>
            ),
        },
        {
            //SLEEP QUALITY QUESTION
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins mt-10">A thing or two about you.</Text>
                    <View className="mt-40 px-10 items-center">
                        <Text className="text-white text-2xl font-bold mb-4">Describe your sleep routine</Text>
                    </View>
                    <View className="mt-7 px-10">
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6" onPress={() => handleSelection(setSleepQuality, 'Very consistent, 8 hours')}>
                            <Text className="text-center font-poppins-semibold text-black">Very consistent, at least 8 hours </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setSleepQuality, 'Moderately good')}>
                            <Text className="text-center font-poppins-semibold text-black">Moderately good, some off days</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setSleepQuality, 'Very inconsistent')}>
                            <Text className="text-center font-poppins-semibold text-black">Very inconsistent, I never
                                get 8 hours</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="mt-40 px-20 items-center flex justify-center">
                        <Image source={images.ankyrIcon} className="h-[55px] w-[50px]"></Image>
                    </View>
                </View>
            ),
        },
        {
            // fitness level
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins mt-10">A thing or two about you.</Text>
                    <View className="mt-40 px-6 items-center">
                        <Text className="text-white text-2xl font-bold mb-4">What is your fitness experience?</Text>
                    </View>
                    <View className="mt-7 px-6">
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6" onPress={() => handleSelection(setFitness, 'Beginner')}>
                            <Text className="text-center font-poppins-semibold text-black">I'm just getting into fitness</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setFitness, 'Intermediate')}>
                            <Text className="text-center font-poppins-semibold text-black">I have some fitness experience</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setFitness, 'Expert')}>
                            <Text className="text-center font-poppins-semibold text-black">I am currently active and consistent </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="mt-40 px-20 items-center flex justify-center">
                        <Image source={images.ankyrIcon} className="h-[55px] w-[50px]"></Image>
                    </View>
                </View>
            )
        },
        {
            //MEDICAL CONDITIONS QUESTION
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins mt-10">A thing or two about you.</Text>
                    <View className="mt-40 px-2 items-center">
                        <Text className="text-white text-2xl font-bold mb-4">Any medical conditions you think we should take into account?</Text>
                    </View>
                    <View className="mt-7 px-6">
                        <TouchableOpacity className="bg-white p-4 rounded-2xl" onPress={() => handleSelection(setMedicalCondition, false)}>
                            <Text className="text-center font-poppins-semibold text-black">No/rather not share</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="mt-20 px-6 items-center">
                        <Text className="text-white text-2xl font-bold mb-4">If so, type in the box below</Text>
                    </View>
                    <View className="mt-4 px-10">
                        <TextInput
                            className="bg-gray-800 text-white p-6 rounded"
                            placeholder="Example: Asthma..."
                            placeholderTextColor="#B0B0B0"
                            onChangeText={setInjuryType}
                        />
                    </View>
                    <View className="items-center px-10 mt-6">
                        <Text className="text-gray-500 font-bold">
                            Not required if you are not comfortable sharing. You don't have to be too specific. Information shared with ANKYR is kept confidential.
                        </Text>
                    </View>
                </View>
            ),
        },
        {
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins">Set your goals</Text>
                    <View className="mt-20 px-10 items-center">
                        <Text className="text-white text-2xl font-bold mb-4 text-center">
                            What is your main fitness goal?
                        </Text>
                    </View>
                    <View className="mt-7 px-10">
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6" onPress={() => handleSelection(setGoal, 'lose weight')}>
                            <Text className="text-center font-poppins-semibold text-black">Lose Weight</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'Build Muscle')}>
                            <Text className="text-center font-poppins-semibold text-black">Build Muscle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'lose weight and build muscle')}>
                            <Text className="text-center font-poppins-semibold text-black">Both of the above</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'running')}>
                            <Text className="text-center font-poppins-semibold text-black">Running</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'be active')}>
                            <Text className="text-center font-poppins-semibold text-black">I just want to be active</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        },
        {
            // NEW DAY SELECTION UI based on screenshot
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins mt-10">Set your goals.</Text>

                    <View className="mt-20 items-center">
                        <Text className="text-white text-2xl font-bold text-center">
                            What days do you want to workout?
                        </Text>
                    </View>

                    {/* Day selection boxes */}
                    <View className="flex-row justify-between mt-20 px-6">
                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Sunday ? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('Sunday')}
                        >
                            <Text className="text-white text-xl font-bold">S</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Monday? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('Monday')}
                        >
                            <Text className="text-white text-xl font-bold">M</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Tuesday ? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('Tuesday')}
                        >
                            <Text className="text-white text-xl font-bold">T</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Wednesday ? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('Wednesday')}
                        >
                            <Text className="text-white text-xl font-bold">W</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Thursday ? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('Thursday')}
                        >
                            <Text className="text-white text-xl font-bold">T</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Friday ? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('Friday')}
                        >
                            <Text className="text-white text-xl font-bold">F</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Saturday ? 'bg-blue-200' : 'bg-gray-700'}`}
                            onPress={() => toggleDaySelection('S2')}
                        >
                            <Text className="text-white text-xl font-bold">S</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white text-center mt-4">
                        You can choose up to 6 days a week
                    </Text>

                    <View className="mt-20 items-center">
                        <Text className="text-white text-3xl font-bold">
                            You selected a {Object.values(selectedDays).filter(Boolean).length} day workout plan.
                        </Text>
                    </View>

                    <View className="mt-20 items-center">
                        <TouchableOpacity onPress={handleDaysConfirm}>
                            <Image source={images.ankyrIcon} className="h-16 w-16" />
                        </TouchableOpacity>
                    </View>
                </View>
            ),
        },
        {
            // EQUIPMENT AVAILABLE QUESTION
            question: (
                <View>
                    <Text className="text-white text-3xl font-bold font-poppins">Set your goals</Text>
                    <View className="mt-20 px-10 items-center">
                        <Text className="text-white text-2xl font-bold mb-4 text-center">
                            What equipment do you have access to?
                        </Text>
                    </View>
                    <View className="mt-7 px-10">

                        <TouchableOpacity className="bg-white p-4 rounded-2xl" onPress={() => handleSelection(setEquipmentAvailable, 'full gym')}>
                            <Text className="text-center font-poppins-semibold text-black">Gym membership</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setEquipmentAvailable, 'small at home gym')}>
                            <Text className="text-center font-poppins-semibold text-black">Small home gym</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'no equipment')}>
                            <Text className="text-center font-poppins-semibold text-black">I dont have access to equipment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ),
        },
    ]
    return (
        <SafeAreaView className="bg-black h-full">
            {/* Show Loading Screen if loading is true */}
            {loading ? (
                <View className="flex-1 mt-10 justify-center items-center">
                    <Text className="text-white text-2xl font-bold font-poppins">Give us a second while our A.I. is personalizes your workouts...</Text>
                </View>
            ) : (
                // Show questionnaire if not loading
                <View className="p-4">
                    <View>{questions[questionIndex].question}</View>
                </View>
            )}
        </SafeAreaView>
    )
}
// @ts-ignore
export default Questionnaire