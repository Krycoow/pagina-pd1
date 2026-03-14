import { persistentAtom } from '@nanostores/persistent';

export type User = {
  name: string;
  phone?: string;
  email: string;
} | null;

// The store to check if the user is authenticated, persists through reloads (for demo purposes)
// JSON encoding is required for objects in persistent atoms
export const authStore = persistentAtom<User>('neonclouds_auth', null, {
  encode: JSON.stringify,
  decode: JSON.parse
});

export function loginUser(user: Omit<User, 'phone'> | User) {
  authStore.set(user as User);
}

export function logoutUser() {
  authStore.set(null);
}
