import AsyncStorage from '@react-native-async-storage/async-storage';

// Matches the "user" object returned by api/mobile_login.php
export type StoredUser = {
  user_id: number;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  farmer_id: number;
  farm_name: string;
  address: string;
};

const USER_KEY = 'grainsense_user';

// Call this right after a successful mobile_login.php response.
export async function saveUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Full stored user object, or null if nobody is logged in.
export async function getUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

// Shortcut for the one field most API calls need (batches, sensors, etc).
export async function getFarmerId(): Promise<number | null> {
  const user = await getUser();
  return user?.farmer_id ?? null;
}

// Call this on logout.
export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}