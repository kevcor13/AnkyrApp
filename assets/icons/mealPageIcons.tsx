// assets/icons/mealPageIcons.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

// 1. Add your other icon names here
export type IconName = "whiteLighting" | "heart" | "search" | "backArrow" | "fowardArrow";

type IconProps = {
  name: IconName | string; // Allow string for flexibility
  color?: string;
  size?: number;
};

export const Icon = ({ name, color = "#FFF", size = 24 }: IconProps) => {
  const icons: Record<string, { viewBox: string; path: React.ReactNode }> = {
    whiteLighting: {
      viewBox: "0 0 22 24",
      path: <Path d="M11.6667 1.25012L1.25 13.7501H10.625L9.58333 22.0835L20 9.58346H10.625L11.6667 1.25012Z" stroke={color} strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round"/>,
    },
    heart: {
        viewBox: "0 0 24 24",
        path: <Path d="M21.3451 2.92899C20.8131 2.3967 20.1814 1.97445 19.4861 1.68636C18.7908 1.39828 18.0456 1.25 17.293 1.25C16.5404 1.25 15.7952 1.39828 15.0999 1.68636C14.4047 1.97445 13.773 2.3967 13.2409 2.92899L12.1368 4.03315L11.0326 2.92899C9.95792 1.85431 8.50034 1.25056 6.98051 1.25056C5.46069 1.25056 4.00311 1.85431 2.92843 2.92899C1.85375 4.00366 1.25 5.46124 1.25 6.98107C1.25 8.50089 1.85375 9.95847 2.92843 11.0332L12.1368 20.2415L21.3451 11.0332C21.8774 10.5011 22.2996 9.86942 22.5877 9.17415C22.8758 8.47888 23.0241 7.73366 23.0241 6.98107C23.0241 6.22848 22.8758 5.48326 22.5877 4.78799C22.2996 4.09272 21.8774 3.46102 21.3451 2.92899Z" stroke={color} strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ,
    },
    search: {
        viewBox: "0 0 24 24",
        path: <Path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill={color} />,
    },
    backArrow:{
        viewBox: "0 0 17 17",
        path: <Path d="M15.25 8.25H1.25M1.25 8.25L8.25 15.25M1.25 8.25L8.25 1.25" stroke={color} strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round"/>

    },
    fowardArrow:{
      viewBox: "0 0 25 25",
      path: <Path d="M5.25 8.25H19.25M19.25 8.25L12.25 1.25M19.25 8.25L12.25 15.25" stroke={color} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

    }
  };

  const icon = icons[name];

  if (!icon) {
    console.warn(`Icon "${name}" not found in mealPageIcons`);
    return null; 
  }

  return (
    <Svg width={size} height={size} viewBox={icon.viewBox} fill="none">
      {icon.path}
    </Svg>
  );
};