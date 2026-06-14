import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/index';

type PriceType = 'fixed' | 'hourly' | 'daily' | '';

type PriceOption = {
  id: string;
  label: string;
  value: PriceType;
};

interface PriceTypeDropdownProps {
  selectedValue: PriceType;
  onSelect: (value: PriceType) => void;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
}

interface NegotiableToggleProps {
  isNegotiable: boolean;
  onToggle: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  inactiveStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onLayout?: (rect: { x: number; y: number; width: number; height: number }) => void;
}

interface NearbyOnlyToggleProps {
  isNearbyOnly: boolean;
  onToggle: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  inactiveStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

interface FilterButtonsProps {
  priceType: PriceType;
  onPriceTypeChange: (value: PriceType) => void;
  isNegotiable: boolean;
  onNegotiableToggle: () => void;
  isNearbyOnly: boolean;
  onNearbyOnlyToggle: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  toggleStyle?: StyleProp<ViewStyle>;
  onNegotiableLayout?: (rect: { x: number; y: number; width: number; height: number }) => void;
}

type ButtonPosition = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

// Price Type Dropdown Component (Compact Version)
const PriceTypeDropdown: React.FC<PriceTypeDropdownProps> = ({
  selectedValue,
  onSelect,
  containerStyle,
  buttonStyle,
  textStyle,
  dropdownStyle,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<View | null>(null);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>({ x: 0, y: 0 });

  const priceOptions: PriceOption[] = [
    { id: '1', label: 'Fixed', value: 'fixed' },
    { id: '2', label: 'Hourly', value: 'hourly' },
    { id: '3', label: 'Daily', value: 'daily' },
  ];

  const handleSelect = (option: PriceOption) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  const getSelectedLabel = (): string => {
    const selected = priceOptions.find((opt) => opt.value === selectedValue);
    return selected ? selected.label : 'Price Type';
  };

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      buttonRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
        setButtonPosition({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        ref={buttonRef}
        style={({ pressed }) => [
          styles.dropdownButton,
          buttonStyle,
          Platform.OS === 'ios' && pressed && { opacity: 0.7 },
        ]}
        android_ripple={{ color: colors.light.border }}
        onPress={toggleDropdown}
      >
        <Text style={[styles.dropdownText, textStyle]}>{getSelectedLabel()}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.light.subText}
        />
      </Pressable>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.dropdownMenu,
              dropdownStyle,
              {
                top: 35,
                left: 4,
                minWidth: buttonPosition.width ?? 140,
              },
            ]}
          >
            {priceOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem,
                    selectedValue === option.value && styles.optionItemSelected,
                    Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: colors.light.altBorder }}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selectedValue === option.value && (
                    <Ionicons name="checkmark" size={18} color={colors.light.success} />
                  )}
                </Pressable>

                {index < priceOptions.length - 1 && <View style={styles.optionSeparator} />}
              </React.Fragment>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// Negotiable Toggle Component
const NegotiableToggle: React.FC<NegotiableToggleProps> = ({
  isNegotiable,
  onToggle,
  containerStyle,
  activeStyle,
  inactiveStyle,
  textStyle,
  onLayout,
}) => {
  const toggleRef = useRef<View>(null);

  const handleLayout = () => {
    if (onLayout) {
      toggleRef.current?.measure((x, y, width, height, pageX, pageY) => {
        onLayout({ x: pageX, y: pageY, width, height });
      });
    }
  };

  return (
    <Pressable
      ref={toggleRef}
      onLayout={handleLayout}
      style={({ pressed }) => [
        styles.toggleButton,
        isNegotiable ? [styles.toggleActive, activeStyle] : [styles.toggleInactive, inactiveStyle],
        containerStyle,
        Platform.OS === 'ios' && pressed && { opacity: 0.8 },
      ]}
      android_ripple={{
        color: isNegotiable ? colors.light.successBackground : colors.light.border,
      }}
      onPress={onToggle}
    >
      <Text style={[styles.toggleText, isNegotiable && { color: colors.light.success }, textStyle]}>
        Negotiable
      </Text>
      <Ionicons
        name="checkmark-circle"
        size={18}
        color={isNegotiable ? colors.light.success : colors.light.mutedText}
      />
    </Pressable>
  );
};

// NearbyOnly Toggle Component
const NearbyOnlyToggle: React.FC<NearbyOnlyToggleProps> = ({
  isNearbyOnly,
  onToggle,
  containerStyle,
  activeStyle,
  inactiveStyle,
  textStyle,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.toggleButton,
        isNearbyOnly ? [styles.toggleActive, activeStyle] : [styles.toggleInactive, inactiveStyle],
        containerStyle,
        Platform.OS === 'ios' && pressed && { opacity: 0.8 },
      ]}
      android_ripple={{
        color: isNearbyOnly ? colors.light.successBackground : colors.light.border,
      }}
      onPress={onToggle}
    >
      <Text style={[styles.toggleText, isNearbyOnly && { color: colors.light.success }, textStyle]}>
        Nearby
      </Text>
      <Ionicons
        name="location"
        size={18}
        color={isNearbyOnly ? colors.light.success : colors.light.mutedText}
      />
    </Pressable>
  );
};

// Main FilterButtons Component
const FilterButtons: React.FC<FilterButtonsProps> = ({
  priceType,
  onPriceTypeChange,
  isNegotiable,
  onNegotiableToggle,
  isNearbyOnly,
  onNearbyOnlyToggle,
  containerStyle,
  dropdownStyle,
  toggleStyle,
  onNegotiableLayout,
}) => {
  return (
    <View style={[styles.filtersContainer, containerStyle]}>
      <PriceTypeDropdown
        selectedValue={priceType}
        onSelect={onPriceTypeChange}
        containerStyle={dropdownStyle}
      />

      <NearbyOnlyToggle
        isNearbyOnly={isNearbyOnly}
        onToggle={onNearbyOnlyToggle}
        containerStyle={toggleStyle}
      />

      <NegotiableToggle
        isNegotiable={isNegotiable}
        onToggle={onNegotiableToggle}
        containerStyle={toggleStyle}
        onLayout={onNegotiableLayout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 2,
    gap: 6,
    backgroundColor: colors.light.altBackground,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 8,
    minWidth: 90,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: colors.light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    zIndex: 1000,
    minWidth: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  optionItemSelected: {
    backgroundColor: colors.light.successBackground,
  },
  optionSeparator: {
    height: 1,
    backgroundColor: colors.light.altBorder,
  },
  optionText: {
    fontSize: 14,
    color: colors.light.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.light.success,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minWidth: 100,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.success,
  },
  toggleInactive: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
  },
});

export { FilterButtons, NegotiableToggle, PriceTypeDropdown };
export default FilterButtons;
