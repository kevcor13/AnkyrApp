import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import axios from 'axios';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';

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

// Convert API meal (which may use {ingredients:[{text}] , instructions:[{step}]}) into our UI shape
function normalizeMeal(raw: any): Meal {
  const ingredients: string[] = Array.isArray(raw?.ingredients)
    ? raw.ingredients
        .map((it: any) => (typeof it === 'string' ? it : it?.text))
        .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    : [];

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
  // Normalize params to string
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
        setError(null);

        const response = await axios.post(`${ngrokAPI}/api/meals/getMealById`, { mealId });
        if (response?.data?.status === 'success' && response?.data?.data) {
          setMeal(normalizeMeal(response.data.data));
        } else {
          throw new Error(response?.data?.message || 'Failed to fetch meal details.');
        }

      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'An error occurred while fetching the meal.');
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
        } else {
          console.error('Failed to fetch favorite status:', response.data.message);
        }
      } catch (err) {
        console.error('Error checking favorite status:', err);
      } 
    }
    fetchFavoriteStatus();
    fetchMealDetails();
  }, [mealId, ngrokAPI]);

  const handleToggleFavorite = () => {
    const userId  = userData._id; 
    if(isFavorited){
      axios.post(`${ngrokAPI}/api/meals/removeFavMeal`, { userId, mealId });
      setIsFavorited(false);
    }
    else{
      axios.post(`${ngrokAPI}/api/meals/addFavoriteMeal`, { userId, mealId});
      setIsFavorited(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !meal) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Meal not found.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
          <Text style={styles.backButtonInlineText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Quick Meal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10, padding: 6 }}>
              <Image source={icons.arrow} style={{ width: 24, height: 24, tintColor: 'black' }} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 10, padding: 6 }} onPress={handleToggleFavorite}>
              <Image
                source={icons.heart /* icons.food may not exist in your set */}
                style={{ width: 24, height: 24, tintColor: isFavorited ? '#FF0000' : '#C0C0C0' }}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Title + time + favorite */}
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{meal.title}</Text>
              <Text style={styles.time}>{meal.timeMinutes > 0 ? `${meal.timeMinutes} mins` : '—'}</Text>
            </View>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Image
                source={icons.heart}
                style={[styles.heartIcon, { tintColor: isFavorited ? '#FF0000' : '#C0C0C0' }]}
              />
            </TouchableOpacity>
          </View>

          {/* Main image */}
          <Image source={{ uri: meal.imageUrl }} style={styles.mainImage} />

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {meal.ingredients.length === 0 ? (
              <Text style={styles.listText}>No ingredients listed.</Text>
            ) : (
              meal.ingredients.map((ingredient, idx) => (
                <View key={`ing-${idx}`} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{ingredient}</Text>
                </View>
              ))
            )}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {meal.instructions.length === 0 ? (
              <Text style={styles.listText}>No instructions provided.</Text>
            ) : (
              meal.instructions.map((instruction, idx) => (
                <View key={`step-${idx}`} style={styles.listItem}>
                  <Text style={styles.instructionNumber}>{idx + 1}.</Text>
                  <Text style={styles.listText}>{instruction}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ----- Styles -----
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButtonInline: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonInlineText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 38,
  },
  time: {
    fontSize: 16,
    color: '#555555',
    marginTop: 4,
  },
  heartIcon: {
    width: 30,
    height: 30,
    marginTop: 5,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 25,
    backgroundColor: '#EEE',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 10,
    color: '#333333',
    lineHeight: 24,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333333',
    lineHeight: 24,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
});

export default MealDetail;
