import { AlertCard } from '@/components/AlertCard';
import { BatchDatePicker } from '@/components/BatchDatePicker';
import { SeverityFilterDropdown } from '@/components/SeverityFilterDropdown';
import {
  ALL_SEVERITIES,
  AlertFilters,
  AlertItem,
  DEFAULT_ALERT_FILTERS,
  SEVERITY_CONFIG,
  SOURCE_CONFIG,
  buildAlertsQuery,
  formatDateTime,
  severityListToValue,
  severityValueToList,
} from '@/constants/alertTypes';
import { API_BASE_URL } from '@/constants/api';
import { getFarmerId } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GREEN_DARK, filterBarStyles, modalStyles, resetFilterStyles, styles } from '@/styles/alerts.styles';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selected, setSelected] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_ALERT_FILTERS);

  // Only the very first fetch should show the full-screen spinner. The
  // screen also refetches every 10s (and whenever filters change) --
  // without this guard, `loading` flips true/false on every one of those
  // background refreshes and blanks the whole list, which is what looked
  // like the screen "refreshing"/flashing white.
  const hasLoadedOnce = useRef(false);

  const loadAlerts = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      const farmerId = await getFarmerId();
      const query = buildAlertsQuery(farmerId, filters);
      const res = await fetch(`${API_BASE_URL}/get_alerts.php${query}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('GrainSense Alerts: failed to load alerts ->', error);
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, [filters]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  function openAlert(alert: AlertItem) {
    setSelected(alert);
  }

  async function closeAlert() {
    const alert = selected;
    setSelected(null);

    if (!alert || alert.is_read) return;

    // Optimistically mark as read locally, then confirm with the server.
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, is_read: true } : a))
    );

    try {
      await fetch(`${API_BASE_URL}/mark_alert_read.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${alert.id}`,
      });
    } catch (error) {
      console.error('GrainSense Alerts: failed to mark as read ->', error);
    }
  }

  const unreadAlerts = alerts.filter((a) => !a.is_read);
  const readAlerts = alerts.filter((a) => a.is_read);

  // Reset only makes sense to show once the user has actually changed
  // something away from the defaults (severity narrowed down from "All",
  // or a specific date picked instead of "All Dates").
  const hasDateFilter = !!(filters.day && filters.month && filters.year);
  const hasSeverityFilter = filters.severities.length !== ALL_SEVERITIES.length;
  const showReset = hasDateFilter || hasSeverityFilter;

  const selectedSeverityCfg = selected ? SEVERITY_CONFIG[selected.status] : null;
  const selectedSourceCfg = selected ? SOURCE_CONFIG[selected.source] : null;
  const isHistorical = selected?.source === 'historical';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Alerts</Text>
        {unreadAlerts.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadAlerts.length} Active</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={filterBarStyles.container}>
        <View style={filterBarStyles.row}>
          <View style={filterBarStyles.rightGroup}>
            <BatchDatePicker
              day={filters.day}
              month={filters.month}
              year={filters.year}
              onSelectDate={(d, m, y) => setFilters((prev) => ({ ...prev, day: d, month: m, year: y }))}
              onClear={() => setFilters((prev) => ({ ...prev, day: '', month: '', year: '' }))}
            />

            <SeverityFilterDropdown
              value={severityListToValue(filters.severities)}
              onChange={(next) =>
                setFilters((prev) => ({ ...prev, severities: severityValueToList(next) }))
              }
            />

            {showReset && (
              <TouchableOpacity
                style={resetFilterStyles.btn}
                onPress={() => setFilters(DEFAULT_ALERT_FILTERS)}
              >
                <Ionicons name="refresh-outline" size={14} color="#B71C1C" />
                <Text style={resetFilterStyles.btnText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator color={GREEN_DARK} />
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color="#AAAAAA" />
            <Text style={styles.emptyText}>No alerts match your filters.</Text>
          </View>
        ) : (
          <>
            {/* Unread Alerts */}
            {unreadAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onPress={() => openAlert(alert)} />
            ))}

            {/* Read Section */}
            {readAlerts.length > 0 && (
              <>
                <View style={styles.resolvedHeader}>
                  <Text style={styles.resolvedLabel}>Read</Text>
                </View>
                {readAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onPress={() => openAlert(alert)} />
                ))}
              </>
            )}
          </>
        )}

      </ScrollView>

      {/* Alert Detail Popup */}
      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={closeAlert}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            {selected && selectedSeverityCfg && selectedSourceCfg && (
              <>
                <View style={modalStyles.badgeRow}>
                  <View style={[modalStyles.statusBadge, { backgroundColor: selectedSeverityCfg.bg }]}>
                    <Ionicons name={selectedSeverityCfg.iconName} size={16} color={selectedSeverityCfg.iconColor} />
                    <Text style={[modalStyles.statusBadgeText, { color: selectedSeverityCfg.iconColor }]}>
                      {selectedSeverityCfg.label}
                    </Text>
                  </View>

                  <View style={modalStyles.sourcePill}>
                    <Ionicons name={selectedSourceCfg.iconName} size={12} color="#555555" />
                    <Text style={modalStyles.sourcePillText}>{selectedSourceCfg.label}</Text>
                  </View>
                </View>

                <ScrollView style={modalStyles.scrollArea} showsVerticalScrollIndicator>
                  <Text style={modalStyles.sectionLabel}>
                    {isHistorical ? 'Likely Pest(s)' : 'Predicted Pest'}
                  </Text>
                  <Text style={modalStyles.sectionValue}>
                    {selected.title || 'N/A'}
                  </Text>

                  <Text style={modalStyles.sectionLabel}>
                    {isHistorical ? 'Root Cause' : 'Possible Cause'}
                  </Text>
                  <Text style={modalStyles.sectionValue}>
                    {selected.subtitle || 'N/A'}
                  </Text>

                  {isHistorical && selected.extra && (
                    <>
                      <Text style={modalStyles.sectionLabel}>Contributing Conditions</Text>
                      <Text style={modalStyles.sectionValue}>{selected.extra}</Text>
                    </>
                  )}

                  <Text style={modalStyles.sectionLabel}>Recommendation</Text>
                  <Text style={modalStyles.sectionValue}>
                    {selected.recommendation || 'N/A'}
                  </Text>

                  <Text style={modalStyles.dateText}>{formatDateTime(selected.created_at)}</Text>
                </ScrollView>

                <TouchableOpacity style={modalStyles.closeBtn} onPress={closeAlert}>
                  <Text style={modalStyles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}