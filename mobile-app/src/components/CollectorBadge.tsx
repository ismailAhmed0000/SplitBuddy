import { TouchableOpacity } from 'react-native';
import Svg, { Circle, Polygon, Text as SvgText } from 'react-native-svg';

export function Seal({ fill, stroke, textColor, label }: { fill: string; stroke: string; textColor: string; label: string }) {
  return (
    <Svg width={36} height={36} viewBox="0 0 300 300">
      <Polygon
        points="150.00,20.00 164.62,38.96 183.65,24.43 192.86,46.53 215.00,37.42 218.18,61.14 241.92,58.08 238.86,81.82 262.58,85.00 253.47,107.14 275.57,116.35 261.04,135.38 280.00,150.00 261.04,164.62 275.57,183.65 253.47,192.86 262.58,215.00 238.86,218.18 241.92,241.92 218.18,238.86 215.00,262.58 192.86,253.47 183.65,275.57 164.62,261.04 150.00,280.00 135.38,261.04 116.35,275.57 107.14,253.47 85.00,262.58 81.82,238.86 58.08,241.92 61.14,218.18 37.42,215.00 46.53,192.86 24.43,183.65 38.96,164.62 20.00,150.00 38.96,135.38 24.43,116.35 46.53,107.14 37.42,85.00 61.14,81.82 58.08,58.08 81.82,61.14 85.00,37.42 107.14,46.53 116.35,24.43 135.38,38.96"
        fill={fill}
        stroke={stroke}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Circle cx={150} cy={150} r={106} fill="none" stroke="#ffffff" strokeWidth={3} strokeDasharray="6,6" opacity={0.9} />
      <SvgText
        x={150}
        y={160}
        textAnchor="middle"
        fontWeight="bold"
        fontSize={30}
        fill={textColor}
        letterSpacing={1}
        rotation={-45}
        origin="150, 150"
      >
        {label}
      </SvgText>
    </Svg>
  );
}

export function CollectorBadge({
  isPayer,
  canSet,
  onSetPayer,
  pending,
}: {
  isPayer: boolean;
  canSet?: boolean;
  onSetPayer?: () => void;
  pending?: boolean;
}) {
  if (isPayer) {
    return <Seal fill="#00a86b" stroke="#006b44" textColor="#ffffff" label="COLLECTOR" />;
  }

  if (!canSet) return null;

  return (
    <TouchableOpacity onPress={onSetPayer} disabled={pending} accessibilityLabel="Set as collector" activeOpacity={0.7}>
      <Seal fill="#94a3b8" stroke="#64748b" textColor="#ffffff" label="COLLECTOR" />
    </TouchableOpacity>
  );
}
