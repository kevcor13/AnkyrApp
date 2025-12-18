import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import images from "@/constants/images";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

const PreQuestionnaire = () => {

  const handlePress = () => {
    router.push("/questionnaire");
  };

  // Fade-in animation values for the words
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20); // start slightly below

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 800 });
    textTranslateY.value = withTiming(0, { duration: 800 });
  }, [textOpacity, textTranslateY]);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.bg}>
      <Animated.View style={[styles.container, textAnimatedStyle]}>
        <Text style={styles.text}>
          The more honest you are with your info, the more accurate your app is-- the better your results.
        </Text>

        <View className="mt-10 flex justify-center items-center">
          <Text className="font-poppins-semibold text-3xl text-white">
            So let us get you to where you want to be.
          </Text>
        </View>
      </Animated.View>

      <View className="px-[120px]">
        <CustomButton
          title="Lets go."
          handlePress={handlePress}
          buttonStyle={{
            backgroundColor: "white",
            borderRadius: 11,
            paddingVertical: 11,
            paddingHorizontal: 32,
            marginTop: 28,
            justifyContent: "center",
          }}
          textStyle={{
            color: "#000000",
            fontSize: 19,
            fontFamily: "poppins-semiBold",
          }}
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
  text: {
    fontFamily: "poppins-semibold",
    color: "#FFFFFF",
    fontSize: 27,
    textAlign: "center",
  },
  container: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
});

export default PreQuestionnaire;
