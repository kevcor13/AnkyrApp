import { View, Text, SafeAreaView, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import images from "@/constants/images";
import icons from "@/constants/icons";
import { router } from "expo-router";
import axios from 'axios';
import { useGlobal } from '@/context/GlobalProvider';

const Nutrition = () => {
    const {ngrokAPI} = useGlobal();
    const [featuredMeals, setFeaturedMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    // FIX: Set error state to null initially, and handle string-based errors.
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching with useEffect ---
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.post(`${ngrokAPI}/api/meals/getFeaturedRecipes`);
                
                if (response.data && Array.isArray(response.data.data)) {
                    setFeaturedMeals(response.data.data);
                } else {
                    console.log("Unexpected data format:", response.data);
                    throw new Error("Received an unexpected data format from the server.");
                }
            } catch (err: any) {
                console.error("Failed to fetch recipes:", err);
                // FIX: Set a user-friendly error message to the state
                setError(err.message || "An error occurred while fetching recipes.");
            } finally {
                // This runs whether the fetch succeeded or failed
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []); // The empty array [] ensures this effect runs only once when the component mounts.

    // --- Mock Data for other sections (can be replaced with API calls too) ---
    const goalOptions = [
        { id: '1', title: 'Build Muscle' },
        { id: '2', title: 'Weight Loss' },
        { id: '3', title: 'Energy' },
    ];
    const ingredientOptions = [
        { id: '1', title: 'Poultry' },
        { id: '2', title: 'Beef' },
        { id: '3', title: 'Seafood' },
    ];
    const dietaryPreferences = [
        { id: '1', title: 'Dairy-Free' },
        { id: '2', title: 'Gluten-Free' },
        { id: '3', title: 'Vegan' },
    ];

    // --- Render Functions ---
    const renderFeaturedMeal = ({ item }: { item: { imageUrl?: string; title: string; _id: string } }) => (
        <View className="relative mr-4 rounded-lg overflow-hidden w-64 h-44 bg-gray-300">
            <Image
                source={{ uri: item.imageUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Available' }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute top-0 left-0 p-4">
                <Text className="text-white font-poppins-bold text-2xl" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>{item.title}</Text>
            </View>
            <View className="absolute top-2 right-2">
                <TouchableOpacity>
                    <Image source={icons.heart} className="w-6 h-6" style={{tintColor: 'white'}} />
                </TouchableOpacity>
            </View>
            <View className="absolute bottom-2 right-2">
                {/* FIX: Added onPress handler to navigate to a meal detail page */}
                <TouchableOpacity 
                    className="bg-white px-4 py-2 rounded-full"
                    onPress={() => router.push({ pathname: '/MealDetail', params: { mealId: item._id }})}
                >
                    <Text className="font-poppins-medium">View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    type CategoryItem = { id: string; title: string };

    // FIX: Modified function to accept 'filterType' to pass correct data
    const renderCategoryCard = ({
        item,
        darkBackground = false,
        filterType, // Added prop
    }: {
        item: CategoryItem;
        darkBackground?: boolean;
        filterType: string; // Added type for the new prop
    }) => (
        <TouchableOpacity
            className={`mr-4 rounded-lg overflow-hidden w-36 h-24 justify-center items-center ${darkBackground ? 'bg-black' : 'bg-white'}`}
            // FIX: Correctly pass both filterType and filterValue to the next screen
            onPress={() => router.push({
                pathname: '/FilteredMeals',
                params: { filterType: filterType, filterValue: item.title }
            })}
        >
            <Text className={`font-poppins-semibold text-lg ${darkBackground ? 'text-white' : 'text-black'}`}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="bg-black flex-1">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {/* Header */}
                <View className="my-6 px-4 flex-row justify-between items-center">
                    <Text className="font-poppins-semibold text-white text-2xl">Meal plans.</Text>
                    <Image
                        source={images.meals}
                        className="w-10 h-10"
                        resizeMode="contain"
                    />
                </View>

                {/* Quick Action Icons */}
                <View className="flex-row justify-around px-6 mb-4">
                    <View className="items-center">
                        <TouchableOpacity className="p-5 rounded-full bg-white" onPress={() => router.push('/(nutrition)/generateMeal')}>
                            <Image source={icons.zap} className="w-6 h-6" />
                        </TouchableOpacity>
                        <Text className="text-white font-poppins-medium mt-2 text-center">Quick Meal</Text>
                    </View>
                    <View className="items-center">
                        <TouchableOpacity className="p-5 rounded-full bg-white">
                            <Image source={icons.heart} className="w-6 h-6" />
                        </TouchableOpacity>
                        <Text className="text-white font-poppins-medium mt-2 text-center">Saved meals</Text>
                    </View>
                    <View className="items-center">
                        <TouchableOpacity className="p-5 rounded-full bg-white">
                            <Image source={icons.searchIcon} className="w-6 h-6" />
                        </TouchableOpacity>
                        <Text className="text-white font-poppins-medium mt-2 text-center">Search</Text>
                    </View>
                </View>

                {/* Main Content Container */}
                <View className="bg-gray-200 flex-1 rounded-t-3xl p-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        <TouchableOpacity className="bg-black rounded-lg w-[142] h-[105] mr-4 p-4 justify-center flex-row-reverse">
                            <Image source={icons.progress} className="w-[34] h-[34]" />
                            <Text className="text-white font-poppins-semibold text-[20px] mt-4">My progress</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-black rounded-lg w-[142] h-[105] mr-4 p-4 justify-center flex-row-reverse">
                            <Image source={icons.calendar} className="w-[34] h-[34]" />
                            <Text className="text-white font-poppins-semibold text-[20px] mt-4 ">My{'\n'}Meal Plan</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Featured Meals Section */}
                    <View className="mb-6">
                        <Text className="font-poppins-semibold text-xl mb-4">Featured</Text>
                        {loading ? (
                            <View className="h-44 justify-center items-center">
                                <ActivityIndicator size="large" color="#000000" />
                            </View>
                        ) : error ? (
                            <View className="h-44 justify-center items-center bg-red-100 p-4 rounded-lg">
                                <Text className="text-red-700 font-poppins-semibold">Error loading meals:</Text>
                                <Text className="text-red-600 text-center mt-2">{error}</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={featuredMeals}
                                renderItem={renderFeaturedMeal}
                                keyExtractor={item => item._id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        )}
                    </View>

                    {/* By Goal */}
                    <View className="mb-6">
                        <Text className="font-poppins-semibold text-xl mb-4">By Goal</Text>
                        <FlatList
                            data={goalOptions}
                            // FIX: Pass the filterType 'goal' to the render function
                            renderItem={({item}) => renderCategoryCard({item, filterType: 'goals'})}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* By Ingredient */}
                    <View className="mb-6">
                        <Text className="font-poppins-semibold text-xl mb-4">By ingredient</Text>
                        <FlatList
                            data={ingredientOptions}
                            // FIX: Pass the filterType 'ingredient' to the render function
                            renderItem={({item}) => renderCategoryCard({item, filterType: 'ingredient', darkBackground: true})}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* Dietary Preferences */}
                    <View className="mb-10">
                        <Text className="font-poppins-semibold text-xl mb-4">Dietary Preferences</Text>
                        <FlatList
                            data={dietaryPreferences}
                             // FIX: Pass the filterType 'dietary' to the render function
                            renderItem={({item}) => renderCategoryCard({item, filterType: 'dietary'})}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Nutrition;