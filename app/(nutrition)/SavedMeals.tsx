import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { useGlobal } from '@/context/GlobalProvider';
import icons from '@/constants/icons';

// Define the structure of a Meal object based on your schema
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
      style={styles.cardContainer}
      onPress={() => router.push({ pathname: '/MealDetail', params: { mealId: item._id } })}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Available' }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image source={icons.arrow} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Saved Meals</Text>

        {/* Spacer to keep title centered */}
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>You haven&apos;t saved any meals yet.</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  cardContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  viewButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SavedMeals;
