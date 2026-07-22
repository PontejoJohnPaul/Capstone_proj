import { AlertCard } from '@/components/AlertCard';
import { AlertItem, SEVERITY_CONFIG, SOURCE_CONFIG, formatDateTime } from '@/constants/alertTypes';
import { API_BASE_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GREEN_DARK, modalStyles, styles } from '@/styles/alerts.styles';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selected, setSelected] = useState<AlertItem | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_alerts.php`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('GrainSense Alerts: failed to load alerts ->', error);
    }
  }, []);

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {alerts.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color="#AAAAAA" />
            <Text style={styles.emptyText}>No alerts yet.</Text>
          </View>
        )}

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