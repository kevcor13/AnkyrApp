import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/GlobalProvider";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
    _id: string;
    username: string;
    profileImage: string;
    followers: string[];
}

const SearchScreen = () => {
    const { query } = useLocalSearchParams();
    const { userData, ngrokAPI, followingUsers} = useGlobal();
    const [searchQuery, setSearchQuery] = useState(query as string || "");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

    // Search for users when the query changes
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [searchQuery]);

    // Function to search for users
    const searchUsers = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await axios.post(`${ngrokAPI}/searchUsers`, {
                token,
                query: searchQuery
            });

            if (response.data.status === 'success') {
                setUsers(response.data.data);

                // Initialize following status for each user
                const statusObj: Record<string, boolean> = {};
                response.data.data.forEach((user: User) => {
                    statusObj[user._id] = user.followers.includes(userData?._id || "");
                });
                setFollowingStatus(statusObj);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle follow/unfollow a user
    const toggleFollow = async (targetId: string) => {
        try {
            if (!userData?._id) {
                console.error('No user ID available');
                return;
            }

            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const endpoint = followingStatus[targetId] ? 'unfollow' : 'follow';

            const response = await axios.post(`${ngrokAPI}/${endpoint}`, {
                userId: userData._id,
                targetId
            });

            if (response.data.status === 'success') {
                // Update following status locally
                setFollowingStatus({
                    ...followingStatus,
                    [targetId]: !followingStatus[targetId]
                });
            }
        } catch (error) {
            console.error(`Error ${followingStatus[targetId] ? 'unfollowing' : 'following'} user:`, error);
        }
    };

    // Navigate to user's profile
    const navigateToProfile = (userId: string) => {
        router.push(`/(components)/UserProfile?userId=${userId}`);
    };

    // @ts-ignore
    return (
        <SafeAreaView className="bg-black flex-1 p-4">
            <TouchableOpacity onPress={() => router.back()} className="flex-row">
                <Image source={icons.arrow}/>
                <Text className="text-white px-2 font-poppins-semibold text-lg">Back</Text>
            </TouchableOpacity>
            <Text className="text-white mt-10 font-poppins-semibold text-[24px]">Search.</Text>
            <View className="mb-4 mt-10">
                <TextInput
                    className="bg-[#2A3235] text-white font-poppins-semibold p-6 rounded-lg"
                    placeholder="Search users..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center mt-10">
                            <Text className="text-gray-400 text-lg">
                                {searchQuery.trim().length > 0 ? "No users found" : "Enter a username to search"}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-row items-center justify-between bg-gray-900 p-4 rounded-lg mb-3"
                            onPress={() => navigateToProfile(item._id)}
                        >
                            <View className="flex-row items-center">
                                <Image
                                    source={item.profileImage}
                                    className="w-12 h-12 rounded-full bg-gray-700"
                                />
                                <Text className="text-white text-lg ml-3">{item.username}</Text>
                            </View>
                            <TouchableOpacity
                                className={`py-2 px-4 rounded-full ${followingStatus[item._id] ? 'bg-gray-700' : 'bg-blue-600'}`}
                                onPress={(e) => {
                                    e.stopPropagation(); // Prevent navigating to profile
                                    toggleFollow(item._id);
                                }}
                            >
                                <Text className="text-white font-medium">
                                    {followingStatus[item._id] ? 'Unfollow' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default SearchScreen;