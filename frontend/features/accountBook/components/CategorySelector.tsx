import { View } from 'react-native';

import { SelectorRow } from './SelectorRow';

export function CategorySelector({
  onPress,
  rowRef,
  value,
}: {
  onPress: () => void;
  rowRef: React.RefObject<View | null>;
  value: string;
}) {
  return <SelectorRow label="카테고리" onPress={onPress} rowRef={rowRef} value={value} />;
}
