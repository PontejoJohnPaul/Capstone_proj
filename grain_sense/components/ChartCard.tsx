import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import {
    CHART_WIDTH,
    ChartCardProps,
    GREEN_DARK,
    POINT_WIDTH,
    chartConfig,
} from '@/constants/analyticsTypes';
import { styles } from '@/styles/analytics.styles';

export function ChartCard({ title, dotColor, labels, data, dark }: ChartCardProps) {
  const renderWidth = Math.max(CHART_WIDTH, labels.length * POINT_WIDTH);

  return (
    <View style={[styles.chartCard, dark && { backgroundColor: GREEN_DARK }]}>
      <View style={styles.chartHeader}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={[styles.chartTitle, dark && { color: '#FFFFFF' }]}>{title}</Text>
      </View>

      {labels.length === 0 ? (
        <View style={styles.noDataBox}>
          <Text style={[styles.noDataText, dark && { color: '#A5D6A7' }]}>
            No readings yet for this period.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginLeft: -16 }}>
          <LineChart
            data={{ labels, datasets: [{ data }] }}
            width={renderWidth}
            height={180}
            chartConfig={
              dark
                ? {
                    backgroundGradientFrom: GREEN_DARK,
                    backgroundGradientTo: GREEN_DARK,
                    decimalPlaces: 0,
                    color: () => dotColor,
                    labelColor: () => '#A5D6A7',
                    strokeWidth: 2,
                    propsForDots: { r: '3', strokeWidth: '2', stroke: dotColor },
                    propsForBackgroundLines: { stroke: '#1F6B2C' },
                  }
                : chartConfig(dotColor)
            }
            bezier
            withInnerLines
            withOuterLines={false}
            style={styles.chart}
            yAxisSuffix=""
            fromZero={false}
          />
        </ScrollView>
      )}
    </View>
  );
}