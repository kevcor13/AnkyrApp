import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import axios from "axios";
import icons from '@/constants/icons'
import images from '@/constants/images'
import {useGlobal} from "@/context/GlobalProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Notification {
    _id: string;
    type: string;        // e.g. "like"
    from: string;        // who liked it
    owner: string;       // whose photo it was
    message: string;     // optional extra text
    username: string;
    userProfileImageUrl: string;
    imageUrl: string;    // the liked image URL
    read: boolean;
    createdAt: string;
}
interface UserData {
    _id: string;
    username: string;
    profileImage: string;
    followers: string[];
    following: string[];
}

interface NotificationScreenProps {
    notifications: Notification[];
    refreshNotifications: () => Promise<void>; // New prop for refreshing
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ notifications, refreshNotifications }) => {
    const { userData, ngrokAPI } = useGlobal();
    const [targetUser, setTargetUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true)

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
                    userId: notifications[0].from,
                });
                if (userResponse.data.status === 'success') {
                    setTargetUser(userResponse.data.data);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (notifications[0].from) {
            fetchUserData();
        }
    }, [notifications[0].from]);

    const formatTimestamp = (isoString: string) => {
        const created = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (diffMs < oneDayMs) {
            // under 24h: show time only
            return created.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } else {
            // 24h+: show date only
            return created.toLocaleDateString();
        }
    };

    const handleAccept = async (fromId: string, id: string, targetUsername: string, profileImage: string) => {
        try {
            const userId = userData._id;
            const targetId = fromId;
            const accept = true;
            const notificationId = id;
            const response = await axios.post(`${ngrokAPI}/response`, { userId, targetId, accept });
            const res = await axios.post(`${ngrokAPI}/deleteNotification`, {notificationId} );
            await axios.post(`${ngrokAPI}/createNotification`, {
                type: 'accept',
                from: targetId,
                owner: userData._id,
                userProfileImageUrl: profileImage,
                username: targetUsername,
                message: `is now following you`
            });
            await axios.post(`${ngrokAPI}/createNotification`, {
                type: 'accept',
                from: userData._id,
                owner: targetId,
                userProfileImageUrl: userData.profileImage,
                username: userData.username,
                message: `has accepted your following request`
            });
            await refreshNotifications();

            console.log(response.data);
            console.log(fromId, 'accepted');

            // Refresh notifications after accepting
            await refreshNotifications();
        } catch (error) {
            console.error(`Error accepting follow from ${fromId}:`, error);
        }
    };

    const handleReject = async (fromId: string, id: string) => {
        try {
            const userId = userData._id;
            const targetId = fromId;
            const accept = false;
            const notificationId = id;

            // Make API calls
            const response = await axios.post(`${ngrokAPI}/response`, { userId, targetId, accept });
            const res = await axios.post(`${ngrokAPI}/deleteNotification`, {notificationId} );

            // Refresh notifications to update the UI
            await refreshNotifications();
        } catch (error) {
            console.error(`Error rejecting follow from ${fromId}:`, error);
        }
    };

    return (
        <ScrollView className="flex-1 bg-black pt-4">
            {notifications.length > 0 ? (
                notifications.map((n) => (
                    <View key={n._id} className="mb-6 rounded-2xl overflow-hidden">
                        <View className="flex-row items-center px-4 py-3">
                            <TouchableOpacity className="">
                                <Image
                                    source={n.userProfileImageUrl ? {uri: n.userProfileImageUrl} : null}
                                    className="w-12 h-12 rounded-full mr-3"
                                />
                            </TouchableOpacity>
                            <Text className="text-white font-medium flex-1">
                                {n.username} {n.message}  <Text className="text-gray-500">{formatTimestamp(n.createdAt)}</Text>
                            </Text>
                            {n.type === 'like' || n.type === 'accept' ? (
                                <>
                                    <Image
                                        source={{ uri: n.imageUrl }}
                                        className="w-10 h-10"
                                        resizeMode="cover"
                                    />
                                </>
                            ) : (
                                <>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            onPress={() => handleAccept(n.from, n._id, n.username, n.userProfileImageUrl)}
                                            className="px-3 py-1 "
                                        >
                                            <Image source={images.followButton} className="w-6 h-6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleReject(n.from, n._id)}
                                            className="px-3 py-1 "
                                        >
                                            <Image source={icons.deniedIcon} className="w-6 h-6" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                ))
            ) : (
                <View className="flex-1 justify-center items-center mt-20">
                    <Text className="text-gray-500 italic">No notifications yet</Text>
                </View>
            )}
        </ScrollView>
    );
};

export default NotificationScreen;