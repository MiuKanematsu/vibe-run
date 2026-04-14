import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { VibeUser } from '../types';

export async function createUser(uid: string, name: string, avatar: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    name,
    avatar,
    vibeTags: [],
    createdAt: serverTimestamp(),
  });
}

export async function getUser(uid: string): Promise<VibeUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    avatar: data.avatar,
    vibeTags: data.vibeTags,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  };
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<VibeUser, 'name' | 'avatar' | 'vibeTags'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), updates);
}
