import {View, Text, ImageBackground, Image} from 'react-native'
import React from 'react'
import images from '@/constants/images'
import {router} from "expo-router";
import CustomButton from "@/components/CustomButton";

const Onboard = () => {
    return (
        <ImageBackground source={images.onboard} className="h-full w-full ">
            <View className="mt-20">
                <View className="mt-20">
                    <View className="mt-32 px-6">
                        <Image source={images.ankyrIcon} className="h-[63px] w-[58px]"/>
                        <View className="mt-4">
                            <Text className="text-white text-[24px] font-poppins font-[600]">Welcome.</Text>
                            <CustomButton
                                title="Resgister"
                                handlePress={()=> router.push("/CodeEntry")}
                            />
                            <CustomButton
                                title="Log in"
                                handlePress={()=> router.push("/sign-in")}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}
export default Onboard