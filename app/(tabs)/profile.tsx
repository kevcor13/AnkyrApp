import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
// @ts-ignore
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import LeagueScreen from "../../components/LeagueScreen";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, router } from "expo-router";
import PostScreen from '@/components/PostScreen';
import NotificationScreen from '@/components/NotificationScreen';
import axios from "axios";

interface Post {
    _id: string;
    username: string;
    content: string;
    imageUrl: string;
    userProfileImageUrl: string;
    createdAt: string;
    UserId: string;
}

interface NotificationType {
    _id: string;
    type: string;        // e.g. "like"
    from: string;        // who liked it
    owner: string;       // whose photo it was
    message: string;     // optional extra text
    username: string;    // Add username to match what NotificationScreen expects
    userProfileImageUrl: string;
    imageUrl: string;    // the liked image URL
    read: boolean;
    createdAt: string;
}

const Profile: React.FC = () => {
    const { userData, fetchGameData, ngrokAPI, isLoggedIn} = useGlobal();
    const [activeTab, setActiveTab] = useState<'POSTS'|'NOTIFICATIONS'|'PLAYLISTS'|'LEAGUE'>('POSTS');

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingLeague, setLoadingLeague] = useState(false);

    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loadingNotifi, setLoadingNotifi] = useState(false);

    const [points, setPoints] = useState<number|null>(null);
    const [streak, setStreak] = useState<number|null>(null);
    const [league, setLeague] = useState<string|null>(null);
    const [badgeImage, setBadgeImage] = useState<string|null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn) {
          // navigate away if logged out
          router.replace("/sign-in");
          return;
        }
        // fetch stuff when logged in
        (async () => {
          try {
            setLoading(true);
            // example:
            // const p = await fetchUserPosts();
            // setPosts(p);
          } catch (e: any) {
            setErr(e?.message ?? "Failed to load");
          } finally {
            setLoading(false);
          }
        })();
      }, [isLoggedIn]);
    
    // Create a reusable function to fetch notifications
    const fetchUserNotifications = useCallback(async () => {
        if (!userData?._id) return;

        setLoadingNotifi(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) throw new Error("No auth token");
            const res = await axios.post(`${ngrokAPI}/getNotifications`, {
                token,
                userId: userData._id
            });
            if (res.data.status === "success") {
                setNotifications(res.data.data);
                console.log("Notifications fetched successfully");
            } else {
                console.error("Notifications fetch error:", res.data.data);
            }
        } catch (e) {
            console.error("Error fetching notifications:", e);
        } finally {
            setLoadingNotifi(false);
        }
    }, [userData, ngrokAPI]);

    useEffect(() => {
        if (!userData?._id) return;

        const fetchUserPosts = async () => {
            setLoadingPosts(true);
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) throw new Error("No auth token");
                const resp = await axios.post(`${ngrokAPI}/getUserPosts`, { token, UserId: userData._id });
                if (resp.data.status === "success") {
                    setPosts(resp.data.data);
                } else {
                    console.error("Posts fetch error:", resp.data.data);
                }
            } catch (e) {
                console.error("Error fetching posts:", e);
            } finally {
                setLoadingPosts(false);
            }
        };

        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (token) {
                    const gd = await fetchGameData(token, userData._id);
                    if (gd) {
                        setPoints(gd.points);
                        setStreak(gd.streak);
                    }
                }
            } catch (e) {
                console.error("Error fetching game data:", e);
            } finally {
                setLoadingLeague(false);
            }
        };

        fetchUserPosts();
        fetchUserNotifications();
        fetchData();
    }, [userData, fetchUserNotifications]);


    useEffect(() => {
        if (points === null) return;
        if (points >= 30000) {
            setLeague("OLYMPIAN"); setBadgeImage(images.Olympian);
        } else if (points >= 20000) {
            setLeague("TITAN"); setBadgeImage(images.titan);
        } else if (points >= 12000) {
            setLeague("SKIPPER"); setBadgeImage(images.skipper);
        } else if (points >= 5000) {
            setLeague("PILOT"); setBadgeImage(images.pilot);
        } else if (points >= 1000) {
            setLeague("PRIVATE"); setBadgeImage(images.Private);
        } else {
            setLeague("NOVICE"); setBadgeImage(images.novice);
        }
    }, [points]);

    const renderHeader = () => (
        <>
            <View className="flex-row items-center justify-between mt-10 px-4">
                <Image
                    source={userData?.profileImage ? { uri: userData.profileImage } : images.profile}
                    className="w-28 h-28 rounded-full"
                />
                <TouchableOpacity onPress={() => router.push("/homeSettings")} className="mt-12 pr-28">
                    <Image source={icons.settings} className="w-6 h-6" />
                </TouchableOpacity>
                {badgeImage
                    ? <Image source={typeof badgeImage === 'string' ? { uri: badgeImage } : badgeImage} className="w-28 h-28" resizeMode="contain" />
                    : <Text className="text-gray-500">Loading badge...</Text>
                }
            </View>
            <View className="flex-row items-center justify-between mt-6 px-4">
                <Text className="text-3xl font-poppins font-bold text-white">
                    {userData.username}
                </Text>
                <Text className="font-raleway text-3xl text-blue-400">
                    {streak ?? "—"}
                </Text>
            </View>
            <View className="flex-row justify-around mt-4">
                {['POSTS','NOTIFICATIONS','PLAYLISTS','LEAGUE'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab as any)}
                        className="relative py-4"
                    >
                        <View className={`border-t border-gray-600 absolute top-0 left-0 right-0 h-1 ${
                            activeTab===tab ? 'bg-white' : 'bg-transparent'
                        }`} />
                        <Text className={`text-lg ${
                            activeTab===tab ? 'text-white font-bold' : 'text-gray-400'
                        }`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    const renderPostsFallback = () => (
        <View className="flex-1 justify-center items-center mt-4">
            <Text className="text-gray-500 italic">
                {userData.username} has not posted yet
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/camera")} className="mt-4">
                <View className="bg-gray-800 rounded-2xl p-2 mt-2">
                    <Text className="text-white">Create a post</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="px-6 bg-black h-full">
                {renderHeader()}

                {/* POSTS tab */}
                {activeTab==='POSTS' && (
                    loadingPosts
                        ? <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
                        : posts.length > 0
                            ? <PostScreen posts={posts} />
                            : renderPostsFallback()
                )}

                {/* NOTIFICATIONS tab */}
                {activeTab==='NOTIFICATIONS' && (
                    loadingNotifi
                        ? <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
                        : notifications.length > 0
                            ? <NotificationScreen
                                notifications={notifications}
                                refreshNotifications={fetchUserNotifications}
                            />
                            : (
                                <View className="flex-1 justify-center items-center mt-4">
                                    <Text className="text-gray-500 italic">No notifications yet</Text>
                                </View>
                            )
                )}

                {/* PLAYLISTS tab */}
                {activeTab==='PLAYLISTS' && (
                    <View className="flex-1 justify-center items-center mt-4">
                        <Text className="text-gray-500 italic">No playlists created</Text>
                    </View>
                )}

                {/* LEAGUE tab */}
                {activeTab==='LEAGUE' && (
                    <View className="flex-1 mt-4">
                        {loadingLeague
                            ? <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
                            : points !== null
                                ? <LeagueScreen userXP={points} League={league ?? ""} />
                                : <Text className="text-gray-500 text-center">No league data available</Text>
                        }
                    </View>
                )}
        </SafeAreaView>
    );
};

export default Profile;