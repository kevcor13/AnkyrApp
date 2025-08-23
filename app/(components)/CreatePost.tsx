import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobal } from "@/context/GlobalProvider";
import { router, useLocalSearchParams } from "expo-router";
import images from "@/constants/images";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


export default function CreatePost() {
    const { userData, ngrokAPI } = useGlobal();
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const params = useLocalSearchParams();
    const imageUri = params.imageUrl;

    const handleShare = async () => {
        if (!caption.trim()) {
            Alert.alert("Error", "Please add a caption to your snap");
            return;
        }
        if (!imageUri) {
            Alert.alert("Error", "No image to share");
            return;
        }

        setIsLoading(true);

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "Authentication required");
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const postData = {
                UserId: userData._id,
                username: userData?.username,
                content: caption,
                imageUrl: imageUri,
                userProfileImageUrl: userData.profileImage
            };

            const response = await axios.post(`${ngrokAPI}/createPost`, postData, config);
            router.push('/home')

        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert("Error", "Failed to share your snap. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <KeyboardAwareScrollView
                        enableOnAndroid
                        keyboardOpeningTime={0}
                        extraScrollHeight={16}               // nudge to sit nicely above keyboard
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
                    >
                        {/* Header with Back button */}
                        <View className="flex-row items-center justify-between px-4 py-2">
                            <TouchableOpacity onPress={() => router.push('/camera')}>
                                <Text className="text-white font-poppins-semibold text-xl">&larr; Back</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <View className="px-4 mt-6 mb-6 flex-row">
                            <Text className="text-white text-2xl font-semibold">Share your snap</Text>
                            <View className="px-48">
                                <Image source={images.send} />
                            </View>
                        </View>

                        {/* Image preview */}
                        <View className="px-10 mb-6 items-center">
                            {imageUri ? (
                                <Image
                                    source={{ uri: imageUri }}
                                    className="w-60 h-80 rounded-md"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-60 h-80 rounded-md bg-gray-800 items-center justify-center">
                                    <Text className="text-white">No image available</Text>
                                </View>
                            )}
                        </View>

                        {/* Caption input */}
                        <View className="px-6 mb-4">
                            <Text className="text-white mb-2 font-poppins text-xl">Caption your snap:</Text>
                            <TextInput
                                className="bg-[#2A3235] p-4 text-white rounded-md"
                                placeholder="Type your caption..."
                                placeholderTextColor="#aaa"
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                                maxLength={200}
                                style={{ textAlignVertical: 'top', minHeight: 70 }}
                            />
                        </View>

                        {/* Share button */}
                        <View className="px-6 mt-6">
                            <TouchableOpacity
                                onPress={handleShare}
                                disabled={isLoading || !imageUri}
                                className={`p-6 rounded-md items-center ${isLoading || !imageUri ? 'bg-gray-500' : 'bg-[#DCE0E3]'
                                    }`}
                            >
                                <Text className="text-black font-semibold">
                                    {isLoading ? 'Sharing...' : 'Share'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}