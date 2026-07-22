import React from 'react';
import { Text, View } from 'react-native';

import { LiveSensor, RISK_CONFIG, RiskStatus, worstRisk } from '@/constants/analyticsTypes';
import { riskCardStyles } from '@/styles/analytics.styles';

export function RiskAnalysisCard({ sensors }: { sensors: LiveSensor[] }) {
  const overall: RiskStatus | null = worstRisk(...sensors.map((s) => s.risk_status));

  if (!overall) {
    return (
      <View style={riskCardStyles.card}>
        <Text style={riskCardStyles.title}>Risk Analysis</Text>
        <Text style={riskCardStyles.emptyText}>No sensor data yet.</Text>
      </View>
    );
  }

  const cfg = RISK_CONFIG[overall];
  const contributingSensors = sensors.filter((s) => s.risk_status === overall);

  return (
    <View style={riskCardStyles.card}>
      <Text style={riskCardStyles.title}>Risk Analysis</Text>
      <Text style={[riskCardStyles.overallStatus, { color: cfg.text }]}>{cfg.label}</Text>
      {contributingSensors.length > 0 && (
        <Text style={riskCardStyles.detail}>
          Based on: {contributingSensors.map((s) => s.sensor_name || s.sensor_code).join(', ')}
        </Text>
      )}
    </View>
  );
}