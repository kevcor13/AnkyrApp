import {View, Text, SafeAreaView, Image, TouchableOpacity} from 'react-native'
import icons from "@/constants/icons"
import images from '@/constants/images'
import React from 'react'
import {router} from "expo-router";

const GenerateMeal = () => {
    return (
        <SafeAreaView className="bg-black h-full">
            <View className="px-10 mt-10 flex-row">
                <View className="mt-1">
                    <Image source={icons.whiteZap} className="w-[30] h-[30]"/>
                </View>
                <Text className="text-white font-poppins-semibold text-[24px] px-6">Quick Meal</Text>
                <View className="mt-[-26] flex-1 flex-row-reverse">
                    <Image source={images.meals} className="w-16 h-16"/>
                </View>
            </View>
            <View className="bg-[#D9D9D9] h-full mt-4">
                <View className="mt-20">
                    <View className=" px-10">
                        <Text className="text-black font-poppins-semibold text-[27px]">Stuck deciding what to make?</Text>
                    </View>
                </View>
                <View className="mt-20">
                    <View className="items-center">
                        <TouchableOpacity className="p-16 rounded-full bg-white">
                            <Image source={icons.zap} className="w-16 h-16" />
                        </TouchableOpacity>
                        <Text className="text-black mt-4 font-poppins-semibold text-[20px]">GENERATE</Text>
                        <View className="mt-40">
                            <Text className="font-poppins text-[14px]">Press the button to generate a random meal.</Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}
export default GenerateMeal