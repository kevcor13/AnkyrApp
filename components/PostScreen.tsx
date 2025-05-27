import React from "react";
import { View, ScrollView } from "react-native";
import PostCard from "@/components/PostCard";

interface Post {
    _id: string;
    username: string;
    content: string;
    imageUrl: string;
    userProfileImageUrl: string;
    createdAt: string;
    UserId: string;
}

interface PostScreenProps {
    posts: Post[];
}

const PostScreen: React.FC<PostScreenProps> = ({ posts }) => {
    return (
        <ScrollView contentContainerStyle={{ paddingVertical: 20}}>
            <View className="mb-6">
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
            </View>
        </ScrollView>
    );
};

export default PostScreen;