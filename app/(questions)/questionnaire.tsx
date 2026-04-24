import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import { useGlobal } from "@/context/GlobalProvider";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
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
  const { userData, ngrokAPI } = useGlobal();
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
    Thursday: false, Friday: false, Saturday: false,
  });
  const [trainingGoal, setTrainingGoal] = useState('');
  const [nutritionGoal, setNutritionGoal] = useState('');
  const [equipmentAvailable, setEquipmentAvailable] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [split, setSplit] = useState('');
  const [splitInfoVisible, setSplitInfoVisible] = useState(false);
  const [splitInfoContent, setSplitInfoContent] = useState<{ label: string; description: string } | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dayCount = Object.values(selectedDays).filter(Boolean).length;
    setWorkoutDays(dayCount);
  }, [selectedDays]);

  // Reset day selection whenever the split changes
  useEffect(() => {
    if (split) {
      setSelectedDays({ Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false });
    }
  }, [split]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const getDayCountFromSplitKey = (key: string): number => {
    const parts = key.split('_');
    return parseInt(parts[parts.length - 1], 10) || 3;
  };

  const getSelectedDayNames = () =>
    Object.entries(selectedDays).filter(([, v]) => v).map(([k]) => k);

  const transitionToNext = () => {
    if (isTransitioning) return;
    if (questionIndex >= questions.length - 1) return;
    setIsTransitioning(true);
    setQuestionIndex(prev => prev + 1);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => setIsTransitioning(false), SCREEN_ENTER_DUR + 50);
  };

  const goBack = () => {
    if (isTransitioning) return;
    if (questionIndex === 0) { router.back(); return; }
    setIsTransitioning(true);
    setQuestionIndex(prev => prev - 1);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => setIsTransitioning(false), SCREEN_ENTER_DUR + 50);
  };

  // ── Split data ──────────────────────────────────────────────────────────────

  const SPLITS_BY_GENDER_AND_DAY: Record<string, Record<number, { key: string; label: string; description: string }[]>> = {
    Male: {
      2: [
        { key: "full_body_2", label: "Full Body", description: "2 days hitting all major muscle groups each session. Great for beginners or anyone with a tight schedule." },
      ],
      3: [
        { key: "ppl_3", label: "Push / Pull / Legs", description: "Push day: chest, shoulders, triceps. Pull day: back, biceps. Leg day: quads, hamstrings, glutes. One of the most effective splits for building muscle." },
        { key: "full_body_3", label: "Full Body", description: "3 days hitting all major muscle groups each session. Classic 3-day program with plenty of recovery time." },
      ],
      4: [
        { key: "upper_lower_4", label: "Upper / Lower", description: "Alternates between upper body and lower body sessions. Great balance of volume and recovery across 4 days per week." },
        { key: "full_body_4", label: "Full Body", description: "4 days of full body training for higher frequency and more total weekly volume." },
      ],
      5: [
        { key: "bro_split_5", label: "Bro Split", description: "One muscle group per day: Chest, Back, Shoulders, Arms, Legs. Classic bodybuilder approach with high volume per muscle group." },
      ],
      6: [
        { key: "ppl_6", label: "Push / Pull / Legs (6-day)", description: "The PPL split done twice per week. Each muscle group trained twice for maximum growth. Best for experienced lifters." },
        { key: "arnold_6", label: "Arnold Split", description: "Arnold Schwarzenegger's 6-day split. Chest & Back together, Shoulders & Arms together, then Legs. High intensity and volume." },
      ],
    },
    Female: {
      2: [
        { key: "full_body_glute_2", label: "Full Body (Glute Focus)", description: "2 days of full body training with extra emphasis on glutes and lower body. Great for beginners or a tight schedule." },
        { key: "full_body_2", label: "Full Body", description: "2 days hitting all major muscle groups each session. Great for beginners or anyone with a tight schedule." },
      ],
      3: [
        { key: "glute_lower_3", label: "Glute & Lower Focus", description: "Trains lower body twice and upper body once per week. Heavy emphasis on glutes, hamstrings, and quads — designed to build and tone the lower body." },
        { key: "ppl_lower_3", label: "Push / Pull / Lower", description: "Push day: chest, shoulders, triceps. Pull day: back, biceps. Lower day: glutes, hamstrings, quads. A balanced 3-day split with dedicated lower body focus." },
        { key: "lower_upper_lower_3", label: "Lower / Upper / Lower", description: "Trains lower body twice per week with a glute and hamstring focus. Upper body day in between for recovery. Great for prioritizing legs and glutes." },
        { key: "full_body_3", label: "Full Body", description: "3 days hitting all major muscle groups each session. Classic 3-day program with plenty of recovery time." },
      ],
      4: [
        { key: "upper_lower_glute_4", label: "Upper / Lower (Glute Bias)", description: "Classic upper/lower split with lower days designed around glutes and posterior chain. 4 days per week for balanced volume and recovery." },
        { key: "lower_upper_lower_upper_4", label: "Lower / Upper / Lower / Upper", description: "Starts with lower body to prioritize glutes. Trains lower body twice, upper body twice per week. Great for equal emphasis across the body." },
        { key: "full_body_4", label: "Full Body", description: "4 days of full body training for higher frequency and more total weekly volume." },
      ],
      5: [
        { key: "glute_5", label: "Glute & Strength Split", description: "5-day program with 3 lower body days and 2 upper body days. Maximizes glute and hamstring volume while maintaining full upper body strength." },
      ],
      6: [
        { key: "ppl_lower_6", label: "Push / Pull / Lower (6-day)", description: "PPL done twice per week with lower days focused on glutes and posterior chain. High frequency for experienced lifters who want to maximize results." },
        { key: "ppl_6", label: "Push / Pull / Legs (6-day)", description: "The PPL split done twice per week. Each muscle group trained twice for maximum growth. Best for experienced lifters." },
      ],
    },
  };

  // Returns all splits for the gender, ordered by day count ascending
  const getAllSplitsForGender = (genderKey: string) => {
    const genderSplits = SPLITS_BY_GENDER_AND_DAY[genderKey] || SPLITS_BY_GENDER_AND_DAY["Male"];
    return Object.entries(genderSplits)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .flatMap(([dayCount, splits]) =>
        splits.map(s => ({ ...s, dayCount: parseInt(dayCount) }))
      );
  };

  // ── Submission ──────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    setLoading(true);
    try {
      const UserID = userData._id;
      const resolvedDays = split ? getDayCountFromSplitKey(split) : workoutDays;
      const fitnessData = {
        UserID,
        gender,
        age,
        weight,
        fitnessLevel: fitness,
        workoutDays: resolvedDays,
        fitnessGoal: trainingGoal,
        trainingGoal,
        bodyGoal: nutritionGoal,
        sleepQuality,
        equipmentAvailable,
        split,
        selectedWorkoutDays: getSelectedDayNames(),
      };
      const points = { UserID, streak: 0, points: 10, league: "NOVICE" };

      axios.post(`${ngrokAPI}/api/user/createFitness`, fitnessData)
        .then(() => axios.post(`${ngrokAPI}/userSettings`, { UserID }))
        .then(() => axios.post(`${ngrokAPI}/api/user/createGameSystem`, points))
        .then(() => axios.post(`${ngrokAPI}/api/GenAI/ai`, { UserID }))
        .then(() => router.replace('/LoadingScreen'))
        .catch(e => console.log("[handleSubmit] error:", e));
    } catch (error) {
      console.log("[handleSubmit] error:", error);
    }
  };

  const handleNext = () => {
    if (questionIndex < questions.length - 1) transitionToNext();
    else handleSubmit();
  };

  const handleSelection = (setter: any, value: any) => {
    setter(value);
    handleNext();
  };

  // ── Day selection ───────────────────────────────────────────────────────────

  const requiredDays = split ? getDayCountFromSplitKey(split) : 3;

  const toggleDaySelection = (day: keyof typeof selectedDays) => {
    setSelectedDays(prev => {
      const alreadySelected = prev[day];
      const selectedCount = Object.values(prev).filter(Boolean).length;
      if (alreadySelected) return { ...prev, [day]: false };
      if (selectedCount >= requiredDays) return prev;
      return { ...prev, [day]: true };
    });
  };

  const handleDaysConfirm = () => {
    const cnt = Object.values(selectedDays).filter(Boolean).length;
    if (cnt === requiredDays) { setWorkoutDays(cnt); handleNext(); }
  };

  const selectedDayCount = Object.values(selectedDays).filter(Boolean).length;

  // ── Header title ────────────────────────────────────────────────────────────

  const headerTitle =
    questionIndex <= 2 ? "Let's start off simple."
    : questionIndex <= 4 ? "A thing or two about you."
    : questionIndex <= 6 ? "Set your goals."
    : "Build your plan.";

  const ageReady = Number.isFinite(age) && age > 0;
  const weightReady = Number.isFinite(weight) && weight > 0;

  // ── Questions ───────────────────────────────────────────────────────────────

  const questions = [
    // Q0: AGE
    {
      question: (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <QuestionScreen
            title={<Text className="text-white text-[24px] font-poppins-semibold text-center">How old are you?</Text>}
            titleWrapperClassName="mt-[100] px-[80px]"
          >
            <View style={{ flexGrow: 1, paddingBottom: 200 }}>
              <View className="px-[80px]">
                <StaggerItem index={0}>
                  <WheelPicker value={age} onChange={setAge} min={1} max={100} />
                </StaggerItem>
              </View>
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
    // Q1: GENDER
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
    // Q2: WEIGHT
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
                    className="bg-[#24292A] mt-7 text-white p-5 mx-[19] rounded-lg text-[16px] text-center"
                    keyboardType="numeric"
                    placeholder="Enter your weight in lbs"
                    placeholderTextColor="#888"
                    onChangeText={(text) => setWeight(parseFloat(text))}
                  />
                </StaggerItem>
              </View>
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
    // Q3: SLEEP
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4">Describe your sleep routine.</Text>}
          titleWrapperClassName="mt-40 px-10 items-center"
        >
          <View className="mt-7 px-10">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setSleepQuality, 'Very consistent, 8 hours')}>
                <Text className="text-center text-[16px] font-poppins-semibold text-black">Very consistent, at least 8 hours</Text>
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
    // Q4: FITNESS LEVEL
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
                <Text className="text-center text-[16px] font-poppins-semibold text-black">I am currently active and consistent</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
    // Q5: TRAINING GOAL (new)
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What's your main training goal?</Text>}
          titleWrapperClassName="mt-20 px-7 items-center"
        >
          <View className="mt-7 px-10">
            <StaggerItem index={0}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6" onPress={() => handleSelection(setTrainingGoal, 'Lose Weight')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Lose Weight</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={1}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setTrainingGoal, 'Build Muscle')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Build Muscle</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={2}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setTrainingGoal, 'Improve Strength')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Improve Strength</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={3}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setTrainingGoal, 'Improve Endurance')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Improve Endurance</Text>
              </TouchableOpacity>
            </StaggerItem>
            <StaggerItem index={4}>
              <TouchableOpacity className="bg-[#DAEEED] p-4 rounded-2xl px-6 mt-7" onPress={() => handleSelection(setTrainingGoal, 'Stay Active')}>
                <Text className="text-center font-poppins-semibold text-[16px] text-black">Stay Active</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
    // Q6: NUTRITION GOAL (new)
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">What's your nutrition goal?</Text>}
          titleWrapperClassName="mt-40 px-7 items-center"
        >
          <View className="mt-3 px-10">
            <StaggerItem index={0}>
              <View style={localSplitStyles.nutritionCard}>
                <Text style={localSplitStyles.nutritionLabel}>Bulk</Text>
                <Text style={localSplitStyles.nutritionDesc}>Eat in a calorie surplus to maximize muscle growth.</Text>
                <TouchableOpacity style={localSplitStyles.nutritionBtn} onPress={() => handleSelection(setNutritionGoal, 'bulk')}>
                  <Text style={localSplitStyles.nutritionBtnText}>Choose</Text>
                </TouchableOpacity>
              </View>
            </StaggerItem>
            <StaggerItem index={1}>
              <View style={[localSplitStyles.nutritionCard, { marginTop: 16 }]}>
                <Text style={localSplitStyles.nutritionLabel}>Cut</Text>
                <Text style={localSplitStyles.nutritionDesc}>Eat in a calorie deficit to lose fat while preserving muscle.</Text>
                <TouchableOpacity style={localSplitStyles.nutritionBtn} onPress={() => handleSelection(setNutritionGoal, 'cut')}>
                  <Text style={localSplitStyles.nutritionBtnText}>Choose</Text>
                </TouchableOpacity>
              </View>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
    // Q7: SPLIT SELECTION (all splits for gender, with day badge)
    {
      question: (() => {
        const allSplits = getAllSplitsForGender(gender || "Male");
        return (
          <QuestionScreen
            title={<Text className="text-white text-[21px] font-poppins-semibold mb-4 text-center">How do you want to organize your training?</Text>}
            titleWrapperClassName="mt-20 px-6 items-center"
          >
            <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
              {allSplits.map((option, idx) => (
                <StaggerItem key={option.key} index={idx}>
                  <TouchableOpacity
                    style={[localSplitStyles.card, split === option.key && localSplitStyles.cardSelected]}
                    onPress={() => handleSelection(setSplit, option.key)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={localSplitStyles.cardLabel}>{option.label}</Text>
                      <Text style={localSplitStyles.cardBadge}>
                        {option.dayCount} workout days · {7 - option.dayCount} rest days
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setSplitInfoContent({ label: option.label, description: option.description });
                        setSplitInfoVisible(true);
                      }}
                      style={localSplitStyles.infoBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={localSplitStyles.infoBtnText}>ⓘ</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </StaggerItem>
              ))}
            </ScrollView>

            <Modal visible={splitInfoVisible} transparent animationType="fade" onRequestClose={() => setSplitInfoVisible(false)}>
              <TouchableOpacity style={localSplitStyles.modalOverlay} activeOpacity={1} onPress={() => setSplitInfoVisible(false)}>
                <View style={localSplitStyles.modalCard}>
                  <Text style={localSplitStyles.modalTitle}>{splitInfoContent?.label}</Text>
                  <Text style={localSplitStyles.modalBody}>{splitInfoContent?.description}</Text>
                  <TouchableOpacity style={localSplitStyles.modalBtn} onPress={() => setSplitInfoVisible(false)}>
                    <Text style={localSplitStyles.modalBtnText}>Got it</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </QuestionScreen>
        );
      })(),
    },
    // Q8: DAY SELECTION (constrained to split's required day count)
    {
      question: (
        <QuestionScreen
          title={<Text className="text-white text-2xl font-bold text-center">Pick your {requiredDays} workout days</Text>}
          titleWrapperClassName="mt-20 items-center"
        >
          <View className="flex-row justify-between mt-20 px-6">
            {(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as (keyof typeof selectedDays)[]).map((day, idx) => (
              <StaggerItem key={day} index={idx}>
                <TouchableOpacity
                  style={[
                    localSplitStyles.dayBtn,
                    selectedDays[day] && localSplitStyles.dayBtnSelected,
                  ]}
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text style={[localSplitStyles.dayBtnText, selectedDays[day] && localSplitStyles.dayBtnTextSelected]}>
                    {day[0]}
                  </Text>
                </TouchableOpacity>
              </StaggerItem>
            ))}
          </View>
          <StaggerItem index={7} className="mt-4">
            <Text className="text-white text-center">
              {selectedDayCount} of {requiredDays} days selected
            </Text>
          </StaggerItem>
          {selectedDayCount === requiredDays && (
            <StaggerItem index={8}>
              <View className="mt-10 px-[100px]">
                <CustomButton
                  title="Next"
                  handlePress={handleDaysConfirm}
                  buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
                  textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
                />
              </View>
            </StaggerItem>
          )}
        </QuestionScreen>
      ),
    },
    // Q9: EQUIPMENT
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
                <Text className="text-center text-[16px] font-poppins-semibold text-black">I don't have access to equipment</Text>
              </TouchableOpacity>
            </StaggerItem>
          </View>
        </QuestionScreen>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="bg-black h-full">
      {loading ? (
        <View className="flex-1 mt-10 justify-center items-center">
          <Text className="text-white text-2xl font-bold font-poppins">Give us a second while our A.I. personalizes your workouts...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* FIXED HEADER */}
          <View style={styles.headerWrap}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text className="text-white text-3xl font-bold font-poppins">{headerTitle}</Text>
          </View>

          {/* CONTENT */}
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
  backBtn: {
    marginBottom: 4,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
});

const localSplitStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DAEEED",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#000000",
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: "poppins-semibold",
    color: "#000000",
  },
  cardBadge: {
    fontSize: 12,
    fontFamily: "poppins-regular",
    color: "#444444",
    marginTop: 3,
  },
  infoBtn: {
    marginLeft: 10,
  },
  infoBtnText: {
    fontSize: 20,
    color: "#555555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: "#1B191E",
    borderRadius: 20,
    padding: 24,
    width: "100%",
  },
  modalTitle: {
    fontFamily: "poppins-semibold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  modalBody: {
    fontFamily: "poppins-regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  modalBtnText: {
    fontFamily: "poppins-semibold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  nutritionCard: {
    backgroundColor: "#DAEEED",
    borderRadius: 16,
    padding: 20,
  },
  nutritionLabel: {
    fontFamily: "poppins-semibold",
    fontSize: 20,
    color: "#000000",
    marginBottom: 6,
  },
  nutritionDesc: {
    fontFamily: "poppins-regular",
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 14,
  },
  nutritionBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  nutritionBtnText: {
    fontFamily: "poppins-semibold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  dayBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#44504F",
  },
  dayBtnSelected: {
    backgroundColor: "#FFFFFF",
  },
  dayBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dayBtnTextSelected: {
    color: "#000000",
  },
});

// @ts-ignore
export default Questionnaire;
