import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export const GREEN_DARK = '#0F3D1C';
export const GREEN_MID  = '#1F6B2C';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ProfileData = { firstName: string; lastName: string; email: string; mobile: string };
export type ThresholdKey = 'temperature' | 'humidity' | 'moisture';
export type ThresholdData = { min: string; safe: string; max: string };
export type Thresholds = Record<ThresholdKey, ThresholdData>;

// Row shape returned by GET /api/get_app_thresholds.php (matches sensor_thresholds columns)
export type ThresholdRow = {
  threshold_id: number;
  temperature_min: number | string;
  temperature_safe: number | string;
  temperature_max: number | string;
  humidity_min: number | string;
  humidity_safe: number | string;
  humidity_max: number | string;
  moisture_min: number | string;
  moisture_safe: number | string;
  moisture_max: number | string;
};

// ─── Threshold config ─────────────────────────────────────────────────────────
export const THRESHOLD_META: Record<ThresholdKey, {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  unit: string;
  safeLabel: string;
}> = {
  temperature: {
    label: 'Temperature Threshold',
    iconName: 'thermometer-outline',
    iconBg: '#FFEBEE',
    iconColor: '#C62828',
    unit: '°C',
    safeLabel: 'Safe Temperature',
  },
  humidity: {
    label: 'Humidity Threshold',
    iconName: 'water-outline',
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    unit: '%',
    safeLabel: 'Safe Humidity Level',
  },
  moisture: {
    label: 'Grain Moisture Threshold',
    iconName: 'leaf-outline',
    iconBg: '#F9FBE7',
    iconColor: '#558B2F',
    unit: '%',
    safeLabel: 'Safe Moisture Level',
  },
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  temperature: { min: '20', safe: '25', max: '32' },
  humidity:    { min: '40', safe: '60', max: '70' },
  moisture:    { min: '10', safe: '13', max: '14' },
};

// Converts the flat DB row (temperature_min, temperature_safe, ...) into the app's Thresholds shape.
export function rowToThresholds(row: ThresholdRow): Thresholds {
  return {
    temperature: { min: String(row.temperature_min), safe: String(row.temperature_safe), max: String(row.temperature_max) },
    humidity:    { min: String(row.humidity_min),    safe: String(row.humidity_safe),    max: String(row.humidity_max) },
    moisture:    { min: String(row.moisture_min),    safe: String(row.moisture_safe),    max: String(row.moisture_max) },
  };
}

// Maps a single threshold group back into the flat field names the API expects.
export function thresholdToPayload(key: ThresholdKey, data: ThresholdData) {
  return {
    [`${key}_min`]: Number(data.min),
    [`${key}_safe`]: Number(data.safe),
    [`${key}_max`]: Number(data.max),
  };
}

// ─── Privacy Policy content ───────────────────────────────────────────────────
export const PRIVACY_TEXT = `GrainSense collects sensor data (temperature, humidity, grain moisture) from your IoT device to monitor storage conditions and send you timely alerts.

Personal Information
We collect your name, email address, and mobile number solely to manage your account and deliver notifications.

Data Usage
Your data is used only to operate the app and improve monitoring accuracy. We do not sell or share your personal information with third parties.

Data Storage
All data is stored securely on encrypted servers. Sensor readings are retained for up to 1 year to support historical analysis.

Your Rights
You may request access to, correction of, or deletion of your data at any time by contacting our support team.

Contact
For questions about this policy, email us at support@grainsense.ph.

Last updated: January 2026`;

