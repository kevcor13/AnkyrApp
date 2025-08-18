import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Dimensions, Animated, StyleSheet } from 'react-native';
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import images from "@/constants/images";

const PreQuestionnaire = () => {
  const screenWidth = Dimensions.get("window").width;

  // fade-from-black overlay
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity2 = useRef(new Animated.Value(1)).current;
  const overlayOpacity3 = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 900,
      delay: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(overlayOpacity2, {
        toValue: 0,
        duration: 900,
        delay: 800,
        useNativeDriver: true,
      }).start();
      Animated.timing(overlayOpacity3, {
        toValue: 0,
        duration: 900,
        delay: 2200,
        useNativeDriver: true,
      }).start();
  }, []);

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Text className="font-poppins-semibold text-[27px] text-white">
          The more honest you are with your info, the more accurate your app is-- the better your results.
        </Text>
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000", opacity: overlayOpacity }]}
        />
        <View className="mt-10 flex justify-center items-center">
          <Text className="font-poppins-semibold text-3xl text-white">
            So let us get you to where you want to be.
          </Text>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000", opacity: overlayOpacity2 }]}
        />
        </View>
      </View>
      <View className="px-[120px]">
        <CustomButton
          title="Lets go."
          handlePress={() => router.push("/questionnaire")}
          buttonStyle={{ backgroundColor: "white", borderRadius: 11, paddingVertical: 11, paddingHorizontal: 32, marginTop: 28, justifyContent: "center" }}
          textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
        />
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000", opacity: overlayOpacity3 }]}
        />
      </View>
      <View className="mt-16 items-center">
        <Image source={images.ankyrIcon} className="h-[55px] w-[50px]" />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#000" },
  container: {
    flex: .9,
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 40, 
  },
});

export default PreQuestionnaire;
