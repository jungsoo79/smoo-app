import { View } from 'react-native';

import { SelectorRow } from './SelectorRow';

export function PaymentMethodSelector({
  onPress,
  rowRef,
  value,
}: {
  onPress: () => void;
  rowRef: React.RefObject<View | null>;
  value: string;
}) {
  return <SelectorRow label="결제수단" onPress={onPress} rowRef={rowRef} value={value} />;
}
