import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router } from "expo-router";
import PostScreen from '@/components/PostScreen';
import axios from "axios";
import LeagueScreen from "@/components/LeagueScreen";

interface Post { _id: string; username: string; content: string; imageUrl: string; createdAt: string; UserID: string; }
interface UserData { _id: string; username: string; profileImage: string; followers: any[]; following: any[]; }
interface GameData { points: number; streak: number; }
interface FollowingEntry { id?: string; userId?: string; username: string; profileImage?: string; requestStatus: boolean | null; }

const UserProfile: React.FC = () => {
  const params = useLocalSearchParams();
  const targetId = useMemo(() => {
    const raw = params.userId as string | string[] | undefined;
    return Array.isArray(raw) ? raw[0] : (raw ?? "");
  }, [params.userId]);

  const { userData, ngrokAPI, fetchFollowingUsers, fetchFollowerUsers } = useGlobal();

  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isApprovedFollower, setIsApprovedFollower] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<string | null>(null);
  const [badgeImage, setBadgeImage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'PLAYLISTS' | 'LEAGUE'>('POSTS');
  const [followingList, setFollowingList] = useState<FollowingEntry[]>([]);
  const [followersList, setFollowersList] = useState<FollowingEntry[]>([]);

  const sameId = (entry: FollowingEntry, id: string) => (entry.id ?? entry.userId) === id;
  const canUseRemoteImage = (uri?: string) => !!uri && /^https?:\/\//i.test(uri);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!userData?._id) return;
        const following = await fetchFollowingUsers(userData._id);
        const followers = await fetchFollowerUsers(userData._id);
        if (!alive) return;
        setFollowingList(Array.isArray(following) ? following : []);
        setFollowersList(Array.isArray(followers) ? followers : []);
      } catch (err) {
        console.error('Error loading connections:', err);
      }
    })();
    return () => { alive = false; };
  }, [userData?._id, fetchFollowingUsers, fetchFollowerUsers]);

  useEffect(() => {
    if (!targetId) return;
    const f = followingList.find(u => sameId(u, targetId));
    const fb = followersList.find(u => sameId(u, targetId));
    if (f || fb) {
      setIsFollowing(true);
      setIsApprovedFollower((f?.requestStatus === true) || (fb?.requestStatus === true));
    } else {
      setIsFollowing(false);
      setIsApprovedFollower(false);
    }
  }, [targetId, followingList, followersList]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!targetId) return;
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const userRes = await axios.post(`${ngrokAPI}/getUserById`, { token, userId: targetId });
        if (alive && userRes.data.status === 'success') setTargetUser(userRes.data.data);

        if (userData?._id === targetId || isApprovedFollower) {
          const postsRes = await axios.post(`${ngrokAPI}/getUserPosts`, { token, UserId: targetId });
          if (alive && postsRes.data.status === 'success') setPosts(postsRes.data.data);
        } else if (alive) {
          setPosts([]);
        }

        const gameRes = await axios.post(`${ngrokAPI}/gamedata`, { token, UserID: targetId });
        if (alive && gameRes.data.status === 'success') setGameData(gameRes.data.data);
      } catch (e) {
        console.error('Error fetching user data:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [targetId, userData?._id, isApprovedFollower, ngrokAPI]);

  useEffect(() => {
    const p = gameData?.points ?? 0;
    if (p >= 30000) { setLeague("OLYMPIAN"); setBadgeImage(images.Olympian); }
    else if (p >= 20000) { setLeague("TITAN"); setBadgeImage(images.titan); }
    else if (p >= 12000) { setLeague("SKIPPER"); setBadgeImage(images.skipper); }
    else if (p >= 5000) { setLeague("PILOT"); setBadgeImage(images.pilot); }
    else if (p >= 1000) { setLeague("PRIVATE"); setBadgeImage(images.Private); }
    else { setLeague("NOVICE"); setBadgeImage(images.novice); }
  }, [gameData]);

  const toggleFollow = async () => {
    try {
      if (!userData?._id || !targetUser?._id) return;
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const resp = await axios.post(`${ngrokAPI}/${endpoint}`, {
        userId: userData._id,
        targetId: targetUser._id
      });
      if (resp.data?.status !== 'success') return;

      if (endpoint === 'follow') {
        axios.post(`${ngrokAPI}/createNotification`, {
          type: 'follow',
          from: userData._id,
          owner: targetUser._id,
          userProfileImageUrl: userData.profileImage,
          username: userData.username,
          message: 'has requested to follow'
        }).catch(() => {});
        setIsFollowing(true);
        setIsApprovedFollower(false);
      } else {
        setIsFollowing(false);
        setIsApprovedFollower(false);
        setPosts([]);
      }
    } catch (e) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, e);
    }
  };

  const canViewProfilePicture = () => userData?._id === targetId || (isFollowing && isApprovedFollower);
  const canViewProfileContent = () => userData?._id === targetId || (isFollowing && isApprovedFollower);
  const canViewPosts = () => userData?._id === targetId || isApprovedFollower;

  if (loading) {
    return (
      <SafeAreaView className="bg-black flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-4">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!targetUser || !targetId) {
    return (
      <SafeAreaView className="bg-black flex-1 justify-center items-center">
        <Text className="text-white text-lg">User not found</Text>
        <TouchableOpacity className="mt-4 bg-gray-800 px-4 py-2 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <Image source={icons.arrow} style={{ width: 18, height: 18 }} />
          <Text className="text-white px-2 font-poppins-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <View style={{ width: 32 }} />
      </View>

      <View className="flex-row items-center justify-between mt-4">
        {canViewProfilePicture() && canUseRemoteImage(targetUser.profileImage) ? (
          <Image source={{ uri: targetUser.profileImage }} className="w-28 h-28 rounded-full" />
        ) : (
          <View className="w-28 h-28 rounded-full bg-gray-700 justify-center items-center">
            <Text className="text-white text-3xl font-bold">
              {targetUser.username ? targetUser.username.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}

        <TouchableOpacity className="mt-12 pr-28" onPress={toggleFollow}>
          {isFollowing ? (
            isApprovedFollower ? (
              <Image source={icons.followedIcon} className="h-10 w-10" />
            ) : (
              <View className="px-3 py-1">
                <Text className="text-[#94ACAB] font-poppins-semibold text-[15px]">Requested</Text>
              </View>
            )
          ) : (
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
        <Text className="text-3xl font-bold text-white">{targetUser.username || "User"}</Text>
        <Text className="text-3xl text-blue-400">{gameData?.streak ?? 0}</Text>
      </View>

      <View className="flex-row justify-around mt-6 border-b border-gray-600 pb-2">
        {(['POSTS', 'PLAYLISTS', 'LEAGUE'] as const).map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text className={`text-lg ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>{tab}</Text>
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
            {activeTab === 'POSTS' && (canViewPosts() ? (
              posts.length > 0 ? (
                <PostScreen posts={posts} showImages={canViewProfilePicture()} />
              ) : (
                <View className="flex-1 justify-center items-center mt-8">
                  <Text className="text-gray-500 italic">This user hasn't posted anything yet.</Text>
                </View>
              )
            ) : (
              <View className="flex-1 justify-center items-center mt-20">
                <Image source={icons.privateIcon} className="h-10 w-10" resizeMode="contain" />
                <Text className="text-white mt-6 font-poppins-semibold text-[13px]">
                  Follow {targetUser.username}'s account to see posts.
                </Text>
              </View>
            ))}

            {activeTab === 'PLAYLISTS' && (
              <View className="flex-1 justify-center items-center mt-8">
                <Text className="text-gray-500 italic">No playlists created.</Text>
              </View>
            )}

            {activeTab === 'LEAGUE' && (
              <View className="flex-1 mt-4">
                {gameData?.points != null ? (
                  <LeagueScreen userXP={gameData.points} League={league ?? 'NOVICE'} />
                ) : (
                  <Text className="text-gray-500 text-center">Loading League...</Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 justify-center items-center mt-20">
            <Image source={icons.privateIcon} className="h-10 w-10" resizeMode="contain" />
            <Text className="text-white mt-6 font-poppins-semibold text-[13px]">
              Follow {targetUser.username}'s account to see posts.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
