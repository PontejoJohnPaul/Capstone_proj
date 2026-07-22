import { API_BASE_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SensorCard } from '@/components/SensorCard';
import { GREEN_DARK, GREEN_MID, HomeSummary } from '@/constants/homeTypes';
import { styles } from '@/styles/index.styles';

export default function HomeScreen() {
  const router = useRouter();
  const [farmerName, setFarmerName] = useState('');
  const [summary, setSummary] = useState<HomeSummary>({
    temperature: null,
    humidity: null,
    moisture: null,
    last_update: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/get_user_profile.php`);
        const data = await res.json();

        if (isMounted && data.success && data.data) {
          const fullName = `${data.data.firstName} ${data.data.lastName}`.trim();
          setFarmerName(fullName);
        }
      } catch (error) {
        console.error('GrainSense Home: failed to load profile ->', error);
      }
    }

    loadProfile();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const res = await fetch(`${API_BASE_URL}/get_home_summary.php`);
        const data = await res.json();

        if (isMounted && data.success) {
          setSummary({
            temperature: data.temperature,
            humidity: data.humidity,
            moisture: data.moisture,
            last_update: data.last_update,
          });
        }
      } catch (error) {
        console.error('GrainSense Home: failed to load summary ->', error);
      }
    }

    loadSummary();
    const interval = setInterval(loadSummary, 15000); // refresh every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const tempDisplay = summary.temperature !== null ? summary.temperature.toString() : '--';
  const humidityDisplay = summary.humidity !== null ? summary.humidity.toString() : '--';
  const moistureDisplay = summary.moisture !== null ? summary.moisture.toString() : '--';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/grain-sense-logo.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />
        <Text style={styles.headerTitle}>Grain Sense</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <Text style={styles.goodDay}>Good Day,</Text>
          <Text style={styles.userName}>{farmerName || '...'}</Text>
          <Text style={styles.dateTime}>As of {dateStr}, {timeStr}</Text>
          <View style={styles.storageBadge}>
            <Ionicons name="leaf" size={13} color="#A5D6A7" />
            <Text style={styles.storageBadgeText}>Storage Active</Text>
          </View>
        </View>

        {/* Sensor Cards Row */}
        <View style={styles.sensorRow}>
          <SensorCard
            label="Temperature"
            value={tempDisplay}
            unit="°C"
            iconName="thermometer-outline"
            iconColor="#C62828"
            iconBg="#FFEBEE"
            tag="Slightly High"
            tagIcon="arrow-up"
            tagIconColor="#B71C1C"
            tagColor="#B71C1C"
            tagBg="#FFEBEE"
          />
          <SensorCard
            label="Humidity"
            value={humidityDisplay}
            unit="%"
            iconName="water-outline"
            iconColor="#1565C0"
            iconBg="#E3F2FD"
            tag="Monitor Closely"
            tagIcon="ellipse"
            tagIconColor="#E65100"
            tagColor="#E65100"
            tagBg="#FFF3E0"
          />
        </View>

        {/* Grain Moisture Card */}
        <View style={styles.moistureCard}>
          <View style={styles.moistureLeft}>
            <View style={styles.moistureIconBadge}>
              <Ionicons name="leaf-outline" size={26} color={GREEN_MID} />
            </View>
            <View>
              <Text style={styles.moistureLabel}>Grain Moisture</Text>
              <View style={styles.moistureValueRow}>
                <Text style={styles.moistureValue}>{moistureDisplay}</Text>
                <Text style={styles.moistureUnit}>%</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.detailsBtn} onPress={() => router.push('/analytics')}>
            <Text style={styles.detailsBtnText}>View more details</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About us</Text>
          <Text style={styles.aboutBody}>
            Development of a Solar-Powered IoT-Based Post-Harvest Monitoring System for Stored Palay with
            AI-Driven Predictive Pest Risk Alerts and SMS Notification for Local Farmers. Designed to
            support farmers in protecting their harvested rice from losses during storage.
          </Text>
          <Text style={styles.aboutBody}>
            We aim to provide a smart and sustainable solution by combining Internet of Things (IoT)
            technology, Artificial Intelligence (AI), and solar power to monitor storage conditions such as
            temperature, humidity, and grain moisture in real time. Through predictive analytics, the system
            can detect potential pest risks early and send timely alerts via SMS, allowing farmers to take
            immediate action.
          </Text>
          <Text style={styles.aboutBody}>
            Our goal is to reduce post-harvest losses, improve grain quality, and empower local farmers with
            accessible and efficient technology—even in remote areas with limited electricity and internet
            connectivity. By integrating innovation with agriculture, we aim to contribute to food security
            and enhance the livelihood of farming communities.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}