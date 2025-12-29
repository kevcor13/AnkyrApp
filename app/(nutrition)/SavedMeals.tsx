import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';
import { Icon } from '@/assets/icons/mealPageIcons'; // Using your SVG component
import { LinearGradient } from 'expo-linear-gradient';

interface Meal {
  _id: string;
  title: string;
  imageUrl?: string;
}

const SavedMeals = () => {
  const { ngrokAPI, userData } = useGlobal();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = userData?._id;
    if (!userId) {
      setError('User not found. Please sign in again.');
      setLoading(false);
      return;
    }

    const fetchSavedMeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${ngrokAPI}/api/meals/getSavedMeals`, { userId });

        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
          setMeals(response.data.data);
        } else {
          setMeals([]);
          throw new Error(response.data?.message || 'Failed to fetch saved meals.');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedMeals();
  }, [ngrokAPI, userData]);

  const renderMealCard = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/MealDetail', params: { mealId: item._id } })}
      className="relative w-full h-72 rounded-[48px] overflow-hidden mb-6 bg-zinc-900 border border-white/10"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      }}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Available' }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />
      
      {/* Subtle Darkening Overlay */}
      <View className="absolute inset-0 bg-black/10" />

      {/* iOS 26 Floating Glass Info Bar */}
      <View 
        className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-3xl rounded-[32px] border border-white/20 p-5 flex-row justify-between items-center"
      >
        <View className="flex-1 mr-4">
          <Text className="text-white font-poppins-bold text-lg tracking-tight" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-white/50 font-poppins-medium text-[10px] uppercase tracking-widest mt-1">
            Personal Collection
          </Text>
        </View>
        
        <View className="w-15 h-15 rounded-full items-center justify-center">
          <Icon name="fowardArrow" size={40} color="#FFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#050505]">
      <LinearGradient
        colors={['#000000', '#000000', 'transparent']}
        locations={[0, 0.43, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 40 }}
      />
      {/* Futuristic Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-12 h-12 rounded-full bg-zinc-800/50 border border-white/10 items-center justify-center"
        >
          <Icon name="backArrow" size={32} color="#FFF" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-zinc-500 font-poppins-medium text-[10px] uppercase tracking-[3px]">Collection</Text>
          <Text className="text-white font-poppins-bold text-2xl tracking-tighter">Saved Meals</Text>
        </View>

        {/* Themed Icon for balance */}
        <View className="w-12 h-12 rounded-full items-center justify-center bg-zinc-900 border border-white/5">
           <Icon name="heart" size={20} color="#FF2D55" />
        </View>
      </View>
      </SafeAreaView>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-zinc-500 font-poppins-medium mt-4">Opening your vault...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="bg-red-500/10 p-8 rounded-[40px] border border-red-500/20 items-center w-full">
            <Text className="text-red-400 font-poppins-semibold text-center">{error}</Text>
            <TouchableOpacity 
                onPress={() => router.back()}
                className="mt-6 bg-white px-8 py-3 rounded-full"
            >
                <Text className="text-black font-poppins-bold">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : meals.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 bg-zinc-900 rounded-full items-center justify-center mb-6 border border-white/10">
            <Icon name="heart" size={32} color="#333" />
          </View>
          <Text className="text-zinc-400 font-poppins-semibold text-xl text-center">Your vault is empty</Text>
          <Text className="text-zinc-600 font-poppins-medium text-center mt-2">
            Start saving recipes to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 130, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default SavedMeals;