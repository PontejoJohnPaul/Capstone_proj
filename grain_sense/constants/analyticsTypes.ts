import { Alert, Dimensions } from 'react-native';

export const GREEN_DARK = '#0F3D1C';
export const GREEN_MID = '#1F6B2C';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CHART_WIDTH = SCREEN_WIDTH - 64;
export const POINT_WIDTH = 70; // horizontal space per data point, for scrollable charts

export const TABS = ['Today', '7 Days', '30 Days'] as const;
export type TabKey = (typeof TABS)[number];

export const TAB_TO_RANGE: Record<TabKey, string> = {
  Today: 'today',
  '7 Days': '7days',
  '30 Days': '30days',
};

export const chartConfig = (color: string) => ({
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: () => color,
  labelColor: () => '#999999',
  strokeWidth: 2,
  propsForDots: {
    r: '3',
    strokeWidth: '2',
    stroke: color,
  },
  propsForBackgroundLines: {
    stroke: '#F0F0F0',
  },
});

export type ChartCardProps = {
  title: string;
  dotColor: string;
  labels: string[];
  data: number[];
  dark?: boolean;
};

// ============================================================
// LIVE SENSOR MONITORING (from get_live_monitoring.php)
// ============================================================

export type SensorStatus = 'online' | 'no_signal' | 'disabled';

// Threshold-based reading risk (from sensor_thresholds table) — separate concept
// from SensorStatus above, which is about connectivity, not reading values.
export type RiskStatus = 'SAFE' | 'WARNING' | 'DANGER';

export const RISK_CONFIG: Record<RiskStatus, { label: string; bg: string; text: string }> = {
  SAFE: { label: 'Safe', bg: '#E8F5E9', text: '#2E7D32' },
  WARNING: { label: 'Warning', bg: '#FFF3E0', text: '#E65100' },
  DANGER: { label: 'Danger', bg: '#FFEBEE', text: '#C62828' },
};

const RISK_RANK: Record<RiskStatus, number> = { SAFE: 0, WARNING: 1, DANGER: 2 };

// Returns the worst (highest-severity) status among the given values, ignoring nulls.
export function worstRisk(...statuses: (RiskStatus | null | undefined)[]): RiskStatus | null {
  let worst: RiskStatus | null = null;
  for (const s of statuses) {
    if (!s) continue;
    if (!worst || RISK_RANK[s] > RISK_RANK[worst]) worst = s;
  }
  return worst;
}

export type LiveSensor = {
  sensor_id: number;
  sensor_code: string;
  sensor_name: string | null;
  sensor_type: 'DHT' | 'MOISTURE';
  gpio_pin: string;
  enabled: number;
  status: SensorStatus;
  temperature: number | null;
  humidity: number | null;
  moisture: number | null;
  temperature_status: RiskStatus | null;
  humidity_status: RiskStatus | null;
  moisture_status: RiskStatus | null;
  risk_status: RiskStatus | null;
  updated_at: string | null;
  seconds_since_update: number | null;
};

export const STATUS_CONFIG: Record<SensorStatus, { label: string; bg: string; text: string }> = {
  online: { label: 'Online', bg: '#E8F5E9', text: '#2E7D32' },
  no_signal: { label: 'No Signal', bg: '#FFF3E0', text: '#E65100' },
  disabled: { label: 'Disabled', bg: '#F0F0F0', text: '#777777' },
};

export function formatElapsed(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return 'Never';
  if (seconds < 60) return seconds <= 2 ? 'Just now' : `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} hr ago`;
}

// Shared modal for Enable (1 input: total_sacks) and Disable
// (2 inputs: healthy_sacks, damaged_sacks) of MOISTURE sensors.
export type BatchModalMode = 'enable' | 'disable' | null;

// Confirmation prompt shown before enabling/disabling ANY sensor (DHT or MOISTURE).
// onConfirm only fires if the user taps "Yes".
export function confirmSensorAction(action: 'enable' | 'disable', onConfirm: () => void) {
  Alert.alert(
    action === 'enable' ? 'Enable Sensor' : 'Disable Sensor',
    `Are you sure you want to ${action} this sensor?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: onConfirm },
    ]
  );
}

// ============================================================
// HISTORICAL READINGS (from get_sensor_history.php)
// ============================================================

export type HistoryPoint = {
  label: string;
  avg_temp: number | null;
  avg_humidity: number | null;
  avg_moisture: number | null;
};