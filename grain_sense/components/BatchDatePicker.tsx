import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { calendarStyles as s } from '@/styles/analytics.styles';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

type Props = {
  day: string; // '' = none, else '1'-'31'
  month: string; // '' = none, else '1'-'12'
  year: string; // '' = none, else e.g. '2026'
  onSelectDate: (day: string, month: string, year: string) => void;
  onClear: () => void;
};

export function BatchDatePicker({ day, month, year, onSelectDate, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const hasSelection = !!(day && month && year);

  const [viewYear, setViewYear] = useState(year ? parseInt(year, 10) : now.getFullYear());
  const [viewMonth, setViewMonth] = useState(month ? parseInt(month, 10) - 1 : now.getMonth());

  const label = hasSelection
    ? `${MONTH_NAMES[parseInt(month, 10) - 1].slice(0, 3)} ${day}, ${year}`
    : 'All Dates';

  function openPicker() {
    setViewYear(year ? parseInt(year, 10) : now.getFullYear());
    setViewMonth(month ? parseInt(month, 10) - 1 : now.getMonth());
    setOpen(true);
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDay(d: number) {
    onSelectDate(String(d), String(viewMonth + 1), String(viewYear));
    setOpen(false);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startWeekday = firstWeekday(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const isSelectedCell = (d: number) =>
    hasSelection &&
    parseInt(day, 10) === d &&
    parseInt(month, 10) === viewMonth + 1 &&
    parseInt(year, 10) === viewYear;

  const isTodayCell = (d: number) =>
    now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === d;

  return (
    <>
      <TouchableOpacity style={s.chip} onPress={openPicker}>
        <Ionicons name="calendar-outline" size={14} color="#1F6B2C" />
        <Text style={s.chipValue}>{label}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={s.sheet}>
            <View style={s.header}>
              <TouchableOpacity onPress={goPrevMonth} style={s.navBtn}>
                <Ionicons name="chevron-back" size={18} color="#1F6B2C" />
              </TouchableOpacity>
              <Text style={s.headerText}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={goNextMonth} style={s.navBtn}>
                <Ionicons name="chevron-forward" size={18} color="#1F6B2C" />
              </TouchableOpacity>
            </View>

            <View style={s.weekdaysRow}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={s.weekdayText}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={s.grid}>
              {cells.map((d, i) => (
                <View key={i} style={s.cell}>
                  {d !== null && (
                    <TouchableOpacity
                      style={[
                        s.dayCell,
                        isSelectedCell(d) && s.dayCellSelected,
                        isTodayCell(d) && !isSelectedCell(d) && s.dayCellToday,
                      ]}
                      onPress={() => selectDay(d)}
                    >
                      <Text style={[s.dayText, isSelectedCell(d) && s.dayTextSelected]}>{d}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={s.footerRow}>
              <TouchableOpacity
                style={s.clearBtn}
                onPress={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                <Text style={s.clearBtnText}>Show All Dates</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}