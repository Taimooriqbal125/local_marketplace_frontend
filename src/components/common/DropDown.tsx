import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@theme/index';

interface DropdownOption {
  label: string;
  value: any;
}

interface CustomDropdownProps {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value: any;
  onChange: (value: any) => void;
  icon?: any; // Ionicons glyph name
  searchable?: boolean;
}

const CustomDropdown = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  icon,
  searchable = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const selectedItem = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          Platform.OS === 'ios' && pressed && { opacity: 0.7 },
        ]}
        android_ripple={{ color: colors.light.border }}
        onPress={() => setIsOpen(true)}
      >
        {icon && (
          <Ionicons name={icon} size={20} color={colors.light.mutedText} style={styles.icon} />
        )}
        <Text style={[styles.dropdownText, !selectedItem && styles.placeholderText]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.light.mutedText}
          style={styles.chevron}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={false}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
        onRequestClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.fullScreenModal}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                Platform.OS === 'ios' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.light.border, borderless: true, radius: 20 }}
              onPress={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
            >
              <Ionicons name="close" size={24} color={colors.light.text} />
            </Pressable>
            <Text style={styles.modalTitle}>{label}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Area */}
          {searchable && (
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.light.mutedText}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.fullScreenSearchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor={colors.light.mutedText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  style={({ pressed }) => [Platform.OS === 'ios' && pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name="close-circle" size={18} color={colors.light.mutedText} />
                </Pressable>
              )}
            </View>
          )}

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value.toString()}
            contentContainerStyle={styles.optionsList}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  Platform.OS === 'ios' && pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: colors.light.altBorder }}
                onPress={() => {
                  onChange(item.value);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
              >
                <Text
                  style={[styles.optionText, item.value === value && styles.selectedOptionText]}
                >
                  {item.label}
                </Text>
                {item.value === value && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.light.success} />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.light.border} />
                <Text style={styles.emptyText}>No matches found for &quot;{searchQuery}&quot;</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.altBackground,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  icon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.light.text,
  },
  placeholderText: {
    color: colors.light.mutedText,
  },
  chevron: {
    marginLeft: 'auto',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.altBorder,
    backgroundColor: colors.light.surface,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.light.altBackground,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.altBorder,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  fullScreenSearchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.light.text,
    paddingVertical: 8,
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.altBorder,
  },
  optionText: {
    fontSize: 16,
    color: colors.light.text,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.light.success,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.light.mutedText,
    textAlign: 'center',
  },
});

export default CustomDropdown;
