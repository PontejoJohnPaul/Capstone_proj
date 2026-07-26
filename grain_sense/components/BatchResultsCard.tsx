import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { BatchDetailModal } from '@/components/BatchDetailModal';
import { BatchResult, formatBatchDate } from '@/constants/analyticsTypes';
import { batchTableStyles as s } from '@/styles/analytics.styles';

const COL = {
  date: 118,
  sensor: 110,
  safe: 60,
  damaged: 76,
  moisture: 82,
  status: 92,
};

function statusFor(item: BatchResult) {
  const damaged = item.damaged_sacks ?? 0;
  if (damaged > 0) return { label: 'Damaged', color: '#C62828', bg: '#FFEBEE' };
  return { label: 'Safe', color: '#2E7D32', bg: '#E8F5E9' };
}

export function BatchResultsCard({ results }: { results: BatchResult[] }) {
  const [selected, setSelected] = useState<BatchResult | null>(null);

  if (results.length === 0) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyText}>No batch results match your filters.</Text>
      </View>
    );
  }

  return (
    <View style={s.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* ===== Header Row ===== */}
          <View style={s.headerRow}>
            <Text style={[s.headerCell, { width: COL.date }]}>Date</Text>
            <Text style={[s.headerCell, { width: COL.sensor }]}>Sensor</Text>
            <Text style={[s.headerCell, { width: COL.safe }]}>Safe</Text>
            <Text style={[s.headerCell, { width: COL.damaged }]}>Damaged</Text>
            <Text style={[s.headerCell, { width: COL.moisture }]}>Moisture</Text>
            <Text style={[s.headerCell, { width: COL.status }]}>Status</Text>
          </View>

          {/* ===== Body (vertically scrollable, capped height) ===== */}
          <ScrollView style={s.body} nestedScrollEnabled showsVerticalScrollIndicator>
            {results.map((item) => {
              const st = statusFor(item);
              return (
                <TouchableOpacity
                  key={item.result_id}
                  style={s.row}
                  onPress={() => setSelected(item)}
                  activeOpacity={0.6}
                >
                  <Text style={[s.cell, { width: COL.date }]}>
                    {formatBatchDate(item.finished_at)}
                  </Text>
                  <Text style={[s.cell, { width: COL.sensor }]} numberOfLines={1}>
                    {item.sensor_name || item.sensor_code || `#${item.batch_id}`}
                  </Text>
                  <Text style={[s.cell, { width: COL.safe }]}>{item.healthy_sacks ?? 0}</Text>
                  <Text style={[s.cell, { width: COL.damaged }]}>{item.damaged_sacks ?? 0}</Text>
                  <Text style={[s.cell, { width: COL.moisture }]}>
                    {item.avg_moisture !== null ? `${item.avg_moisture}%` : '--'}
                  </Text>
                  <View style={[s.statusBadge, { width: COL.status, backgroundColor: st.bg }]}>
                    <Text style={[s.statusBadgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      <Text style={s.hint}>
        <Ionicons name="information-circle-outline" size={12} color="#9AA0A6" /> Tap a row for
        full details
      </Text>

      <BatchDetailModal item={selected} onClose={() => setSelected(null)} />
    </View>
  );
}