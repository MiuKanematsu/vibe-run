import {
  collection, addDoc, updateDoc, arrayUnion,
  doc, getDocs, query, where, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { RunSession } from '../types';

type CreateSessionInput = Omit<RunSession, 'id' | 'participants' | 'status' | 'createdAt'>;

export async function createSession(input: CreateSessionInput): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    ...input,
    participants: [input.creatorId],
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function joinSession(sessionId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    participants: arrayUnion(userId),
  });
}

export function subscribeToNearbySessions(
  callback: (sessions: RunSession[]) => void
): () => void {
  const q = query(
    collection(db, 'sessions'),
    where('status', 'in', ['open', 'active'])
  );
  return onSnapshot(q, (snap) => {
    const sessions: RunSession[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        creatorId: data.creatorId,
        title: data.title,
        location: data.location,
        locationName: data.locationName,
        startTime: data.startTime?.toDate() ?? new Date(),
        pace: data.pace,
        cafeDestination: data.cafeDestination,
        cafeLocation: data.cafeLocation,
        participants: data.participants,
        status: data.status,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      };
    });
    callback(sessions);
  });
}

export async function getNearbySessions(): Promise<RunSession[]> {
  const q = query(
    collection(db, 'sessions'),
    where('status', 'in', ['open', 'active'])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      creatorId: data.creatorId,
      title: data.title,
      location: data.location,
      locationName: data.locationName,
      startTime: data.startTime?.toDate() ?? new Date(),
      pace: data.pace,
      cafeDestination: data.cafeDestination,
      cafeLocation: data.cafeLocation,
      participants: data.participants,
      status: data.status,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    };
  });
}
