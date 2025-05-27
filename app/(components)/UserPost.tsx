import { View, Text, TouchableOpacity, SafeAreaView, Image, FlatList, ActivityIndicator, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from "expo-router";
import images from "@/constants/images";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { BlurView } from 'expo-blur';
import * as Notifications from "expo-notifications"; // <== IMPORT BlurView

interface UserImage {
    _id: string;
    image: string;
    url: string;
    createdAt: string;
    UserID: string;
}

const UserPost = () => {
    const { userData, ngrokAPI } = useGlobal();
    const [userImages, setUserImages] = useState<UserImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserImages();
    }, []);

    useEffect(() => {
        if (userImages.length > 0) {
            const timer = setInterval(async () => {
                const now = new Date();
                const anyNewlyReady = userImages.some(img => {
                    const createdAt = new Date(img.createdAt);
                    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
                    return diffInMinutes >= 5;
                });
                if (anyNewlyReady) {
                    //Alert.alert('Image ready!', 'One of your images is now available!');
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'New Image!',
                            body: `Your Image is Ready!`,
                            data: {userId: userData.userId},
                        },
                        trigger: null,
                    });
                    clearInterval(timer);
                }
            }, 60000); // check every 1 min

            return () => clearInterval(timer);
        }
    }, [userImages]);

    const fetchUserImages = async () => {
        if (!userData?._id) {
            console.error('No user ID available');
            return;
        }
        const UserID = userData._id;

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                router.replace('/');
                return;
            }

            const response = await axios.post(`${ngrokAPI}/UserImages`, { token, UserID });
            if (response.data.status === 'success') {
                setUserImages(response.data.data);
            } else {
                console.error('Failed to fetch images:', response.data.data);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isBlurred = (createdAt: string) => {
        const now = new Date();
        const createdDate = new Date(createdAt);
        const diffInMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
        return diffInMinutes < 5; // blurred if less than 5 minutes old
    };

    const groupedImages = userImages.reduce((acc: Record<string, UserImage[]>, img) => {
        const date = formatDate(img.createdAt);
        if (!acc[date]) acc[date] = [];
        acc[date].push(img);
        return acc;
    }, {});

    const handleImageClick = (image: UserImage) => {
        router.push({ pathname: '/(components)/CreatePost', params: { imageUrl: image.image } });
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center px-4 py-2">
                <TouchableOpacity onPress={() => router.push('/camera')}>
                    <Text className="text-white text-xl font-poppins-semibold">&larr; Camera</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row px-4 mt-6 justify-between items-center">
                <Text className="text-white text-3xl font-poppins-semibold">Your snaps</Text>
                <TouchableOpacity onPress={fetchUserImages}>
                    <Image className="w-12 h-12" source={images.libraryIcon} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            ) : userImages.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-white text-lg text-center font-poppins-regular">
                        No snaps yet. Take your first picture!
                    </Text>
                </View>
            ) : (
                <ScrollView className="mt-6 px-4" showsVerticalScrollIndicator={false}>
                    {Object.entries(groupedImages).map(([date, images]) => (
                        <View key={date} className="mb-6">
                            <Text className="text-white text-base mb-2 font-poppins-regular">{date}</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {images.map((img) => {
                                    const blurred = isBlurred(img.createdAt);
                                    return (
                                        <View key={img._id}>
                                            <TouchableOpacity
                                                onPress={() => !blurred && handleImageClick(img)}
                                                activeOpacity={blurred ? 1 : 0.8}
                                                disabled={blurred}
                                            >
                                                <View className="w-36 h-48 rounded-lg overflow-hidden">
                                                    <Image
                                                        source={{ uri: img.image }}
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                    {blurred && (
                                                        <BlurView
                                                            intensity={100}
                                                            tint="dark"
                                                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default UserPost;