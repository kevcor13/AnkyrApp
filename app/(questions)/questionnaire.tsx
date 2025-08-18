import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import { useGlobal } from "@/context/GlobalProvider";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const Questionnaire = () => {
  const { userData, logoutUser, markQuestionnaireCompleted, ngrokAPI } = useGlobal();
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [age, setAge] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [fitness, setFitness] = useState('');
  const [workoutDays, setWorkoutDays] = useState(0);
  const [selectedDays, setSelectedDays] = useState({
    Sunday: false, Monday: false, Tuesday: false, Wednesday: false,
    Thursday: false, Friday: false, Saturday: false
  });
  const [goal, setGoal] = useState('');
  const [equipmentAvailable, setEquipmentAvailable] = useState('');
  const [medicalCondition, setMedicalCondition] = useState(false);
  const [injuryType, setInjuryType] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [nutritionQuality, setNutritionQuality] = useState('');
  const [changeDays, setChangeDays] = useState(false);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  // keep workoutDays in sync
  useEffect(() => {
    const dayCount = Object.values(selectedDays).filter(Boolean).length;
    setWorkoutDays(dayCount);
  }, [selectedDays]);

  const getSelectedDayNames = () => {
    const dayMap = { Sunday: "Sunday", Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday" };
    const selectedDayNames: string[] = [];
    Object.entries(selectedDays).forEach(([k, v]) => { if (v) selectedDayNames.push((dayMap as any)[k]); });
    return selectedDayNames;
  };

  // ---- Animations: slide + fade-to-black (content-only)
  const slideX = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const run = (anim: Animated.CompositeAnimation) => new Promise<void>(res => anim.start(() => res()));

  const transitionToNext = async () => {
    if (isTransitioning || questionIndex >= questions.length - 1) return;
    setIsTransitioning(true);
    await run(Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }));
    setQuestionIndex(i => i + 1);
    slideX.setValue(SCREEN_WIDTH);
    await run(Animated.parallel([
      Animated.timing(slideX, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]));
    setIsTransitioning(false);
  };
  // -------------------------------------------------------------

  const handleSubmit = () => {
    setLoading(true);
    try {
      const fitnessData = { UserID: userData._id, gender, age, weight, fitnessLevel: fitness, workoutDays, fitnessGoal: goal };
      const points = { UserID: userData._id, streak: 0, points: 10, league: "NOVICE" };
      const daysList = getSelectedDayNames().join(", ");
      const Gmessage = `
User profile:
- Sex at birth: ${gender || 'unspecified'}
- Age: ${age}
- Weight_lbs: ${weight}
- Fitness level: ${fitness}
Goal: ${goal}

Workout days: ${daysList} (total ${workoutDays})
Equipment: ${equipmentAvailable}
Health: ${medicalCondition ? `Condition: ${injuryType}` : 'None reported'}
Sleep: ${sleepQuality}; Stress: ${stressLevel}

Output rules:
- Return ONLY JSON (no markdown, no commentary).
- Use ONLY exercises from the provided "Available Exercises" list (exact "name" values).
- Schema: { "routine": [ { "day": string, "focus": string, "timeEstimate": number,
    "warmup": [ { "exerciseName": string, "sets": number, "reps": string } ],
    "workoutRoutine": [ { "exerciseName": string, "sets": number, "reps": string, "difficulty": string, "recommendedWeight": number } ],
    "cooldown": [ { "exerciseName": string, "sets": number, "reps": string } ] } ] }
- If an exercise is bodyweight or a stretch, OMIT "recommendedWeight".
- If reps are time-based, keep "reps" as a string like "30 seconds".
- "recommendedWeight" MUST be a pure number (no units).
`.trim();
      const UserID = userData._id;

      axios.post(`${ngrokAPI}/fitnessInfo`,   fitnessData)
        .then(() => axios.post(`${ngrokAPI}/userSettings`, { UserID }))
        .then(() => axios.post(`${ngrokAPI}/api/user/createGameSystem`, points))
        .then(() => axios.post(`${ngrokAPI}/api/GenAI/ai`, { Gmessage, UserID }))
        .then(() => router.replace('/LoadingScreen'))
        .catch(e => console.log(e));
    } catch (error) { console.log(error); }
  };

  const handleNext = () => {
    if (questionIndex < questions.length - 1) transitionToNext();
    else handleSubmit();
  };
  const handleSelection = (setter: any, value: any) => { setter(value); handleNext(); };

  // ✅ Cap selections to 6: allow unselect anytime, block new selects if already 6
  const toggleDaySelection = (day: keyof typeof selectedDays) => {
    setSelectedDays(prev => {
      const alreadySelected = prev[day];
      if (alreadySelected) {
        // unselect is always allowed
        return { ...prev, [day]: false };
      }
      const selectedCount = Object.values(prev).filter(Boolean).length;
      if (selectedCount >= 6) {
        // block selecting more than 6
        return prev;
      }
      return { ...prev, [day]: true };
    });
  };

  const handleDaysConfirm = () => {
    const cnt = Object.values(selectedDays).filter(Boolean).length;
    if (cnt > 0) { setWorkoutDays(cnt); handleNext(); }
  };

  const headerTitle =
    questionIndex === 0
      ? "Let's start off simple."
      : questionIndex <= 6
      ? "A thing or two about you."
      : "Set your goals.";

  // simple validity checks for “show Next” on age/weight
  const ageReady = Number.isFinite(age) && age > 0;
  const weightReady = Number.isFinite(weight) && weight > 0;

  const questions = [
    // 1) AGE
    {
      question: (
        <View>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }} keyboardDismissMode="on-drag">
              <View className="mt-[200] px-[80px]">
                <Text className="text-white text-[24px] font-poppins-semibold text-center">How old are you?</Text>
                <TextInput
                  className="bg-[#24292A] mt-7 text-white p-5 mx-[19] rounded-lg text-[16px]"
                  keyboardType="numeric"
                  placeholder="Enter your age"
                  placeholderTextColor="#888"
                  onChangeText={(text) => setAge(parseFloat(text))}
                />
              </View>

              {/* ✅ Show Next only when age entered */}
              {ageReady && (
                <View className="mt-[-10px] px-[100px]">
                  <CustomButton
                    title="Next"
                    handlePress={handleNext}
                    buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                    textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
                  />
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      ),
    },
    // 2) GENDER
    {
      question: (
        <View>
          <Text className="text-white text-[21px] mb-4 mt-60 font-poppins-semibold text-center">Were you born a male or female?</Text>
          <View className="flex-row px-24">
            <View className="flex-row mt-6">
              <Image source={images.womanIcon} resizeMode="cover" />
              <View className="flex-row px-40">
                <Image source={images.maleIcon} resizeMode="cover" />
              </View>
            </View>
          </View>
          <View className="flex-row px-12 space-x-4 mt-6">
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
    // 3) WEIGHT
    {
      question: (
        <View>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }} keyboardDismissMode="on-drag">
              <View className="mt-[200] px-[80px]">
                <Text className="text-white text-[24px] font-poppins-semibold text-center">What is your current weight?</Text>
                <TextInput
                  className="bg-[#24292A] mt-7 text-white p-5 mx-[19] rounded-lg text-[16px]"
                  keyboardType="numeric"
                  placeholder="Enter your weight in lbs"
                  placeholderTextColor="#888"
                  onChangeText={(text) => setWeight(parseFloat(text))}
                />
              </View>

              {/* ✅ Show Next only when weight entered */}
              {weightReady && (
                <View className="mt-[-10px] px-[100px]">
                  <CustomButton
                    title="Next"
                    handlePress={handleNext}
                    buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                    textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
                  />
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      ),
    },
    // 4) CURRENT WORKOUT DAYS
    {
      question: (
        <View>
          <View className="mt-20 px-13 items-center">
            <Text className="font-poppins-semibold text-white text-2xl mb-4 text-center">
              How many days a week are you currently working out?
            </Text>
          </View>
          <View className="mt-7 px-20">
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14" onPress={() => handleSelection(setWorkoutDays, 0)}>
              <Text className="text-center text-[14px] font-poppins-semibold text-black">0, that's why I'm here</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 2)}>
              <Text className="text-center text-[14px] font-poppins-semibold text-black">1-2 day(s) a week</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 4)}>
              <Text className="text-center text-[14px] font-poppins-semibold text-black">3-4 days a week</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 6)}>
              <Text className="text-center text-[14px] font-poppins-semibold text-black">5-6 days a week</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 7)}>
              <Text className="text-center text-[14px] font-poppins-semibold text-black">Everyday</Text>
            </TouchableOpacity>
          </View> 
        </View>
      ),
    },
    // 5) SLEEP
    {
      question: (
        <View>
          <View className="mt-40 px-10 items-center">
            <Text className="text-white text-[21px] font-poppins-semibold mb-4">Describe your sleep routine.</Text>
          </View>
          <View className="mt-7 px-10">
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setSleepQuality, 'Very consistent, 8 hours')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">Very consistent, at least 8 hours </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setSleepQuality, 'Moderately good')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">Moderately good, some off days</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setSleepQuality, 'Very inconsistent')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">Very inconsistent, I never
                get 8 hours</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
    // 6) FITNESS LEVEL
    {
      question: (
        <View>
          <View className="mt-40 px-6 items-center">
            <Text className="text-white text-[21px] font-poppins-semibold mb-4">What is your fitness experience?</Text>
          </View>
          <View className="mt-7 px-6">
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setFitness, 'Beginner')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">I'm just getting into fitness</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setFitness, 'Intermediate')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">I have some fitness experience</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setFitness, 'Expert')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">I am currently active and consistent </Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    // 7) MEDICAL CONDITIONS
    {
      question: (
        <View>
          <View className="mt-40 px-2 items-center">
            <Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">
              Any medical conditions you think we should take into account?
            </Text>
          </View>
          <View className="mt-7 px-6">
            <TouchableOpacity
              className="bg-white p-4 rounded-2xl"
              onPress={() => handleSelection(setMedicalCondition, false)}
            >
              <Text className="text-center text-[16px] font-poppins-semibold text-black">
                No/rather not share
              </Text>
            </TouchableOpacity>
          </View>
          <View className="mt-20 px-6 items-center">
            <Text className="text-white text-[21px] font-poppins-semibold mb-4">
              If so, type in the box below:
            </Text>
          </View>
          <View className="mt-4 px-10">
            <TextInput
              className="bg-[#24292A] text-white p-6 rounded-lg"
              placeholder="Example: Asthma..."
              placeholderTextColor="#B0B0B0"
              onChangeText={setInjuryType}
            />
          </View>
          <View className="items-center px-10 mt-6">
            <Text className="text-[#CDCDE0] font-poppins text-center">
              Informatino shared with ANKYR is kept condfidential.
            </Text>
          </View>
        </View>
      ),
    },
    // 8) MAIN GOAL
    {
      question: (
        <View>
          <View className="mt-20 px-7 items-center">
            <Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What is your main fitness goal?</Text>
          </View>
          <View className="mt-7 px-20">
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setGoal, 'lose weight')}>
              <Text className="text-center font-poppins-semibold text-[16px] text-black">Lose Weight</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'Build Muscle')}>
              <Text className="text-center font-poppins-semibold text-[16px] text-black">Build Muscle</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'lose weight and build muscle')}>
              <Text className="text-center font-poppins-semibold text-[16px] text-black">Both of the above</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'running')}>
              <Text className="text-center font-poppins-semibold text-[16px] text-black">Running</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'be active')}>
              <Text className="text-center font-poppins-semibold text-[16px] text-black">I just want to be active</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    // 9) SELECT WORKOUT DAYS (max 6)
    {
      question: (
        <View>
          <View className="mt-20 items-center">
            <Text className="text-white text-2xl font-bold text-center">What days do you want to workout?</Text>
          </View>
          <View className="flex-row justify-between mt-20 px-6">
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Sunday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Sunday')}>
              <Text className="text-white text-xl font-bold">S</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Monday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Monday')}>
              <Text className="text-white text-xl font-bold">M</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Tuesday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Tuesday')}>
              <Text className="text-white text-xl font-bold">T</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Wednesday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Wednesday')}>
              <Text className="text-white text-xl font-bold">W</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Thursday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Thursday')}>
              <Text className="text-white text-xl font-bold">T</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Friday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Friday')}>
              <Text className="text-white text-xl font-bold">F</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Saturday ? 'bg-[#DAEEED]' : 'bg-[#44504F]'}`} onPress={() => toggleDaySelection('Saturday')}>
              <Text className="text-white text-xl font-bold">S</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white text-center mt-4">You can choose up to 6 days a week</Text>
          <View className="mt-20 px-10 items-center">
            <Text className="mt-20 text-white text-center text-3xl font-bold">You selected a {Object.values(selectedDays).filter(Boolean).length} day workout plan.</Text>
          </View>
          <View className="mt-[-10px] px-[100px]">
                  <CustomButton
                    title="Next"
                    handlePress={handleNext}
                    buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                    textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
                  />
                </View>
        </View>
      ),
    },
    // 10) EQUIPMENT
    {
      question: (
        <View>
          <View className="mt-20 px-10 items-center">
            <Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What equipment do you have access to?</Text>
          </View>
          <View className="mt-7 px-20">
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl" onPress={() => handleSelection(setEquipmentAvailable, 'full gym')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">Gym membership</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setEquipmentAvailable, 'small at home gym')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">Small home gym</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'no equipment')}>
              <Text className="text-center text-[16px] font-poppins-semibold text-black">I dont have access to equipment</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView className="bg-black h-full">
      {loading ? (
        <View className="flex-1 mt-10 justify-center items-center">
          <Text className="text-white text-2xl font-bold font-poppins">Give us a second while our A.I. is personalizes your workouts...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* FIXED HEADER (changes by questionIndex) */}
          <View style={styles.headerWrap}>
            <Text className="text-white text-3xl font-bold font-poppins">{headerTitle}</Text>
          </View>

          {/* CONTENT (slides & fades under the fixed header) */}
          <View style={{ flex: 1, paddingTop: 8 }}>
            <Animated.View style={{ flex: 1, transform: [{ translateX: slideX }] }}>
              {questions[questionIndex].question}
            </Animated.View>

            {/* Fade-to-black overlay (content-only) */}
            <Animated.View
              pointerEvents={isTransitioning ? "auto" : "none"}
              style={[StyleSheet.absoluteFillObject, { backgroundColor: "black", opacity: overlayOpacity }]}
            />
          </View>
          <View className="mt-[71px] items-center">
            <Image source={images.ankyrIcon} className="h-[55px] w-[50px]" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
});

// @ts-ignore
export default Questionnaire;