// ─── Shared small helpers ─────────────────────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={sh.overlay}>
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Confirm / Success Dialogs (shared by Threshold + Profile saves) ─────────
function ConfirmDialog({
  visible, title, message, loading, onConfirm, onCancel,
}: { visible: boolean; title: string; message: string; loading?: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!visible) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={sh.overlay}>
        <View style={sh.confirmCard}>
          <View style={[sh.confirmIconBadge, sh.confirmIconBadgeNeutral]}>
            <Ionicons name="help-circle-outline" size={32} color={GREEN_MID} />
          </View>
          <Text style={sh.confirmTitle}>{title}</Text>
          <Text style={sh.confirmMsg}>{message}</Text>
          <View style={sh.btnRow}>
            <TouchableOpacity style={sh.cancelBtn} onPress={onCancel} activeOpacity={0.8} disabled={loading}>
              <Text style={sh.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sh.saveBtn} onPress={onConfirm} activeOpacity={0.8} disabled={loading}>
              {loading
                ? <ActivityIndicator color={GREEN_DARK} />
                : <Text style={sh.saveBtnText}>Yes, Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SuccessDialog({
  visible, message, onClose,
}: { visible: boolean; message: string; onClose: () => void }) {
  if (!visible) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={sh.confirmCard}>
          <View style={[sh.confirmIconBadge, sh.confirmIconBadgeNeutral]}>
            <Ionicons name="checkmark-circle" size={32} color={GREEN_MID} />
          </View>
          <Text style={sh.confirmTitle}>Saved</Text>
          <Text style={sh.confirmMsg}>{message}</Text>
          <TouchableOpacity style={sh.successOkBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={sh.successOkText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Threshold View Modal ─────────────────────────────────────────────────────
export function ThresholdViewModal({
  thKey, data, onEdit, onClose,
}: { thKey: ThresholdKey; data: ThresholdData; onEdit: () => void; onClose: () => void }) {
  const meta = THRESHOLD_META[thKey];
  const row = (label: string, value: string) => (
    <View style={sh.viewRow}>
      <Text style={sh.viewLabel}>{label}</Text>
      <View style={sh.viewValueBox}>
        <Text style={sh.viewValue}>{value} {meta.unit}</Text>
      </View>
    </View>
  );
  return (
    <ModalOverlay onClose={onClose}>
      <View style={sh.card}>
        <TouchableOpacity
          style={sh.thCloseBtn}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <Text style={sh.cardTitle}>Threshold Settings</Text>
        <Text style={sh.cardSub}>Adjust threshold settings for monitoring condition</Text>

        <View style={sh.iconRow}>
          <View style={[sh.thIconBadge, { backgroundColor: meta.iconBg }]}>
            <Ionicons name={meta.iconName} size={28} color={meta.iconColor} />
          </View>
          <Text style={sh.cardHeading}>{meta.label.replace(' Threshold', '')}</Text>
        </View>

        {row('Minimum limit', data.min)}
        {row(meta.safeLabel, data.safe)}
        {row('Maximum limit', data.max)}

        <TouchableOpacity style={sh.editBtn} onPress={onEdit} activeOpacity={0.8}>
          <Text style={sh.editBtnText}>Adjust</Text>
        </TouchableOpacity>
      </View>
    </ModalOverlay>
  );
}

// ─── Threshold Edit Modal ─────────────────────────────────────────────────────
export function ThresholdEditModal({
  thKey, data, onSave, onClose,
}: { thKey: ThresholdKey; data: ThresholdData; onSave: (d: ThresholdData) => Promise<boolean>; onClose: () => void }) {
  const meta = THRESHOLD_META[thKey];
  const [form, setForm] = useState<ThresholdData>(data);
  const f = (key: keyof ThresholdData) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));

  // 'edit' → user is filling out the form
  // 'confirm' → "are you sure?" dialog before the actual save
  // 'success' → save succeeded, show confirmation before closing
  const [stage, setStage] = useState<'edit' | 'confirm' | 'success'>('edit');
  const [saving, setSaving] = useState(false);

  async function handleConfirmSave() {
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    // On failure, the parent screen already shows an error Alert — just return to the form.
    setStage(ok ? 'success' : 'edit');
  }

  return (
    <>
      {stage === 'edit' && (
        <ModalOverlay onClose={onClose}>
          <View style={sh.card}>
            <Text style={sh.cardTitle}>Edit {meta.label.replace(' Threshold', '')}</Text>

            {([['min', 'Minimum limit', 'Enter minimum limit…'],
               ['safe', meta.safeLabel, 'Enter safe level…'],
               ['max', 'Maximum limit', 'Enter maximum limit…']] as [keyof ThresholdData, string, string][])
              .map(([key, label, ph]) => (
                <View key={key} style={sh.fieldGroup}>
                  <Text style={sh.fieldLabel}>{label}</Text>
                  <TextInput
                    style={sh.fieldInput}
                    value={form[key]}
                    onChangeText={f(key)}
                    placeholder={ph}
                    placeholderTextColor="#BBBBBB"
                    keyboardType="numeric"
                  />
                </View>
              ))}

            <View style={sh.btnRow}>
              <TouchableOpacity style={sh.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={sh.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={sh.saveBtn} onPress={() => setStage('confirm')} activeOpacity={0.8}>
                <Text style={sh.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ModalOverlay>
      )}

      <ConfirmDialog
        visible={stage === 'confirm'}
        title="Save Changes?"
        message={`Sigurado ka bang gusto mong i-save ang bagong ${meta.label.toLowerCase()}?`}
        loading={saving}
        onCancel={() => setStage('edit')}
        onConfirm={handleConfirmSave}
      />

      <SuccessDialog
        visible={stage === 'success'}
        message="Matagumpay na na-save ang threshold settings."
        onClose={() => { setStage('edit'); onClose(); }}
      />
    </>
  );
}

// ─── Profile Modal (popup card style) ────────────────────────────────────────
export function ProfileModal({ visible, data, onSave, onClose }: {
  visible: boolean; data: ProfileData; onSave: (d: ProfileData) => Promise<boolean>; onClose: () => void;
}) {
  const [form, setForm] = useState<ProfileData>(data);
  React.useEffect(() => { if (visible) setForm(data); }, [visible]);

  // 'edit' → user is filling out the form
  // 'confirm' → "are you sure?" dialog before the actual save
  // 'success' → save succeeded, show confirmation before closing
  const [stage, setStage] = useState<'edit' | 'confirm' | 'success'>('edit');
  const [saving, setSaving] = useState(false);
  React.useEffect(() => { if (visible) setStage('edit'); }, [visible]);

  async function handleConfirmSave() {
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    // On failure, the parent screen already shows an error Alert — just return to the form.
    setStage(ok ? 'success' : 'edit');
  }

  const field = (
    label: string,
    key: keyof ProfileData,
    ph: string,
    iconName: keyof typeof Ionicons.glyphMap,
    kb?: 'email-address' | 'phone-pad',
  ) => (
    <View style={sh.fieldGroup} key={key}>
      <Text style={sh.fieldLabel}>{label}</Text>
      <View style={sh.inputWrapper}>
        <Ionicons name={iconName} size={16} color="#A5D6A7" style={sh.inputIcon} />
        <TextInput
          style={sh.fieldInputWithIcon}
          value={form[key]}
          onChangeText={(v) => setForm(prev => ({ ...prev, [key]: v }))}
          placeholder={ph}
          placeholderTextColor="#BBBBBB"
          keyboardType={kb ?? 'default'}
          autoCapitalize={kb ? 'none' : 'words'}
        />
      </View>
    </View>
  );

  if (!visible) return null;
  return (
    <>
      {stage === 'edit' && (
        <Modal visible animationType="fade" transparent onRequestClose={onClose}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={sh.overlay}>
            <View style={sh.card}>
              {/* Header row */}
              <View style={sh.profileModalHeader}>
                <Text style={sh.cardTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>

              {/* Avatar */}
              <View style={sh.avatarRow}>
                <View style={sh.bigAvatar}>
                  <Text style={sh.bigAvatarText}>{(form.firstName[0] ?? '') + (form.lastName[0] ?? '')}</Text>
                </View>
                <TouchableOpacity style={sh.changePhotoBtn}>
                  <Ionicons name="camera-outline" size={12} color={GREEN_DARK} />
                  <Text style={sh.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {field('First Name',    'firstName', 'e.g. Juan',               'person-outline')}
                {field('Last Name',     'lastName',  'e.g. Dela Cruz',          'person-outline')}
                {field('Email',         'email',     'e.g. juan@email.com',     'mail-outline',   'email-address')}
                {field('Mobile Number', 'mobile',    'e.g. +63 912 345 6789',   'call-outline',   'phone-pad')}

                <View style={sh.btnRow}>
                  <TouchableOpacity style={sh.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                    <Text style={sh.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={sh.saveBtn} onPress={() => setStage('confirm')} activeOpacity={0.8}>
                    <Text style={sh.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 8 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      <ConfirmDialog
        visible={stage === 'confirm'}
        title="Save Changes?"
        message="Sigurado ka bang gusto mong i-save ang mga pagbabago sa iyong profile?"
        loading={saving}
        onCancel={() => setStage('edit')}
        onConfirm={handleConfirmSave}
      />

      <SuccessDialog
        visible={stage === 'success'}
        message="Matagumpay na na-save ang iyong profile."
        onClose={() => { setStage('edit'); onClose(); }}
      />
    </>
  );
}

// ─── Privacy Policy Modal (popup card style) ──────────────────────────────────
export function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={sh.overlay}>
        <View style={[sh.card, { maxHeight: '80%' }]}>
          {/* Header */}
          <View style={sh.profileModalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#A5D6A7" />
              <Text style={sh.cardTitle}>Privacy Policy</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 4 }}>
            <Text style={sh.privacyText}>{PRIVACY_TEXT}</Text>
            <View style={{ height: 16 }} />
          </ScrollView>

          <TouchableOpacity style={sh.editBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={sh.editBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Logout Confirm Modal ─────────────────────────────────────────────────────
export function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={sh.overlay}>
        <View style={sh.confirmCard}>
          <View style={sh.confirmIconBadge}>
            <Ionicons name="log-out-outline" size={32} color="#C62828" />
          </View>
          <Text style={sh.confirmTitle}>Log Out</Text>
          <Text style={sh.confirmMsg}>Are you sure you want to log out?</Text>
          <View style={sh.btnRow}>
            <TouchableOpacity style={sh.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={sh.cancelBtnText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sh.logoutBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={sh.saveBtnText}>Yes, Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Password Modal (popup card style) ─────────────────────────────────
export function ChangePasswordModal({ onSave, onClose }: {
  onSave: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 'form' → user must enter current password + new password first
  // 'confirm' → "are you sure?" dialog before the actual save
  // 'success' → save succeeded, show confirmation before closing
  const [stage, setStage] = useState<'form' | 'confirm' | 'success'>('form');
  const [saving, setSaving] = useState(false);

  function handleSubmitPress() {
    setErrorMsg(null);
    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setStage('confirm');
  }

  async function handleConfirmSave() {
    setSaving(true);
    const ok = await onSave(currentPassword, newPassword);
    setSaving(false);
    if (ok) {
      setStage('success');
    } else {
      // Wrong current password (or a server-side rejection) — let the user try again.
      setStage('form');
      setErrorMsg('Current password is incorrect.');
    }
  }

  const pwField = (
    label: string,
    value: string,
    onChangeText: (v: string) => void,
    show: boolean,
    setShow: (v: boolean) => void,
  ) => (
    <View style={sh.fieldGroup}>
      <Text style={sh.fieldLabel}>{label}</Text>
      <View style={sh.inputWrapper}>
        <TextInput
          style={sh.fieldInputWithIcon}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholderTextColor="#BBBBBB"
        />
        <TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#A5D6A7" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {stage === 'form' && (
        <ModalOverlay onClose={onClose}>
          <View style={sh.card}>
            <View style={sh.profileModalHeader}>
              <Text style={sh.cardTitle}>Change Password</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <Text style={sh.cardSub}>Enter your current password first to make changes</Text>

            {pwField('Current Password', currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
            {pwField('New Password', newPassword, setNewPassword, showNew, setShowNew)}
            {pwField('Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}

            {errorMsg && <Text style={sh.errorText}>{errorMsg}</Text>}

            <View style={sh.btnRow}>
              <TouchableOpacity style={sh.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={sh.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={sh.saveBtn} onPress={handleSubmitPress} activeOpacity={0.8}>
                <Text style={sh.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ModalOverlay>
      )}

      <ConfirmDialog
        visible={stage === 'confirm'}
        title="Change Password?"
        message="Sigurado ka bang gusto mong palitan ang password mo?"
        loading={saving}
        onCancel={() => setStage('form')}
        onConfirm={handleConfirmSave}
      />

      <SuccessDialog
        visible={stage === 'success'}
        message="Matagumpay na napalitan ang password mo."
        onClose={() => { setStage('form'); onClose(); }}
      />
    </>
  );
}

// ─── Shared Modal Styles ──────────────────────────────────────────────────────
const sh = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },

  // Centered popup card (all modals now use this)
  card: { backgroundColor: GREEN_DARK, borderRadius: 20, padding: 24, width: '100%' },
  cardTitle:   { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  cardSub:     { color: '#A5D6A7', fontSize: 12, textAlign: 'center', marginBottom: 20, marginTop: 4 },
  cardHeading: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginLeft: 10 },
  iconRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  thIconBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thCloseBtn:  { position: 'absolute', top: 16, right: 16, zIndex: 1 },

  profileModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },

  viewRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewLabel:   { color: '#A5D6A7', fontSize: 13, fontWeight: '600' },
  viewValueBox:{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, minWidth: 80, alignItems: 'center' },
  viewValue:   { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  editBtn:     { backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  editBtnText: { color: GREEN_DARK, fontSize: 15, fontWeight: '700' },

  fieldGroup:  { marginBottom: 14 },
  fieldLabel:  { color: '#A5D6A7', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  fieldInput:  { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },

  inputWrapper:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12 },
  inputIcon:         { marginRight: 8 },
  fieldInputWithIcon:{ flex: 1, paddingVertical: 11, fontSize: 15, color: '#FFFFFF' },

  avatarRow:      { alignItems: 'center', marginBottom: 20 },
  bigAvatar:      { width: 68, height: 68, borderRadius: 34, backgroundColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center' },
  bigAvatarText:  { fontSize: 26, fontWeight: '700', color: GREEN_DARK },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  changePhotoText:{ fontSize: 11, color: '#A5D6A7', fontWeight: '600' },

  btnRow:      { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:   { flex: 1, backgroundColor: '#C62828', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText:{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  saveBtn:     { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: GREEN_DARK, fontSize: 14, fontWeight: '700' },
  logoutBtn:   { flex: 1.4, backgroundColor: '#C62828', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },

  // Logout confirm card (white)
  confirmCard:      { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '100%', alignItems: 'center' },
  confirmIconBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  confirmIconBadgeNeutral: { backgroundColor: '#E8F5E9' },
  confirmTitle:     { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  confirmMsg:       { fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 24 },
  successOkBtn:     { backgroundColor: GREEN_DARK, borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '100%' },
  successOkText:    { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  privacyText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  errorText: { color: '#FF8A80', fontSize: 12, textAlign: 'center', marginBottom: 10, marginTop: -4 },
});