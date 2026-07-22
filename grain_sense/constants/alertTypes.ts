import { Ionicons } from '@expo/vector-icons';

// SAFE is intentionally excluded -- get_alerts.php only returns
// WARNING/DANGER for real-time alerts, and historical reports are
// always treated as DANGER-tier (they only exist for infested batches).
export type AlertSeverity = 'WARNING' | 'DANGER';

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