// PostCard.tsx
import React, {useEffect, useState} from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useGlobal } from "@/context/GlobalProvider";
import icons from "../constants/icons";
import { router } from "expo-router";
import * as Notifications from 'expo-notifications';
import axios from "axios";
import images from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PostCardProps {
    post: {
        _id: string;
        username: string;
        content: string;
        imageUrl: string;
        userProfileImageUrl: string;
        createdAt: string;
        UserId: string;
    };
}
interface UserData {
    _id: string;
    username: string;
    profileImage: string;
    followers: string[];
    following: string[];
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { userData, ngrokAPI } = useGlobal();
    const [targetUser, setTargetUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true)
    const [liked, setLiked] = useState(false);

    const fetchLikeStatus = async () => {
        try {
            const {data} = await axios.post(
                `${ngrokAPI}/hasLiked`,
                { postId: post._id, likedUser: userData._id }
            );
            // @ts-ignore
            if (data.status === 'success') {
                setLiked(data.liked);
            } else {
                console.error('Failed to fetch like status:', data);
            }
        } catch (err) {
            console.error('Error calling /hasLiked:', err);
        }
    };

    // 3. Call it once on mount (or whenever post/user changes):
    useEffect(() => {
        if (post._id && userData?._id) {
            fetchLikeStatus();
        }
    }, [post._id, userData]);

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
                    userId: post.UserId
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

        if (post.UserId) {
            fetchUserData();
        }
    }, [post.UserId]);

    const toggleLike = async () => {
        const postId = post._id;
        const postOwner = post.UserId;
        const me = userData._id;

        if (!liked) {
            try {
                setLiked(true);

                // 1) call your backend
                await axios.post(`${ngrokAPI}/like`, { postId, postOwner, likedUser: me });

                // 2) schedule a local notification banner
                if (postOwner !== me) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'New Like!',
                            body: `${userData.username} liked your post.`,
                            data: { postId },
                        },
                        trigger: null,
                    });
                }
                await axios.post(`${ngrokAPI}/createNotification`, {
                    type: 'like',
                    from: userData._id,
                    owner: post.UserId,
                    imageUrl: post.imageUrl,
                    username: userData.username,
                    userProfileImageUrl: userData.profileImage,
                    message: ` liked your post`
                });

            } catch (err) {
                console.error(err);
                setLiked(false);
            }
        } else {
            try {
                setLiked(false);
                // unlike on backend
                await axios.post(`${ngrokAPI}/unlike`, { postId, likedUser: me });
            } catch (err) {
                console.error(err);
                setLiked(true);
            }
        }
    };

    return (
        <View>
            {post.imageUrl && (
                <Image
                    source={{ uri: post.imageUrl }}
                    style={{
                        height: 600,
                        paddingLeft: 15,
                        paddingRight: 15,
                        borderWidth: 2,
                        borderRadius: 12,
                        paddingTop: 15,
                    }}
                    resizeMode="cover"
                />
            )}
            {post.content && (
                <>
                    <View className="mt-2 px-2 flex-row">
                        <Text className="text-white font-poppins-semibold text-xl px-4">
                            "{post.content}"
                        </Text>
                        <TouchableOpacity className="flex-1 flex-row-reverse pr-3" onPress={toggleLike}>
                            <Image
                                source={liked ? icons.filledHeart : icons.heart}
                                className="w-7 h-7"
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        className="mb-6 mt-2 px-5 flex-row"
                        onPress={() => router.push(`/(components)/UserProfile?userId=${post.UserId}`)}
                    >
                        <Image
                            source={targetUser?.profileImage ? {uri: targetUser.profileImage} : images.profile}
                            className="w-10 h-10 rounded-full"
                        />
                        <Text className="text-white font-poppins-semibold text-l px-4 mt-2">
                            {post.username}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default PostCard;