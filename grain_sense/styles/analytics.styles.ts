import { StyleSheet } from 'react-native';

import { GREEN_DARK, GREEN_MID } from '@/constants/analyticsTypes';

export const monitorStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    color: '#777777',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48.5%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  code: {
    fontSize: 9.5,
    color: '#999999',
    marginTop: 1,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 7,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  readingLabel: {
    fontSize: 10.5,
    color: '#777777',
  },
  readingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN_MID,
  },
  lastUpdated: {
    fontSize: 9.5,
    color: '#9AA0A6',
    marginTop: 6,
  },
  actionBtn: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  riskBadge: {
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  riskBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
});

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#333333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#222222',
    backgroundColor: '#F5F5F5',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  cancelBtnText: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 13,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: GREEN_MID,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

export const riskCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777777',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  overallStatus: {
    fontSize: 22,
    fontWeight: '800',
  },
  detail: {
    fontSize: 12,
    color: '#666666',
    marginTop: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#999999',
  },
});

// ============================================================
// BATCH RESULTS — table, filter bar, pagination, detail modal
// ============================================================

export const batchTableStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    color: '#777777',
    fontSize: 13,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingBottom: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777777',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  body: {
    maxHeight: 420,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cell: {
    fontSize: 12.5,
    color: '#333333',
    paddingRight: 6,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: '#9AA0A6',
    marginTop: 6,
    textAlign: 'center',
  },
});

export const filterBarStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E8DB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 11,
    color: '#9AA0A6',
    fontWeight: '600',
  },
  chipValue: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '700',
    maxWidth: 90,
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C62828',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 30,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
  },
  optionTextActive: {
    color: GREEN_MID,
    fontWeight: '700',
  },
});

export const calendarStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E8DB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipValue: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#9AA0A6',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: GREEN_MID,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: GREEN_MID,
  },
  dayText: {
    fontSize: 13,
    color: '#333333',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C62828',
  },
});

export const paginationStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  btnDisabled: {
    backgroundColor: '#F0F0F0',
  },
  btnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GREEN_MID,
  },
  btnTextDisabled: {
    color: '#BBBBBB',
  },
  pageText: {
    fontSize: 12.5,
    color: '#777777',
    fontWeight: '600',
  },
});

export const batchDetailStyles = StyleSheet.create({
  card: {
    maxHeight: '80%',
  },
  closeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
    padding: 4,
  },
  titleWithClose: {
    paddingRight: 28,
    textAlign: 'left',
  },
  subtitleLeft: {
    textAlign: 'left',
  },
  scroll: {
    marginTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statBox: {
    minWidth: 70,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN_MID,
  },
  statValueDanger: {
    color: '#C62828',
  },
  statLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 1,
  },
  pctBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  pctBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C62828',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#444444',
  },
  notesEmpty: {
    fontSize: 12.5,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F4' },
  header: {
    backgroundColor: GREEN_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  headerIcon: {
    backgroundColor: GREEN_MID,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 32 },

  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#777777' },
  tabTextActive: { color: GREEN_MID },

  // Charts
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  chartTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  chart: { marginLeft: -16, borderRadius: 8 },
  noDataBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 12,
    color: '#999999',
  },
});