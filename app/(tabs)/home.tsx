import {View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native'
import React, {use, useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import images from "@/constants/images"
import icons from "@/constants/icons"
import {useGlobal} from "@/context/GlobalProvider";
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PostCard from '@/components/PostCard';
import { LinearGradient } from 'expo-linear-gradient';
import {Tab} from "../../assets/icons/index"

const Home = () => {
    const { userData, fetchWorkout, fetchGameData, fetchFriends, ngrokAPI, userGameData, fetchUserData } = useGlobal();
    const [isLoading, setIsLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            if (!userData) {
                router.push('/(root)/sign-in');
            } else {
                loadFriendsAndPosts();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [userData]);
{/** 
    useEffect(() => {
        // Define an async function inside the useEffect
        const getChallenges = async () => {
            // Make sure userData._id exists before making the API call
            if (userData?._id) {
                try {
                    const UserID = userData._id;
                    const response = await axios.post(`${ngrokAPI}/api/GenAI/AIchallanges`, { UserID });
                    // Log the 'data' property of the response object
                    console.log("AI Challenges Response:", response.data);
                } catch (error) {
                    console.error("Error fetching AI challenges:", error);
                }
            }
        };
    
        // Call the async function
        getChallenges();
    
    }, [userData]); 
*/}
 // retreives all the friends and their posts. 
    const loadFriendsAndPosts = async () => {
        try {
            setLoadingPosts(true);

            // Get token for API calls
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            // 1. Fetch friends list
            const friendsList = await fetchFriends();
            setFriends(friendsList);

            // 2. Fetch workouts + game data
            fetchWorkout(token, userData._id);
            fetchGameData(token, userData._id);

            // 3. Only accepted friends (requestStatus === true)
            const acceptedFriends = friendsList
                .filter((u: { requestStatus: string }) => u.requestStatus == "Accepted")
                .map((u: { id: string }) => u.id);

            // 4. Also include the current user's ID to show their own posts
            if (!acceptedFriends.includes(userData._id)) {
                acceptedFriends.push(userData._id);
            }

            // 5. Fetch posts for all accepted friends + self
            let allPosts: any[] = [];
            for (const userId of acceptedFriends) {
                const resp = await axios.post(
                    `${ngrokAPI}/getUserPosts`,
                    { token, UserId: userId }
                );
                if (resp.data.status === 'success') {
                    allPosts = allPosts.concat(resp.data.data);
                } else {
                    console.error(`Failed to fetch posts for ${userId}:`, resp.data.message);
                }
            }

            // 6. Sort newest first and set state
            allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPosts(allPosts);

        } catch (error) {
            console.error("Error loading feed:", error);
        } finally {
            setLoadingPosts(false);
            setIsLoading(false);
        }
    };


    const renderHeader = () => (
        <>
            <View style={{paddingHorizontal: 5}}>
                <View className="justify-between items-start flex-row mb-6">
                    <View style={styles.headerContainer}>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.usernameText}>{userData?.username || "User"}</Text>
                    </View>
                    <View style={styles.imageContainer}>
                        <Image
                            source={images.ankyr}
                            className="w-[65] h-[65]"
                            resizeMode="contain"/>
                    </View>
                </View>
            </View>
            <View style={styles.iconsContainer}>
                <View className="items-center">
                    <TouchableOpacity className="p-6 rounded-full bg-white" onPress={() => router.navigate("/(components)/Playlist")}>
                        <Image source={icons.headphonesIcon} className="w-8 h-8"/>
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Playlist</Text>
                </View>
                <View className="items-center px-10">
                    <TouchableOpacity className="p-6 rounded-full bg-white">
                        <Image source={icons.libraryIcon} className="w-8 h-8"/>
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Your library</Text>
                </View>
                <View className="items-center">
                    <TouchableOpacity
                        className="p-6 rounded-full bg-white"
                        onPress={() => router.push("/(components)/SearchScreen?query=")}
                    >
                        <Image source={icons.searchIcon} className="w-8 h-8" />
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Search</Text>
                </View>
            </View>

            <View className="mt-8 px-4">
                <Text className="text-white font-poppins-semibold text-xl mb-2">Your Feed</Text>
            </View>
        </>
    );

    const renderScrollContentHeader = () => (
        <View style={{ marginTop: 145 }}>
            <View style={styles.iconsContainer}>
                <View className="items-center">
                    <TouchableOpacity className="p-6 rounded-full bg-white" onPress={() => router.navigate("/(components)/Playlist")}>
                        <Image source={icons.headphonesIcon} className="w-8 h-8"/>
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Playlist</Text>
                </View>
                <View className="items-center px-10">
                    <TouchableOpacity className="p-6 rounded-full bg-white">
                        <Image source={icons.libraryIcon} className="w-8 h-8"/>
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Your library</Text>
                </View>
                <View className="items-center">
                    <TouchableOpacity
                        className="p-6 rounded-full bg-white"
                        onPress={() => router.push("/(components)/SearchScreen?query=")}
                    >
                        <Image source={icons.searchIcon} className="w-8 h-8" />
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Search</Text>
                </View>
            </View>

            <View className="mt-8 px-4">
                <Text className="text-white font-poppins-semibold text-xl mb-2">Your Feed</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="bg-black h-full justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* 1. STATIONARY GRADIENT */}
            <LinearGradient
                colors={['#000000', '#000000', 'transparent']}
                locations={[0, 0.43, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, zIndex: 10 }}
            />    

            {/* 2. STATIONARY HEADER */}
            <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
                <View style={{ paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.usernameText}>{userData?.username || "User"}</Text>
                    </View>
                    <View style={styles.imageContainer}>
                    <Tab name="home" color="#FFF" size={70} />
                    </View>
                </View>
            </SafeAreaView>

            {/* 3. SCROLLING CONTENT */}
            <FlatList
                data={posts}
                renderItem={({item}) => <PostCard post={item} />}
                ListHeaderComponent={renderScrollContentHeader}
                ListEmptyComponent={() => (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-white">No posts found.</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                onRefresh={loadFriendsAndPosts}
                refreshing={loadingPosts}
            />
        </View>
    )
}

const styles = StyleSheet.create({
  headerContainer: {
    marginVertical: 10,
  },
  imageContainer: {
    marginVertical: 10,
  },
  welcomeText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#CDCDE0',
  },
  usernameText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#DAEEED',
  },
  iconsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  }
});

export default Home;