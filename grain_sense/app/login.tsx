import { API_BASE_URL } from '@/constants/api';
import { saveUser } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/mobile_login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password)}`,
      });

      const data = await res.json();

      if (data.success) {
        // Store the logged-in user (farmer_id, etc.) so other screens
        // like Analytics can use it when calling the API.
        await saveUser(data.user);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login failed', data.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('GrainSense Login: request failed ->', error);
      Alert.alert('Connection error', 'Could not reach the server. Check your WiFi/API settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.subtitle}>Welcome Back!</Text>
          <Text style={styles.subtitleSmall}>Log in to your dashboard</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#9AA89C"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#9AA89C"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#777777" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrapper} onPress={() => router.push('/forgot_password')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
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
  forgotWrapper: {
    alignSelf: 'center',
    marginTop: 14,
  },
  forgotText: {
    color: GREEN_BUTTON,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: GREEN_BUTTON,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 22,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});