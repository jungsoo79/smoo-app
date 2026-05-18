import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SelectorRowHandle = View;

export function SelectorRow({
  label,
  onPress,
  rowRef,
  value,
}: {
  label: string;
  onPress: () => void;
  rowRef: React.RefObject<View | null>;
  value: string;
}) {
  return (
    <TouchableOpacity ref={rowRef} activeOpacity={0.78} onPress={onPress} style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueGroup}>
        <Text style={styles.value}>{value}</Text>
        <MaterialIcons name="chevron-right" size={18} color="#C6C6C6" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F5',
  },
  label: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  value: {
    color: '#474747',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
});
