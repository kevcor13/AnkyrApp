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
import { StatusBar } from "expo-status-bar";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { styles as globalStyles } from "@/constants/styles";

const screenWidth = Dimensions.get("window").width;

type RestScreenProps = {
  duration: number;              // seconds
  onRestComplete: () => void;
};

const RestScreen: React.FC<RestScreenProps> = ({ duration, onRestComplete }) => {
  // keep public state simple; show one decimal
  const [countdownMs, setCountdownMs] = useState(Math.max(0, Math.round(duration * 1000)));
  const [isRestFinished, setIsRestFinished] = useState(duration <= 0);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // progress bar anim (fill from 0% to 100% over the whole rest)
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: Math.max(0, Math.round(duration * 1000)), // duration is in seconds -> ms
      useNativeDriver: false, // width can't use native driver
    }).start();
  }, [duration]);

  // countdown ticker (updates every 0.1s so we can render "30.0")
  useEffect(() => {
    if (countdownMs <= 0) {
      setIsRestFinished(true);
      setCountdownMs(0);
      return;
    }
    const id = setInterval(() => {
      setCountdownMs((prev) => {
        const next = prev - 100; // 100ms steps
        return next > 0 ? next : 0;
      });
    }, 100);
    return () => clearInterval(id);
  }, [countdownMs]);

  // slide in NEXT button when finished
  useEffect(() => {
    if (isRestFinished) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isRestFinished]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const secondsDisplay = (countdownMs / 1000).toFixed(1);

  return (
    <LinearGradient colors={["#7BCFC7", "#271293"]} style={styles.container}>
      {/* Status bar fix: light, translucent over gradient */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={{ flexDirection: "row", marginTop: 70, margin: 30, alignItems: "center" }}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Image source={icons.halfArrow} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>
      </View>

      <View style={{ justifyContent: "center", margin: 30 }}>
        <Text style={styles.title}>REST</Text>
        <View style={{ flexDirection: "row" }}>
          {/* show like 30.0 seconds */}
          <Text style={styles.timer}>{secondsDisplay}</Text>
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
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <TouchableOpacity style={styles.skipButton} onPress={onRestComplete}>
            <Image source={icons.skipButton} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.streakContainer}>
        <Image source={icons.blueStreak} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconButton: {
    backgroundColor: "rgba(217,217, 217, 0.27)",
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    width: 45,
    borderRadius: 22.5,
  },
  title: {
    fontFamily: "poppins-BoldItalic",
    fontStyle: "italic",
    fontSize: 40,
    marginTop: 100,
    color: "white",
  },
  timer: {
    fontFamily: "poppins-semibold",
    fontSize: 120,
    color: "#8AFFF9",
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
  nextButtonText: { color: "#2980B9", fontSize: 20, fontFamily: "poppins-bold" },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
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
  streakContainer: { alignItems: "center", marginTop: 60 },
});

export default RestScreen;
