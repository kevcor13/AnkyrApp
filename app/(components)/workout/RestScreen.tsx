import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import icons from "@/constants/icons";
import { router } from "expo-router";

const screenWidth = Dimensions.get("window").width;

type RestScreenProps = {
  duration: number;
  onRestComplete: () => void;
};

const RestScreen: React.FC<RestScreenProps> = ({
  duration,
  onRestComplete,
}) => {
  const [countdown, setCountdown] = useState(duration);
  const [isRestFinished, setIsRestFinished] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  // --- This will now control the width of the progress bar ---
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Timer countdown and progress bar animation logic
  useEffect(() => {
    // Animate the progress bar filling up over the total duration
    Animated.timing(progressAnim, {
      toValue: 1, // Animate to 1 (which will represent 100%)
      duration: duration, // The total duration of the rest in milliseconds
      useNativeDriver: false, // width is not supported by native driver
    }).start();

    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsRestFinished(true);
    }
  }, [countdown]);

  // Animation for the "Next" button
  useEffect(() => {
    if (isRestFinished) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isRestFinished]);

  // --- Interpolate the progress animation to a width percentage ---
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient colors={["#7BCFC7", "#271293"]} style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          marginTop: 70,
          margin: 30,
          alignItems: "center",
        }}
      >
        <TouchableOpacity style={styles.iconButton} onPress={router.back}>
          <Image source={icons.halfArrow} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          {/* --- The Animated.View now uses the progressWidth style --- */}
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>
      </View>

      <View style={{ justifyContent: "center", margin: 30 }}>
        <Text style={styles.title}>REST</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.timer}>{countdown}</Text>
          <Text
            style={{
              fontFamily: "poppins-semibold",
              fontSize: 24,
              color: "#8AFFF9",
              marginTop: 80,
            }}
          >
            seconds
          </Text>
        </View>
      </View>
      {isRestFinished && (
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <TouchableOpacity style={styles.nextButton} onPress={onRestComplete}>
            <Text style={styles.nextButtonText}>NEXT EXERCISE</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {!isRestFinished && (
        <TouchableOpacity style={styles.skipButton} onPress={onRestComplete}>
          <Text style={styles.skipButtonText}>SKIP</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    //alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(217,217, 217, 0.27)",
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    width: 45,
    borderRadius: 22.5,
  },
  title: {
    fontFamily: "poppins-bold",
    fontSize: 40,
    marginTop: 100,
    color: "white",
  },
  timer: {
    fontFamily: "poppins-semibold",
    fontSize: 120,
    color: "#8AFFF9",
    //marginBottom: 40,
  },
  nextButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 40,
  },
  nextButtonText: {
    color: "#2980B9",
    fontSize: 20,
    fontFamily: "poppins-bold",
  },
  skipButton: {
    //marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "transparent",
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontFamily: "poppins-semibold",
  },
  progressBarContainer: {
    height: 10,
    width: "60%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 5,
    marginHorizontal: 15,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
});

export default RestScreen;
