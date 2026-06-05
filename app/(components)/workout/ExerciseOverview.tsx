import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/constants/styles";
import icons from "@/constants/icons";
import { useGlobal } from "@/context/GlobalProvider";
import Animated, { SlideInLeft } from "react-native-reanimated";
import { ResizeMode, Video } from "expo-av";
import AppIcon from "@/components/AppIcon";

interface Exercise {
  exerciseName: string;
  reps: string; // <-- now string to match ActiveWorkoutScreen / new schema
  phase: "warmup" | "workout" | "cooldown" | "challanges";
  videoUrl: string;
}

interface ExerciseOverviewProps {
  exercise: Exercise;
  onStart: () => void;
  onEnd: () => void;
  onBackToList: () => void;
  currentExerciseIndex: number;
  totalExercises: number;
}

const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({
  exercise,
  onStart,
  onEnd,
  onBackToList,
  currentExerciseIndex,
  totalExercises,
}) => {
  const { userData } = useGlobal();
  const theme = userData.defaultTheme;
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const isWarmup = exercise.phase === "warmup";

  // Calculate progress
  const progress =
    totalExercises > 0 ? (currentExerciseIndex + 1) / totalExercises : 0;

  const progressWidth = `${progress * 100}%` as `${number}%`;

  const repsIsTimed = /\bseconds?\b/i.test(exercise.reps);
  const repsDisplay = repsIsTimed ? exercise.reps : `${exercise.reps} reps`;

  const handleLeaveWorkout = () => {
    setShowLeaveModal(true);
  };

  return (
    <LinearGradient
      colors={
        isWarmup
          ? ["#000000", "#6C4A23"]
          : theme
            ? ["#FF0509", "#271293"]
            : ["#000000", "#272727"]
      }
      start={{ x: 0, y: 0.5 }}
      end={{ x: 0, y: 1}}
      style={styles.overviewContainer}
    >
      {/* Progress Bar */}
      <View style={{ flexDirection: "row", marginTop: 70, margin: 30 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#1B191E",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
            height: 45,
            width: 45,
          }}
          onPress={onBackToList}
        >
          <Image source={icons.halfArrow} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#1B191E",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
            height: 45,
            width: 45,
          }}
          onPress={handleLeaveWorkout}
        >
          <Image source={icons.stopButton} style={{ height: 24, width: 24 }} />
        </TouchableOpacity>
      </View>

      <View style={{ justifyContent: "center", marginTop: 100, paddingBottom: 140 }}>
        {/* Exercise name sliding in */}
        <Animated.Text
          entering={SlideInLeft.duration(800)}
          style={styles.overviewTitle}
        >
          {exercise.exerciseName}
        </Animated.Text>

        {/* Reps / time sliding in */}
        <Animated.Text
          entering={SlideInLeft.duration(500).delay(150)}
          style={styles.repsText}
        >
          {repsDisplay}
        </Animated.Text>

        {/* Start button text sliding in */}
        <TouchableOpacity
          style={styles.nextButtonOverview}
          onPress={() => {
            setTimeout(() => onStart(), 600);
          }}
        >
          <Animated.Text
            entering={SlideInLeft.duration(500).delay(300)}
            style={styles.nextButtonText}
          >
            Start
          </Animated.Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.streakContainer, { position: "absolute", bottom: 0, left: 0, right: 0 }]}>
        <AppIcon name="ankyrWordmark" size={100} fill="no fill" />
        {/*<Image style={{ height: 100, width: 100 }} source={icons.blueStreak} />*/}
      </View>

      {/* Leave Workout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLeaveModal}
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <Text style={localStyles.modalTitle}>Leave Workout?</Text>
            <Text style={localStyles.modalText}>
              Are you sure you want to leave the workout? Your progress will not be saved.
            </Text>
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={localStyles.leaveButton}
                onPress={() => {
                  setShowLeaveModal(false);
                  onEnd();
                }}
              >
                <Text style={localStyles.leaveButtonText}>Yes, Leave</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={localStyles.cancelButton}
                onPress={() => setShowLeaveModal(false)}
              >
                <Text style={localStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Video
        source={{ uri: exercise.videoUrl }}
        shouldPlay={false}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        style={{ width: 0, height: 0, opacity: 0 }}
      />
    </LinearGradient>
  );
};

const localStyles = StyleSheet.create({
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

export default ExerciseOverview;
