import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import AnkyrWordmarkIcon from "@/assets/icons/icon.ankyrSVG.svg";
import CameraIcon from "@/assets/icons/CameraIcon.svg";
import FemaleIcon from "@/assets/icons/Female-Icon.svg";
import FloatieIcon from "@/assets/icons/flotieIcon.svg";
import HeadphonesIcon from "@/assets/icons/icon.headphones.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import HomeIcon from "@/assets/icons/HomeIcon.svg";
import LifeBuoyIcon from "@/assets/icons/Life buoy.svg";
import MealsGlyphIcon from "@/assets/icons/SVG/Meals.svg";
import NutritionIcon from "@/assets/icons/nutritionIcon.svg";
import ProfileIcon from "@/assets/icons/profileIcon.svg";
import RedStreakIcon from "@/assets/icons/icon.streak.red.svg";
import VectorIcon from "@/assets/icons/VectorSVG.svg";
import WhiteStreakIcon from "@/assets/icons/WhiteStreakTab.svg";
import ActivityIcon from "@/assets/icons/Activity.svg";
import ActivityG from "@/assets/icons/ActivityG.svg";
import Moon from "@/assets/icons/Moon.svg"
import doubleBox from "@/assets/icons/3dbox.svg"
import weightIcon from "@/assets/icons/WeightStatICon.svg"
import tragetIcon from "@/assets/icons/Target.svg"
import shieldOff from "@/assets/icons/Shield off.svg"
import shieldOn from "@/assets/icons/Shield.svg";
import calendar from "@/assets/icons/CalendarIcon.svg";
import overviewBox from "@/assets/icons/OverviewButton.svg"
import upArrow from "@/assets/icons/Arrow up-right.svg"
import checkMark from "@/assets/icons/Check.svg"
import gearIcon from "@/assets/icons/GearIcon.svg"

type SvgIconComponent = ComponentType<SvgProps>;

export const svgIcons = {
  ankyrWordmark: AnkyrWordmarkIcon,
  gearIcon : gearIcon,
  checkMark: checkMark,
  upArrow: upArrow,
  overviewBox: overviewBox,
  calendar: calendar,
  shieldOff: shieldOff,
  shieldOn: shieldOn,
  targetIcon: tragetIcon,
  weight: weightIcon,
  moon: Moon,
  doubleBox: doubleBox,
  activity: ActivityIcon,
  activityG: ActivityG,
  camera: CameraIcon,
  female: FemaleIcon,
  floatie: FloatieIcon,
  headphones: HeadphonesIcon,
  heart: HeartIcon,
  home: HomeIcon,
  lifeBuoy: LifeBuoyIcon,
  mealsGlyph: MealsGlyphIcon,
  nutrition: NutritionIcon,
  profile: ProfileIcon,
  redStreak: RedStreakIcon,
  vector: VectorIcon,
  whiteStreak: WhiteStreakIcon,
} as const satisfies Record<string, SvgIconComponent>;

export type SvgIconName = keyof typeof svgIcons;
