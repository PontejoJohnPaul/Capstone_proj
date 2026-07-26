import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Adjust this path if your constants folder is located elsewhere relative to this screen.
import {
  ChangePasswordModal,
  DEFAULT_THRESHOLDS,
  GREEN_DARK,
  GREEN_MID,
  LogoutModal,
  PrivacyModal,
  ProfileData,
  ProfileModal,
  rowToThresholds,
  THRESHOLD_META,
  ThresholdData,
  ThresholdEditModal,
  ThresholdKey,
  Thresholds,
  thresholdToPayload,
  ThresholdViewModal,
} from '../../components/SettingsModals';
import { API_BASE_URL } from '../../constants/api';

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    firstName: 'Juan', lastName: 'Dela Cruz',
    email: 'juan@email.com', mobile: '+63 912 345 6789',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [loadingThresholds, setLoadingThresholds] = useState(true);
  const [savingThreshold, setSavingThreshold] = useState(false);

  const [showProfile,  setShowProfile]  = useState(false);
  const [showPrivacy,  setShowPrivacy]  = useState(false);
  const [showLogout,   setShowLogout]   = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [thModal, setThModal] = useState<{ key: ThresholdKey; mode: 'view' | 'edit' } | null>(null);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = (profile.firstName[0] ?? '') + (profile.lastName[0] ?? '');

  // ── Fetch current thresholds from the database on screen load ──
  const fetchThresholds = useCallback(async () => {
    try {
      setLoadingThresholds(true);
      const res = await fetch(`${API_BASE_URL}/get_app_thresholds.php`);
      const json = await res.json();
      if (json.success && json.data) {
        setThresholds(rowToThresholds(json.data));
      } else {
        console.warn('get_app_thresholds.php returned no data, using defaults.');
      }
    } catch (err) {
      console.warn('Failed to fetch thresholds, using defaults:', err);
      Alert.alert('Connection Error', 'Could not load thresholds from the server. Showing default values.');
    } finally {
      setLoadingThresholds(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  // ── Fetch the farmer's profile (users table) from the database on screen load ──
  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch(`${API_BASE_URL}/get_user_profile.php`);
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
      } else {
        console.warn('get_user_profile.php returned no data, keeping placeholder profile.');
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
      Alert.alert('Connection Error', 'Could not load your profile from the server.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Save an edited threshold group back to the database ──
  // Returns true/false so the confirm modal knows whether to show the success dialog.
  async function saveThreshold(key: ThresholdKey, data: ThresholdData): Promise<boolean> {
    const previous = thresholds[key];
    // Optimistically update the UI, then confirm/rollback based on the API response.
    setThresholds(prev => ({ ...prev, [key]: data }));
    setSavingThreshold(true);
    try {
      const res = await fetch(`${API_BASE_URL}/update_thresholds.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholdToPayload(key, data)),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Update failed');
      }
      return true;
    } catch (err) {
      console.warn('Failed to save threshold:', err);
      setThresholds(prev => ({ ...prev, [key]: previous })); // rollback
      Alert.alert('Save Failed', 'Could not update the threshold on the server. Please try again.');
      return false;
    } finally {
      setSavingThreshold(false);
    }
  }

  // ── Save the edited profile back to the database (users table) ──
  // Returns true/false so the confirm modal knows whether to show the success dialog.
  async function saveProfile(data: ProfileData): Promise<boolean> {
    const previous = profile;
    // Optimistically update the UI, then confirm/rollback based on the API response.
    setProfile(data);
    try {
      const res = await fetch(`${API_BASE_URL}/update_user_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Update failed');
      }
      return true;
    } catch (err) {
      console.warn('Failed to save profile:', err);
      setProfile(previous); // rollback
      Alert.alert('Save Failed', 'Could not update your profile on the server. Please try again.');
      return false;
    }
  }

  // ── Change the account password (requires the current password to be correct) ──
  // Returns true/false so the modal knows whether to show the success dialog or an inline error.
  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/change_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.warn('Failed to change password:', err);
      Alert.alert('Connection Error', 'Could not reach the server. Please try again.');
      return false;
    }
  }

  function handleLogout() {
    setShowLogout(false);
    router.replace('/welcome');
  }

  const thKeys: ThresholdKey[] = ['temperature', 'humidity', 'moisture'];

  // Account section rows
  const accountRows: {
    iconName: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    label: string;
    sublabel?: string;
    onPress?: () => void;
  }[] = [
    { iconName: 'location-outline', iconBg: '#E8F5E9', iconColor: '#2E7D32', label: 'Farm Location', sublabel: 'Sabang, Nasugbu, Batangas' },
    { iconName: 'lock-closed-outline', iconBg: '#ECEFF1', iconColor: '#546E7A', label: 'Change Password', onPress: () => setShowChangePassword(true) },
  ];

  return (
    <SafeAreaView style={st.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* Header */}
      <View style={st.header}>
        <Text style={st.headerTitle}>Settings</Text>
      </View>

      {/* Profile Banner */}
      <View style={st.profileBanner}>
        <View style={st.avatarCircle}>
          <Text style={st.avatarText}>{initials}</Text>
        </View>
        <View style={st.profileInfo}>
          <Text style={st.profileName}>{fullName}</Text>
          <Text style={st.profileRole}>Grain Farmer · Nasugbu, Batangas</Text>
        </View>
        <TouchableOpacity
          style={[st.editBtn, loadingProfile && { opacity: 0.5 }]}
          onPress={() => setShowProfile(true)}
          activeOpacity={0.75}
          disabled={loadingProfile}
        >
          <Ionicons name="create-outline" size={13} color="#A5D6A7" />
          <Text style={st.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

        {/* ── Monitoring ── */}
        <Text style={st.sectionTitle}>Monitoring</Text>
        <View style={st.sectionCard}>
          {loadingThresholds && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={GREEN_MID} />
            </View>
          )}
          {!loadingThresholds && thKeys.map((key, i) => {
            const meta = THRESHOLD_META[key];
            const th   = thresholds[key];
            return (
              <View key={key} style={[st.row, i < thKeys.length - 1 && st.rowBorder]}>
                <View style={[st.iconBadge, { backgroundColor: meta.iconBg }]}>
                  <Ionicons name={meta.iconName} size={20} color={meta.iconColor} />
                </View>
                <View style={st.rowLabels}>
                  <Text style={st.rowLabel}>{meta.label}</Text>
                  <Text style={st.rowSublabel}>
                    {th.min}{meta.unit} – {th.max}{meta.unit} · Safe: {th.safe}{meta.unit}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[st.adjustBtn, savingThreshold && { opacity: 0.5 }]}
                  onPress={() => setThModal({ key, mode: 'view' })}
                  activeOpacity={0.75}
                  disabled={savingThreshold}
                >
                  <Text style={st.adjustBtnText}>Adjust</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── Account ── */}
        <Text style={st.sectionTitle}>Account</Text>
        <View style={st.sectionCard}>
          {accountRows.map((row, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[st.row, i < arr.length - 1 && st.rowBorder]}
              activeOpacity={0.6}
              onPress={row.onPress}
              disabled={!row.onPress}
            >
              <View style={[st.iconBadge, { backgroundColor: row.iconBg }]}>
                <Ionicons name={row.iconName} size={20} color={row.iconColor} />
              </View>
              <View style={st.rowLabels}>
                <Text style={st.rowLabel}>{row.label}</Text>
                {row.sublabel ? <Text style={st.rowSublabel}>{row.sublabel}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── About ── */}
        <Text style={st.sectionTitle}>About</Text>
        <View style={st.sectionCard}>
          <TouchableOpacity style={[st.row, st.rowBorder]} activeOpacity={0.6}>
            <View style={[st.iconBadge, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#1565C0" />
            </View>
            <View style={st.rowLabels}>
              <Text style={st.rowLabel}>App Version</Text>
            </View>
            <Text style={st.rowValue}>v1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.row} onPress={() => setShowPrivacy(true)} activeOpacity={0.6}>
            <View style={[st.iconBadge, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="document-text-outline" size={20} color="#6A1B9A" />
            </View>
            <View style={st.rowLabels}>
              <Text style={st.rowLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* ── Log Out ── */}
        <View style={[st.sectionCard, { marginBottom: 8 }]}>
          <TouchableOpacity style={st.row} onPress={() => setShowLogout(true)} activeOpacity={0.6}>
            <View style={[st.iconBadge, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="log-out-outline" size={20} color="#C62828" />
            </View>
            <View style={st.rowLabels}>
              <Text style={[st.rowLabel, { color: '#C62828' }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── Modals ── */}
      <ProfileModal visible={showProfile} data={profile} onSave={saveProfile} onClose={() => setShowProfile(false)} />
      {showPrivacy  && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showLogout   && <LogoutModal  onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      {showChangePassword && (
        <ChangePasswordModal onSave={changePassword} onClose={() => setShowChangePassword(false)} />
      )}

      {/* Threshold View */}
      {thModal?.mode === 'view' && (
        <ThresholdViewModal
          thKey={thModal.key}
          data={thresholds[thModal.key]}
          onEdit={() => setThModal({ key: thModal.key, mode: 'edit' })}
          onClose={() => setThModal(null)}
        />
      )}

      {/* Threshold Edit */}
      {thModal?.mode === 'edit' && (
        <ThresholdEditModal
          thKey={thModal.key}
          data={thresholds[thModal.key]}
          onSave={(d) => saveThreshold(thModal.key, d)}
          onClose={() => setThModal(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F4F6F4' },
  header:       { backgroundColor: GREEN_DARK, paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle:  { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },

  profileBanner: { backgroundColor: GREEN_MID, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  avatarCircle:  { width: 46, height: 46, borderRadius: 23, backgroundColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 16, fontWeight: '700', color: GREEN_DARK },
  profileInfo:   { flex: 1 },
  profileName:   { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  profileRole:   { color: '#A5D6A7', fontSize: 12, marginTop: 2 },
  editBtn:       { backgroundColor: GREEN_DARK, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText:   { color: '#A5D6A7', fontSize: 12, fontWeight: '700' },

  content:      { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginLeft: 4, marginTop: 8 },
  sectionCard:  { backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, marginBottom: 8 },

  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
  rowBorder:  { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  iconBadge:  { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rowLabels:  { flex: 1 },
  rowLabel:   { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  rowSublabel:{ fontSize: 12, color: '#888888', marginTop: 1 },
  rowValue:   { fontSize: 13, color: '#888888', marginRight: 4 },

  adjustBtn:     { backgroundColor: GREEN_DARK, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  adjustBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});