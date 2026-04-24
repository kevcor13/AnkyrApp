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
import React, { useState, useRef } from 'react'
import images from '@/constants/images'
import axios from 'axios'
import { useGlobal } from '@/context/GlobalProvider'
import { router } from 'expo-router'

const CodeEntry = () => {
    const { ngrokAPI } = useGlobal()
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const inputRefs = useRef<(TextInput | null)[]>([])

    const handleCodeChange = (text: string, index: number) => {
        const digitsOnly = text.replace(/[^0-9]/g, '')

        if (digitsOnly.length > 0) {
            const newCode = [...code]
            newCode[index] = digitsOnly[digitsOnly.length - 1]
            setCode(newCode)
            setError('')

            // Auto-advance to next box
            if (index < 5) {
                inputRefs.current[index + 1]?.focus()
            }

            // Auto-submit when last digit is entered
            if (index === 5) {
                const fullCode = newCode.join('')
                if (fullCode.length === 6) handleNext(fullCode)
            }
        }
    }

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const newCode = [...code]
            if (code[index] === '') {
                if (index > 0) {
                    inputRefs.current[index - 1]?.focus()
                    newCode[index - 1] = ''
                }
            } else {
                newCode[index] = ''
            }
            setCode(newCode)
            setError('')
        }
    }

    // Accept optional code param for auto-submit from last digit
    const handleNext = async (codeOverride?: string) => {
        try {
            const documentId = '680aaab878a04aea3fe07bee'
            const codeString = codeOverride ?? code.join('')
            console.log('Validating code:', codeString)
            const resp = await axios.post(
                `${ngrokAPI}/api/auth/checkCodeMatch`,
                { documentId, code: codeString }
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

    const isCodeComplete = code.every(digit => digit !== '')

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

                        <View className="flex-row justify-center gap-3 mt-10">
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputRefs.current[index] = ref as TextInput | null
                                    }}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    textContentType="oneTimeCode"
                                    selectTextOnFocus
                                    className="w-14 h-16 bg-white/10 border-2 border-white/20 rounded-xl text-white text-2xl font-poppins-semibold text-center"
                                    style={{ fontSize: 24 }}
                                    selectionColor="#FFFFFF"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </View>

                        {error.length > 0 && (
                            <Text className="text-red-400 text-center mt-4">
                                {error}
                            </Text>
                        )}

                        <Text className="text-white text-[14px] font-poppins text-center mt-6">
                            Don't have a code? How to get one
                        </Text>
                    </View>

                    {isCodeComplete && (
                        <TouchableOpacity
                            onPress={() => handleNext()}
                            className="mt-8 bg-white py-4 rounded-xl items-center"
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