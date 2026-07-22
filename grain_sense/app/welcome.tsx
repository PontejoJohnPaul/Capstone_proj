import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN_DARK = '#0F3D1C';
const GREEN_BUTTON = '#1F6B2C';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* Top green section */}
      <View style={styles.topSection}>
        <Text style={styles.welcomeText}>Welcome to</Text>

        <Image
          source={require('@/assets/images/grain-sense-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <Text style={styles.title}>Grain Sense</Text>
        <Text style={styles.subtitle}>Monitor . Protect . Preserve</Text>
      </View>

      {/* Bottom white section with the curve */}
      <View style={styles.bottomSection}>
        <View style={styles.curve} />

        <View style={styles.bottomContent}>
          {/* Self-registration removed -- accounts are created by the admin.
              Welcome now leads straight into Login. */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Click to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_DARK,
  },
  topSection: {
    flex: 1,
    backgroundColor: GREEN_DARK,
    alignItems: 'center',
    paddingTop: 40,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 10,
  },
  logo: {
    width: 170,
    height: 170,
    marginVertical: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    color: '#D7E8D9',
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 4,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    height: 220,
  },
  curve: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  loginButton: {
    backgroundColor: GREEN_BUTTON,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});