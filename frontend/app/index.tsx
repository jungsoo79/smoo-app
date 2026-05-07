import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SplashBrandMark } from '@/components/branding/splash-brand-mark';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSession = false;

      router.replace((hasSession ? '/(tabs)' : '/login') as Href);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.blurTop} />
      <View style={styles.blurBottom} />

      <View style={styles.content}>
        <SplashBrandMark />

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Zerly</Text>
          <Text style={styles.subtitle}>당신의 삶, 아름답게 조율되다.</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.archiveGroup}>
          <Text style={styles.archiveText}>에테르 아카이브</Text>
          <View style={styles.archiveDot} />
        </View>
      </View>

      <View pointerEvents="none" style={styles.deviceBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  blurTop: {
    position: 'absolute',
    top: -88,
    left: -39,
    width: 234,
    height: 530,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 218, 219, 0.4)',
  },
  blurBottom: {
    position: 'absolute',
    right: -39,
    bottom: -88,
    width: 195,
    height: 442,
    borderRadius: 999,
    backgroundColor: 'rgba(231, 232, 233, 0.5)',
  },
  content: {
    width: '100%',
    maxWidth: 448,
    minHeight: 884,
    alignItems: 'center',
    paddingTop: 135,
    paddingBottom: 135,
  },
  titleGroup: {
    alignItems: 'center',
    marginTop: 64,
    gap: 16,
  },
  title: {
    color: '#000000',
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  subtitle: {
    width: 280,
    color: 'rgba(71, 71, 71, 0.8)',
    fontSize: 18,
    lineHeight: 29,
    fontWeight: '500',
    letterSpacing: 0.45,
    textAlign: 'center',
  },
  progressTrack: {
    width: '72%',
    maxWidth: 278,
    height: 2,
    marginTop: 108,
    borderRadius: 999,
    backgroundColor: '#EDEEEF',
    overflow: 'hidden',
  },
  progressFill: {
    width: '33.33%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#000000',
  },
  archiveGroup: {
    alignItems: 'center',
    marginTop: 128,
    opacity: 0.4,
  },
  archiveText: {
    color: '#474747',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 2,
  },
  archiveDot: {
    width: 16,
    height: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  deviceBorder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 32,
    borderColor: '#F8F9FA',
  },
});
