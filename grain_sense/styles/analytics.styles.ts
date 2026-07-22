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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  code: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 10,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  readingLabel: {
    fontSize: 12,
    color: '#777777',
  },
  readingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: GREEN_MID,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#9AA0A6',
    marginTop: 8,
  },
  actionBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  riskBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  riskBadgeText: {
    fontSize: 10,
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