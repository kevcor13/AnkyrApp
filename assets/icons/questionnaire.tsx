// assets/icons/mealPageIcons.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

// 1. Add your other icon names here
export type IconName = "femaleIcon" | "maleIcon";

type IconProps = {
  name: IconName | string; // Allow string for flexibility
  color?: string;
  size?: number;
};

export const QuestionnaireIcon = ({ name, color = "#FFF", size = 24 }: IconProps) => {
  const icons: Record<string, { viewBox: string; path: React.ReactNode }> = {
    femaleIcon: {
      viewBox: "0 0 54.34 53.59",
      path: <Path d="M39.5,7.01h-3.51c-3.52-.53-2.49-6.88-.03-6.99h16.7c1.68-.07,1.68.07,1.68,1.59v16.1c-.19,3.15-6.33,3.64-7.08.12v-3.18c0-1.19-.25-1.35-1.17-.58l-.76.76-7.09,7.02c1.58,1.24,2.69,3.48,3.15,6.11.31.59.68,5.96.08,9.13-1.13,8.94-7.45,14.2-14.96,16.07-3.86.52-7.47.61-10.67,0-7.66-1.63-14.25-6.29-15.53-16.77-.28-2.17-.49-4.57-.07-7.32,3.44-15.35,18.11-19.71,31.96-13.53l8.14-7.44c.76-.81.49-1.17-.84-1.09ZM20.98,45.63c7.2,0,13.04-5.64,13.04-12.61s-5.84-12.61-13.04-12.61-13.04,5.64-13.04,12.61,5.84,12.61,13.04,12.61Z" fill={"#FFF"} stroke={color} strokeWidth=".5"/>,
    },
    maleIcon: {
      viewBox: "0 0 39.01 63.08",
      path: <Path d="M31.04,19.8c0,6.38-5.17,11.55-11.55,11.55s-11.55-5.17-11.55-11.55,5.17-11.55,11.55-11.55,11.55,5.17,11.55,11.55ZM0,20.27c.08,9.05,6.7,17.67,15.99,18.34v4.93s-9.97-.03-9.97-.03c-3.04.33-3.04,8.1,0,8.08l8.96-.09c1.3,0,1.01-.22,1.06,1.04l-.06,8.02c.18,3.48,6.88,3.28,7.03,0l.02-8.07c0-1.07-.21-.94.98-.92h7.99c3.98-.2,4.74-7.56-.07-7.99h-7.88c-1.05.06-1.12.02-1.06-1.14l.09-3.88c8.71-.56,14.51-7.19,15.79-15.69.17-3.8.18-2.6,0-5.33-2.21-9.85-6.24-14.01-14.93-17.02-3.51-.61-4.84-.62-7.83-.29C5.1,2.83-.06,10.6,0,20.27Z" fill={"#FFF"} stroke={color} strokeWidth=".5"/>,
    },
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