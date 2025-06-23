import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useGlobal } from "@/context/GlobalProvider";
import WorkoutCard from "@/components/WorkoutCard";

const EndWorkoutScreen = () => {
  const {
    userWorkoutData,
    userData,
    warmup,
    workout,
    coolDown,
    TodayWorkout,
    userGameData,
  } = useGlobal();
  const [currentDay, setCurrentDay] = useState("");
  const [workoutRoutine, setworkoutRoutine] = useState([]);
  const [focus, setFocus] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [points, setPoints] = useState(Number);
  const [XP, setXP] = useState(Number);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ensure the workout data exists and has the correct structure
        const routineArray = userWorkoutData?.routine || [];
        setPoints(
          (TodayWorkout.warmup.length + TodayWorkout.workoutRoutine.length) * 5
        );
        setXP(userGameData?.points || 0);
        // Get the current day
        const today = new Date().toLocaleString("en-US", { weekday: "long" });

        // Find today's workout in the routine array
        const workoutOfTheDay = routineArray.find(
          (dayRoutine: { day: string }) => dayRoutine.day === today
        );
        setTimeEstimate(workoutOfTheDay.timeEstimate);
        setFocus(workoutOfTheDay.focus);
        setworkoutRoutine(
          routineArray.find(
            (dayRoutine: { day: string }) => dayRoutine.day === "Monday"
          )?.workoutRoutine
        );
      } catch (error) {
        console.error("Error fetching workout data:", error);
      }
    };

    fetchData();
  }, [userData]);

  useEffect(() => {
    if (XP === null) return;
    if (XP >= 30000) {
      setBadgeImage(images.Olympian);
    } else if (XP >= 20000) {
      setBadgeImage(images.titan);
    } else if (XP >= 12000) {
      setBadgeImage(images.skipper);
    } else if (XP >= 5000) {
      setBadgeImage(images.pilot);
    } else if (XP >= 1000) {
      setBadgeImage(images.Private);
    } else {
      setBadgeImage(images.novice);
    }
  }, [points]);

  return (
    <LinearGradient
      colors={["#FF0509", "#271293"]} // Gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.textHeader}>YOUR {'\n'}WORKOUT</Text>
          <Image source={icons.blueStreak} style={styles.zapImage} />
        </View>
        {/* the workout time and xp details */}
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            marginLeft: 38,
            marginRight: 38,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "poppins-semibold",
              fontSize: 64,
              color: "#8AFFF9",
            }}
          >
            {timeEstimate}
          </Text>
          <Text
            style={{
              fontFamily: "poppins-semibold",
              fontSize: 24,
              color: "#8AFFF9",
              marginTop: 40,
              marginLeft: 5,
            }}
          >
            mins
          </Text>
        </View>
        <View style={styles.XpContainer}>
          {badgeImage ? (
            <Image
              source={
                typeof badgeImage === "string"
                  ? { uri: badgeImage }
                  : badgeImage
              }
              className="w-28 h-28"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-gray-500">Loading badge...</Text>
          )}
          <Text
            style={{
              fontFamily: "raleway-semibold",
              color: "white",
              fontSize: 16,
              marginTop:20
            }}
          >
            TOTAL XP EARNED:
          </Text>
          <View style={{ flexDirection: "row", marginTop: 40, marginLeft: -140}}>
            <Text
              style={{
                fontFamily: "raleway-semibold",
                color: "#8AFFF9",
                fontSize: 24,
              }}
            >
              + {points}
            </Text>
            <Text
              style={{
                fontFamily: "raleway-semibold",
                color: "#8AFFF9",
                fontSize: 13,
                marginTop: 10,
              }}
            >
              {" "}
              xp
            </Text>
          </View>
        </View>
        <CustomButton
          title="Finish"
          handlePress={() => router.navigate("/(tabs)/home")}
          buttonStyle={{
            backgroundColor: "rgba(217, 217, 217, 0.5)",
            borderRadius: 20,
            paddingVertical: 16,
            marginHorizontal: 38,
            marginTop: 10,
            justifyContent: "center",
          }}
          textStyle={{
            color: "#FFFFFF",
            fontSize: 16,
            fontFamily: "poppins-semiBold",
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 38,
            marginTop: 60,
          }}
        >
          <Text
            style={{
              fontFamily: "poppins-semibold",
              fontSize: 20,
              color: "white",
            }}
          >
            You did: 
          </Text>
        </View>
        <WorkoutCard workoutRoutine={warmup} title="Warm-Up" />
        <WorkoutCard workoutRoutine={workout} title="Main Workout" />
        <WorkoutCard workoutRoutine={coolDown} title="Cool Down" />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    marginTop: 60,
    marginLeft: 38,
    borderRadius: 50,
    padding: 10,
  },
  header: {
    marginLeft:30,
    marginTop: 80,
    flexDirection: "row",
  },
  textHeader: {
    fontSize: 43,
    fontFamily: "raleway-light",
    color: "#FFFFFF",
    lineHeight: 46,
    textTransform: "uppercase",
    paddingTop: 30,
  },
  zapImage: {
    width: 105,
    height: 106,
    marginTop: 10,
    marginLeft:40
  },
  XpContainer: {
    marginLeft: 38,
    flexDirection: "row",
  },
});

export default EndWorkoutScreen;
