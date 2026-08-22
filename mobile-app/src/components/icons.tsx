import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function PlusIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = '#2B2B2B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13L10 18L19 7"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RunIcon({ size = 16, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="14.2" cy="4.6" r="1.9" fill={color} />
      <Path
        d="M14 7 L10.3 10.3 M14 7 L17.6 9.3 M10.3 10.3 L12 15 L8.6 20 M12 15 L16 17.8 L18.7 15"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function BikeIcon({ size = 16, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="17" r="3.1" stroke={color} strokeWidth={1.7} />
      <Circle cx="18" cy="17" r="3.1" stroke={color} strokeWidth={1.7} />
      <Path
        d="M6 17L10 9H14M10 9L13 17M13 17H18M10 9L8.2 6H6.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function BellIcon({ size = 22, color = '#1E293B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C9.5 3 8 5 8 8V11C8 13 7 14.5 5.5 15.5H18.5C17 14.5 16 13 16 11V8C16 5 14.5 3 12 3Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path d="M10 18a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function HomeIcon({ size = 22, color = '#1E293B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11L12 4L20 11" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6 9.5V19a1 1 0 0 0 1 1h4v-5h2v5h4a1 1 0 0 0 1-1V9.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BuddiesIcon({ size = 22, color = '#1E293B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="2.6" stroke={color} strokeWidth={1.7} />
      <Path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx="16.5" cy="8.5" r="2.1" stroke={color} strokeWidth={1.7} />
      <Path d="M14.7 13.2c2.4.4 4.1 2.4 4.1 5.3" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function BillsIcon({ size = 22, color = '#1E293B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3H18V20L16 18.7L14 20L12 18.7L10 20L8 18.7L6 20V3Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M9 8H15M9 11.5H15M9 15H13" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
