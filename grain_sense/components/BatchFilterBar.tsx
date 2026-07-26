import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import {
  BatchFilters,
  FilterOption,
  MOISTURE_FILTER_OPTIONS,
  MoistureFilter,
  SACK_FILTER_OPTIONS,
  SackFilter,
} from '@/constants/analyticsTypes';
import { filterBarStyles as s } from '@/styles/analytics.styles';
import { BatchDatePicker } from '@/components/BatchDatePicker';

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T;
  options: FilterOption<T>[];
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity style={s.chip} onPress={() => setOpen(true)}>
        <Text style={s.chipLabel}>{label}</Text>
        <Text style={s.chipValue} numberOfLines={1}>
          {current?.label ?? 'All'}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#1F6B2C" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value || 'all'}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.option}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[s.optionText, item.value === value && s.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={16} color="#1F6B2C" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function BatchFilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: BatchFilters;
  onChange: (filters: BatchFilters) => void;
  onReset: () => void;
}) {
  const hasActiveFilters =
    !!filters.day ||
    !!filters.month ||
    !!filters.year ||
    filters.sackFilter !== 'all' ||
    filters.moistureFilter !== 'all';

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.container}>
      <BatchDatePicker
        day={filters.day}
        month={filters.month}
        year={filters.year}
        onSelectDate={(d, m, y) => onChange({ ...filters, day: d, month: m, year: y })}
        onClear={() => onChange({ ...filters, day: '', month: '', year: '' })}
      />

      <FilterDropdown<SackFilter>
        label="Sacks"
        value={filters.sackFilter}
        options={SACK_FILTER_OPTIONS}
        onSelect={(v) => onChange({ ...filters, sackFilter: v })}
      />
      <FilterDropdown<MoistureFilter>
        label="Moisture"
        value={filters.moistureFilter}
        options={MOISTURE_FILTER_OPTIONS}
        onSelect={(v) => onChange({ ...filters, moistureFilter: v })}
      />

      {hasActiveFilters && (
        <TouchableOpacity style={s.resetChip} onPress={onReset}>
          <Ionicons name="close-circle" size={14} color="#C62828" />
          <Text style={s.resetChipText}>Reset</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}