import {View, Text} from 'react-native'
import React, {useEffect} from 'react'
import axios from "axios";
import {useGlobal} from "@/context/GlobalProvider";
import {router} from "expo-router";
import CustomButton from "@/components/CustomButton";

const LoadingScreen = () => {
    return (
        <View className="bg-black h-full">
            <View className="mt-60 px-6">
                <View className="mt-10">
                    <Text className="text-white text-3xl font-poppins font-bold">
                        And thats it.
                    </Text>
                    <Text className="text-white text-3xl font-poppins font-bold mt-10">
                        You're one of us now.
                    </Text>
                    <CustomButton
                        title="Go to my new personal app"
                        handlePress={()=> router.replace("/VideoFile")}
                        buttonStyle={{backgroundColor: "white", borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, marginTop: 28, justifyContent: "center"}}
                                textStyle={{
                                color: '#000000', 
                                fontSize: 16, 
                                fontFamily: 'poppins-semiBold'}}
                    />
                </View>
            </View>
        </View>
    )
}
export default LoadingScreen