import {View, Text, TouchableOpacity, Image} from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import {router} from "expo-router";

const Settings = () => {
    return (
        <View className="bg-black h-full  px-6">
            <View className="mt-16">
                <TouchableOpacity className="flex-row" onPress={() => router.back()}>
                    <Image source={icons.arrow} />
                    <Text className="text-white font-poppins-semibold text-[18px]">Back</Text>
                </TouchableOpacity>
            </View>
            <View className="mt-10 flex-row">
                <Text className="flex-1 text-white font-poppins-semibold text-[25px]">Settings.</Text>
            </View>
            <TouchableOpacity className="mt-16 flex-row">
                <Text className="text-white font-poppins-medium text-[19px] flex-1">My Account</Text>
                <Image source={icons.settingArrow} />
            </TouchableOpacity>
            <TouchableOpacity className="mt-16 flex-row" onPress={() => router.push("/notifications")}>
                <Text className="text-white font-poppins-medium text-[19px] flex-1">Notifications</Text>
                <Image source={icons.settingArrow} />
            </TouchableOpacity>
            <TouchableOpacity className="mt-16 flex-row">
                <Text className="text-white font-poppins-medium text-[19px] flex-1">Permissions</Text>
                <Image source={icons.settingArrow} />
            </TouchableOpacity>
            <TouchableOpacity className="mt-16 flex-row">
                <Text className="text-white font-poppins-medium text-[19px] flex-1" onPress={() => router.push("/ChangeTheme")}>App apperance</Text>
                <Image source={icons.settingArrow} />
            </TouchableOpacity>
            <TouchableOpacity className="mt-16 flex-row">
                <Text className="text-white font-poppins-medium text-[19px] flex-1">Help</Text>
                <Image source={icons.settingArrow} />
            </TouchableOpacity>
            <TouchableOpacity className="mt-16 flex-row">
                <Text className="text-white font-poppins-medium text-[19px] flex-1">About</Text>
                <Image source={icons.settingArrow} />
            </TouchableOpacity>
        </View>
    )
}
export default Settings