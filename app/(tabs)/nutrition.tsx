import { View, Text, SafeAreaView, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router } from "expo-router";
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { Icon } from '../../assets/icons/mealPageIcons';
import { Tab } from '../../assets/icons/index';
import { useGlobal } from '@/context/GlobalProvider';

const Nutrition = () => {
    const { ngrokAPI } = useGlobal();
    const [featuredMeals, setFeaturedMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.post(`${ngrokAPI}/api/meals/getFeaturedRecipes`);
                if (response.data && Array.isArray(response.data.data)) {
                    setFeaturedMeals(response.data.data);
                } else {
                    throw new Error("Unexpected format");
                }
            } catch (err: any) {
                setError(err.message || "Error fetching recipes.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    const goalOptions = [
        { id: '1', title: 'Build Muscle' },
        { id: '2', title: 'Weight Loss' },
        { id: '3', title: 'Energy' },
    ];

    const renderFeaturedMeal = ({ item }: { item: { imageUrl?: string; title: string; _id: string } }) => (
        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/MealDetail', params: { mealId: item._id }})}
            className="relative mr-5 rounded-[40px] overflow-hidden w-72 h-52 bg-zinc-900 border border-white/10"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}
        >
            <Image
                source={{ uri: item.imageUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Available' }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 p-5 bg-black/30 backdrop-blur-md">
                <Text className="text-white font-poppins-bold text-xl tracking-tight">{item.title}</Text>
            </View>
            
            {/*  this is the heart icon on the top right of each card

            <View className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl p-3 rounded-full border border-white/20">
                <Icon name="heart" size={24} color="#FFFFFF" /> 
            </View>
            */}
        </TouchableOpacity>
    );

    const renderCategoryCard = ({ item, darkBackground = false, filterType }: any) => (
        <TouchableOpacity
            activeOpacity={0.8}
            className={`mr-4 rounded-[30px] w-40 h-28 justify-center items-center border ${darkBackground ? 'bg-zinc-900 border-white/10' : 'bg-white/80 border-black/5'}`}
            onPress={() => router.push({
                pathname: '/FilteredMeals',
                params: { filterType: filterType, filterValue: item.title }
            })}
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }}
        >
            <Text className={`font-poppins-semibold text-lg tracking-tight ${darkBackground ? 'text-white' : 'text-zinc-800'}`}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#050505]">
            {/* 1. STATIONARY GRADIENT */}
            <LinearGradient
                colors={['#050505', '#050505', 'transparent']}
                locations={[0, 0.4, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, zIndex: 10 }}
            />

            {/* 2. STATIONARY HEADER */}
            <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
                <View className="mt-4 mb-4 px-6 flex-row justify-between items-end">
                    <View>
                        <Text className="text-zinc-500 font-poppins-medium text-xs uppercase tracking-[3px] mb-1">Your Kitchen</Text>
                        <Text className="font-poppins-bold text-white text-4xl tracking-tighter">Meal plans.</Text>
                    </View>
                    <Tab name='meals' size={50} color="#FFFFFF" />
                </View>
            </SafeAreaView>

            {/* 3. SCROLLING CONTENT */}
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ flexGrow: 1, paddingTop: 150 }} // Offset for stationary header
            >
                <View className="flex-row px-6 gap-x-4 mb-8">
                    {[
                        { icon: "heart", label: 'Saved', color: "#FF3330",route: '/(nutrition)/SavedMeals' },
                        { icon: "search", label: 'Search',color: "#007AFF", route: '/(nutrition)/SearchMeal' },
                    ].map((action, index) => (
                            <TouchableOpacity 
                                key={index}
                                className="flex-1 bg-zinc-900/60 border border-white/10 rounded-3xl p-4 flex-row item-center justify-center"
                                onPress={() => action.route && router.push(action.route as any)}
                            >
                                <Icon name={action.icon as any} size={24} color={action.color} />
                                <Text className='text-white font-poppins-semibold ml-3 text-sm'>{action.label}</Text>
                            </TouchableOpacity>
                    ))}
                </View>
            {/* Main Content: "The Sheet" */}
                <View className="bg-[#F2F2F7] flex-1 rounded-t-[50px] p-6 shadow-2xl">
                    {/* Featured Meals Section */}
                    <View className="mb-10">
                        <View className="flex-row justify-between items-center mb-5 px-1">
                            <Text className="font-poppins-bold text-2xl text-zinc-900 tracking-tight">Featured</Text>
                            <TouchableOpacity><Text className="text-blue-600 font-poppins-medium">See all</Text></TouchableOpacity>
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#000" />
                        ) : (
                            <FlatList
                                data={featuredMeals}
                                renderItem={renderFeaturedMeal}
                                keyExtractor={(item: any) => item._id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                snapToAlignment="start"
                                decelerationRate="fast"
                            />
                        )}
                    </View>

                    {/* By Goal Section */}
                    <View className="mb-10">
                        <Text className="font-poppins-bold text-2xl text-zinc-900 tracking-tight mb-5 px-1">By Goal</Text>
                        <FlatList
                            data={goalOptions}
                            renderItem={({item}) => renderCategoryCard({item, filterType: 'goals'})}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* Footer Spacing */}
                    <View className="h-20" />
                </View>
            </ScrollView>
        </View>
    );
};

export default Nutrition;