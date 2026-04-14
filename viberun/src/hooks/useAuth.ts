import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUser, createUser } from '../firebase/users';
import { VibeUser } from '../types';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [vibeUser, setVibeUser] = useState<VibeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile = await getUser(user.uid);
        setVibeUser(profile);
      } else {
        setVibeUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithApple(identityToken: string, nonce: string) {
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({ idToken: identityToken, rawNonce: nonce });
    const result = await signInWithCredential(auth, credential);
    const existing = await getUser(result.user.uid);
    if (!existing) {
      await createUser(
        result.user.uid,
        result.user.displayName ?? 'VibeRunner',
        result.user.photoURL ?? ''
      );
    }
    return result.user;
  }

  async function signInWithGoogle(idToken: string) {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const existing = await getUser(result.user.uid);
    if (!existing) {
      await createUser(
        result.user.uid,
        result.user.displayName ?? 'VibeRunner',
        result.user.photoURL ?? ''
      );
    }
    return result.user;
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { firebaseUser, vibeUser, loading, signInWithApple, signInWithGoogle, signOut, setVibeUser };
}
