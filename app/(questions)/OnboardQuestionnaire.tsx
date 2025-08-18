import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
} from "react-native";
import images from "@/constants/images";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

const OnboardQuestionnaire = () => {
  return (
    <ImageBackground source={images.questionCover} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* Parent fills the screen and pushes footer to bottom */}
        <View style={styles.container}>
          {/* TOP BLOCK */}
          <View style={styles.topBlock}>
            <Text style={styles.h1}>Welcome.</Text>
            <Text style={styles.h1}>Lets Tailor your A.I. to you.</Text>

            <CustomButton
              title="Get Started"
              handlePress={() => router.push("/PreQuestionnaire")}
              buttonStyle={styles.ctaBtn}
              textStyle={styles.ctaText}
            />
          </View>
          <View style={styles.midCopy}>
            <Text style={styles.body}>
              Answer a few questions (2-5 mins) so our A.I. can create a personal workout plan to get you
            </Text>
            <Text style={styles.body}>from where you are right now</Text>
            <Text style={styles.body}>to where you want to be.</Text>
          </View>
        </View>

          {/* FOOTER pinned at bottom */}
          <View style={styles.footer}>
            <Image source={images.ankyrName} resizeMode="contain" />
          </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  safe: { flex: 1 },

  // Key: space items vertically and fill the screen
  container: {
    flex: 1,
    justifyContent: "center",
    margin: 15,
  },

  // Small nudge down for the intro
  topBlock: {
    marginTop: 10,
  },

  midCopy: {
    marginTop: 20, // “only go down a bit”
  },

  footer: {
    alignItems: "center", // center the logo horizontally
    paddingBottom: 8,     // tiny breathing room above the safe area bottom
  },

  h1: {
    fontFamily: "poppins-semibold",
    color: "#FFFFFF",
    fontSize: 27,
  },

  ctaBtn: {
    backgroundColor: "white",
    borderRadius: 11,
    paddingVertical: 16,
    paddingHorizontal: 130, // kept as-is per your styling
    marginTop: 28,
    justifyContent: "center",
  },
  ctaText: {
    color: "#000000",
    fontSize: 16,
    fontFamily: "poppins-semiBold",
  },

  body: {
    fontFamily: "poppins",
    color: "white",
    fontSize: 15,
    lineHeight: 21,
  },
});

export default OnboardQuestionnaire;
