import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  BatchModalMode,
  GREEN_MID,
  LiveSensor,
  RISK_CONFIG,
  RiskStatus,
  STATUS_CONFIG,
  formatElapsed,
} from '@/constants/analyticsTypes';
import { monitorStyles } from '@/styles/analytics.styles';

function RiskBadge({ risk }: { risk: RiskStatus | null }) {
  if (!risk) return null;
  const cfg = RISK_CONFIG[risk];
  return (
    <View style={[monitorStyles.riskBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[monitorStyles.riskBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

export function SensorMonitorCard({
  sensor,
  onToggleDht,
  onOpenBatchModal,
  busy,
}: {
  sensor: LiveSensor;
  onToggleDht: (sensor: LiveSensor) => void;
  onOpenBatchModal: (sensor: LiveSensor, mode: BatchModalMode) => void;
  busy: boolean;
}) {
  const cfg = STATUS_CONFIG[sensor.status];
  const isDht = sensor.sensor_type === 'DHT';

  return (
    <View style={monitorStyles.card}>
      <View style={monitorStyles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={monitorStyles.name}>
            {sensor.sensor_name || sensor.sensor_code}
          </Text>
          <Text style={monitorStyles.code}>{sensor.sensor_code} · {sensor.gpio_pin}</Text>
        </View>
        <View style={[monitorStyles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[monitorStyles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={monitorStyles.divider} />

      {isDht ? (
        <>
          <View style={monitorStyles.readingRow}>
            <Text style={monitorStyles.readingLabel}>Temperature</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={monitorStyles.readingValue}>
                {sensor.temperature !== null ? `${sensor.temperature.toFixed(1)}°C` : '--'}
              </Text>
              <RiskBadge risk={sensor.temperature_status} />
            </View>
          </View>
          <View style={monitorStyles.readingRow}>
            <Text style={monitorStyles.readingLabel}>Humidity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={monitorStyles.readingValue}>
                {sensor.humidity !== null ? `${sensor.humidity.toFixed(1)}%` : '--'}
              </Text>
              <RiskBadge risk={sensor.humidity_status} />
            </View>
          </View>
        </>
      ) : (
        <View style={monitorStyles.readingRow}>
          <Text style={monitorStyles.readingLabel}>Moisture</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={monitorStyles.readingValue}>
              {sensor.moisture !== null ? `${sensor.moisture.toFixed(1)}%` : '--'}
            </Text>
            <RiskBadge risk={sensor.moisture_status} />
          </View>
        </View>
      )}

      <Text style={monitorStyles.lastUpdated}>
        <Ionicons name="time-outline" size={12} color="#9AA0A6" /> {formatElapsed(sensor.seconds_since_update)}
      </Text>

      {isDht ? (
        <TouchableOpacity
          style={[
            monitorStyles.actionBtn,
            { backgroundColor: sensor.enabled ? '#FFF3E0' : '#E8F5E9' },
          ]}
          disabled={busy}
          onPress={() => onToggleDht(sensor)}
        >
          <Text style={[monitorStyles.actionBtnText, { color: sensor.enabled ? '#E65100' : GREEN_MID }]}>
            {sensor.enabled ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            monitorStyles.actionBtn,
            { backgroundColor: sensor.enabled ? '#FFF3E0' : '#E8F5E9' },
          ]}
          disabled={busy}
          onPress={() => onOpenBatchModal(sensor, sensor.enabled ? 'disable' : 'enable')}
        >
          <Text style={[monitorStyles.actionBtnText, { color: sensor.enabled ? '#E65100' : GREEN_MID }]}>
            {sensor.enabled ? 'Disable (End Batch)' : 'Enable (Start Batch)'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}