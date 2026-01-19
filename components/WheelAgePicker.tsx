// WheelPicker.js
import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const HEIGHT = 250;
const VISIBLE_ROWS = 3;
const ITEM_HEIGHT = HEIGHT / VISIBLE_ROWS;

interface WheelPickerProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string; // e.g., "kg", "lbs", "cm", "years"
  width?: number;
}

const WheelPicker = ({ 
  value, 
  onChange,
  min = 1,
  max = 100,
  step = 1,
  suffix = "",
  width = 120
}: WheelPickerProps) => {
  // Generate array of values based on min, max, and step
  const values = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  );

  const [selectedIndex, setSelectedIndex] = useState(
    value != null ? values.indexOf(value) : 0
  );
  
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (value != null) {
      const index = values.indexOf(value);
      if (index >= 0 && index !== selectedIndex) {
        setSelectedIndex(index);
        scrollRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
      }
    }
  }, [value]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < values.length && index !== selectedIndex) {
      setSelectedIndex(index);
      onChange?.(values[index]);
    }
  };

  return (
    <View style={[styles.container, { width }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: (HEIGHT - ITEM_HEIGHT) / 2 }}
      >
        {values.map((val, index) => (
          <View
            key={val}
            style={[
              styles.item,
              index === selectedIndex && styles.selectedItem,
            ]}
          >
            <Text style={[
              styles.text,
              index === selectedIndex && styles.selectedText
            ]}>
              {val}{suffix}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.selectionOverlay} pointerEvents="none" />
    </View>
  );
}

export default WheelPicker;

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    alignSelf: "center",
    overflow: "hidden",
    marginTop: 24,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {
    transform: [{ scale: 1.2 }],
  },
  text: {
    color: "white",
    fontSize: 20,
    opacity: 0.5,
  },
  selectedText: {
    opacity: 1,
    fontWeight: "600",
  },
  selectionOverlay: {
    position: "absolute",
    top: (HEIGHT - ITEM_HEIGHT) / 2,
    height: ITEM_HEIGHT,
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#444",
  },
});