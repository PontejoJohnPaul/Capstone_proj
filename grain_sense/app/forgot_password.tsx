import { API_BASE_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN_DARK = '#13522B';
const GREEN_BUTTON = '#1A6B33';

type Step = 'email' | 'code' | 'newPassword' | 'done';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Step 1: request a code ──
  async function handleRequestCode() {
    if (!email.trim()) {
      Alert.alert('Missing info', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot_password_request.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Code Sent', 'Check your email for the 4-digit code.');
        setStep('code');
      } else {
        Alert.alert('Request Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('ForgotPassword: request code failed ->', error);
      Alert.alert('Connection error', 'Could not reach the server. Check your WiFi/API settings.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Step 2: verify the code ──
  async function handleVerifyCode() {
    if (code.trim().length !== 4) {
      Alert.alert('Invalid Code', 'Please enter the 4-digit code sent to your email.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot_password_verify.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('newPassword');
      } else {
        Alert.alert('Invalid Code', data.message || 'The code is invalid or has expired.');
      }
    } catch (error) {
      console.error('ForgotPassword: verify code failed ->', error);
      Alert.alert('Connection error', 'Could not reach the server. Check your WiFi/API settings.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Step 3: set the new password ──
  async function handleResetPassword() {
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot_password_reset.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        Alert.alert('Reset Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('ForgotPassword: reset failed ->', error);
      Alert.alert('Connection error', 'Could not reach the server. Check your WiFi/API settings.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <Image
            source={require('@/assets/images/grain-sense-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.form}>
          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <Text style={styles.subtitle}>Forgot Password?</Text>
              <Text style={styles.subtitleSmall}>Enter your email to receive a reset code</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. juan@email.com"
                placeholderTextColor="#9AA89C"
              />

              <TouchableOpacity
                style={[styles.actionButton, isLoading && { opacity: 0.7 }]}
                onPress={handleRequestCode}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Send Code</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: Code ── */}
          {step === 'code' && (
            <>
              <Text style={styles.subtitle}>Check Your Email</Text>
              <Text style={styles.subtitleSmall}>Enter the 4-digit code we sent to {email}</Text>

              <Text style={styles.label}>Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                keyboardType="number-pad"
                maxLength={4}
                value={code}
                onChangeText={setCode}
                placeholder="0000"
                placeholderTextColor="#9AA89C"
              />

              <TouchableOpacity
                style={[styles.actionButton, isLoading && { opacity: 0.7 }]}
                onPress={handleVerifyCode}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Verify Code</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkWrapper} onPress={handleRequestCode} disabled={isLoading}>
                <Text style={styles.linkText}>Didn't get a code? Resend</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 'newPassword' && (
            <>
              <Text style={styles.subtitle}>Set New Password</Text>
              <Text style={styles.subtitleSmall}>Choose a new password for your account</Text>

              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="#9AA89C"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#777777" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#9AA89C"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#777777" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, isLoading && { opacity: 0.7 }]}
                onPress={handleResetPassword}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Reset Password</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 4: Done ── */}
          {step === 'done' && (
            <>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={64} color={GREEN_BUTTON} />
              </View>
              <Text style={styles.subtitle}>Password Updated!</Text>
              <Text style={styles.subtitleSmall}>You can now log in with your new password</Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.replace('/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: GREEN_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 30,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 16,
    zIndex: 2,
    padding: 4,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '600',
  },
  logo: {
    width: 150,
    height: 150,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitleSmall: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#333333',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222222',
    backgroundColor: '#EFEFEF',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 12,
    fontWeight: '700',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EFEFEF',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222222',
  },
  eyeButton: {
    paddingLeft: 8,
  },
  actionButton: {
    backgroundColor: GREEN_BUTTON,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 22,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  linkWrapper: {
    alignSelf: 'center',
    marginTop: 16,
  },
  linkText: {
    color: GREEN_BUTTON,
    fontSize: 13,
    fontWeight: '600',
  },
  successIconWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
});