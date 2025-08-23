import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
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
}

interface GameData {
  points: number;
  streak: number;
}

interface FriendEntry {
  id: string;
  username: string;
  avatar: string;
  requestStatus: boolean | null; // true = accepted, null/false = pending
}

const UserProfile: React.FC = () => {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { userData, ngrokAPI, fetchFriends } = useGlobal();

  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [isFriendRelated, setIsFriendRelated] = useState(false);      // any relationship (pending/accepted)
  const [isFriendAccepted, setIsFriendAccepted] = useState(false);    // accepted == true
  const [posts, setPosts] = useState<Post[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<string | null>(null);
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'WORKOUTS' | 'PLAYLISTS' | 'LEAGUE'>('POSTS');
  const [friendsList, setFriendsList] = useState<FriendEntry[]>([]);

  // Load full friends list for the current user
  const loadFriends = useCallback(async () => {
    try {
      if (!userData?._id) return;
      const friends = await fetchFriends();
      setFriendsList(friends || []);
    } catch (err) {
      console.error('Error loading friends:', err);
    }
  }, [userData?._id, fetchFriends]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Update relationship/acceptance status based on friends list
  useEffect(() => {
    if (!userId) return;
    const entry = friendsList.find(u => u.id === userId);
    if (entry) {
      setIsFriendRelated(true);
      setIsFriendAccepted(entry.requestStatus === true);
    } else {
      setIsFriendRelated(false);
      setIsFriendAccepted(false);
    }
  }, [userId, friendsList]);

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

        // Fetch profile owner's data
        const userResponse = await axios.post(`${ngrokAPI}/getUserById`, { token, userId });
        if (userResponse.data.status === 'success') {
          setTargetUser(userResponse.data.data);
        }

        // Only fetch posts if it's the user's own profile or friendship is accepted
        if (userData?._id === userId || isFriendAccepted) {
          const postsResponse = await axios.post(`${ngrokAPI}/getUserPosts`, { token, UserId: userId });
          if (postsResponse.data.status === 'success') {
            setPosts(postsResponse.data.data);
          }
        } else {
          setPosts([]);
        }

        // Fetch game data
        const gameResponse = await axios.post(`${ngrokAPI}/gamedata`, { token, UserID: userId });
        if (gameResponse.data.status === 'success') {
          setGameData(gameResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId, userData?._id, isFriendAccepted, ngrokAPI]);

  // Determine league and badge based on points
  useEffect(() => {
    if (gameData?.points != null) {
      const points = gameData.points;

      if (points >= 30000) { setLeague("OLYMPIAN"); setBadgeImage(images.Olympian); }
      else if (points >= 20000) { setLeague("TITAN"); setBadgeImage(images.titan); }
      else if (points >= 12000) { setLeague("SKIPPER"); setBadgeImage(images.skipper); }
      else if (points >= 5000) { setLeague("PILOT"); setBadgeImage(images.pilot); }
      else if (points >= 1000) { setLeague("PRIVATE"); setBadgeImage(images.Private); }
      else { setLeague("NOVICE"); setBadgeImage(images.novice); }
    }
  }, [gameData]);

  // Send friend request / cancel (unfriend or cancel pending)
  const toggleFriend = async () => {
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

      // If any relationship exists -> hitting again cancels/unfriends
      const endpoint = isFriendRelated ? 'unfollow' : 'follow';
      const response = await axios.post(`${ngrokAPI}/${endpoint}`, {
        userId: userData._id,
        targetId: targetUser._id
      });

      if (endpoint === "follow") {
        // optional: notify target
        try {
          await axios.post(`${ngrokAPI}/createNotification`, {
            type: 'follow',
            from: userData._id,
            owner: targetUser._id,
            userProfileImageUrl: userData.profileImage,
            username: userData.username,
            message: `has requested to follow`
          });
        } catch {}
      }
      
      if (response.data.status === 'success') {
        // flip local flags and refresh friends for accurate pending/accepted icons
        setIsFriendRelated(!isFriendRelated);
        if (endpoint === 'unfollow') {
          setIsFriendAccepted(false);
          setPosts([]);
        }
        await loadFriends();
      }
    } catch (error) {
      console.error(`Error ${isFriendRelated ? 'unfriending/canceling' : 'requesting'} user:`, error);
    }
  };

  // Visibility helpers
  const canViewProfilePicture = () => {
    if (userData?._id === userId) return true;
    return isFriendRelated && isFriendAccepted;
  };

  const canViewProfileContent = () => {
    if (userData?._id === userId) return true;
    return isFriendRelated && isFriendAccepted;
  };

  const canViewPosts = () => {
    if (userData?._id === userId || isFriendAccepted) return true;
    return isFriendRelated && isFriendAccepted;
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
        <View className="w-8" />
      </View>

      <View className="flex-row items-center justify-between mt-4">
      <Image
            source={{ uri: targetUser.profileImage }}
            className="w-28 h-28 rounded-full"
          />

        {userData?._id !== userId ? (
          <TouchableOpacity
            className="mt-12 pr-20"
            onPress={toggleFriend}
          >
            {isFriendRelated ? (
              isFriendAccepted ? (
                <Image source={icons.followedIcon} className="h-10 w-10" />
              ) : (
                <View className="">
                  <Text className="text-[#94ACAB] font-poppins-semibold text-[12px]">Requested</Text>
                </View>
              )
            ) : (
              <Image source={images.followButton} className="h-10 w-10" />
            )}
          </TouchableOpacity>
        ) : (
          <View className="mt-12 pr-28" />
        )}

        {badgeImage ? (
          <Image
            source={typeof badgeImage === "string" ? { uri: badgeImage } : badgeImage}
            className="w-28 h-28"
            resizeMode="contain"
          />
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
                <Text className="text-white mt-6 font-poppins-semibold text-[13px]">
                  Follow {targetUser.username}'s account to see their posts.
                </Text>
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
            <Text className="text-white mt-6 font-poppins-semibold text-[13px]">
              Follow {targetUser.username}'s account to see their posts.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
