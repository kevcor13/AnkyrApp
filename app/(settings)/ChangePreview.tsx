import { View, Text, TouchableOpacity, SafeAreaView, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

interface UserImage {
  _id: string;
  image: string;
  url: string;
  createdAt: string;
  UserID: string;
}

interface PreviewPicture {
  url: string;
  uploadedAt: string;
}

const ChangePreview = () => {
  const { userData, ngrokAPI } = useGlobal();
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [currentPreviews, setCurrentPreviews] = useState<PreviewPicture[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!userData?._id) {
      console.error('No user ID available');
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error('No authentication token found');
        router.replace('/');
        return;
      }

      // Fetch user's images
      const imagesResponse = await axios.post(`${ngrokAPI}/UserImages`, { 
        token, 
        UserID: userData._id 
      });
      
      if (imagesResponse.data.status === 'success') {
        // Filter out blurred images (less than 5 minutes old)
        const now = new Date();
        const availableImages = imagesResponse.data.data.filter((img: UserImage) => {
          const createdDate = new Date(img.createdAt);
          const diffInMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
          return diffInMinutes >= 5;
        });
        setUserImages(availableImages);
      }

      // Fetch current preview pictures
      const userResponse = await axios.post(`${ngrokAPI}/getUserById`, { 
        token, 
        userId: userData._id 
      });
      
      if (userResponse.data.status === 'success') {
        const previews = userResponse.data.data.previewPictures || [];
        setCurrentPreviews(previews);
        setSelectedImages(previews.map((p: PreviewPicture) => p.url));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        // Deselect
        return prev.filter(url => url !== imageUrl);
      } else {
        // Select (max 3)
        if (prev.length >= 3) {
          Alert.alert('Limit Reached', 'You can only select up to 3 preview pictures');
          return prev;
        }
        return [...prev, imageUrl];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.post(`${ngrokAPI}/api/update/updatePreviewPictures`, {
        token,
        userId: userData._id,
        previewPictures: selectedImages.map(url => ({
          url,
          uploadedAt: new Date().toISOString()
        }))
      });
      console.log('Save response:', response.data);
      if (response.data.status === 'success') {
        Alert.alert('Success', 'Preview pictures updated!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update preview pictures');
      }
    } catch (error) {
      console.error('Error saving preview pictures:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupedImages = userImages.reduce((acc: Record<string, UserImage[]>, img) => {
    const date = formatDate(img.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(img);
    return acc;
  }, {});

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-xl font-poppins-semibold">&larr; Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-poppins-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-4 mt-6">
        <Text className="text-white text-3xl font-poppins-semibold">Choose Preview Pictures</Text>
        <Text className="text-gray-400 mt-2 font-poppins-regular">
          Select up to 3 pictures ({selectedImages.length}/3 selected)
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : userImages.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-white text-lg text-center font-poppins-regular">
            No available pictures. Take some pictures first!
          </Text>
        </View>
      ) : (
        <ScrollView className="mt-6 px-4" showsVerticalScrollIndicator={false}>
          {Object.entries(groupedImages).map(([date, images]) => (
            <View key={date} className="mb-6">
              <Text className="text-white text-base mb-2 font-poppins-regular">{date}</Text>
              <View className="flex-row flex-wrap gap-3">
                {images.map((img) => {
                  const isSelected = selectedImages.includes(img.image);
                  return (
                    <TouchableOpacity
                      key={img._id}
                      onPress={() => toggleImageSelection(img.image)}
                      activeOpacity={0.8}
                    >
                      <View className={`w-36 h-48 rounded-lg overflow-hidden ${
                        isSelected ? 'border-4 border-blue-500' : 'border border-gray-700'
                      }`}>
                        <Image
                          source={{ uri: img.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                        {isSelected && (
                          <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 justify-center items-center">
                            <Text className="text-white font-bold text-xs">✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ChangePreview;