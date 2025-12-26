import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';
import { Icon } from '@/assets/icons/mealPageIcons'; 
import { LinearGradient } from 'expo-linear-gradient';

interface Meal {
  _id: string;
  title: string;
  imageUrl?: string;
}

function ensureString(param: string | string[] | undefined): string | undefined {
  if (param == null) return undefined;
  return Array.isArray(param) ? param[0] : param;
}

const FilteredMeals = () => {
  const params = useLocalSearchParams<{ filterType?: string | string[]; filterValue?: string | string[] }>();
  const filterType = ensureString(params.filterType);
  const filterValue = ensureString(params.filterValue);

  const { ngrokAPI } = useGlobal();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerTitle = useMemo(() => {
    if (!filterValue) return 'Filtered';
    return filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  }, [filterValue]);

  useEffect(() => {
    if (!filterType || !filterValue) {
      setError('Filter criteria is missing.');
      setLoading(false);
      return;
    }

    const fetchFilteredMeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${ngrokAPI}/api/meals/getFilteredRecipes`, {
          filterType,
          filterValue,
        });

        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
          setMeals(response.data.data);
        } else {
          setMeals([]);
          throw new Error(response.data?.message || 'Failed to fetch meals.');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMeals();
  }, [filterType, filterValue, ngrokAPI]);

  // --- iOS 26 Styled Meal Card ---
  const renderMealCard = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/MealDetail', params: { mealId: item._id } })}
      className="relative w-full h-80 rounded-[48px] overflow-hidden mb-10 border border-white/5 bg-zinc-900 shadow-2xl"
    >
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Available' }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />
      
      {/* Dark tint for text clarity */}
      <View className="absolute inset-0 bg-black/10" />

      {/* Futuristic Bottom Glass Panel */}
      <View className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-2xl rounded-[35px] border border-white/20 p-5 flex-row justify-between items-center">
        <View className="flex-1 mr-4">
          <Text className="text-white font-poppins-bold text-xl tracking-tight" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-white/60 font-poppins-medium text-[10px] uppercase tracking-[3px] mt-1">
            View Recipe
          </Text>
        </View>
        
        <View className="bg-white w-12 h-12 rounded-full items-center justify-center">
          <Icon name="rightArrow" size={20} color="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#050505]">
      {/* 1. TOP SHADOWY LAYER (Hides the Island) */}
      <LinearGradient
        colors={['#000000', '#000000', 'transparent']}
        locations={[0, 0.43, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 40 }}
      />

      {/* 2. FLOATING HEADER */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-12 h-12 rounded-full bg-white/10 border border-white/10 items-center justify-center backdrop-blur-xl"
          >
            <Icon name="backArrow" size={20} color="#FFF" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-zinc-500 font-poppins-medium text-[9px] uppercase tracking-[4px] mb-1">Catalog</Text>
            <Text className="text-white font-poppins-bold text-2xl tracking-tighter">{headerTitle}</Text>
          </View>

          <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 border border-white/10 items-center justify-center backdrop-blur-xl">
            <Image source={icons.searchIcon} className="w-5 h-5" style={{ tintColor: 'white' }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 3. CONTENT AREA */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A1FF00" />
          <Text className="text-zinc-500 font-poppins-medium mt-4 tracking-widest text-xs uppercase">Curating Vault...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="bg-red-500/10 p-8 rounded-[40px] border border-red-500/20 items-center">
            <Text className="text-red-400 font-poppins-semibold text-center leading-6">{error}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item._id}
          // Added large paddingTop (130) so the first item isn't hidden by the floating header
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 130, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-zinc-500 font-poppins-medium text-lg text-center">The vault is currently empty.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default FilteredMeals;