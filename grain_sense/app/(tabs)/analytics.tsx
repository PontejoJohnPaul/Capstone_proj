import { API_BASE_URL } from '@/constants/api';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BatchModal } from '@/components/BatchModal';
import { ChartCard } from '@/components/ChartCard';
import { RiskAnalysisCard } from '@/components/RiskAnalysisCard';
import { SensorMonitorCard } from '@/components/SensorMonitorCard';
import {
  BatchModalMode,
  GREEN_DARK,
  GREEN_MID,
  HistoryPoint,
  LiveSensor,
  TABS,
  TAB_TO_RANGE,
  TabKey,
  confirmSensorAction,
} from '@/constants/analyticsTypes';
import { monitorStyles, styles } from '@/styles/analytics.styles';
import { getFarmerId } from '@/utils/auth';

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('Today');
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [sensors, setSensors] = useState<LiveSensor[]>([]);
  const [busySensorId, setBusySensorId] = useState<number | null>(null);

  // Batch modal state
  const [modalMode, setModalMode] = useState<BatchModalMode>(null);
  const [modalSensor, setModalSensor] = useState<LiveSensor | null>(null);
  const [totalSacksInput, setTotalSacksInput] = useState('');
  const [healthySacksInput, setHealthySacksInput] = useState('');
  const [damagedSacksInput, setDamagedSacksInput] = useState('');

  const loadSensors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_live_monitoring.php`);
      const data = await res.json();
      if (data.success) {
        setSensors(data.sensors);
      }
    } catch (error) {
      console.error('GrainSense Analytics: failed to load live monitoring ->', error);
    }
  }, []);

  const loadHistory = useCallback(async (tab: TabKey) => {
    setHistoryLoading(true);
    try {
      const range = TAB_TO_RANGE[tab];
      const res = await fetch(`${API_BASE_URL}/get_sensor_history.php?range=${range}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.readings);
      }
    } catch (error) {
      console.error('GrainSense Analytics: failed to load history ->', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSensors();
    const interval = setInterval(loadSensors, 5000);
    return () => clearInterval(interval);
  }, [loadSensors]);

  useEffect(() => {
    loadHistory(activeTab);
  }, [activeTab, loadHistory]);

  async function handleToggleDht(sensor: LiveSensor) {
    const willEnable = !sensor.enabled;
    setBusySensorId(sensor.sensor_id);
    try {
      const res = await fetch(`${API_BASE_URL}/toggle_sensor_enable.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `sensor_id=${sensor.sensor_id}&enabled=${willEnable ? '1' : '0'}`,
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert('Error', data.message || 'Failed to update sensor.');
      } else {
        Alert.alert('Success', `Sensor ${willEnable ? 'enabled' : 'disabled'} successfully.`);
      }
      await loadSensors();
    } catch (error) {
      console.error('GrainSense Analytics: toggle failed ->', error);
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setBusySensorId(null);
    }
  }

  // Confirmation gate for DHT sensors — actual toggle only runs if the user taps "Yes".
  function handleToggleDhtPress(sensor: LiveSensor) {
    confirmSensorAction(sensor.enabled ? 'disable' : 'enable', () => handleToggleDht(sensor));
  }

  function openBatchModal(sensor: LiveSensor, mode: BatchModalMode) {
    setModalSensor(sensor);
    setModalMode(mode);
    setTotalSacksInput('');
    setHealthySacksInput('');
    setDamagedSacksInput('');
  }

  // Confirmation gate for MOISTURE sensors — the sacks-input card only opens after "Yes".
  function handleOpenBatchModalPress(sensor: LiveSensor, mode: BatchModalMode) {
    if (!mode) return;
    confirmSensorAction(mode, () => openBatchModal(sensor, mode));
  }

  function closeBatchModal() {
    setModalMode(null);
    setModalSensor(null);
  }

  async function submitEnableBatch() {
    if (!modalSensor) return;
    const totalSacks = parseInt(totalSacksInput, 10);
    if (!totalSacks || totalSacks <= 0) {
      Alert.alert('Missing Input', 'Enter the number of rice sacks.');
      return;
    }

    const farmerId = await getFarmerId();
    if (!farmerId) {
      Alert.alert('Session Expired', 'Please log in again to continue.');
      return;
    }

    setBusySensorId(modalSensor.sensor_id);
    try {
      const res = await fetch(`${API_BASE_URL}/enable_moisture_sensor.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `sensor_id=${modalSensor.sensor_id}&total_sacks=${totalSacks}&farmer_id=${farmerId}`,
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert('Error', data.message || 'Failed to start the batch.');
      } else {
        closeBatchModal();
        Alert.alert('Success', 'Sensor enabled successfully.');
      }
      await loadSensors();
    } catch (error) {
      console.error('GrainSense Analytics: enable batch failed ->', error);
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setBusySensorId(null);
    }
  }

  async function submitDisableBatch() {
    if (!modalSensor) return;
    const healthy = parseInt(healthySacksInput, 10) || 0;
    const damaged = parseInt(damagedSacksInput, 10) || 0;

    if (healthy === 0 && damaged === 0) {
      Alert.alert('Missing Input', 'Enter the number of safe and pest-affected sacks.');
      return;
    }

    setBusySensorId(modalSensor.sensor_id);
    try {
      const res = await fetch(`${API_BASE_URL}/disable_moisture_sensor.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `sensor_id=${modalSensor.sensor_id}&healthy_sacks=${healthy}&damaged_sacks=${damaged}`,
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert('Error', data.message || 'Failed to close the batch.');
      } else {
        closeBatchModal();
        Alert.alert('Success', 'Sensor disabled successfully.');
      }
      await loadSensors();
    } catch (error) {
      console.error('GrainSense Analytics: disable batch failed ->', error);
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setBusySensorId(null);
    }
  }

  const tempLabels = history.filter((h) => h.avg_temp !== null).map((h) => h.label);
  const tempData = history.filter((h) => h.avg_temp !== null).map((h) => h.avg_temp as number);

  const humidityLabels = history.filter((h) => h.avg_humidity !== null).map((h) => h.label);
  const humidityData = history.filter((h) => h.avg_humidity !== null).map((h) => h.avg_humidity as number);

  const moistureLabels = history.filter((h) => h.avg_moisture !== null).map((h) => h.label);
  const moistureData = history.filter((h) => h.avg_moisture !== null).map((h) => h.avg_moisture as number);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ===== Risk Analysis Summary ===== */}
        <RiskAnalysisCard sensors={sensors} />

        {/* ===== Live Sensors Section ===== */}
        <Text style={monitorStyles.sectionTitle}>Live Sensors</Text>

        {sensors.length === 0 ? (
          <View style={monitorStyles.emptyCard}>
            <Text style={monitorStyles.emptyText}>No sensors found. Check your connection.</Text>
          </View>
        ) : (
          sensors.map((sensor) => (
            <SensorMonitorCard
              key={sensor.sensor_id}
              sensor={sensor}
              onToggleDht={handleToggleDhtPress}
              onOpenBatchModal={handleOpenBatchModalPress}
              busy={busySensorId === sensor.sensor_id}
            />
          ))
        )}

        {/* ===== Historical Readings Section ===== */}
        <Text style={[monitorStyles.sectionTitle, { marginTop: 8 }]}>Reading History</Text>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {historyLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={GREEN_MID} />
          </View>
        ) : (
          <>
            <ChartCard
              title="Temperature (°C) — All Sensors Avg"
              dotColor="#2E7D32"
              labels={tempLabels}
              data={tempData}
            />
            <ChartCard
              title="Humidity (%) — All Sensors Avg"
              dotColor="#1565C0"
              labels={humidityLabels}
              data={humidityData}
            />
            <ChartCard
              title="Moisture (%) — All Sensors Avg"
              dotColor="#FFC107"
              labels={moistureLabels}
              data={moistureData}
              dark
            />
          </>
        )}

      </ScrollView>

      {/* ===== Batch Modal (Enable / Disable a MOISTURE sensor) ===== */}
      <BatchModal
        mode={modalMode}
        sensor={modalSensor}
        totalSacksInput={totalSacksInput}
        setTotalSacksInput={setTotalSacksInput}
        healthySacksInput={healthySacksInput}
        setHealthySacksInput={setHealthySacksInput}
        damagedSacksInput={damagedSacksInput}
        setDamagedSacksInput={setDamagedSacksInput}
        onClose={closeBatchModal}
        onSubmitEnable={submitEnableBatch}
        onSubmitDisable={submitDisableBatch}
      />
    </SafeAreaView>
  );
}