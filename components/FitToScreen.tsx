import React from "react";
import { View, useWindowDimensions } from "react-native";

const FitToScreen: React.FC<{
  /** Set this to the phone you designed on (points). */
  baseW?: number; // e.g. 393 (iPhone 13/14/15/16 Pro width)
  baseH?: number; // e.g. 852 (iPhone 13/14/15/16 Pro height)
  children: React.ReactNode;
}> = ({ baseW = 393, baseH = 852, children }) => {
  const { width, height } = useWindowDimensions();

  // Scale uniformly so content fits entirely on screen
  const scale = Math.min(width / baseW, height / baseH);
  const left = (width - baseW * scale) / 2;
  const top = (height - baseH * scale) / 2;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          left,
          top,
          width: baseW,
          height: baseH,
          transform: [{ scale }],
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default FitToScreen;
