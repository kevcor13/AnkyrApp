import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import icons from "@/constants/icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobal } from "@/context/GlobalProvider";
import axios from "axios";

interface ChangeThemeScreenProps {
  onConfirm: () => void;
}

const ChangeThemeScreen: React.FC<ChangeThemeScreenProps> = ({ onConfirm }) => {
  const [selectedTheme, setSelectedTheme] = useState<"default" | "dark">("default");
  const { userData, ngrokAPI, setUserData } = useGlobal();

  const handleConfirmPress = () => {
    // Proceed immediately so workout flow continues without a reset
    onConfirm();

    if (!userData?._id) {
      console.error("User ID is missing. Cannot update theme.");
      return;
    }

    const isDefaultTheme = selectedTheme === "default";

    // Fire-and-forget the server update; then merge minimal changes into global state
    axios
      .post(`${ngrokAPI}/api/update/updateTheme`, {
        userId: userData._id,
        askedThemeQuestion: true,
        defaultTheme: isDefaultTheme,
      })
      .then((response) => {
        const serverUser = response?.data?.user;
        setUserData((prev: any) => ({
          ...prev,
          askedThemeQuestion: true,
          defaultTheme: isDefaultTheme,
          ...(serverUser || {}),
        }));
      })
      .catch((error) => {
        console.warn("Failed to update theme:", error?.message || error);
      });
  };

  return (
    <LinearGradient colors={["#6F6F6F", "#FFFFFF"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Switch to dark mode?</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          {/* Default preview */}
          <View style={{ backgroundColor: "white", height: 337, width: 156, borderRadius: 20, overflow: "hidden" }}>
            <LinearGradient colors={["#FF090D", "#1E00FF"]} style={styles.previewBox}>
              <View style={styles.innerHeader}>
                <View style={styles.circleButton}>
                  <Image source={icons.halfArrow} style={styles.iconStyle} />
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: 50 }]} />
                </View>
                <View style={styles.circleButton}>
                  <Image source={icons.stopButton} style={styles.iconStyle} />
                </View>
              </View>
              <View style={{ justifyContent: "center", marginTop: 100 }}>
                <Text style={styles.overviewTitle}>Bench Press</Text>
                <Text style={styles.repsText}>9-10 reps</Text>
                <View style={styles.nextButtonOverview}>
                  <Text style={styles.nextButtonText}>Start</Text>
                </View>
              </View>
              <View style={styles.streakContainer}>
                <Image style={{ height: 40, width: 40 }} src={undefined as any} source={icons.blueStreak} />
              </View>
            </LinearGradient>
          </View>

          {/* Dark preview */}
          <View style={{ backgroundColor: "white", height: 337, width: 156, borderRadius: 20, overflow: "hidden" }}>
            <LinearGradient colors={["#000000", "#272727"]} style={styles.previewBox}>
              <View style={styles.innerHeader}>
                <View style={styles.circleButton}>
                  <Image source={icons.halfArrow} style={styles.iconStyle} />
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: 50 }]} />
                </View>
                <View style={styles.circleButton}>
                  <Image source={icons.stopButton} style={styles.iconStyle} />
                </View>
              </View>
              <View style={{ justifyContent: "center", marginTop: 100 }}>
                <Text style={styles.overviewTitle}>Bench Press</Text>
                <Text style={styles.repsText}>9-10 reps</Text>
                <View style={styles.nextButtonOverview}>
                  <Text style={styles.nextButtonText}>Start</Text>
                </View>
              </View>
              <View style={styles.streakContainer}>
                <Image style={{ height: 40, width: 40 }} source={icons.blueStreak} />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Theme selection */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={[styles.button, selectedTheme === "default" && styles.buttonActive]}
            onPress={() => setSelectedTheme("default")}
          >
            <Text style={{ color: "white", fontFamily: "poppins-semibold", fontSize: 16 }}>Default</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, selectedTheme === "dark" && styles.buttonActive]}
            onPress={() => setSelectedTheme("dark")}
          >
            <Text style={{ color: "white", fontFamily: "poppins-semibold", fontSize: 16 }}>Dark Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm */}
        <View style={styles.bottomButton}>
          <TouchableOpacity style={styles.button2} onPress={handleConfirmPress}>
            <Text style={{ color: "white", fontFamily: "poppins-semibold", fontSize: 16 }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ChangeThemeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, margin: 10, padding: 10 },
  header: { marginTop: 130, paddingRight: 100, justifyContent: "center" },
  headerText: { fontFamily: "raleway-light", fontSize: 40, color: "white" },
  previewBox: { flex: 1 },
  innerHeader: { flexDirection: "row", marginTop: 10, marginHorizontal: 5, alignItems: "center" },
  circleButton: {
    backgroundColor: "rgba(217,217, 217, 0.27)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    height: 20,
    width: 20,
  },
  iconStyle: { height: 15, width: 15 },
  progressBarContainer: {
    height: 5,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 5 },
  overviewTitle: { color: "white", fontSize: 15, fontFamily: "raleway-light", marginHorizontal: 20, textAlign: "center" },
  repsText: { color: "#8AFFF9", fontSize: 20, fontFamily: "poppins-semibold", marginHorizontal: 20, textAlign: "center" },
  nextButtonOverview: {
    backgroundColor: "rgba(217,217,217,0.27)",
    paddingVertical: 5,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
  },
  nextButtonText: { color: "white", fontSize: 10, fontFamily: "poppins-semibold" },
  streakContainer: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  button: {
    backgroundColor: "rgba(42,42,42,0.27)",
    marginTop: 30,
    paddingTop: 15,
    alignItems: "center",
    borderRadius: 15,
    height: 49,
    width: 156,
    borderWidth: 2,
    borderColor: "transparent",
  },
  buttonActive: { borderColor: "#38FFF5", backgroundColor: "rgba(56, 255, 245, 0.2)" },
  button2: {
    backgroundColor: "rgba(42,42,42,0.27)",
    marginTop: 30,
    paddingTop: 15,
    alignItems: "center",
    borderRadius: 15,
    height: 49,
    width: 238,
  },
  bottomButton: { alignItems: "center", marginTop: 20 },
});
