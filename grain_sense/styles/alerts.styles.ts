import { StyleSheet } from 'react-native';

export const GREEN_DARK = '#0F3D1C';

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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
  },
  sectionLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  sectionValue: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 19,
    marginTop: 3,
  },
  dateText: {
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 16,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: GREEN_DARK,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
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
  badge: {
    backgroundColor: '#C62828',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  content: { padding: 12, paddingBottom: 32 },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: '#999999',
    fontSize: 13,
  },

  alertCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  alertRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  alertIcon: { marginTop: 1 },
  alertBody: { flex: 1 },
  sourceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  sourceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  alertTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },

  resolvedHeader: {
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  resolvedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});