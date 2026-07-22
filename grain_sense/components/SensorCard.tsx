import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { sensorStyles } from '@/styles/index.styles';

type SensorCardProps = {
  label: string;
  value: string;
  unit: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  tag: string;
  tagIcon: keyof typeof Ionicons.glyphMap;
  tagIconColor: string;
  tagColor: string;
  tagBg: string;
};

export function SensorCard({
  label, value, unit,
  iconName, iconColor, iconBg,
  tag, tagIcon, tagIconColor, tagColor, tagBg,
}: SensorCardProps) {
  return (
    <View style={sensorStyles.card}>
      <View style={[sensorStyles.iconBadge, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <Text style={sensorStyles.label}>{label}</Text>
      <View style={sensorStyles.valueRow}>
        <Text style={sensorStyles.value}>{value}</Text>
        <Text style={sensorStyles.unit}>{unit}</Text>
      </View>
      <View style={[sensorStyles.tag, { backgroundColor: tagBg }]}>
        <Ionicons name={tagIcon} size={10} color={tagIconColor} style={{ marginRight: 3 }} />
        <Text style={[sensorStyles.tagText, { color: tagColor }]}>{tag}</Text>
      </View>
    </View>
  );
}