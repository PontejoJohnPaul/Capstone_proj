import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { BatchResult, formatBatchDate } from '@/constants/analyticsTypes';
import { batchDetailStyles as s, modalStyles } from '@/styles/analytics.styles';

export function BatchDetailModal({
  item,
  onClose,
}: {
  item: BatchResult | null;
  onClose: () => void;
}) {
  if (!item) return null;

  const healthy = item.healthy_sacks ?? 0;
  const damaged = item.damaged_sacks ?? 0;
  const total = healthy + damaged || item.total_sacks;
  const damagedPct = total > 0 ? Math.round((damaged / total) * 100) : 0;

  return (
    <Modal visible={!!item} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.card, s.card]}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={20} color="#777777" />
          </TouchableOpacity>

          <Text style={[modalStyles.title, s.titleWithClose]}>
            {item.sensor_name || item.sensor_code || `Batch #${item.batch_id}`}
          </Text>
          <Text style={[modalStyles.subtitle, s.subtitleLeft]}>{formatBatchDate(item.finished_at)}</Text>

          <ScrollView style={s.scroll}>
            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statValue}>{healthy}</Text>
                <Text style={s.statLabel}>Safe Sacks</Text>
              </View>
              <View style={s.statBox}>
                <Text style={[s.statValue, damaged > 0 && s.statValueDanger]}>{damaged}</Text>
                <Text style={s.statLabel}>Pest-Affected</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statValue}>{total}</Text>
                <Text style={s.statLabel}>Total Sacks</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statValue}>
                  {item.avg_moisture !== null ? `${item.avg_moisture}%` : '--'}
                </Text>
                <Text style={s.statLabel}>Avg Moisture</Text>
              </View>
            </View>

            {damaged > 0 && (
              <View style={s.pctBanner}>
                <Text style={s.pctBannerText}>
                  {damagedPct}% of this batch was pest-affected
                </Text>
              </View>
            )}

            {item.notes ? (
              <>
                <Text style={s.notesLabel}>AI Analysis & Recommendation</Text>
                <Text style={s.notesText}>{item.notes}</Text>
              </>
            ) : (
              <Text style={s.notesEmpty}>No AI notes recorded for this batch.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}