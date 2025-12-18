import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  Modal,
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
  currentExerciseIndex: number;
  totalExercises: number;
};

const RestScreen: React.FC<RestScreenProps> = ({ duration, onRestComplete, totalExercises, currentExerciseIndex,}) => {
  // keep public state simple; show one decimal
  const [countdownMs, setCountdownMs] = useState(Math.max(0, Math.round(duration * 1000)));
  const [isRestFinished, setIsRestFinished] = useState(duration <= 0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progress = totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  const progressWidth = `${progress * 100}%`;
  // progress bar anim (fill from 0% to 100% over the whole rest)
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: Math.max(0, Math.round(duration * 1000)), // duration is in seconds -> ms
      useNativeDriver: false, // width can't use native driver
    }).start();
  }, [duration]);


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

  const secondsDisplay = (countdownMs / 1000).toFixed(1);

  const handleLeaveWorkout = () => {
    setShowLeaveModal(true);
  };

  return (
    <LinearGradient colors={["#7BCFC7", "#271293"]} style={styles.container}>
      {/* Status bar fix: light, translucent over gradient */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* All main content; leave space at the bottom for the streak bar */}
      <View style={styles.content}>
        <View style={{ flexDirection: "row", marginTop: 70, margin: 30, alignItems: "center" }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Image source={icons.halfArrow} style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenWidth],
              }) }]} />
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={handleLeaveWorkout}>
            <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
        </View>

        <View style={{ justifyContent: "center", margin: 30 }}>
          <Text style={styles.title}>REST</Text>
          <View style={{ flexDirection: "row" }}>
            {/* show like 30.0 seconds */}
            <View className="flex-1">
            <Text style={styles.timer}>{secondsDisplay}</Text>
            </View>
            <Text
              style={{
                fontFamily: "poppins-semibold",
                fontSize: 18,
                color: "#8AFFF9",
                marginTop: 80,
              }}
            >
              seconds
            </Text>
          </View>
        </View>

        {isRestFinished ? (
          <View>
            <TouchableOpacity style={styles.nextButton} onPress={onRestComplete}>
              <Text style={styles.nextButtonText}>NEXT EXERCISE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <TouchableOpacity style={styles.skipButton} onPress={onRestComplete}>
              <Image source={icons.skipButton} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Fixed bottom streak bar */}
      <View pointerEvents="none" style={styles.streakContainer}>
        <Image
          source={icons.blueStreak}
          style={styles.streakImage}
          resizeMode="contain"
        />
      </View>

      {/* Leave Workout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLeaveModal}
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave Workout?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to leave the workout? Your progress will not be saved.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.leaveButton} 
                onPress={() => router.back()}
              >
                <Text style={styles.leaveButtonText}>Yes, Leave</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowLeaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Push content above the fixed streak; keep enough bottom padding so it's never covered
  content: {
    flex: 1,
    paddingBottom: 96, // space reserved for the streak image + breathing room
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
    fontFamily: "poppins-BoldItalic",
    fontStyle: "italic",
    fontSize: 40,
    marginTop: 100,
    color: "white",
  },
  timer: {
    fontFamily: "poppins-semibold",
    fontSize: 100,
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

  // Bottom-pinned streak
  streakContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: 24, // pseudo safe-area; tweak if you use insets
  },
  streakImage: {
    width: 100,
    height: 100,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    fontFamily: "poppins-bold",
  },
  modalText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: "poppins-regular",
  },
  modalButtons: {
    gap: 12,
  },
  leaveButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  leaveButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "poppins-bold",
  },
  cancelButton: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2ECC71",
  },
  cancelButtonText: {
    color: "#2ECC71",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "poppins-semibold",
  },
});

export default RestScreen;