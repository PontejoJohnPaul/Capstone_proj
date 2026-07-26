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

// ============================================================
// BATCH RESULTS (from get_batch_results.php)
// ============================================================

export type BatchResult = {
  result_id: number;
  batch_id: number;
  healthy_sacks: number | null;
  damaged_sacks: number | null;
  notes: string | null;
  is_read: number;
  finished_at: string;
  total_sacks: number;
  batch_started_at: string;
  sensor_code: string | null;
  sensor_name: string | null;
  avg_moisture: number | null;
};

// ---- Filters for the Batch Results table ----

export type SackFilter = 'all' | 'safe' | 'damaged';
export type MoistureFilter = 'all' | 'safe' | 'high';

export type BatchFilters = {
  day: string; // '' = All, else '1'-'31'
  month: string; // '' = All, else '1'-'12'
  year: string; // '' = All, else e.g. '2026'
  sackFilter: SackFilter;
  moistureFilter: MoistureFilter;
};

export const DEFAULT_BATCH_FILTERS: BatchFilters = {
  day: '',
  month: '',
  year: '',
  sackFilter: 'all',
  moistureFilter: 'all',
};

export type FilterOption<T extends string = string> = { label: string; value: T };

export const MONTH_OPTIONS: FilterOption[] = [
  { label: 'All Months', value: '' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS: FilterOption[] = [
  { label: 'All Years', value: '' },
  ...[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => ({
    label: String(y),
    value: String(y),
  })),
];

export const DAY_OPTIONS: FilterOption[] = [
  { label: 'All Days', value: '' },
  ...Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })),
];

export const SACK_FILTER_OPTIONS: FilterOption<SackFilter>[] = [
  { label: 'All', value: 'all' },
  { label: 'Safe Only', value: 'safe' },
  { label: 'Damaged Only', value: 'damaged' },
];

export const MOISTURE_FILTER_OPTIONS: FilterOption<MoistureFilter>[] = [
  { label: 'All', value: 'all' },
  { label: 'Safe (<14%)', value: 'safe' },
  { label: 'High (≥14%)', value: 'high' },
];

// Builds the query string for get_batch_results.php from the current filters/page.
export function buildBatchResultsQuery(
  farmerId: number,
  page: number,
  filters: BatchFilters
): string {
  const params = new URLSearchParams();
  params.set('farmer_id', String(farmerId));
  params.set('page', String(page));
  if (filters.day) params.set('day', filters.day);
  if (filters.month) params.set('month', filters.month);
  if (filters.year) params.set('year', filters.year);
  if (filters.sackFilter !== 'all') params.set('sack_filter', filters.sackFilter);
  if (filters.moistureFilter !== 'all') params.set('moisture_filter', filters.moistureFilter);
  return params.toString();
}

// Formats a MySQL timestamp string (e.g. "2026-07-19 07:12:40") into
// something readable like "Jul 19, 2026 · 7:12 AM".
export function formatBatchDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(parsed.getTime())) return dateStr;
  const datePart = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}