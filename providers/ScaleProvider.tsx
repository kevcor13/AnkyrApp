import React, { createContext, useContext, useMemo, PropsWithChildren } from "react";
import { useWindowDimensions, PixelRatio } from "react-native";

type ScaleCtx = {
  vw: (p: number) => number;   // viewport width %
  vh: (p: number) => number;   // viewport height %
  s: (n: number) => number;    // scaled spacing
  rem: (n: number) => number;  // scaled font size
  width: number;
  height: number;
};

const Ctx = createContext<ScaleCtx>({
  vw: n => n, vh: n => n, s: n => n, rem: n => n, width: 390, height: 844,
});

export const ScaleProvider = ({ children }: PropsWithChildren) => {
  const { width, height } = useWindowDimensions();

  const value = useMemo(() => {
    const vw = (p: number) => (width * p) / 100;
    const vh = (p: number) => (height * p) / 100;

    // Derive a gentle scale from current device relative to a mid reference
    // but DO NOT lock to any model; clamp to keep design stable across devices.
    const widthRef = 390;   // mid iPhone width (~13/14/15)
    const heightRef = 844;  // mid iPhone height
    const r = Math.min(width / widthRef, height / heightRef);
    const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
    const scaled = clamp(r, 0.9, 1.15); // keep within ±10–15%

    const s = (n: number) => Math.round(n * scaled);

    // Font scaling: mild width-based scale, optionally dampened by PixelRatio font scale
    const fontScaled = (n: number) => {
      const sys = PixelRatio.getFontScale(); // user accessibility setting
      const base = n * scaled;
      // Keep accessibility sane but avoid blowing up layout
      const effective = base * Math.min(sys, 1.1);
      return Math.round(effective);
    };
    const rem = (n: number) => fontScaled(n);

    return { vw, vh, s, rem, width, height };
  }, [width, height]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default ScaleProvider;
export const useScale = () => useContext(Ctx);