import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ───────────────────────────────────────────────────────────────
const GREEN_DARK = '#0F3D1C';
const GREEN_MID  = '#1F6B2C';
const GOLD       = '#D9A441'; // GrainSense brand accent

// ─── Weather Code → icon name + condition ────────────────────────────────────
type WeatherInfo = { iconName: keyof typeof Ionicons.glyphMap; iconColor: string; condition: string };

function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0)  return { iconName: 'sunny',              iconColor: '#F9A825', condition: 'Clear'             };
  if (code === 1)  return { iconName: 'partly-sunny',       iconColor: '#FBC02D', condition: 'Mostly Clear'      };
  if (code === 2)  return { iconName: 'partly-sunny',       iconColor: '#90A4AE', condition: 'Partly Cloudy'     };
  if (code === 3)  return { iconName: 'cloudy',             iconColor: '#78909C', condition: 'Cloudy'            };
  if (code <= 49)  return { iconName: 'cloud',              iconColor: '#90A4AE', condition: 'Foggy'             };
  if (code <= 55)  return { iconName: 'rainy-outline',      iconColor: '#64B5F6', condition: 'Light Drizzle'     };
  if (code <= 59)  return { iconName: 'rainy',              iconColor: '#42A5F5', condition: 'Drizzle'           };
  if (code <= 61)  return { iconName: 'rainy-outline',      iconColor: '#42A5F5', condition: 'Light Rain'        };
  if (code <= 65)  return { iconName: 'rainy',              iconColor: '#1E88E5', condition: 'Rain'              };
  if (code <= 69)  return { iconName: 'rainy',              iconColor: '#1565C0', condition: 'Heavy Rain'        };
  if (code <= 79)  return { iconName: 'snow',               iconColor: '#90CAF9', condition: 'Snow'              };
  if (code === 80) return { iconName: 'rainy-outline',      iconColor: '#42A5F5', condition: 'Light Showers'     };
  if (code === 81) return { iconName: 'rainy',              iconColor: '#1E88E5', condition: 'Rain Showers'      };
  if (code === 82) return { iconName: 'rainy',              iconColor: '#1565C0', condition: 'Heavy Showers'     };
  if (code <= 84)  return { iconName: 'snow',               iconColor: '#90CAF9', condition: 'Snow Showers'      };
  if (code <= 94)  return { iconName: 'thunderstorm',       iconColor: '#2E7D32', condition: 'Thunderstorm'      };
  if (code <= 99)  return { iconName: 'thunderstorm',       iconColor: '#1B5E20', condition: 'Heavy Thunderstorm'};
  return { iconName: 'help-circle-outline', iconColor: '#AAAAAA', condition: 'Unknown' };
}

function getWindDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatDate(dateStr: string): { label: string; dayName: string } {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const label   = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayName = d.toLocaleDateString('en-PH', { weekday: 'short' });
  return { label, dayName };
}

// Converts "17:00" → "5:00 PM", "05:00" → "5:00 AM"
function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${suffix}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
type GeoResult = { name: string; admin1?: string; country: string; latitude: number; longitude: number };

type HourlySlot = {
  time: string;
  temp: number;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  rain: number;
};

type ForecastDay = {
  date: string; dayName: string; isToday: boolean;
  iconName: keyof typeof Ionicons.glyphMap; iconColor: string; condition: string;
  rainChance: number; low: number; high: number; hourly: HourlySlot[];
  dryingAdvisory: DryingAdvisory;
};

type CurrentWeather = {
  temp: number;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  condition: string;
  wind: string; rainChance: number; asOf: string;
};

// ─── Palay Drying Advisory (rule-based, no AI needed) ────────────────────────
// Based purely on rain chance + weather code for that day -- rain is the
// main enemy of sun-drying palay, so we don't need sensor/AI data for this.
type DryingSuitability = 'good' | 'fair' | 'poor';

type DryingAdvisory = {
  suitability: DryingSuitability;
  label: string;
  message: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

function getDryingAdvisory(rainChance: number, weathercode: number): DryingAdvisory {
  const isRainy = weathercode >= 51; // drizzle, rain, showers, thunderstorm (see getWeatherInfo)

  if (isRainy || rainChance >= 60) {
    return {
      suitability: 'poor',
      label: 'Iwasan Munang Magbilad',
      message: 'Malaki ang tsansa ng ulan ngayong araw na ito — mas mainam maghintay ng mas maaraw na araw para hindi mabasa ang palay.',
      iconName: 'close-circle',
      color: '#C62828',
      bg: '#FDECEA',
    };
  }

  if (weathercode <= 2 && rainChance < 30) {
    return {
      suitability: 'good',
      label: 'Magandang Magbilad',
      message: 'Maaraw at halos walang inaasahang ulan — magandang araw para magbilad ng palay.',
      iconName: 'checkmark-circle',
      color: '#2E7D32',
      bg: '#EAF7EA',
    };
  }

  return {
    suitability: 'fair',
    label: 'Puwede, Pero Bantayan',
    message: 'Medyo maulap o may pagkakataong umulan mamaya — puwede pang magbilad pero laging bantayan ang langit.',
    iconName: 'alert-circle',
    color: '#E65100',
    bg: '#FFF3E0',
  };
}

// ─── API Helpers ─────────────────────────────────────────────────────────────
async function searchLocations(query: string): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res  = await fetch(url);
  const data = await res.json();
  return data.results ?? [];
}

