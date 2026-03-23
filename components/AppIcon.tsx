import type { SvgProps } from "react-native-svg";

import { svgIcons, type SvgIconName } from "@/constants/svgIcons";

type AppIconProps = SvgProps & {
  name: SvgIconName;
  size?: number;
  color?: string;
};

const AppIcon = ({
  name,
  size = 24,
  width,
  height,
  color,
  fill,
  stroke,
  ...props
}: AppIconProps) => {
  const IconComponent = svgIcons[name];
  const resolvedColor =
    color ??
    (typeof fill === "string" ? fill : undefined) ??
    (typeof stroke === "string" ? stroke : undefined);

  return (
    <IconComponent
      width={width ?? size}
      height={height ?? size}
      color={resolvedColor}
      fill={fill}
      stroke={stroke}
      {...props}
    />
  );
};

export default AppIcon;
