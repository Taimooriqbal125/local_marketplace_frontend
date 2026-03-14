import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Price Type Dropdown Component (Compact Version)
const PriceTypeDropdown = ({
  selectedValue,
  onSelect,
  containerStyle,
  buttonStyle,
  textStyle,
  dropdownStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const priceOptions = [
    { id: '1', label: 'Fixed', value: 'fixed' },
    { id: '2', label: 'Hourly', value: 'hourly' },
    { id: '3', label: 'Daily', value: 'daily' },
  ];

  const handleSelect = (option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    const selected = priceOptions.find((opt) => opt.value === selectedValue);
    return selected ? selected.label : 'Price Type';
  };

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setButtonPosition({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        ref={buttonRef}
        style={[styles.dropdownButton, buttonStyle]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, textStyle]}>{getSelectedLabel()}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </Pressable>

      {isOpen && (
        <>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Dropdown Menu */}
          <View
            style={[
              styles.dropdownMenu,
              dropdownStyle,
              {
                top: 35,
                left: 4,
                minWidth: buttonPosition.width,
              },
            ]}
          >
            {priceOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                <Pressable
                  style={[
                    styles.optionItem,
                    selectedValue === option.value && styles.optionItemSelected,
                  ]}
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
                    <Ionicons name="checkmark" size={18} color="#10B981" />
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
const NegotiableToggle = ({
  isNegotiable,
  onToggle,
  containerStyle,
  activeStyle,
  inactiveStyle,
  textStyle,
}) => {
  return (
    <Pressable
      style={[
        styles.toggleButton,
        isNegotiable ? [styles.toggleActive, activeStyle] : [styles.toggleInactive, inactiveStyle],
        containerStyle,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.toggleText, isNegotiable && { color: '#10B981' }, textStyle]}>
        Negotiable
      </Text>
      <Ionicons name="checkmark-circle" size={18} color={isNegotiable ? '#10B981' : '#9CA3AF'} />
    </Pressable>
  );
};

// Main FilterButtons Component
const FilterButtons = ({
  priceType,
  onPriceTypeChange,
  isNegotiable,
  onNegotiableToggle,
  containerStyle,
  dropdownStyle,
  toggleStyle,
}) => {
  return (
    <View style={[styles.filtersContainer, containerStyle]}>
      <PriceTypeDropdown
        selectedValue={priceType}
        onSelect={onPriceTypeChange}
        containerStyle={dropdownStyle}
      />

      <NegotiableToggle
        isNegotiable={isNegotiable}
        onToggle={onNegotiableToggle}
        containerStyle={toggleStyle}
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
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 12,
    backgroundColor: '#F9FAFB',
  },
  // Dropdown Button Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
    minWidth: 140,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Backdrop (invisible touch area)
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  // Dropdown Menu (compact popup)
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    paddingHorizontal: 16,
  },
  optionItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  optionSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#10B981',
    fontWeight: '600',
  },
  // Toggle Styles
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
  },
  toggleInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export { FilterButtons, NegotiableToggle, PriceTypeDropdown };
export default FilterButtons;
