import CustomButton from "@/components/CustomButton";
// Make sure the file exists at app/components/CustomButton.tsx or app/components/CustomButton/index.tsx
import images from "@/constants/images";
import { useGlobal } from "@/context/GlobalProvider";
import { Redirect, router } from "expo-router";
import React from 'react';
import { Image, ImageBackground, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
    const {isLoggedIn} = useGlobal();

    if (isLoggedIn) {
        console.log(isLoggedIn)
        return <Redirect href="/home"/>
    }
    return (
        <ImageBackground source={images.onboard} className="h-full w-full ">
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerClassName=" items-center">
                    <View className="px-10 mt-36 ">
                        <Image source={images.ankyrIcon} className="ml-[90px] mb-6 w-40 h-40"/>
                        <Text className=" text-white text-2xl font-poppins font-bold text-center">it's time to actualize your</Text>
                        <Text className="text-white text-2xl font-poppins font-bold text-center">potential with</Text>
                        <Text className="mt-10 text-white text-7xl font-poppins font-bold text-center">A N K Y R</Text>
                        <CustomButton
                            title="Log In or Sign Up"
                            handlePress={()=> router.navigate("/Onboard")}
                        />
                        <Text className="text-white text-center mt-7">Everything you need to help you reach your goals; whether its new workouts, meal plans, or a bomb</Text>
                        <Text className="text-white text-center ">gym playlist.</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
}
export default index