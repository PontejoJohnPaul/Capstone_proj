export const GREEN_DARK = '#0F3D1C';
export const GREEN_MID = '#1F6B2C';
export const GREEN_LIGHT = '#E8F5E9';
export const GREEN_BADGE = '#2E7D32';

export type HomeSummary = {
  temperature: number | null;
  humidity: number | null;
  moisture: number | null;
  last_update: string | null;
};