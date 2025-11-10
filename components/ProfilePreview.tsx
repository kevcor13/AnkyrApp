import React, { useRef, useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface PreviewPicture {
  url: string;
  uploadedAt: string;
}

interface ProfilePreviewProps {
  previewPictures: PreviewPicture[];
  isOwnProfile: boolean;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ previewPictures, isOwnProfile }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Image dimensions - larger first image, smaller side images
  const FIRST_IMAGE_WIDTH = screenWidth * 0.55;
  const SIDE_IMAGE_WIDTH = screenWidth * 0.25;
  const IMAGE_HEIGHT = 420;
  const SPACING = 12;

  // Show only the 3 most recent preview pictures
  const displayPictures = previewPictures.slice(0, 3);

  const handleAddPreview = () => {
    router.push('/(settings)/ChangePreview');
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (FIRST_IMAGE_WIDTH + SPACING));
        setActiveIndex(index);
      }
    }
  );

  if (displayPictures.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <View className="mt-6">
      <Animated.ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={FIRST_IMAGE_WIDTH + SPACING}
        snapToAlignment="start"
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - FIRST_IMAGE_WIDTH) / 2,
          gap: SPACING
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {displayPictures.map((picture, index) => {
          const inputRange = [
            (index - 1) * (FIRST_IMAGE_WIDTH + SPACING),
            index * (FIRST_IMAGE_WIDTH + SPACING),
            (index + 1) * (FIRST_IMAGE_WIDTH + SPACING)
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp'
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp'
          });

          const imageWidth = index === activeIndex ? FIRST_IMAGE_WIDTH : SIDE_IMAGE_WIDTH;

          return (
            <Animated.View
              key={index}
              style={{
                width: FIRST_IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                transform: [{ scale }],
                opacity
              }}
            >
              <View className="rounded-2xl overflow-hidden h-full shadow-2xl">
                <Image
                  source={{ uri: picture.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </Animated.View>
          );
        })}
        
        {/* Add button - only show on own profile and if less than 3 pictures 
        {isOwnProfile && displayPictures.length < 3 && (
          <Animated.View
            style={{
              width: FIRST_IMAGE_WIDTH,
              height: IMAGE_HEIGHT
            }}
          >
            <TouchableOpacity
              onPress={handleAddPreview}
              className="h-full rounded-2xl border-2 border-dashed border-gray-600 justify-center items-center bg-gray-900/50"
              activeOpacity={0.7}
            >
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-gray-800 justify-center items-center mb-2">
                  <Text className="text-white text-3xl">+</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        */}
      </Animated.ScrollView>

      {/* Pagination dots */}
      {displayPictures.length > 1 && (
        <View className="flex-row justify-center items-center gap-2 mb-10">
          {displayPictures.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === activeIndex 
                  ? 'w-6 bg-white' 
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ProfilePreview;