async function fetchWeatherForCoords(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,precipitation_probability` +
    `&hourly=temperature_2m,weathercode,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Asia%2FManila` +
    `&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WeatherScreen() {
  const [locationLabel, setLocationLabel] = useState('Sabang, Nasugbu, Batangas');
  const [coords, setCoords]               = useState({ lat: 14.0667, lon: 120.6333 });

  const [searchText, setSearchText]       = useState('');
  const [suggestions, setSuggestions]     = useState<GeoResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer                       = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [current, setCurrent]             = useState<CurrentWeather | null>(null);
  const [forecast, setForecast]           = useState<ForecastDay[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => { loadWeather(); }, [coords]);

  async function loadWeather() {
    try {
      setLoading(true);
      setError(null);
      setExpandedIndex(null);

      const data = await fetchWeatherForCoords(coords.lat, coords.lon);

      // Current
      const c = data.current;
      const { iconName, iconColor, condition } = getWeatherInfo(c.weathercode);
      const now = new Date(c.time);
      const asOf = now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

      // Current hour in Manila time (the API time is already Manila)
      const currentHour = now.getHours();

      // Today's date string (YYYY-MM-DD)
      const todayStr = data.daily.time[0] as string;

      setCurrent({
        temp: Math.round(c.temperature_2m),
        iconName, iconColor, condition,
        wind: `${Math.round(c.windspeed_10m)} km/h ${getWindDir(c.winddirection_10m)}`,
        rainChance: c.precipitation_probability ?? 0,
        asOf,
      });

      // Hourly map
      const hourlyByDate: Record<string, HourlySlot[]> = {};
      data.hourly.time.forEach((t: string, idx: number) => {
        const [datePart, timePart] = t.split('T');
        const hour = parseInt(timePart.split(':')[0]);

        // For today: only show hours >= current hour (skip past hours), start from 5am min
        // For other days: show 5am onwards
        if (datePart === todayStr) {
          if (hour < 5 || hour < currentHour) return;
        } else {
          if (hour < 5) return;
        }

        if (!hourlyByDate[datePart]) hourlyByDate[datePart] = [];
        const { iconName: hIcon, iconColor: hColor } = getWeatherInfo(data.hourly.weathercode[idx]);
        hourlyByDate[datePart].push({
          time: formatTime(timePart.slice(0, 5)),
          temp: Math.round(data.hourly.temperature_2m[idx]),
          iconName: hIcon,
          iconColor: hColor,
          rain: data.hourly.precipitation_probability[idx] ?? 0,
        });
      });

      // Daily
      const days: ForecastDay[] = data.daily.time.map((dateStr: string, i: number) => {
        const { label, dayName } = formatDate(dateStr);
        const { iconName: dIcon, iconColor: dColor, condition: dCond } = getWeatherInfo(data.daily.weathercode[i]);
        const rainChance = data.daily.precipitation_probability_max[i] ?? 0;
        return {
          date: label, dayName,
          isToday: i === 0,
          iconName: dIcon, iconColor: dColor, condition: dCond,
          rainChance,
          low:  Math.round(data.daily.temperature_2m_min[i]),
          high: Math.round(data.daily.temperature_2m_max[i]),
          hourly: hourlyByDate[dateStr] ?? [],
          dryingAdvisory: getDryingAdvisory(rainChance, data.daily.weathercode[i]),
        };
      });

      setForecast(days);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function onSearchChange(text: string) {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchLocations(text);
      setSuggestions(results);
      setSearchLoading(false);
    }, 400);
  }

  function selectLocation(geo: GeoResult) {
    const label = [geo.name, geo.admin1, geo.country].filter(Boolean).join(', ');
    setLocationLabel(label);
    setCoords({ lat: geo.latitude, lon: geo.longitude });
    setSearchText('');
    setSuggestions([]);
    Keyboard.dismiss();
  }

  function toggleExpand(index: number) {
    setExpandedIndex(prev => (prev === index ? null : index));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Forecast</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={GREEN_MID} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city or municipality…"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
          {searchLoading && <ActivityIndicator size="small" color={GREEN_MID} style={{ marginRight: 8 }} />}
          {searchText.length > 0 && !searchLoading && (
            <TouchableOpacity onPress={() => { setSearchText(''); setSuggestions([]); }}>
              <Ionicons name="close-circle" size={18} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((geo, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggestionRow, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => selectLocation(geo)}
              >
                <Ionicons name="location-outline" size={14} color={GREEN_MID} style={{ marginRight: 6 }} />
                <Text style={styles.suggestionName}>
                  {geo.name}{geo.admin1 ? `, ${geo.admin1}` : ''}
                </Text>
                <Text style={styles.suggestionCountry}>{geo.country}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN_MID} />
          <Text style={styles.loadingText}>Fetching weather data…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={32} color="#B00020" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadWeather}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Current Weather Card */}
          {current && (
            <View style={styles.currentCard}>
              <Text style={styles.asOfLabel}>TODAY · {current.asOf}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={14} color={GOLD} style={{ marginRight: 5 }} />
                <Text style={styles.locationText}>{locationLabel}</Text>
              </View>
              <View style={styles.tempRow}>
                <View>
                  <View style={styles.tempNumRow}>
                    <Text style={styles.tempNum}>{current.temp}</Text>
                    <Text style={styles.tempUnit}>°C</Text>
                  </View>
                  <Text style={styles.condition}>{current.condition}</Text>
                </View>
                <View style={styles.currentIconBadge}>
                  <Ionicons name={current.iconName} size={54} color={current.iconColor} />
                </View>
              </View>
              <View style={styles.currentDivider} />
              <View style={styles.windRainRow}>
                <Ionicons name="navigate-outline" size={13} color="#81C784" />
                <Text style={styles.windRain}> {current.wind}</Text>
                <Text style={styles.windRainSep}>  ·  </Text>
                <Ionicons name="water-outline" size={13} color="#81C784" />
                <Text style={styles.windRain}> {current.rainChance}% Rain</Text>
              </View>
            </View>
          )}

          {/* Palay Drying Advisory (today) */}
          {forecast[0] && (
            <View style={styles.dryingCard}>
              <Text style={styles.dryingEyebrow}>PALAY DRYING GUIDE</Text>
              <Text style={styles.dryingCardTitle}>Bilad Advisory Ngayong Araw</Text>
              <View
                style={[
                  styles.dryingBanner,
                  { backgroundColor: forecast[0].dryingAdvisory.bg, borderColor: forecast[0].dryingAdvisory.color },
                ]}
              >
                <View style={[styles.dryingIconBadge, { backgroundColor: '#FFFFFF' }]}>
                  <Ionicons name={forecast[0].dryingAdvisory.iconName} size={22} color={forecast[0].dryingAdvisory.color} />
                </View>
                <View style={styles.dryingBannerTextWrap}>
                  <Text style={[styles.dryingBannerLabel, { color: forecast[0].dryingAdvisory.color }]}>
                    {forecast[0].dryingAdvisory.label}
                  </Text>
                  <Text style={styles.dryingBannerMessage}>{forecast[0].dryingAdvisory.message}</Text>
                </View>
              </View>
            </View>
          )}

          {/* 7-Day Forecast */}
          <View style={styles.forecastCard}>
            <Text style={styles.forecastEyebrow}>THIS WEEK</Text>
            <Text style={styles.forecastTitle}>7-Day Forecast</Text>
            {forecast.map((item, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <View key={i}>
                  <TouchableOpacity
                    style={[
                      styles.forecastRow,
                      i < forecast.length - 1 && !isExpanded && styles.forecastBorder,
                    ]}
                    onPress={() => toggleExpand(i)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.forecastLeft}>
                      <Text style={styles.forecastDate}>{item.date}</Text>
                      <Text style={styles.forecastDay}>{item.isToday ? 'Today' : item.dayName}</Text>
                    </View>
                    <Ionicons name={item.iconName} size={26} color={item.iconColor} style={styles.forecastIcon} />
                    <View style={styles.forecastMid}>
                      <Text style={styles.forecastCondition}>{item.condition}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Ionicons name="water-outline" size={10} color="#777" />
                        <Text style={styles.forecastRain}> {item.rainChance}% Rain</Text>
                      </View>
                      <View style={[styles.dryingChip, { backgroundColor: item.dryingAdvisory.bg }]}>
                        <Ionicons name={item.dryingAdvisory.iconName} size={10} color={item.dryingAdvisory.color} />
                        <Text style={[styles.dryingChipText, { color: item.dryingAdvisory.color }]}>
                          {item.dryingAdvisory.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.forecastRange}>{item.low}° – {item.high}°</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#AAAAAA"
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.hourlyContainer, i < forecast.length - 1 && styles.forecastBorder]}>
                      <View style={[styles.expandedAdvisory, { backgroundColor: item.dryingAdvisory.bg }]}>
                        <Ionicons name={item.dryingAdvisory.iconName} size={14} color={item.dryingAdvisory.color} />
                        <Text style={[styles.expandedAdvisoryText, { color: item.dryingAdvisory.color }]}>
                          {item.dryingAdvisory.message}
                        </Text>
                      </View>
                      <Text style={styles.hourlyTitle}>
                        {item.isToday ? 'Remaining Hours Today' : 'Hourly (5AM – Midnight)'}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {item.hourly.map((h, hi) => (
                          <View key={hi} style={styles.hourlySlot}>
                            <Text style={styles.hourlyTime}>{h.time}</Text>
                            <Ionicons name={h.iconName} size={22} color={h.iconColor} style={{ marginBottom: 4 }} />
                            <Text style={styles.hourlyTemp}>{h.temp}°</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="water-outline" size={9} color="#5B8A63" />
                              <Text style={styles.hourlyRain}>{h.rain}%</Text>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.attributionRow}>
            <Ionicons name="leaf-outline" size={10} color="#BBBBBB" />
            <Text style={styles.attribution}> Weather data by Open-Meteo.com · CC BY 4.0</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F4' },

  header: {
    backgroundColor: GREEN_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },

  searchWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, zIndex: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EAE6',
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  suggestionName:    { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  suggestionCountry: { fontSize: 12, color: '#999999', marginLeft: 8 },

  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  loadingText: { color: GREEN_MID, fontSize: 14, marginTop: 8 },
  errorText:   { color: '#B00020', fontSize: 14, textAlign: 'center', marginHorizontal: 24, marginTop: 8 },
  retryBtn:    { marginTop: 12, backgroundColor: GREEN_MID, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:   { color: '#FFF', fontWeight: '700' },

  // Current Card
  currentCard:  { backgroundColor: GREEN_DARK, borderRadius: 20, padding: 20, marginBottom: 16 },
  asOfLabel:    { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  locationText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  tempRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tempNumRow:   { flexDirection: 'row', alignItems: 'flex-start' },
  tempNum:      { color: '#FFFFFF', fontSize: 60, fontWeight: '700', lineHeight: 66, letterSpacing: -1 },
  tempUnit:     { color: '#A5D6A7', fontSize: 22, fontWeight: '600', marginTop: 8 },
  condition:    { color: '#A5D6A7', fontSize: 14, marginTop: 2 },
  currentIconBadge: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  currentDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 18, marginBottom: 14 },
  windRainRow:  { flexDirection: 'row', alignItems: 'center' },
  windRain:     { color: '#81C784', fontSize: 12 },
  windRainSep:  { color: '#4CAF50', fontSize: 12 },

  // Forecast Card
  forecastCard:      { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  forecastEyebrow:   { fontSize: 10, fontWeight: '700', color: GREEN_MID, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  forecastTitle:     { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  forecastRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  forecastBorder:    { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  forecastLeft:      { width: 80 },
  forecastDate:      { fontSize: 11, color: '#999999' },
  forecastDay:       { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  forecastIcon:      { marginHorizontal: 8 },
  forecastMid:       { flex: 1 },
  forecastCondition: { fontSize: 13, fontWeight: '600', color: '#222222' },
  forecastRain:      { fontSize: 11, color: '#777777' },
  forecastRange:     { fontSize: 13, fontWeight: '600', color: '#1A1A1A', textAlign: 'right' },

  // Palay Drying Advisory
  dryingCard:            { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dryingEyebrow:         { fontSize: 10, fontWeight: '700', color: GREEN_MID, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  dryingCardTitle:       { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  dryingBanner:          { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, padding: 12 },
  dryingIconBadge:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  dryingBannerTextWrap:  { flex: 1, marginLeft: 12 },
  dryingBannerLabel:     { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  dryingBannerMessage:   { fontSize: 12, color: '#555555', lineHeight: 17 },
  dryingChip:            { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 3, marginTop: 5, paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 20 },
  dryingChipText:        { fontSize: 10, fontWeight: '700' },
  expandedAdvisory:      { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderRadius: 10, padding: 10, marginBottom: 10 },
  expandedAdvisoryText:  { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 16 },

  // Hourly
  hourlyContainer: { backgroundColor: '#F8FBF8', borderRadius: 12, padding: 12, marginBottom: 4 },
  hourlyTitle:     { fontSize: 11, fontWeight: '600', color: GREEN_MID, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  hourlySlot:      { alignItems: 'center', marginRight: 16, minWidth: 48 },
  hourlyTime:      { fontSize: 11, color: '#888888', marginBottom: 4 },
  hourlyTemp:      { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  hourlyRain:      { fontSize: 10, color: '#5B8A63', marginLeft: 1 },

  attributionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  attribution: { fontSize: 10, color: '#AAAAAA', letterSpacing: 0.3 },
});