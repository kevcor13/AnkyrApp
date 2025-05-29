import {View, Text, ImageBackground, ScrollView, Image} from 'react-native'
import React from 'react'
import images from "@/constants/images"
import {SafeAreaView} from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";

const OnboardQuestionnaire = () => {
    return (
        <ImageBackground source={images.questionCover} className="h-full w-full " resizeMode="cover">
            <SafeAreaView className="flex-1">
                <ScrollView>
                    <View className="mt-10">
                        <View className="px-10 mt-60 ">
                            <Text className="font-poppins-semibold text-white text-2xl">
                                Welcome.
                            </Text>
                            <Text className="font-poppins-semibold font-bold text-white text-2xl">
                                Lets Tailor our A.I. to you
                            </Text>
                            <CustomButton
                                title="Get Started"
                                handlePress={()=> router.push("/PreQuestionnaire")}
                                buttonStyle={{backgroundColor: "white", borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, marginTop: 28, justifyContent: "center"}}
                                textStyle={{
                                color: '#000000', 
                                fontSize: 16, 
                                fontFamily: 'poppins-semiBold'}}
                            />
                        </View>
                        <View className="mt-4 px-8">
                            <Text className="font-poppins text-white text-m">
                                Answer a few questions (2-5 mins) so our A.I. can create a personal workout plan to get you
                            </Text>
                            <View className=" px-14">
                                <Text className="font-poppins text-white text-m">
                                    from where you are right now
                                </Text>
                            </View>
                            <View className="px-20">
                                <Text className="font-poppins text-white text-m">to where you want to be.</Text>
                            </View>
                        </View>
                    </View>
                    <View className="mt-40 px-20">
                        <Image source={images.ankyrName}/>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
}
export default OnboardQuestionnaire