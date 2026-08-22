import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  filled?: boolean;
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

export function BellIcon({ size = 22, color = '#111827' }: IconProps) {
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

export function HomeIcon({ size = 22, color = '#111827', filled = false }: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3L20 10V20H4V10L12 3Z" fill={color} />
      </Svg>
    );
  }
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

export function BuddiesIcon({ size = 22, color = '#111827', filled = false }: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8.5" r="3.2" fill={color} />
        <Path d="M5 19.5C5 16.2 8.1 13.5 12 13.5C15.9 13.5 19 16.2 19 19.5Z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="2.6" stroke={color} strokeWidth={1.7} />
      <Path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx="16.5" cy="8.5" r="2.1" stroke={color} strokeWidth={1.7} />
      <Path d="M14.7 13.2c2.4.4 4.1 2.4 4.1 5.3" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function BillsIcon({ size = 22, color = '#111827', filled = false }: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 3H18V20L16 18.7L14 20L12 18.7L10 20L8 18.7L6 20V3Z" fill={color} />
      </Svg>
    );
  }
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

export function ChevronLeftIcon({ size = 20, color = '#111827' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5L8 12L15 19" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 20, color = '#111827' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5L16 12L9 19" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 16, color = '#9CA3AF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ size = 18, color = '#6B7280' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 18L18 6M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 18, color = '#9CA3AF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={1.8} />
      <Path d="M20 20L16 16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function TrashIcon({ size = 18, color = '#9CA3AF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7H19M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({ size = 16, color = '#6B7280' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20l.8-3.6L15.6 5.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L7.6 19.2 4 20Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CameraIcon({ size = 22, color = '#0D9488' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.2" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function ImageIcon({ size = 22, color = '#0D9488' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 5.5h15A1 1 0 0 1 20.5 6.5v11A1 1 0 0 1 19.5 18.5h-15A1 1 0 0 1 3.5 17.5v-11A1 1 0 0 1 4.5 5.5Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Circle cx="8.5" cy="10" r="1.6" stroke={color} strokeWidth={1.4} />
      <Path d="M4 16.5 9 12l3 2.5 3.5-3.5L20 15" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function GroupIcon({ size = 22, color = '#111827' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Circle cx="10" cy="8" r="3.2" stroke={color} strokeWidth={1.7} />
      <Path d="M15.5 9.2c1.6.3 3 1.6 3.3 3.7" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx="17" cy="6.6" r="2" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function SwapIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 8h12l-3-3M18 16H6l3 3" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function WarningIcon({ size = 22, color = '#EF4444' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4 21 19H3L12 4Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M12 10v3.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="12" cy="16.3" r="0.9" fill={color} />
    </Svg>
  );
}

export function ReceiptEmptyIcon({ size = 40, color = '#D1D5DB' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3H18V20L16 18.7L14 20L12 18.7L10 20L8 18.7L6 20V3Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path d="M9 8H15M9 11.5H15M9 15H13" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}
