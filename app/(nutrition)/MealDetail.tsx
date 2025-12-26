import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';
import { Icon } from '@/assets/icons/mealPageIcons';
import { LinearGradient } from 'expo-linear-gradient';

// ----- Types -----
interface Meal {
  _id: string;
  title: string;
  imageUrl: string;
  timeMinutes: number;
  ingredients: string[];
  instructions: string[];
}

// ----- Helpers -----
function ensureString(param: string | string[] | undefined): string | undefined {
  if (param == null) return undefined;
  return Array.isArray(param) ? param[0] : param;
}

const PLACEHOLDER_IMG = 'https://placehold.co/800x500/cccccc/ffffff?text=No+Image';

function normalizeMeal(raw: any): Meal {
  // Normalize ingredients: supports strings or objects with a 'text' property
  const ingredients: string[] = Array.isArray(raw?.ingredients)
    ? raw.ingredients
        .map((it: any) => (typeof it === 'string' ? it : it?.text))
        .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    : [];

  // Normalize instructions: supports strings or objects with a 'step' property
  const instructions: string[] = Array.isArray(raw?.instructions)
    ? raw.instructions
        .map((it: any) => (typeof it === 'string' ? it : it?.step))
        .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    : [];

  const timeNum = Number(raw?.timeMinutes);
  return {
    _id: String(raw?._id || ''),
    title: String(raw?.title || 'Untitled Meal'),
    imageUrl: typeof raw?.imageUrl === 'string' && raw.imageUrl.trim().length ? raw.imageUrl : PLACEHOLDER_IMG,
    timeMinutes: Number.isFinite(timeNum) ? timeNum : 0,
    ingredients,
    instructions,
  };
}

const MealDetail = () => {
  const params = useLocalSearchParams<{ mealId?: string | string[] }>();
  const mealId = ensureString(params.mealId);
  const { ngrokAPI, userData } = useGlobal();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchMealDetails = async () => {
      if (!mealId) {
        setError('Meal ID not found.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.post(`${ngrokAPI}/api/meals/getMealById`, { mealId });
        if (response?.data?.status === 'success' && response?.data?.data) {
          setMeal(normalizeMeal(response.data.data));
        } else {
          throw new Error('Failed to fetch meal details.');
        }
      } catch (err: any) {
        setError(err?.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFavoriteStatus = async () => {
      if (!mealId || !userData?._id) return;
      try {
        const response = await axios.post(`${ngrokAPI}/api/meals/hasFavoriteMeal`, {
          userId: userData._id,
          mealId,
        });
        if (response?.data?.status === 'success') {
          setIsFavorited(response.data.favorite);
        }
      } catch (err) {
        console.error('Error checking favorite status:', err);
      } 
    };

    fetchFavoriteStatus();
    fetchMealDetails();
  }, [mealId, ngrokAPI]);

  const handleToggleFavorite = () => {
    const userId = userData._id; 
    if(isFavorited){
      axios.post(`${ngrokAPI}/api/meals/removeFavMeal`, { userId, mealId });
      setIsFavorited(false);
    } else {
      axios.post(`${ngrokAPI}/api/meals/addFavoriteMeal`, { userId, mealId});
      setIsFavorited(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#050505] justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  if (error || !meal) {
    return (
      <SafeAreaView className="flex-1 bg-[#050505] justify-center items-center px-10">
        <Text className="text-red-400 font-poppins-medium text-center mb-6">{error || 'Meal not found.'}</Text>
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="bg-white px-8 py-3 rounded-full"
        >
          <Text className="text-black font-poppins-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[#050505]">
      <LinearGradient
        colors={['#000000', '#000000', 'transparent']}
        locations={[0, 0.43, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 40 }}
      />
      {/* HEADER */}
      <SafeAreaView className="absolute top-1 left-0 right-0 z-50">
        <View className="px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-12 h-12 rounded-full bg-black/30 border border-white/20 items-center justify-center backdrop-blur-xl"
          >
            <Icon name="backArrow" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleToggleFavorite}
            className="w-12 h-12 rounded-full bg-black/30 border border-white/20 items-center justify-center backdrop-blur-xl"
          >
            <Icon name="heart" size={22} color={isFavorited ? '#FF2D55' : '#FFF'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 , paddingTop: 60}} 
      >
        {/* Hero Section */}
        <View className="px-5 pt-4">
          <View className="relative w-full h-[450px] rounded-[55px] overflow-hidden shadow-2xl">
            <Image source={{ uri: meal.imageUrl }} className="w-full h-full" resizeMode="cover" />
            
            <View className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-3xl px-6 py-3 rounded-[24px] border border-white/10">
              <Text className="text-white font-poppins-bold text-xs tracking-[2px]">
                {meal.timeMinutes > 0 ? `${meal.timeMinutes} MINS` : 'QUICK MEAL'}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-8 py-10">
          <Text className="text-[#A1FF00] font-poppins-semibold text-[10px] uppercase tracking-[5px] mb-3">Chef Selection</Text>
          <Text className="text-white font-poppins-bold text-4xl tracking-tighter leading-[48px] mb-10">
            {meal.title}
          </Text>

          {/* Ingredients Slab */}
          <View className="bg-zinc-900/80 border border-white/10 rounded-[45px] p-8 mb-10 shadow-sm">
            <View className="flex-row items-center mb-6">
                <View className="w-1.5 h-6 bg-[#A1FF00] rounded-full mr-3" />
                <Text className="text-white font-poppins-bold text-2xl">Ingredients</Text>
            </View>
            
            {meal.ingredients.map((ingredient, idx) => (
              <View key={`ing-${idx}`} className="flex-row items-center mb-5">
                <View className="w-2 h-2 rounded-full bg-[#A1FF00] mr-4 shadow-[0_0_10px_#A1FF00]" />
                <Text className="text-zinc-300 font-poppins-medium text-base flex-1">
                  {ingredient}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions Timeline Section */}
          <View className="px-1">
            <Text className="text-white font-poppins-bold text-2xl mb-8">Preparation</Text>
            
            {meal.instructions.length === 0 ? (
              <Text className="text-zinc-500 font-poppins-medium">No instructions provided.</Text>
            ) : (
              meal.instructions.map((instruction, idx) => (
                <View key={`step-${idx}`} className="flex-row min-h-[80px]">
                  {/* Left Column: Number and Connector Line */}
                  <View className="mr-6 items-center">
                    <View className="w-12 h-12 rounded-[20px] bg-white items-center justify-center shadow-lg z-10">
                      <Text className="text-black font-poppins-bold text-xl">{idx + 1}</Text>
                    </View>
                    
                    {/* The connector line logic: Only show if not the last item */}
                    {idx !== meal.instructions.length - 1 && (
                      <View className="w-[2px] flex-1 bg-zinc-800/60 my-2 rounded-full" />
                    )}
                  </View>

                  {/* Right Column: Instruction Text */}
                  <View className="flex-1 pb-10">
                    <Text className="text-zinc-400 font-poppins-medium text-[17px] leading-7">
                      {instruction}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MealDetail;