import {View, Text, Image} from 'react-native'
import React from 'react'
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";
import images from "@/constants/images"

const PreQuestionnaire = () => {
    return (
        <View className="bg-black h-full">
            <View className="mt-60 px-4 flex justify-center items-center">
                <Text className="font-poppins-semibold text-3xl text-white">
                    The more honest you are with your info, the more accurate your workouts are for you--the better your results.
                </Text>
                <View className="mt-10 flex justify-center items-center">
                    <Text className="font-poppins-semibold text-3xl text-white">
                        So let us get you to where you want to be.
                    </Text>
                </View>
            </View>
            <View className="mt-20 px-20">
                <CustomButton
                    title="Next"
                    handlePress={()=> router.push("/questionnaire")}
                />
            </View>
            <View className="mt-20 px-20 items-center flex justify-center">
                <Image source={images.ankyrIcon} className="h-[55px] w-[50px]"></Image>
            </View>
        </View>
    )
}
export default PreQuestionnaire