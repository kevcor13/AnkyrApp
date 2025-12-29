import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/GlobalProvider";
import { router } from "expo-router";
import axios from "axios";
import icons from "@/constants/icons";
import { Icon } from '@/assets/icons/mealPageIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Meal {
  _id: string;
  title: string;
  imageUrl?: string;
  prepTime?: number;
  servings?: number;
  calories?: number;
  protein?: number;
}

const SearchMeal = () => {
  const { ngrokAPI } = useGlobal();

  const [searchQuery, setSearchQuery] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  // debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search when the query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length === 0) {
      setMeals([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchMeals();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Function to search for meals
  const searchMeals = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.post(`${ngrokAPI}/api/meals/searchMeals`, {
        token,
        query: searchQuery.trim(),
      });

      if (response.data.status === "success") {
        setMeals(response.data.data || []);
      }
    } catch (error) {
      console.error("Error searching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to meal detail
  const navigateToMeal = (mealId: string) => {
    router.push({ pathname: '/MealDetail', params: { mealId }});
  };

  return (
    <SafeAreaView className="bg-[#050505] flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
            <Icon name="backArrow" size={20} color="#FFF" />
          <Text className="text-white px-2 font-poppins-semibold text-lg">Back</Text>
        </TouchableOpacity>

        <View>
          <Text className="text-zinc-500 font-poppins-medium text-xs uppercase tracking-[3px] mb-1">
            Discover
          </Text>
          <Text className="font-poppins-bold text-white text-4xl tracking-tighter">
            Search meals.
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="bg-zinc-900/50 border border-white/10 rounded-[24px] flex-row items-center px-5 py-4">
          <Icon name="search" size={20} color="#71717A" />
          <TextInput
            className="flex-1 text-white font-poppins-medium text-base ml-3"
            placeholder="Search for meals..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close" size={20} color="#71717A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <View className="flex-1 bg-[#F2F2F7] rounded-t-[50px] pt-6">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : (
          <FlatList
            data={meals}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center mt-20">
                <View className="bg-white rounded-full p-8 mb-6">
                  <Icon name="search" size={48} color="#D4D4D8" />
                </View>
                <Text className="text-zinc-400 text-lg font-poppins-semibold mb-2">
                  {searchQuery.trim().length > 0 ? "No meals found" : "Start searching"}
                </Text>
                <Text className="text-zinc-400 text-sm font-poppins text-center px-8">
                  {searchQuery.trim().length > 0 
                    ? "Try a different search term" 
                    : "Enter a meal name to find recipes"}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-white rounded-[30px] mb-4 overflow-hidden border border-black/5"
                style={{ 
                  shadowColor: '#000', 
                  shadowOffset: { width: 0, height: 4 }, 
                  shadowOpacity: 0.1, 
                  shadowRadius: 10 
                }}
                onPress={() => navigateToMeal(item._id)}
              >
                <View className="flex-row">
                  {/* Image */}
                  <View className="w-28 h-28">
                    {item.imageUrl ? (
                      <Image 
                        source={{ uri: item.imageUrl }} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-zinc-200 justify-center items-center">
                        <Icon name="heart" size={32} color="#D4D4D8" />
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View className="flex-1 p-4 justify-center">
                    <Text className="text-zinc-900 font-poppins-bold text-lg mb-2" numberOfLines={2}>
                      {item.title}
                    </Text>
                    
                    {/* Metadata */}
                    <View className="flex-row items-center flex-wrap">
                      {item.prepTime && (
                        <View className="flex-row items-center mr-4 mb-1">
                          <Icon name="clock" size={14} color="#71717A" />
                          <Text className="text-zinc-500 font-poppins-medium text-xs ml-1">
                            {item.prepTime} min
                          </Text>
                        </View>
                      )}
                      {item.calories && (
                        <View className="flex-row items-center mr-4 mb-1">
                          <Icon name="fire" size={14} color="#71717A" />
                          <Text className="text-zinc-500 font-poppins-medium text-xs ml-1">
                            {item.calories} cal
                          </Text>
                        </View>
                      )}
                      {item.protein && (
                        <View className="flex-row items-center mb-1">
                          <Text className="text-zinc-500 font-poppins-semibold text-xs">
                            {item.protein}g protein
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchMeal;