import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import { useGlobal } from "@/context/GlobalProvider";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
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
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';

import { QuestionnaireIcon } from "@/assets/icons/questionnaire";
import WheelPicker from "@/components/WheelAgePicker";

const TITLE_DUR = 500;
const ANS_DUR = 350;
const STAGGER = 300;
const SCREEN_ENTER_DUR = 600;
const SCREEN_EXIT_DUR = 400;

type QuestionScreenProps = {
  title?: React.ReactNode;
  titleWrapperClassName?: string;
  titleWrapperStyle?: any;
  children?: React.ReactNode;
};

const QuestionScreen = ({
  title,
  titleWrapperClassName,
  titleWrapperStyle,
  children,
}: QuestionScreenProps) => (
  <View>
    {title ? (
      <Animated.View entering={FadeInRight.duration(TITLE_DUR)}>
        {titleWrapperClassName || titleWrapperStyle ? (
          <View className={titleWrapperClassName} style={titleWrapperStyle}>
            {title}
          </View>
        ) : (
          title
        )}
      </Animated.View>
    ) : null}
    {children}
  </View>
);

type StaggerItemProps = {
  index: number;
  children: React.ReactNode;
  style?: any;
  className?: string;
};

const StaggerItem = ({ index, children, style, className }: StaggerItemProps) => (
  <Animated.View
    entering={FadeInUp.duration(ANS_DUR).delay(index * STAGGER)}
  >
    {className || style ? (
      <View className={className} style={style}>
        {children}
      </View>
    ) : (
      children
    )}
  </Animated.View>
);

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
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // keep workoutDays in sync
  useEffect(() => {
    const dayCount = Object.values(selectedDays).filter(Boolean).length;
    setWorkoutDays(dayCount);
  }, [selectedDays]);
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const getSelectedDayNames = () => {
    const dayMap = { Sunday: "Sunday", Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday" };
    const selectedDayNames: string[] = [];
    Object.entries(selectedDays).forEach(([k, v]) => { if (v) selectedDayNames.push((dayMap as any)[k]); });
    return selectedDayNames;
  };

  // ----------------------------------------------------------------

  const transitionToNext = () => {
    if (isTransitioning) return;
    if (questionIndex >= questions.length - 1) return;

    setIsTransitioning(true);
    setQuestionIndex(prev => prev + 1);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, SCREEN_ENTER_DUR + 50);
  };
  // -------------------------------------------------------------

  const handleSubmit = () => {
    console.log("[handleSubmit] called");
    setLoading(true);
    try {

      const getSplitForDays = (days: number) => {
        if (days === 3) return "Push/Pull/Legs";
        if (days === 4) return "Upper/Lower/Upper/Lower";
        if (days === 5) return "Push/Pull/Legs/Upper/Full Body";
        if (days >= 6) return "Push/Pull/Legs/Push/Pull/Legs";
        // fallback for 1–2 days
        return "Full Body";
      };

      const bodyGoal = goal === 'lose weight' ? 'cut' : 'bulk';

      const fitnessData = {
        UserID: userData._id,
        gender,
        age,
        weight,
        fitnessLevel: fitness,
        workoutDays,
        fitnessGoal: goal,
        bodyGoal,
        sleepQuality,
        equipmentAvailable,
        selectedWorkoutDays: getSelectedDayNames(),
      };
      const points = { UserID: userData._id, streak: 0, points: 10, league: "NOVICE" };
      const daysList = getSelectedDayNames().join(", ");
      const split = getSplitForDays(workoutDays);

      console.log("[handleSubmit] fitnessData:", fitnessData);
      console.log("[handleSubmit] selected days:", daysList);
      console.log("[handleSubmit] split:", split);

      const splitRules = `
      Program design rules:
      - Use a ${split} split.
      - "focus" must be assigned to each day in the split (e.g., Push = chest/shoulders/triceps, Pull = back/biceps, Legs = quads/hamstrings/glutes/calves)
      - for the "focus" you must assign which ever muscle groups are relevant to that day. the push/pull/legs split is for reference only.
      - Map the selected workout days in order to the split days in order.
      - Choose exercises whose "category" matches that day's focus (e.g., Push = chest/shoulders/triceps, Pull = back/biceps, Legs = quads/hamstrings/glutes/calves).`.trim();

      const Gmessage = `
User profile:
- Sex at birth: ${gender || 'unspecified'}
- Age: ${age}
- Weight_lbs: ${weight}
- Fitness level: ${fitness}

Goal: ${goal}
Body goal: ${bodyGoal}
Equipment: ${equipmentAvailable}

Workout days: ${daysList} (total ${workoutDays})
Health: ${medicalCondition ? `Condition: ${injuryType}` : 'None reported'}
Sleep: ${sleepQuality}; Stress: ${stressLevel}

${splitRules}
`.trim();
      const UserID = userData._id;

      axios.post(`${ngrokAPI}/api/user/createFitness`, fitnessData)
        .then(() => {
          console.log("[handleSubmit] /fitnessInfo success");
          return axios.post(`${ngrokAPI}/userSettings`, { UserID });
        })
        .then(() => {
          console.log("[handleSubmit] /userSettings success");
          return axios.post(`${ngrokAPI}/api/user/createGameSystem`, points);
        })
        .then(() => {
          console.log("[handleSubmit] /createGameSystem success");
          return axios.post(`${ngrokAPI}/api/GenAI/ai`, { Gmessage, UserID });
        })
        .then(() => {
          console.log("[handleSubmit] /api/GenAI/ai success, navigating to /LoadingScreen");
          router.replace('/LoadingScreen');
        })
        .catch(e => {
          console.log("[handleSubmit] axios error:", e);
        });
    } catch (error) {
      console.log("[handleSubmit] try/catch error:", error);
    }
  };

  const handleNext = () => {
    console.log("[handleNext] called at questionIndex =", questionIndex);
    // @ts-ignore
    if (questionIndex < questions.length - 1) transitionToNext();
    else handleSubmit();
  };

  const handleSelection = (setter: any, value: any) => {
    console.log("[handleSelection] value:", value);
    setter(value);
    handleNext();
  };

  // ✅ Cap selections to 6: allow unselect anytime, block new selects if already 6
  const toggleDaySelection = (day: keyof typeof selectedDays) => {
    console.log("[toggleDaySelection] toggling day:", day);
    setSelectedDays(prev => {
      const alreadySelected = prev[day];
      const selectedCount = Object.values(prev).filter(Boolean).length;
      console.log("[toggleDaySelection] before toggle, selectedCount =", selectedCount, "alreadySelected =", alreadySelected);
      if (alreadySelected) {
        return { ...prev, [day]: false };
      }
      if (selectedCount >= 6) {
        console.log("[toggleDaySelection] blocked: already 6 days selected");
        return prev;
      }
      return { ...prev, [day]: true };
    });
  };

  const handleDaysConfirm = () => {
    const cnt = Object.values(selectedDays).filter(Boolean).length;
    console.log("[handleDaysConfirm] count =", cnt);
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <QuestionScreen
            title={<Text className="text-white text-[24px] font-poppins-semibold text-center">How old are you?</Text>}
            titleWrapperClassName="mt-[100] px-[80px]"
          >
            <View style={{ flexGrow: 1, paddingBottom: 200 }}>
              <View className="px-[80px]">
                {/**   Save it as a text or keep it as a wheel
                <TextInput
                  className="bg-[#24292A] mt-7 text-white p-5 mx-[19] rounded-lg text-[16px]"
                  keyboardType="numeric"
                  placeholder="Enter your age"
                  placeholderTextColor="#888"
                  onChangeText={(text) => {
                    console.log("[Age Input] text =", text);
                    setAge(parseFloat(text));
                  }}
                />
                */}
                <StaggerItem index={0}>
                  <WheelPicker
                    value={age}
                    onChange={setAge}
                    min={1}
                    max={100}
                  />
                </StaggerItem>
              </View>

              {/* ✅ Show Next only when age entered */}
              {ageReady && (
                <StaggerItem index={1}>
                  <View className="mt-[-10px] px-[100px]">
                    <CustomButton
                      title="Next"
                      handlePress={handleNext}
                      buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                      textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
                    />
                  </View>
                </StaggerItem>
              )}
            </View>
          </QuestionScreen>
        </KeyboardAvoidingView>
      ),
    },
    // 2) GENDER
    {
      question: (
        <QuestionScreen
          title={(
            <Text className="text-white text-[21px] font-poppins-semibold text-center">
              Were you born a male or female?
            </Text>
          )}
          titleWrapperClassName="mb-4 mt-60 px-4 items-center"
        >
          <View className="items-center">
            <StaggerItem index={0}>
              <View className="flex-row justify-between gap-[80px] mt-6">
                <QuestionnaireIcon name="femaleIcon" color="#FFF" size={60} />
                <QuestionnaireIcon name="maleIcon" color="#FFF" size={60} />
              </View>
            </StaggerItem>

            <StaggerItem index={1}>
              <View className="flex-row gap-4 mt-6">
                <TouchableOpacity
                  className="bg-white p-4 rounded-2xl px-14"
                  onPress={() => handleSelection(setGender, 'Male')}
                >
                  <Text className="text-center text-black">Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white p-4 rounded-2xl px-14"
                  onPress={() => handleSelection(setGender, 'Female')}
                >
                  <Text className="text-center text-black">Female</Text>
                </TouchableOpacity>
              </View>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
    // 3) WEIGHT
    {
      question: (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView style={{ flexGrow: 1, paddingBottom: 200 }}>
            <QuestionScreen
              title={<Text className="text-white text-[24px] font-poppins-semibold text-center">What is your current weight?</Text>}
              titleWrapperClassName="mt-[200] px-[80px]"
            >
              <View className="px-[80px]">
                <StaggerItem index={0}>
                  <TextInput
                    className="bg-[#24292A] mt-7 text-white p-5 mx-[19] rounded-lg text-[16px text-center"
                    keyboardType="numeric"
                    placeholder="Enter your weight in lbs"
                    placeholderTextColor="#888"
                    onChangeText={(text) => {
                      console.log("[Weight Input] text =", text);
                      setWeight(parseFloat(text));
                    }} />
                </StaggerItem>
                {/** 
                <View className="flex-row justify-center">
                <WheelPicker
                  value={weight}
                  onChange={setWeight}
                  min={66}
                  max={440}
                  suffix=" lbs"
                />
                </View>
                */}
              </View>

              {/* ✅ Show Next only when weight entered */}
              {weightReady && (
                <StaggerItem index={1}>
                  <View className="mt-[-10px] px-[100px]">
                    <CustomButton
                      title="Next"
                      handlePress={handleNext}
                      buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                      textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
                    />
                  </View>
                </StaggerItem>
              )}
            </QuestionScreen>
          </ScrollView>
        </KeyboardAvoidingView>
      ),
    },
    // 4) CURRENT WORKOUT DAYS
    {
      question: (
        <QuestionScreen
          title={(
            <Text className="font-poppins-semibold text-white text-2xl mb-4 text-center">
              How many days a week are you currently working out?
            </Text>
          )}
          titleWrapperClassName="mt-20 px-13 items-center"
        >
          <View className="mt-7 px-20">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14" onPress={() => handleSelection(setWorkoutDays, 0)}>
                <Text className="text-center text-[14px] font-poppins-semibold text-black">0, that's why I'm here</Text>
              </TouchableOpacity>
            </StaggerItem>
          
            <StaggerItem index={1}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 2)}>
                <Text className="text-center text-[14px] font-poppins-semibold text-black">1-2 day(s)</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={2}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 4)}>
                <Text className="text-center text-[14px] font-poppins-semibold text-black">3-4 days</Text>
              </TouchableOpacity>
            </StaggerItem>
          
            <StaggerItem index={3}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 6)}>
                <Text className="text-center text-[14px] font-poppins-semibold text-black">5-6 days </Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={4}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-14 mt-7" onPress={() => handleSelection(setWorkoutDays, 7)}>
                <Text className="text-center text-[14px] font-poppins-semibold text-black">Everyday</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
    // 5) SLEEP
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4">Describe your sleep routine.</Text>}
          titleWrapperClassName="mt-40 px-10 items-center"
        >
          <View className="mt-7 px-10">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setSleepQuality, 'Very consistent, 8 hours')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">Very consistent, at least 8 hours </Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={1}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setSleepQuality, 'Moderately good')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">Moderately good, some off days</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={2}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setSleepQuality, 'Very inconsistent')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">Very inconsistent</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
    // 6) FITNESS LEVEL
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4">What is your fitness experience?</Text>}
          titleWrapperClassName="mt-40 px-6 items-center"
        >
          <View className="mt-7 px-6">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setFitness, 'Beginner')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">I'm just getting into fitness</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={1}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setFitness, 'Intermediate')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">I have some fitness experience</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={2}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setFitness, 'Expert')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">I am currently active and consistent </Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      )
    },
    // 7) MEDICAL CONDITIONS 
    // {
    //   question: (
    //     <View>
    //       <View className="mt-40 px-2 items-center">
    //         <Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">
    //           Any medical conditions you think we should take into account?
    //         </Text>
    //       </View>
    //       <View className="mt-7 px-6">
    //         <TouchableOpacity
    //           className="bg-white p-4 rounded-2xl"
    //           onPress={() => handleSelection(setMedicalCondition, false)}
    //         >
    //           <Text className="text-center text-[16px] font-poppins-semibold text-black">
    //             No/rather not share
    //           </Text>
    //         </TouchableOpacity>
    //       </View>
    //       <View className="mt-20 px-6 items-center">
    //         <Text className="text-white text-[21px] font-poppins-semibold mb-4">
    //           If so, type in the box below:
    //         </Text>
    //       </View>
    //       <View className="mt-4 px-10">
    //         <TextInput
    //           className="bg-[#24292A] text-white p-6 rounded-lg"
    //           placeholder="Example: Asthma..."
    //           placeholderTextColor="#B0B0B0"
    //           onChangeText={setInjuryType}
    //         />
    //       </View>
    //       <View className="items-center px-10 mt-6">
    //         <Text className="text-[#CDCDE0] font-poppins text-center">
    //           Informatino shared with ANKYR is kept condfidential.
    //         </Text>
    //       </View>
    //     </View>
    //   ),
    // },
    
    // 8) MAIN GOAL
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What is your main fitness goal?</Text>}
          titleWrapperClassName="mt-20 px-7 items-center"
        >
          <View className="mt-7 px-20">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setGoal, 'lose weight')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Lose Weight</Text>
              </TouchableOpacity>
            </StaggerItem>
            
            <StaggerItem index={1}> 
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'Build Muscle')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Build Muscle</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={2}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'lose weight and build muscle')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Both of the above</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={3}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'running')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Running</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={4}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setGoal, 'be active')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">I just want to be active</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      )
    },
    // 9) SELECT WORKOUT DAYS (max 6)
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-2xl font-bold text-center">What days do you want to workout?</Text>}
          titleWrapperClassName="mt-20 items-center"
        >
          <View className="flex-row justify-between mt-20 px-6">
            <StaggerItem index={0}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Sunday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Sunday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Sunday ? 'text-black' : 'text-white'}`}>S</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={1}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Monday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Monday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Monday ? 'text-black' : 'text-white'}`}>M</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={2}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Tuesday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Tuesday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Tuesday ? 'text-black' : 'text-white'}`}>T</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={3}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Wednesday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Wednesday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Wednesday ? 'text-black' : 'text-white'}`}>W</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={4}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Thursday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Thursday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Thursday ? 'text-black' : 'text-white'}`}>T</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={5}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Friday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Friday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Friday ? 'text-black' : 'text-white'}`}>F</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={6}>
              <TouchableOpacity 
                className={`w-12 h-12 rounded-lg items-center justify-center ${selectedDays.Saturday ? 'bg-[#FFFFFF]' : 'bg-[#44504F]'}`} 
                onPress={() => toggleDaySelection('Saturday')}
              >
                <Text className={`text-xl font-bold ${selectedDays.Saturday ? 'text-black' : 'text-white'}`}>S</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
          <StaggerItem index={7} className="mt-4">
            <Text className="text-white text-center">You can choose up to 6 days a week</Text>
          </StaggerItem>
          <StaggerItem index={8} className="mt-20 px-10 items-center">
            <Text className="mt-20 text-white text-center text-3xl font-bold">You selected a {Object.values(selectedDays).filter(Boolean).length} day workout plan.</Text>
          </StaggerItem>
          <StaggerItem index={9}>
            <View className="mt-[-10px] px-[100px]">
              <CustomButton
                title="Next"
                handlePress={handleNext}
                buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
              />
            </View>
          </StaggerItem>
        </QuestionScreen>
      ),
    },
    // 10) EQUIPMENT
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What equipment do you have access to?</Text>}
          titleWrapperClassName="mt-20 px-10 items-center"
        >
          <View className="mt-7 px-20">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl" onPress={() => handleSelection(setEquipmentAvailable, 'full gym')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">Gym membership</Text>
              </TouchableOpacity>
            </StaggerItem>

            <StaggerItem index={1}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setEquipmentAvailable, 'small at home gym')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">Small home gym</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={2}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setEquipmentAvailable, 'no equipment')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">I dont have access to equipment</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
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
            <Animated.View
              key={`question-${questionIndex}`}
              entering={FadeIn.duration(SCREEN_ENTER_DUR)}
              exiting={FadeOut.duration(SCREEN_EXIT_DUR)}
              style={{ flex: 1 }}
            >
              {questions[questionIndex].question}
            </Animated.View>
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
