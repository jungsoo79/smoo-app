import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ColorPicker, {
  HueSlider,
  OpacitySlider,
  Panel1,
  type ColorFormatsObject,
  type ColorPickerRef,
} from 'reanimated-color-picker';

type CategoryAddModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd?: (category: { color: string; label: string }) => void;
};

function normalizeHex(value: string) {
  const cleanValue = value.trim().replace(/^#/, '').slice(0, 6).toUpperCase();

  return `#${cleanValue}`;
}

function isValidHex(value: string) {
  return /^#?[0-9A-Fa-f]{6}$/.test(value.trim());
}

function getContrastTextColor(hexColor: string) {
  const hex = normalizeHex(hexColor).replace('#', '');
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? '#191C1D' : '#FFFFFF';
}

export function CategoryAddModal({ visible, onAdd, onClose }: CategoryAddModalProps) {
  const colorPickerRef = useRef<ColorPickerRef>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#A3A3A3');
  const [hexInput, setHexInput] = useState('#A3A3A3');
  const [isPickerVisible, setPickerVisible] = useState(false);

  const updateColor = (colors: ColorFormatsObject) => {
    const nextColor = normalizeHex(colors.hex);

    setSelectedColor(nextColor);
    setHexInput(nextColor);
  };

  const updateHexInput = (value: string) => {
    const displayValue = value.startsWith('#') ? value : `#${value}`;

    setHexInput(displayValue.toUpperCase());

    if (isValidHex(value)) {
      const nextColor = normalizeHex(value);

      setSelectedColor(nextColor);
      colorPickerRef.current?.setColor(nextColor);
    }
  };

  const closeAndReset = () => {
    setCategoryName('');
    setSelectedColor('#A3A3A3');
    setHexInput('#A3A3A3');
    setPickerVisible(false);
    onClose();
  };

  const submitCategory = () => {
    const nextName = categoryName.trim();

    if (!nextName) {
      return;
    }

    onAdd?.({
      color: selectedColor,
      label: nextName,
    });
    closeAndReset();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={closeAndReset}>
      <View style={styles.layer}>
        <Pressable accessibilityLabel="카테고리 추가 닫기" onPress={closeAndReset} style={styles.backdrop} />

        <View style={styles.card}>
          <Text style={styles.title}>카테고리 추가하기</Text>

          <TextInput
            placeholder="카테고리 이름"
            placeholderTextColor="#A3A3A3"
            value={categoryName}
            onChangeText={setCategoryName}
            style={styles.input}
          />

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => setPickerVisible((value) => !value)}
            style={styles.colorRow}>
            <Text style={styles.colorLabel}>색상</Text>
            <View style={styles.colorValue}>
              <Text style={styles.colorHex}>{selectedColor}</Text>
              <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
              <MaterialIcons name="chevron-right" size={18} color="#C6C6C6" />
            </View>
          </TouchableOpacity>

          {isPickerVisible ? (
            <GestureHandlerRootView style={styles.pickerRoot}>
              <ColorPicker
                ref={colorPickerRef}
                boundedThumb
                onChangeJS={updateColor}
                onCompleteJS={updateColor}
                sliderThickness={16}
                thumbShape="circle"
                thumbSize={24}
                value={selectedColor}>
                <TextInput
                  autoCapitalize="characters"
                  maxLength={7}
                  onChangeText={updateHexInput}
                  placeholder="#A3A3A3"
                  placeholderTextColor="rgba(255, 255, 255, 0.42)"
                  style={[
                    styles.hexDisplayInput,
                    {
                      backgroundColor: selectedColor,
                      color: getContrastTextColor(selectedColor),
                    },
                  ]}
                  value={hexInput}
                />

                <Panel1 style={styles.panel} />

                <Text style={styles.pickerLabel}>Hue</Text>
                <HueSlider style={styles.slider} />

                <Text style={styles.pickerLabel}>Alpha</Text>
                <OpacitySlider style={styles.slider} />
              </ColorPicker>
            </GestureHandlerRootView>
          ) : null}

          <TouchableOpacity activeOpacity={0.84} onPress={submitCategory} style={styles.submitButton}>
            <Text style={styles.submitText}>추가하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 48,
    padding: 28,
    gap: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 36,
    elevation: 18,
  },
  title: {
    marginBottom: 12,
    color: '#191C1D',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
  },
  input: {
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 22,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F8F9FA',
  },
  colorRow: {
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
  },
  colorLabel: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  colorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorHex: {
    color: '#777777',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#A3A3A3',
  },
  pickerRoot: {
    borderRadius: 32,
    padding: 18,
    gap: 10,
    backgroundColor: '#F8F9FA',
  },
  hexDisplayInput: {
    height: 46,
    marginBottom: 8,
    borderRadius: 23,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
    backgroundColor: '#000000',
  },
  panel: {
    height: 168,
    borderRadius: 24,
  },
  pickerLabel: {
    marginTop: 8,
    color: '#777777',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  slider: {
    height: 16,
    borderRadius: 999,
  },
  submitButton: {
    height: 64,
    marginTop: 12,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
});
