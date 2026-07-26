import { Ionicons } from '@expo/vector-icons';

// Historical reports only exist for infested batches (they're generated
// when a batch finishes with damaged sacks), so they're always DANGER-tier.
// Realtime alerts (ai_analysis) can be SAFE, WARNING, or DANGER.
export type AlertSeverity = 'SAFE' | 'WARNING' | 'DANGER';

// 'realtime'   -> from ai_analysis (per-reading prediction)
// 'historical' -> from batch_results.notes (Root Cause Analysis
//                 generated when a batch finishes with infested sacks)
export type AlertSource = 'realtime' | 'historical';

export type AlertItem = {
  id: string;           // "rt-5" or "hist-3" -- unique across both sources
  source_id: number;    // the underlying analysis_id / result_id
  source: AlertSource;
  batch_id: number;
  status: AlertSeverity;
  title: string | null;          // predicted_pest (realtime) or likely_pests (historical)
  subtitle: string | null;       // possible_cause (realtime) or root_cause (historical)
  extra: string | null;          // contributing_conditions -- historical only
  recommendation: string | null;
  is_read: boolean;
  created_at: string;
};

export type SeverityConfig = {
  bg: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  border: string;
  label: string;
};

export const SEVERITY_CONFIG: Record<AlertSeverity, SeverityConfig> = {
  DANGER: {
    bg: '#B71C1C',
    iconName: 'warning',
    iconColor: '#FFCDD2',
    border: '#C62828',
    label: 'Danger',
  },
  WARNING: {
    bg: '#E65100',
    iconName: 'warning-outline',
    iconColor: '#FFE0B2',
    border: '#EF6C00',
    label: 'Warning',
  },
  SAFE: {
    bg: '#2E7D32',
    iconName: 'checkmark-circle-outline',
    iconColor: '#C8E6C9',
    border: '#2E7D32',
    label: 'Safe',
  },
};

export type SourceConfig = {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

// Small tag shown on every card/detail so it's always clear which
// pipeline generated the alert -- same red/orange severity styling
// either way, just a different label + icon.
export const SOURCE_CONFIG: Record<AlertSource, SourceConfig> = {
  realtime: {
    label: 'Real-time',
    iconName: 'pulse-outline',
  },
  historical: {
    label: 'Historical Report',
    iconName: 'document-text-outline',
  },
};

export function formatDateTime(isoLike: string): string {
  const d = new Date(isoLike.replace(' ', 'T'));
  if (isNaN(d.getTime())) return isoLike;
  const dateStr = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dateStr}, ${timeStr}`;
}

// ============================================================
// FILTERS (calendar date + severity toggles)
// ============================================================

export type AlertFilters = {
  day: string; // '' = none, else '1'-'31'
  month: string; // '' = none, else '1'-'12'
  year: string; // '' = none, else e.g. '2026'
  severities: AlertSeverity[]; // which severities to show; never empty
};

export const DEFAULT_ALERT_FILTERS: AlertFilters = {
  day: '',
  month: '',
  year: '',
  severities: ['SAFE', 'WARNING', 'DANGER'],
};

export const ALL_SEVERITIES: AlertSeverity[] = ['SAFE', 'WARNING', 'DANGER'];

// ============================================================
// Severity dropdown (All / Safe / Warning / Danger, single-select)
// ============================================================
// The dropdown itself only ever holds one of these 4 values, but the
// PHP endpoint (and AlertFilters.severities) still speaks in terms of
// a comma-separated list, so we convert both ways.
export type SeverityFilterValue = 'ALL' | AlertSeverity;

export function severityValueToList(value: SeverityFilterValue): AlertSeverity[] {
  return value === 'ALL' ? ALL_SEVERITIES : [value];
}

export function severityListToValue(list: AlertSeverity[]): SeverityFilterValue {
  return list.length === 1 ? list[0] : 'ALL';
}

// Builds the query string for get_alerts.php from the current filters.
export function buildAlertsQuery(farmerId: number | null, filters: AlertFilters): string {
  const params = new URLSearchParams();
  if (farmerId) params.set('farmer_id', String(farmerId));
  if (filters.day) params.set('day', filters.day);
  if (filters.month) params.set('month', filters.month);
  if (filters.year) params.set('year', filters.year);
  params.set('severity', filters.severities.join(','));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}