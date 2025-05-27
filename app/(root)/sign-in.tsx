import React, { useState } from "react";
import { View, Text, ScrollView, Image, ImageBackground, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/GlobalProvider";
import images from "@/constants/images";
import {Link, router} from "expo-router";

const SignIn = () => {
    const { loginUser } = useGlobal();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        const result = await loginUser(email, password);
        if (result.success) {
            router.replace("/home");
        } else {
            alert(result.message || "Login failed. Please try again.");
        }
    };

    return (
        <ImageBackground source={images.onboard} className="h-full w-full" resizeMode="cover">
            <ScrollView>
                <View className="flex justify-center mt-40 py-4 px-6">
                    <Text className="text-white font-poppins text-3xl">Welcome Back.</Text>
                    <Text className="text-white mt-6">Email</Text>
                    <TextInput
                        className="bg-gray-800 mt-4 px-4 rounded-2xl py-4 text-white font-poppins"
                        onChangeText={setEmail}
                        value={email}
                    />
                    <Text className="text-white mt-6">Password</Text>
                    <View className="bg-gray-800 mt-4 px-4 rounded-2xl py-4 flex-row">
                        <TextInput
                            className="flex-1 text-white font-poppins"
                            secureTextEntry={!showPassword}
                            onChangeText={setPassword}
                            value={password}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Image source={showPassword ? images.eyeHide : images.eye} className="h-6 w-6" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity className="bg-white rounded-2xl py-4 mt-20" onPress={handleSubmit}>
                        <Text className="font-poppins text-center text-lg">L O G I N</Text>
                    </TouchableOpacity>
                    <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-gray-500 text-lg font-poppins">
                            dont have an account?
                        </Text>
                        <Link href="/(root)/sign-up" className="text-lg font-poppins text-blue-400">Sign up</Link>
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

export default SignIn;