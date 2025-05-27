import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router } from "expo-router";
import PostScreen from '@/components/PostScreen';
import axios from "axios";
import LeagueScreen from "@/components/LeagueScreen";

interface Post {
    _id: string;
    username: string;
    content: string;
    imageUrl: string;
    createdAt: string;
    UserID: string;
}

interface UserData {
    _id: string;
    username: string;
    profileImage: string;
    followers: string[];
    following: string[];
}

interface GameData {
    points: number;
    streak: number;
}
interface FollowingEntry {
    id: string;
    username: string;
    avatar: string;
    requestStatus: boolean | null;
}
const UserProfile: React.FC = () => {
    const { userId } = useLocalSearchParams();
    const { userData, ngrokAPI ,fetchFollowingUsers, fetchFollowerUsers} = useGlobal();
    const [targetUser, setTargetUser] = useState<UserData | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isApprovedFollower, setIsApprovedFollower] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [loading, setLoading] = useState(true);
    const [league, setLeague] = useState<string | null>(null);
    const [badgeImage, setBadgeImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'POSTS' | 'WORKOUTS' | 'PLAYLISTS' | 'LEAGUE'>('POSTS');
    const [followingList, setFollowingList] = useState<FollowingEntry[]>([]);
    const [followersList, setFollowersList] = useState<FollowingEntry[]>([]);

    // 1. Load full following list
    const loadConnections = async () => {
        try {
            if (!userData?._id) return;
            const following = await fetchFollowingUsers(userData._id);
            const followers = await fetchFollowerUsers(userData._id); // NEW fetchFollowerUsers
            setFollowingList(following);
            setFollowersList(followers);
        } catch (err) {
            console.error('Error loading connections:', err);
        }
    };

    useEffect(() => {
        loadConnections();
    }, [userData?._id]);

// 2. Update following/approval status based on connections
    useEffect(() => {
        if (!userId) return;

        const isFollowingEntry = followingList.find(u => u.id === userId);
        const isFollowedByEntry = followersList.find(u => u.id === userId);

        if (isFollowingEntry || isFollowedByEntry) {
            setIsFollowing(true);
            const approved = (isFollowingEntry && isFollowingEntry.requestStatus === true) ||
                (isFollowedByEntry && isFollowedByEntry.requestStatus === true);
            setIsApprovedFollower(approved);
        } else {
            setIsFollowing(false);
            setIsApprovedFollower(false);
        }
    }, [userId, followingList, followersList]);


    // Fetch user data and posts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    console.error('No authentication token found');
                    return;
                }

                // Fetch user data
                const userResponse = await axios.post(`${ngrokAPI}/getUserById`, {
                    token,
                    userId
                });
                if (userResponse.data.status === 'success') {
                    setTargetUser(userResponse.data.data);
                }

                // Only fetch posts if it's the user's own profile or they have approved follow status
                if (userData?._id === userId || isApprovedFollower) {
                    const postsResponse = await axios.post(`${ngrokAPI}/getUserPosts`, {
                        token,
                        UserId: userId
                    });
                    if (postsResponse.data.status === 'success') {
                        setPosts(postsResponse.data.data);
                    }
                }

                // Fetch game data
                const gameResponse = await axios.post(`${ngrokAPI}/gamedata`, {
                    token,
                    UserID: userId
                });
                if (gameResponse.data.status === 'success') {
                    setGameData(gameResponse.data.data);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId, userData?._id, isApprovedFollower]);

    // Determine league and badge based on points
    useEffect(() => {
        if (gameData?.points) {
            const points = gameData.points;

            if (points >= 30000) {
                setLeague("OLYMPIAN");
                setBadgeImage(images.Olympian);
            } else if (points >= 20000) {
                setLeague("TITAN");
                setBadgeImage(images.titan);
            } else if (points >= 12000) {
                setLeague("SKIPPER");
                setBadgeImage(images.skipper);
            } else if (points >= 5000) {
                setLeague("PILOT");
                setBadgeImage(images.pilot);
            } else if (points >= 1000) {
                setLeague("PRIVATE");
                setBadgeImage(images.Private);
            } else {
                setLeague("NOVICE");
                setBadgeImage(images.novice);
            }
        }
    }, [gameData]);

    // Toggle follow/unfollow
    const toggleFollow = async () => {
        try {
            if (!userData?._id || !targetUser?._id) {
                console.error('No user ID available');
                return;
            }

            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const endpoint = isFollowing ? 'unfollow' : 'follow';

            const response = await axios.post(`${ngrokAPI}/${endpoint}`, {
                userId: userData._id,
                targetId: targetUser._id
            });

            if(endpoint === "follow"){
                console.log(userData.username);
                await axios.post(`${ngrokAPI}/createNotification`, {
                    type: 'follow',
                    from: userData._id,
                    owner: targetUser._id,
                    userProfileImageUrl: userData.profileImage,
                    username: userData.username,
                    message: `has requested to follow`
                });
            }

            if (response.data.status === 'success') {
                setIsFollowing(!isFollowing);
                if (endpoint === 'unfollow') {
                    setIsApprovedFollower(false);
                }

                // If unfollowing, clear posts as well
                if (endpoint === 'unfollow') {
                    setPosts([]);
                }
            }
        } catch (error) {
            console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
        }
    };

    // Check if profile picture should be shown
    const canViewProfilePicture = () => {
        // Show if it's the current user's own profile
        if (userData?._id === userId) return true;
        // Show if the current user is following the profile user with approved request
        return isFollowing && isApprovedFollower;
    };

    // Check if profile content should be shown
    const canViewProfileContent = () => {
        // Show if it's the current user's own profile
        if (userData?._id === userId) return true;
        // Show if the current user is following the profile user with approved request
        return isFollowing && isApprovedFollower;
    };

    // Specifically check if posts can be viewed
    const canViewPosts = () => {
        // Show if it's the current user's own profile
        if (userData?._id === userId || isApprovedFollower) return true;
        // Only show posts if request status is true (approved)
        return isFollowing && isApprovedFollower;
    };

    if (loading) {
        return (
            <SafeAreaView className="bg-black flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white mt-4">Loading profile...</Text>
            </SafeAreaView>
        );
    }

    if (!targetUser) {
        return (
            <SafeAreaView className="bg-black flex-1 justify-center items-center">
                <Text className="text-white text-lg">User not found</Text>
                <TouchableOpacity
                    className="mt-4 bg-gray-800 px-4 py-2 rounded-lg"
                    onPress={() => router.back()}
                >
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Header with user info and follow button
    const renderHeader = () => (
        <>
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row">
                    <Image source={icons.arrow}/>
                    <Text className="text-white px-2 font-poppins-semibold text-lg">Back</Text>
                </TouchableOpacity>
                <View className="w-8" /> {/* Empty view for symmetry */}
            </View>

            <View className="flex-row items-center justify-between mt-4">
                {canViewProfilePicture() && targetUser?.profileImage ? (
                    // Show the profile image if user is following with approved request or it's their own profile
                    <Image
                        source={targetUser.profileImage ? {uri: targetUser.profileImage} : null}
                        className="w-28 h-28 rounded-full"
                    />
                ) : (
                    // Show placeholder if not following or request not approved
                    <View className="w-20 h-20 rounded-full bg-gray-700 justify-center items-center">
                        <Text className="text-white text-lg font-bold">
                            {targetUser.username ? targetUser.username.charAt(0).toUpperCase() : "?"}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    className="mt-12 pr-28"
                    onPress={toggleFollow}
                >
                    {isFollowing ? (
                        isApprovedFollower ? (
                            // Following and approved
                            <Image source={icons.followedIcon} className="h-10 w-10" />
                        ) : (
                            // Following but not approved (pending request)
                            <View className=" px-3 py-1">
                                <Text className="text-[#94ACAB] font-poppins-semibold text-[15px]">Requested</Text>
                            </View>
                        )
                    ) : (
                        // Not following
                        <Image source={images.followButton} className="h-10 w-10" />
                    )}
                </TouchableOpacity>

                {badgeImage ? (
                    <Image source={badgeImage} className="w-28 h-28" resizeMode="contain" />
                ) : (
                    <View className="w-28 h-28 justify-center items-center">
                        <Text className="text-gray-500">Loading badge...</Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-center justify-between mt-6">
                <Text className="text-3xl font-bold text-white">
                    {targetUser?.username || "User"}
                </Text>
                <Text className="text-3xl text-blue-400">
                    {gameData?.streak !== undefined ? gameData.streak : "0"}
                </Text>
            </View>

            <View className="flex-row justify-around mt-6 border-b border-gray-600 pb-2">
                {['POSTS', 'PLAYLISTS', 'LEAGUE'].map((tab) => (
                    <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
                        <Text className={`text-lg ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    return (
        <SafeAreaView className="px-6 bg-black flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                {renderHeader()}

                {canViewProfileContent() ? (
                    <>
                        {activeTab === 'POSTS' && canViewPosts() ? (
                            posts.length > 0 ? (
                                <PostScreen posts={posts} showImages={canViewProfilePicture()} />
                            ) : (
                                <View className="flex-1 justify-center items-center mt-8">
                                    <Text className="text-gray-500 italic">
                                        This user hasn't posted anything yet.
                                    </Text>
                                </View>
                            )
                        ) : activeTab === 'POSTS' && !canViewPosts() ? (
                            <View className="flex-1 justify-center items-center mt-20">
                                <Image source={icons.privateIcon} className="h-10 w-10" resizeMode="contain"/>
                                <Text className="text-white">hello</Text>
                            </View>
                        ) : null}

                        {activeTab === 'PLAYLISTS' && (
                            <View className="flex-1 justify-center items-center mt-8">
                                <Text className="text-gray-500 italic">
                                    No playlists created.
                                </Text>
                            </View>
                        )}

                        {activeTab === 'LEAGUE' && (
                            <View className="flex-1 mt-4">
                                {gameData?.points != null ? (
                                    <LeagueScreen userXP={gameData.points} League={league} />
                                ) : (
                                    <Text className="text-gray-500 text-center">
                                        Loading League...
                                    </Text>
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <View className="flex-1 justify-center items-center mt-20">
                        <Image source={icons.privateIcon} className="h-10 w-10" resizeMode="contain"/>
                        <Text className="text-white mt-6 font-poppins-semibold text-[13px]">Follow {targetUser.username}'s account to see his posts.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserProfile;