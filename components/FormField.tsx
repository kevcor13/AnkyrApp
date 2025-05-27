import {View, Text, TextInput, TouchableOpacity, Image, ScrollView} from 'react-native'
import React, {useState} from 'react'
import images from '@/constants/images'



// @ts-ignore
const FormField = ({title, value, handleChangeText, otherStyles}) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <ScrollView className={`${otherStyles}`}>
            <Text className="text-base text-white">{title}</Text>
            <View className="bg-gray-500 w-full mt-4 py-4 rounded-2xl focus:border-black items-center flex-row">
                <TextInput
                    className="flex-1 text-white text-base"
                    value={value}
                    onChangeText={handleChangeText}
                    secureTextEntry={title === "Password" && !showPassword}
                />
                {title === "Password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image
                            source={!showPassword ? images.eye : images.eyeHide}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    )
}
export default FormField