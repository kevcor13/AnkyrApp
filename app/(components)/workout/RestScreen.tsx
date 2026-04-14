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
import AppIcon from "@/components/AppIcon";

const screenWidth = Dimensions.get("window").width;

type RestScreenProps = {
  duration: number;              // seconds
  onRestComplete: () => void;
  onBackToList: () => void;
  onEndWorkout: () => void;
  currentExerciseIndex: number;
  totalExercises: number;
};

const RestScreen: React.FC<RestScreenProps> = ({
  duration,
  onRestComplete,
  onBackToList,
  onEndWorkout,
  totalExercises,
  currentExerciseIndex,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.ceil(duration)));
  const [isRestFinished, setIsRestFinished] = useState(duration <= 0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const startTimeRef = useRef<number | null>(null);
  const totalSecondsRef = useRef<number>(Math.ceil(duration));

  const progress = totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  // Start the timer immediately
  useEffect(() => {
    const totalSecs = Math.ceil(duration);
    totalSecondsRef.current = totalSecs;
    setSecondsLeft(totalSecs);
    startTimeRef.current = Date.now();
    setIsRestFinished(totalSecs <= 0);
  }, [duration]);

  // Accurate countdown timer
  useEffect(() => {
    if (secondsLeft <= 0 || startTimeRef.current === null) {
      if (secondsLeft <= 0) {
        setIsRestFinished(true);
      }
      return;
    }

    const id = setInterval(() => {
      if (startTimeRef.current === null) return;
      
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalSecondsRef.current - elapsed);
      
      setSecondsLeft(remaining);
      
      if (remaining === 0) {
        setIsRestFinished(true);
      }
    }, 100);
    
    return () => clearInterval(id);
  }, [secondsLeft]);

  // slide in NEXT button when finished
  useEffect(() => {
    if (isRestFinished) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isRestFinished, slideAnim]);

  const handleLeaveWorkout = () => {
    setShowLeaveModal(true);
  };

  return (
    <LinearGradient colors={["#000000", "#22406B"]} start={{ x: 0, y: 0.38 }}
      end={{ x: 0, y: 1}} style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={styles.content}>
        <View style={{ flexDirection: "row", marginTop: 70, margin: 30, alignItems: "center" }}>
          <TouchableOpacity style={styles.iconButton} onPress={onBackToList}>
            <Image source={icons.halfArrow} style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={handleLeaveWorkout}>
            <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
        </View>

        <View style={{ justifyContent: "center", alignItems: "center", margin: 30 }}>
          <Text style={styles.title}>REST</Text>
          <View style={{ flexDirection: "row" }}>
            <View className="align-items-center">
              <Text style={styles.timer}>
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </Text>
            </View>
            {/** 
            <Text
              style={{
                fontFamily: "poppins-semibold",
                fontSize: 18,
                color: "#8AFFF9",
                marginTop: 80,
              }}
            >
              min
            </Text>
            */}
          </View>
        </View>

        {isRestFinished ? (
          <View>
            <TouchableOpacity style={styles.nextButton} onPress={onRestComplete}>
              <Text style={styles.nextButtonText}>NEXT SET</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <TouchableOpacity style={styles.skipButton} onPress={onRestComplete}>
              <AppIcon name="skipIcon" size={24} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View pointerEvents="none" style={styles.streakContainer}>
        <AppIcon name="ankyrWordmark" size={100} fill="no fill" />
      </View>

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
                onPress={() => {
                  setShowLeaveModal(false);
                  onEndWorkout();
                }}
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

  content: {
    flex: 1,
    paddingBottom: 96,
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
    fontFamily: "raleway-light",
    fontSize: 40,
    marginTop: 100,
    color: "white",
  },
  timer: {
    fontFamily: "SpaceGrotesk-Regular",
    fontSize: 64,
    color: "#6477E7",
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
  nextButtonText: { color: "#6477E7", fontSize: 20, fontFamily: "poppins-bold" },
  skipButton: {
    backgroundColor: "rgba(24, 21, 30, 0.47)",
    padding: 16,
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

  streakContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: 24,
  },
  streakImage: {
    width: 100,
    height: 100,
  },

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
