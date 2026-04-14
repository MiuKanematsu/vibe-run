import {
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Story } from '../types';
import { STORY_EXPIRY_HOURS } from '../constants';

export async function uploadStoryMedia(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `stories/${userId}/${Date.now()}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function createStory(
  userId: string,
  mediaUrl: string,
  overlayData: { distance: number; duration: number },
  location?: { latitude: number; longitude: number },
  sessionId?: string
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + STORY_EXPIRY_HOURS);

  const docRef = await addDoc(collection(db, 'stories'), {
    userId,
    mediaUrl,
    overlayData,
    location: location ?? null,
    sessionId: sessionId ?? null,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getActiveStories(): Promise<Story[]> {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'stories'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      mediaUrl: data.mediaUrl,
      overlayData: data.overlayData,
      location: data.location,
      sessionId: data.sessionId,
      expiresAt: data.expiresAt.toDate(),
      createdAt: data.createdAt?.toDate() ?? new Date(),
    };
  });
}
