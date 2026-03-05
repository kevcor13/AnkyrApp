// FadeInView.tsx
import React, { useEffect, useRef } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  distance?: number;
  triggerKey?: number | string;
}

const FadeInView = ({ 
  children, 
  duration = 600, 
  delay = 0,
  from = 'bottom',
  distance = 30,
  triggerKey,
  style,
  ...props 
}: FadeInViewProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(from === 'top' ? -distance : from === 'bottom' ? distance : 0);
  const translateX = useSharedValue(from === 'left' ? -distance : from === 'right' ? distance : 0);
  const prevTrigger = useRef<FadeInViewProps['triggerKey']>();

  useEffect(() => {
    if (triggerKey !== undefined) {
      if (prevTrigger.current === undefined) {
        prevTrigger.current = triggerKey;
        return;
      }
      if (prevTrigger.current === triggerKey) return;
      prevTrigger.current = triggerKey;
    }

    opacity.value = 0;
    translateY.value = from === 'top' ? -distance : from === 'bottom' ? distance : 0;
    translateX.value = from === 'left' ? -distance : from === 'right' ? distance : 0;

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
    
    if (from !== 'none') {
      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration,
          easing: Easing.out(Easing.cubic),
        })
      );
      translateX.value = withDelay(
        delay,
        withTiming(0, {
          duration,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [delay, distance, duration, from, triggerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;
