import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AlertItem, SEVERITY_CONFIG, SOURCE_CONFIG, formatDateTime } from '@/constants/alertTypes';
import { styles } from '@/styles/alerts.styles';

export function AlertCard({ alert, onPress }: { alert: AlertItem; onPress: () => void }) {
  const cfg = SEVERITY_CONFIG[alert.status];
  const sourceCfg = SOURCE_CONFIG[alert.source];

  return (
    <TouchableOpacity
      style={[styles.alertCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.alertRow}>
        <Ionicons name={cfg.iconName} size={22} color={cfg.iconColor} style={styles.alertIcon} />
        <View style={styles.alertBody}>
          <View style={styles.sourceTagRow}>
            <Ionicons name={sourceCfg.iconName} size={11} color="rgba(255,255,255,0.85)" />
            <Text style={styles.sourceTagText}>{sourceCfg.label}</Text>
          </View>

          <Text style={styles.alertTitle}>
            {alert.title || cfg.label}
          </Text>
          <Text style={styles.alertText} numberOfLines={2}>
            {alert.subtitle || 'No details available.'}
          </Text>
          <Text style={styles.alertTime}>{formatDateTime(alert.created_at)}</Text>
        </View>
        {!alert.is_read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
}