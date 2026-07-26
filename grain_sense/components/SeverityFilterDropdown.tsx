import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { SEVERITY_CONFIG, SeverityFilterValue } from '@/constants/alertTypes';
import { severityDropdownStyles as s } from '@/styles/alerts.styles';

type Option = {
  value: SeverityFilterValue;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
};

const OPTIONS: Option[] = [
  { value: 'ALL', label: 'All', iconName: 'apps-outline', color: '#555555' },
  { value: 'SAFE', label: SEVERITY_CONFIG.SAFE.label, iconName: SEVERITY_CONFIG.SAFE.iconName, color: SEVERITY_CONFIG.SAFE.border },
  { value: 'WARNING', label: SEVERITY_CONFIG.WARNING.label, iconName: SEVERITY_CONFIG.WARNING.iconName, color: SEVERITY_CONFIG.WARNING.border },
  { value: 'DANGER', label: SEVERITY_CONFIG.DANGER.label, iconName: SEVERITY_CONFIG.DANGER.iconName, color: SEVERITY_CONFIG.DANGER.border },
];

export function SeverityFilterDropdown({
  value,
  onChange,
}: {
  value: SeverityFilterValue;
  onChange: (next: SeverityFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  function select(v: SeverityFilterValue) {
    onChange(v);
    setOpen(false);
  }

  return (
    <>
      <TouchableOpacity style={s.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Ionicons name={current.iconName} size={14} color={current.color} />
        <Text style={s.triggerText}>{current.label}</Text>
        <Ionicons name="chevron-down" size={14} color="#555555" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={s.menu}>
            {OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.menuItem, active && s.menuItemActive]}
                  onPress={() => select(opt.value)}
                >
                  <Ionicons name={opt.iconName} size={16} color={opt.color} />
                  <Text style={[s.menuItemText, active && s.menuItemTextActive]}>{opt.label}</Text>
                  <View style={s.menuCheckSlot}>
                    {active && <Ionicons name="checkmark" size={16} color="#1F6B2C" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}