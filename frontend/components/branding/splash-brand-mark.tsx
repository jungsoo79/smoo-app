import { StyleSheet, Text, View } from 'react-native';

export function SplashBrandMark() {
  return (
    <View style={styles.mark}>
      <View style={styles.outerGlow} />
      <View style={styles.ring} />

      <View style={[styles.orb, styles.sideOrb, styles.leftOrb]}>
        <DotGrid />
      </View>

      <View style={[styles.orb, styles.centerOrb]}>
        <Text style={styles.letter}>s</Text>
      </View>

      <View style={[styles.orb, styles.sideOrb, styles.rightOrb]}>
        <DotCluster />
      </View>
    </View>
  );
}

function DotGrid() {
  return (
    <View style={styles.dotGrid}>
      {Array.from({ length: 25 }).map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
    </View>
  );
}

function DotCluster() {
  return (
    <View style={styles.dotCluster}>
      {Array.from({ length: 9 }).map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 211,
    height: 211,
    borderRadius: 106,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  ring: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.2)',
  },
  orb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },
  sideOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  centerOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 6,
  },
  leftOrb: {
    left: 7,
  },
  rightOrb: {
    right: 7,
  },
  letter: {
    color: '#000000',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.8,
  },
  dotGrid: {
    width: 29,
    height: 29,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dotCluster: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 3.4,
    height: 3.4,
    borderRadius: 1.7,
    backgroundColor: '#000000',
  },
});
