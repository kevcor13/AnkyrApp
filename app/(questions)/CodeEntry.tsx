import {
    View,
    Text,
    Image,
    ImageBackground,
    TextInput,
    SafeAreaView,
    TouchableOpacity,
    ScrollView
} from 'react-native'
import React, { useState } from 'react'
import images from '@/constants/images'
import axios from 'axios'
import { useGlobal } from '@/context/GlobalProvider'
import { router } from 'expo-router'

const CodeEntry = () => {
    const { ngrokAPI } = useGlobal()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')

    const handleCode = (text: string) => {
        // strip out any non-digits
        const digitsOnly = text.replace(/[^0-9]/g, '')
        setCode(digitsOnly)
        setError('')  // clear previous error as they type
    }

    const handleNext = async () => {
        try {
            const documentId = '680aaab878a04aea3fe07bee'
            const resp = await axios.post(
                `${ngrokAPI}/api/auth/checkCodeMatch`,
                { documentId, code }
            )
            const { found } = resp.data

            if (found) {
                router.push('/sign-up')
            } else {
                setError('Code not found. Please try again.')
            }
        } catch (err) {
            console.error('Error validating code:', err)
            setError('Something went wrong. Please try again.')
        }
    }

    return (
        <ImageBackground source={images.onboard} className="h-full w-full">
            <SafeAreaView className="mt-20 flex-1">
                <ScrollView className="mt-40 px-6">
                    <Image
                        source={images.ankyrIcon}
                        className="h-[63px] w-[58px]"
                    />

                    <View className="mt-4">
                        <Text className="text-white text-[24px] font-poppins font-semibold">
                            Enter your member code
                        </Text>

                        <TextInput
                            value={code}
                            onChangeText={handleCode}
                            keyboardType="numeric"
                            maxLength={6}
                            className="bg-[#24292A] text-white p-6 font-poppins-semibold mt-10 rounded text-center"
                            placeholder="Enter Code Manually"
                            placeholderTextColor="#FFFFFF"
                        />

                        {error.length > 0 && (
                            <Text className="text-red-400 text-center mt-2">
                                {error}
                            </Text>
                        )}

                        <Text className="text-white text-[14px] font-poppins text-center mt-4">
                            Don’t have a code? How to get one
                        </Text>
                    </View>

                    {code.length > 0 && (
                        <TouchableOpacity
                            onPress={handleNext}
                            className="mt-8 bg-white py-3 rounded-lg items-center"
                        >
                            <Text className="text-black text-lg font-poppins-semibold">
                                Next
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
}

export default CodeEntry