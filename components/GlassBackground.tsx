import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';

type Props = {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    /**
     * Border radius of the glass shape.
     * Defaults to a full pill (height / 2).
     * Pass 0 for sharp corners, or any value for custom rounding.
     */
    borderRadius?: number;
};

/**
 * ANKYR GLASS background component.
 * Reproduces the 3-layer Figma glass fill:
 *   - bottom radial (white→gray, 6% opacity)
 *   - top radial    (white→gray, 12% opacity)
 *   - white overlay (1% opacity)
 *
 * Usage:
 *   <GlassBackground style={{ height: 50 }}>
 *       <Text>Hello</Text>
 *   </GlassBackground>
 */
const GlassBackground = ({ style, children, borderRadius }: Props) => {
    const [dims, setDims] = useState({ width: 0, height: 0 });
    const { width: W, height: H } = dims;

    // Unique ids so multiple instances on screen don't conflict
    const uid = React.useMemo(() => Math.random().toString(36).slice(2), []);
    const bottomId = `glass_bottom_${uid}`;
    const topId = `glass_top_${uid}`;

    const r = borderRadius !== undefined ? borderRadius : H / 2;

    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setDims({ width, height });
    };

    return (
        <View style={[styles.container, { borderRadius: r }, style]} onLayout={onLayout}>
            {W > 0 && H > 0 && (
                <Svg style={StyleSheet.absoluteFill} width={W} height={H}>
                    <Defs>
                        {/*
                         * Bottom radial — mirrors Figma paint0_radial
                         * Centered at bottom-center, spreading upward and sideways.
                         * Original: center (W/2, H), rx ≈ 68.9% of width, ry = full height
                         */}
                        <RadialGradient
                            id={bottomId}
                            cx={W / 2}
                            cy={H}
                            rx={W * 0.689}
                            ry={H}
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0.0288" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="0.1635" stopColor="#8A8A8A" stopOpacity="1" />
                            <Stop offset="0.3269" stopColor="#404040" stopOpacity="1" />
                            <Stop offset="0.8077" stopColor="#0F0F0F" stopOpacity="1" />
                        </RadialGradient>

                        {/*
                         * Top radial — mirrors Figma paint1_radial
                         * Centered at top-center, spreading downward and sideways.
                         * Original: center (W/2, 0), rx ≈ 47.6% of width, ry ≈ 36% of height
                         */}
                        <RadialGradient
                            id={topId}
                            cx={W / 2}
                            cy={0}
                            rx={W * 0.476}
                            ry={H * 0.36}
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                            <Stop offset="0.4999" stopColor="#8D8D8D" stopOpacity="1" />
                            <Stop offset="1" stopColor="#4D4D4D" stopOpacity="1" />
                        </RadialGradient>
                    </Defs>

                    {/* Layer 1: bottom radial at 6% opacity */}
                    <Rect
                        x={0} y={0} width={W} height={H} rx={r} ry={r}
                        fill={`url(#${bottomId})`}
                        fillOpacity={0.06}
                    />

                    {/* Layer 2: top radial at 12% opacity */}
                    <Rect
                        x={0} y={0} width={W} height={H} rx={r} ry={r}
                        fill={`url(#${topId})`}
                        fillOpacity={0.12}
                    />

                    {/* Layer 3: white base at 1% opacity */}
                    <Rect
                        x={0} y={0} width={W} height={H} rx={r} ry={r}
                        fill="white"
                        fillOpacity={0.01}
                    />
                </Svg>
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});

export default GlassBackground;
