import { View } from 'react-native';

import { SelectorRow } from './SelectorRow';

export function RepeatSelector({
  onPress,
  rowRef,
  value,
}: {
  onPress: () => void;
  rowRef: React.RefObject<View | null>;
  value: string;
}) {
  return <SelectorRow label="반복 지출" onPress={onPress} rowRef={rowRef} value={value} />;
}
