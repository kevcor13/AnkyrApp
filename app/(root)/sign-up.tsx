import {
    View,
    Text,
    ScrollView,
    Image,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    Alert,
    Keyboard, Platform, TouchableWithoutFeedback, KeyboardAvoidingView
} from 'react-native'
import React, {useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import images from "@/constants/images"
import CustomButton from "@/components/CustomButton";
import {Link, router} from "expo-router";
import axios from 'axios';
import {useGlobal} from "@/context/GlobalProvider";

const SignUp = () => {
    const {signUpUser} = useGlobal()
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const profile = images.ProfileImage

    const submit = async () =>{
        const result = await signUpUser(name, username, email, password, profile);
        console.log("this is the part", result.status);
        if(result.status === "success"){
            router.push("/OnboardQuestionnaire");
        } else {
            console.log(result);
        }
    }

    return (
        <ImageBackground source={images.login} className="h-full w-full " resizeMode="cover">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
            <ScrollView>
                <View className="flex justify-center mt-24 py-4 px-6">
                    <Image
                        source={images.ankyrIcon}
                        className="h-[63px] w-[58px]"
                    />
                    <Text className="text-white font-poppins-semibold text-[22px] mt-4">Create your Login.</Text>

                    <Text className="text-white mt-6">Name</Text>
                    <View className="bg-[#24292AB8] mt-4 px-4 rounded-2xl py-4 focus:border-black">
                        <TextInput
                            className="text-white font-poppins"
                            placeholder="Your name"
                            placeholderTextColor="#7B7B8B"
                            onChangeText={(e) => setName(e)}
                        />
                    </View>
                    {/* the username input box */}
                    <Text className="text-white mt-6">Username</Text>
                    <View className="bg-[#24292AB8] mt-4 px-4 rounded-2xl py-4 focus:border-black">
                        <TextInput
                            className="text-white font-poppins"
                            placeholder="Your unique username"
                            placeholderTextColor="#7B7B8B"
                            onChangeText={(e) => setUsername(e)}
                        />
                    </View>

                    {/*the email input box*/}
                    <Text className="text-white mt-6">Email</Text>
                    <View className="bg-[#24292AB8] mt-4 px-4 rounded-2xl py-4 focus:border-black">
                        <TextInput
                            className="text-white font-poppins"
                            placeholder="Enter your email"
                            placeholderTextColor="#7B7B8B"
                            onChangeText={(e) => setEmail(e)}
                        />
                    </View>

                    {/*the password input box*/}
                    <Text className="text-white mt-6">Password</Text>
                    <View className="bg-[#24292AB8] mt-4 px-4 rounded-2xl py-4 focus:border-black flex-row ">
                        <TextInput
                            className="flex-1 text-white font-poppins"
                            placeholder="Enter a unique password"
                            placeholderTextColor="#7B7B8B"
                            onChangeText={(e) => setPassword(e)}
                            secureTextEntry={!showPassword}
                        />
                        {/* the eye icon control*/}
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Image
                                source={!showPassword ? images.eye : images.eyeHide}
                                className="h-6 w-6 "
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                    {/* login button */}
                    <TouchableOpacity className="bg-white rounded-2xl py-4 mt-20 justify-center" onPress={submit} activeOpacity={0.7}>
                        <View className="flex flex-row items-center justify-center">
                            <Text className="font-poppins text-center text-lg">L O G I N</Text>
                        </View>
                    </TouchableOpacity>

                    {/* switching tabs between login and logout */}
                    <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-gray-500 text-lg font-poppins">
                            Already have an account?
                        </Text>
                        <Link href="/sign-in" className="text-lg font-poppins text-[#8AFFF9]">Sign in</Link>
                    </View>
                </View>
            </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </ImageBackground>
    )
}
export default SignUp