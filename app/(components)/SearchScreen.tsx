import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useRef } from "react";
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
}

interface FriendEntry {
  id: string;
  username: string;
  avatar: string;
  requestStatus: boolean | null; // true = accepted, null/false = pending
}

type FollowState = "following" | "requested" | "follow";

const SearchScreen = () => {
  // Normalize query (can be string or string[])
  const { query } = useLocalSearchParams<{ query?: string | string[] }>();
  const initialQuery = Array.isArray(query) ? query[0] ?? "" : query ?? "";

  const { userData, ngrokAPI, fetchFriends } = useGlobal();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Single friends list from global helper
  const [friendsList, setFriendsList] = useState<FriendEntry[]>([]);

  // Map of userId -> follow state label
  const [followStatus, setFollowStatus] = useState<Record<string, FollowState>>({});

  // debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load current user's friends once we know who the current user is
  useEffect(() => {
    (async () => {
      try {
        if (!userData?._id) return;
        const friends = (await fetchFriends?.()) ?? [];
        setFriendsList(friends);
      } catch (e) {
        console.error("Error loading friends:", e);
      }
    })();
  }, [userData?._id, fetchFriends]);

  // Debounced search when the query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length === 0) {
      setUsers([]);
      setFollowStatus({});
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchUsers();
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Re-compute followStatus whenever search results OR friends list changes
  useEffect(() => {
    const statusObj: Record<string, FollowState> = {};
    for (const u of users) {
      if (u._id === userData?._id) {
        // don't show a button for yourself; mark as following to disable button
        statusObj[u._id] = "following";
        continue;
      }
      const entry = friendsList.find((f) => f.id === u._id);
      if (!entry) {
        statusObj[u._id] = "follow";
      } else if (entry.requestStatus === true) {
        statusObj[u._id] = "following";
      } else {
        statusObj[u._id] = "requested";
      }
    }
    setFollowStatus(statusObj);
  }, [users, friendsList, userData?._id]);

  // Function to search for users
  const searchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.post(`${ngrokAPI}/searchUsers`, {
        token,
        query: searchQuery.trim(),
      });

      if (response.data.status === "success") {
        // hide myself from results
        const list: User[] = (response.data.data || []).filter((u: User) => u._id !== userData?._id);
        setUsers(list);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow/unfollow a user (request/cancel)
  const toggleFollow = async (targetId: string) => {
    try {
      if (!userData?._id) {
        console.error("No user ID available");
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const current = followStatus[targetId] ?? "follow";
      const endpoint = current === "follow" ? "follow" : "unfollow";

      const response = await axios.post(`${ngrokAPI}/${endpoint}`, {
        userId: userData._id,
        targetId,
      });

      if (response.data.status === "success") {
        // Optimistic update in UI
        setFollowStatus((prev) => {
          if (endpoint === "follow") {
            return { ...prev, [targetId]: "requested" };
          } else {
            return { ...prev, [targetId]: "follow" };
          }
        });

        // Refresh friends list to stay consistent
        try {
          const freshFriends = (await fetchFriends?.()) ?? [];
          setFriendsList(freshFriends);
        } catch {}
      }
    } catch (error) {
      console.error(
        `Error ${followStatus[targetId] === "follow" ? "following" : "unfollowing"} user:`,
        error
      );
    }
  };

  // Navigate to user's profile
  const navigateToProfile = (userId: string) => {
    router.push(`/(components)/UserProfile?userId=${userId}`);
  };

  return (
    <SafeAreaView className="bg-black flex-1 p-4">
      <TouchableOpacity onPress={() => router.back()} className="flex-row">
        <Image
          source={typeof icons.arrow === "string" ? { uri: icons.arrow } : icons.arrow}
          style={{ width: 24, height: 24 }}
        />
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
          autoCapitalize="none"
          autoCorrect={false}
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
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-400 text-lg">
                {searchQuery.trim().length > 0 ? "No users found" : "Enter a username to search"}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const status: FollowState = followStatus[item._id] ?? "follow";
            const label = status === "following" ? "Following" : status === "requested" ? "Requested" : "Follow";
            const bgClass =
              status === "following" ? "bg-gray-700" : status === "requested" ? "bg-yellow-600" : "bg-blue-600";

            return (
              <TouchableOpacity
                className="flex-row items-center justify-between bg-gray-900 p-4 rounded-lg mb-3"
                onPress={() => navigateToProfile(item._id)}
              >
                <View className="flex-row items-center">
                  {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} className="w-12 h-12 rounded-full bg-gray-700" />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-gray-700 justify-center items-center">
                      <Text className="text-white text-lg font-bold">
                        {item.username ? item.username.charAt(0).toUpperCase() : "?"}
                      </Text>
                    </View>
                  )}
                  <Text className="text-white text-lg ml-3">{item.username}</Text>
                </View>

                {item._id !== userData?._id && (
                  <TouchableOpacity
                    className={`py-2 px-4 rounded-full ${bgClass}`}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent navigating to profile
                      toggleFollow(item._id);
                    }}
                  >
                    <Text className="text-white font-medium">{label}</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
