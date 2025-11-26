import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Dimensions, Animated, StyleSheet } from 'react-native';
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import images from "@/constants/images";

const PreQuestionnaire = () => {

  const screenWidth = Dimensions.get("window").width;

  console.log("[PreQuestionnaire] screenWidth =", screenWidth);
  const [isAnimationComplete, setIsAnimationComplete] = React.useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("[PreQuestionnaire] starting overlay opacity animation");
  
    const id = overlayOpacity.addListener(({ value }) => {
      console.log("[PreQuestionnaire] overlayOpacity =", value);
    });
  
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 4000,      // slow so you can see it
      delay: 500,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimationComplete(true);
    });
  }, [overlayOpacity]);

  return (
    <View style={styles.bg}>
      <Animated.View
        style={[
          styles.container,
          isAnimationComplete ? { opacity: 1 } : { opacity: overlayOpacity }
        ]}
      >
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
          handlePress={() => {
            console.log("[PreQuestionnaire] Lets go button pressed, navigating to /questionnaire");
            router.push("/questionnaire");
          }}
          buttonStyle={{
            backgroundColor: "white",
            borderRadius: 11,
            paddingVertical: 11,
            paddingHorizontal: 32,
            marginTop: 28,
            justifyContent: "center",
          }}
          textStyle={{ color: "#000000", fontSize: 19, fontFamily: "poppins-semiBold" }}
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
  text :{
    fontFamily: "poppins-semibold",
    color: "#FFFFFF",
    fontSize: 27,
  },
  container: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor:"red"
  },
});

export default PreQuestionnaire;
