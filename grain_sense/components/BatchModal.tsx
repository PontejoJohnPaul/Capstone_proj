import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BatchModalMode, LiveSensor } from '@/constants/analyticsTypes';
import { modalStyles } from '@/styles/analytics.styles';

type BatchModalProps = {
  mode: BatchModalMode;
  sensor: LiveSensor | null;
  totalSacksInput: string;
  setTotalSacksInput: (value: string) => void;
  healthySacksInput: string;
  setHealthySacksInput: (value: string) => void;
  damagedSacksInput: string;
  setDamagedSacksInput: (value: string) => void;
  onClose: () => void;
  onSubmitEnable: () => void;
  onSubmitDisable: () => void;
};

// Shared modal for Enable (1 input: total_sacks) and Disable
// (2 inputs: healthy_sacks, damaged_sacks) of MOISTURE sensors.
export function BatchModal({
  mode,
  sensor,
  totalSacksInput,
  setTotalSacksInput,
  healthySacksInput,
  setHealthySacksInput,
  damagedSacksInput,
  setDamagedSacksInput,
  onClose,
  onSubmitEnable,
  onSubmitDisable,
}: BatchModalProps) {
  return (
    <Modal visible={mode !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          {mode === 'enable' ? (
            <>
              <Text style={modalStyles.title}>Start Batch</Text>
              <Text style={modalStyles.subtitle}>
                {sensor?.sensor_name || sensor?.sensor_code}
              </Text>
              <Text style={modalStyles.label}>How many sacks of rice?</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="number-pad"
                value={totalSacksInput}
                onChangeText={setTotalSacksInput}
                placeholder="e.g. 50"
                placeholderTextColor="#9AA89C"
                autoFocus
              />
              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.confirmBtn} onPress={onSubmitEnable}>
                  <Text style={modalStyles.confirmBtnText}>Start</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={modalStyles.title}>Finish Batch</Text>
              <Text style={modalStyles.subtitle}>
                {sensor?.sensor_name || sensor?.sensor_code}
              </Text>

              <Text style={modalStyles.label}>How many sacks are SAFE (pest-free)?</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="number-pad"
                value={healthySacksInput}
                onChangeText={setHealthySacksInput}
                placeholder="e.g. 45"
                placeholderTextColor="#9AA89C"
                autoFocus
              />

              <Text style={modalStyles.label}>How many sacks have PESTS?</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="number-pad"
                value={damagedSacksInput}
                onChangeText={setDamagedSacksInput}
                placeholder="e.g. 5"
                placeholderTextColor="#9AA89C"
              />

              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.confirmBtn} onPress={onSubmitDisable}>
                  <Text style={modalStyles.confirmBtnText}>Finish</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}