import { View, Text, SafeAreaView, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native'
import React from 'react'
import images from "@/constants/images";
import icons from "@/constants/icons";
import { router } from "expo-router";

const Nutrition = () => {
    // Featured meals data
    const featuredMeals = [
        {
            id: '1',
            title: 'Lemon Garlic Salmon',
            image: '/api/placeholder/300/200', // Placeholder image
        },
        {
            id: '2',
            title: 'Grilled Chicken Bowl',
            image: '/api/placeholder/300/200', // Placeholder image
        },
    ];

    // Goals data
    const goalOptions = [
        { id: '1', title: 'Build Muscle' },
        { id: '2', title: 'Weight Loss' },
        { id: '3', title: 'Energy' },
    ];

    // Ingredients data
    const ingredientOptions = [
        { id: '1', title: 'Poultry' },
        { id: '2', title: 'Beef' },
        { id: '3', title: 'Seafood' },
    ];

    // Dietary preferences data
    const dietaryPreferences = [
        { id: '1', title: 'Dairy-Free' },
        { id: '2', title: 'Gluten-Free' },
        { id: '3', title: 'Vegan' },
    ];

    const renderFeaturedMeal = ({ item }) => (
        <View className="relative mr-4 rounded-lg overflow-hidden w-64 h-44">
            <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute top-0 left-0 p-4">
                <Text className="text-white font-poppins-bold text-2xl">{item.title}</Text>
            </View>
            <View className="absolute top-2 right-2">
                <TouchableOpacity>
                    <Image source={icons.heart} className="w-6 h-6 tint-white" />
                </TouchableOpacity>
            </View>
            <View className="absolute bottom-2 right-2">
                <TouchableOpacity className="bg-white px-4 py-2 rounded-full">
                    <Text className="font-poppins-medium">View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCategoryCard = ({ item, darkBackground = false }) => (
        <TouchableOpacity
            className={`mr-4 rounded-lg overflow-hidden w-36 h-24 justify-center items-center ${darkBackground ? 'bg-black' : 'bg-white'}`}
        >
            <Text className={`font-poppins-semibold text-lg ${darkBackground ? 'text-white' : 'text-black'}`}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    const renderQuickAccessCard = ({ item }) => (
        <View className="mr-4 bg-black w-44 h-24 rounded-lg p-4 justify-center">
            <Image source={item.icon} className="w-6 h-6 tint-white mb-2" />
            <Text className="text-white font-poppins-semibold">{item.title}</Text>
        </View>
    );

    return (
        <SafeAreaView className="bg-black h-full">
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

            {/* Main Content with Light Gray Background */}
            <View className="bg-gray-200 flex-1 rounded-t-3xl">
                <ScrollView showsVerticalScrollIndicator={false} className="p-4">
                    {/* Quick Access Cards */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        <TouchableOpacity className="bg-black rounded-lg w-[142] h-[105] mr-4 p-4 justify-center flex-row-reverse">
                            <Image source={icons.progress} className="w-[34] h-[34]" />
                            <Text className="text-white font-poppins-semibold text-[20px] mt-4">My progress</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-black rounded-lg w-[142] h-[105] mr-4 p-4 justify-center flex-row-reverse">
                            <Image source={icons.calendar} className="w-[34] h-[34]" />
                            <Text className="text-white font-poppins-semibold text-[20px] mt-4 ">My{'\n'}Meal Plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-black rounded-lg w-[142] h-[105] mr-4 p-4 justify-center flex-row-reverse">
                            <Image source={icons.calendar} className="w-[34] h-[34]" />
                            <Text className="text-white font-poppins-semibold text-[20px] mt-4 ">My Meal Plan</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Featured Meals */}
                    <View className="mb-6">
                        <Text className="font-poppins-semibold text-xl mb-4">Featured</Text>
                        <FlatList
                            data={featuredMeals}
                            renderItem={renderFeaturedMeal}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* By Goal */}
                    <View className="mb-6">
                        <Text className="font-poppins-semibold text-xl mb-4">By Goal</Text>
                        <FlatList
                            data={goalOptions}
                            renderItem={({item}) => renderCategoryCard({item})}
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
                            renderItem={({item}) => renderCategoryCard({item, darkBackground: true})}
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
                            renderItem={({item}) => renderCategoryCard({item})}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* Back to Top */}
                    <TouchableOpacity className="items-center pb-4">
                        <Text className="font-poppins-medium text-gray-700">Back to top</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Nutrition;