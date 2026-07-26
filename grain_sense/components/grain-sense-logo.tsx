import React from 'react';
import Svg, { Path, Circle, Rect, Polygon, G, ClipPath, Defs } from 'react-native-svg';

type Props = {
  size?: number;
};

/**
 * GrainSenseLogo
 * Vector recreation ng circular leaf/farm icon ng Grain Sense.
 *
 * Note: kailangan ng "react-native-svg" sa project. Kung wala pa,
 * i-install: npx expo install react-native-svg
 */
export function GrainSenseLogo({ size = 160 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <ClipPath id="circleClip">
          <Circle cx="100" cy="105" r="62" />
        </ClipPath>
      </Defs>

      {/* Leaf stem curling around the circle */}
      <Path
        d="M100 43
           C 60 43, 32 70, 32 105
           C 32 142, 62 168, 100 168
           C 138 168, 168 142, 168 105"
        stroke="#3FA34D"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small leaf at the top of the stem */}
      <Path d="M100 43 C 96 28, 84 22, 72 24 C 80 34, 90 40, 100 43 Z" fill="#3FA34D" />
      <Path d="M100 43 C 104 30, 116 26, 126 30 C 118 38, 109 41, 100 43 Z" fill="#3FA34D" />

      {/* Clipped scene inside the circle: sun, water tower, fields, tractor */}
      <G clipPath="url(#circleClip)">
        <Circle cx="108" cy="98" r="26" fill="#F2A93B" />

        <G>
          <Rect x="128" y="78" width="14" height="14" fill="#5C4536" />
          <Polygon points="122,78 148,78 135,68" fill="#5C4536" />
          <Path
            d="M124 92 L120 132 M146 92 L150 132 M135 92 L135 132"
            stroke="#5C4536"
            strokeWidth="3"
            fill="none"
          />
        </G>

        <Path d="M30 130 Q70 110 110 130 T190 130 L190 200 L30 200 Z" fill="#2F8C3F" />
        <Path d="M30 145 Q70 125 110 145 T190 145 L190 200 L30 200 Z" fill="#2A7D38" />
        <Path d="M30 160 Q70 142 110 160 T190 160 L190 200 L30 200 Z" fill="#256E31" />
        <Path d="M30 175 Q70 158 110 175 T190 175 L190 200 L30 200 Z" fill="#1F5F2A" />

        <G>
          <Rect x="118" y="112" width="20" height="11" rx="2" fill="#2A7D38" />
          <Circle cx="122" cy="128" r="7" fill="#1F5F2A" />
          <Circle cx="138" cy="128" r="5" fill="#1F5F2A" />
          <Rect x="132" y="104" width="6" height="10" fill="#2A7D38" />
        </G>
      </G>
    </Svg>
  );
}
