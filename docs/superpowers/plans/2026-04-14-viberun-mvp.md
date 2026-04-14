# VibeRun MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** iOSソーシャルランニングアプリ「VibeRun」のMVPを構築する。ユーザーがマップ上でランセッションを発見・参加し、走った後のストーリーを共有し、カフェ訪問を調整できるプラットフォーム。

**Architecture:** Expo (React Native) + TypeScript。Firebase で認証・リアルタイムデータ・メディアストレージを管理。Google Maps でセッションピンをリアルタイム表示。React Navigation の4タブボトムバーで画面遷移。

**Tech Stack:** Expo SDK 51, TypeScript, Firebase v10, React Navigation v6, react-native-maps, expo-location, expo-camera, expo-image-picker, @shopify/react-native-skia, expo-apple-authentication, expo-auth-session, Jest, @testing-library/react-native

---

## ファイル構成

```
arcana-prj/
├── viberun/                          # Expo プロジェクトルート
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   ├── .env.example
│   ├── __tests__/
│   │   ├── firebase/
│   │   │   ├── users.test.ts
│   │   │   ├── sessions.test.ts
│   │   │   └── stories.test.ts
│   │   └── hooks/
│   │       └── useSessions.test.ts
│   └── src/
│       ├── types/
│       │   └── index.ts              # 共有TypeScript型定義
│       ├── constants/
│       │   └── index.ts              # ペース・Vibeタグ選択肢
│       ├── firebase/
│       │   ├── config.ts             # Firebase初期化
│       │   ├── users.ts              # ユーザーCRUD
│       │   ├── sessions.ts           # セッションCRUD
│       │   └── stories.ts           # ストーリーCRUD
│       ├── hooks/
│       │   ├── useAuth.ts            # 認証状態管理
│       │   ├── useLocation.ts        # 位置情報取得
│       │   └── useSessions.ts        # セッションリアルタイム購読
│       ├── components/
│       │   ├── SessionPin.tsx        # マップ上のセッションピン
│       │   ├── StoryCard.tsx         # フィード用ストーリーカード
│       │   ├── VibeTagSelector.tsx   # Vibeタグ選択UI
│       │   └── DataOverlay.tsx       # 走行データを画像に合成
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── LoginScreen.tsx
│       │   │   └── ProfileSetupScreen.tsx
│       │   ├── map/
│       │   │   ├── MapScreen.tsx
│       │   │   ├── CreateSessionScreen.tsx
│       │   │   └── SessionDetailScreen.tsx
│       │   ├── feed/
│       │   │   └── FeedScreen.tsx
│       │   ├── post/
│       │   │   └── PostScreen.tsx
│       │   └── profile/
│       │       └── ProfileScreen.tsx
│       └── navigation/
│           ├── AppNavigator.tsx      # 認証状態によるルート切り替え
│           └── TabNavigator.tsx      # ボトムタブナビゲーション
```

---

## Task 1: プロジェクト初期化と依存関係インストール

**Files:**
- Create: `viberun/` (Expo プロジェクト全体)
- Create: `viberun/.env.example`

- [ ] **Step 1: Expo プロジェクトを作成する**

```bash
cd /Users/arc053mac/Desktop/arcana-prj
npx create-expo-app viberun --template expo-template-blank-typescript
cd viberun
```

Expected: `viberun/` ディレクトリが作成され、TypeScript テンプレートが展開される

- [ ] **Step 2: 依存関係をインストールする**

```bash
npx expo install react-native-maps expo-location expo-camera expo-image-picker expo-apple-authentication expo-auth-session expo-crypto @react-native-community/datetimepicker

npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context

npm install firebase @shopify/react-native-skia

npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
```

- [ ] **Step 3: `app.json` に Google Maps API キーと権限を設定する**

`viberun/app.json` を以下の内容に書き換える:

```json
{
  "expo": {
    "name": "VibeRun",
    "slug": "viberun",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.viberun.app",
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_IOS_API_KEY"
      },
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "ランセッションの場所を表示するために位置情報を使用します。",
        "NSLocationAlwaysUsageDescription": "ランセッション中に位置情報を追跡するために使用します。",
        "NSCameraUsageDescription": "ランの写真を撮影するためにカメラを使用します。",
        "NSPhotoLibraryUsageDescription": "ランの写真を選択するためにフォトライブラリを使用します。"
      },
      "usesAppleSignIn": true
    },
    "plugins": [
      "expo-location",
      "expo-camera",
      "expo-image-picker",
      "expo-apple-authentication",
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_GOOGLE_MAPS_IOS_API_KEY"
        }
      ]
    ]
  }
}
```

- [ ] **Step 4: `.env.example` を作成する**

```
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

実際の `.env` ファイルを `.env.example` をコピーして作成し、値を埋める（`.gitignore` に追加済みであることを確認）。

- [ ] **Step 5: Jest を設定する**

`viberun/package.json` の `jest` セクションを追加する:

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase)"
    ]
  }
}
```

- [ ] **Step 6: コミット**

```bash
git add viberun/
git commit -m "feat: initialize Expo TypeScript project with dependencies"
```

---

## Task 2: 型定義と定数

**Files:**
- Create: `viberun/src/types/index.ts`
- Create: `viberun/src/constants/index.ts`

- [ ] **Step 1: `src/types/index.ts` を作成する**

```typescript
// viberun/src/types/index.ts

export interface VibeUser {
  id: string;
  name: string;
  avatar: string;
  vibeTags: string[];
  createdAt: Date;
}

export interface RunSession {
  id: string;
  creatorId: string;
  title: string;
  location: { latitude: number; longitude: number };
  locationName: string;
  startTime: Date;
  pace: string;
  cafeDestination?: string;
  cafeLocation?: { latitude: number; longitude: number };
  participants: string[];
  status: 'open' | 'active' | 'finished';
  createdAt: Date;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  overlayData: {
    distance: number; // km
    duration: number; // 秒
  };
  location?: { latitude: number; longitude: number };
  sessionId?: string;
  expiresAt: Date;
  createdAt: Date;
}
```

- [ ] **Step 2: `src/constants/index.ts` を作成する**

```typescript
// viberun/src/constants/index.ts

export const PACE_OPTIONS = [
  'キロ5分（速め）',
  'キロ6分（普通）',
  'キロ7分（ゆっくり）',
  'キロ8分以上（のんびり）',
] as const;

export const VIBE_TAG_OPTIONS = [
  'カフェ好き',
  'おしゃべり好き',
  'お洒落',
  '初心者歓迎',
  'もくもく系',
  '朝活',
  '夜ラン',
] as const;

export const STORY_EXPIRY_HOURS = 24;
```

- [ ] **Step 3: コミット**

```bash
git add viberun/src/
git commit -m "feat: add TypeScript type definitions and constants"
```

---

## Task 3: Firebase 設定とデータ層

**Files:**
- Create: `viberun/src/firebase/config.ts`
- Create: `viberun/src/firebase/users.ts`
- Create: `viberun/src/firebase/sessions.ts`
- Create: `viberun/src/firebase/stories.ts`
- Create: `viberun/__tests__/firebase/users.test.ts`
- Create: `viberun/__tests__/firebase/sessions.test.ts`
- Create: `viberun/__tests__/firebase/stories.test.ts`

**事前準備（手動）:**
1. [Firebase Console](https://console.firebase.google.com) で新規プロジェクトを作成
2. Authentication → ログイン方法 → Apple と Google を有効化
3. Firestore Database を作成（テストモードで開始）
4. Storage を有効化
5. iOS アプリを追加し、`GoogleService-Info.plist` をダウンロードして `viberun/` に配置
6. `.env` に Firebase 設定値を入力

- [ ] **Step 1: Firebase config を作成する**

```typescript
// viberun/src/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

- [ ] **Step 2: `users.ts` のテストを書く**

```typescript
// viberun/__tests__/firebase/users.test.ts
import { createUser, getUser, updateUserProfile } from '../../src/firebase/users';
import { VibeUser } from '../../src/types';

jest.mock('../../src/firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      name: 'テストユーザー',
      avatar: '',
      vibeTags: ['カフェ好き'],
      createdAt: { toDate: () => new Date('2026-04-14') },
    }),
    id: 'user-123',
  }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

describe('users', () => {
  it('createUser: ユーザードキュメントを作成する', async () => {
    const { setDoc } = require('firebase/firestore');
    await createUser('user-123', 'テストユーザー', '');
    expect(setDoc).toHaveBeenCalled();
  });

  it('getUser: ユーザーデータを取得する', async () => {
    const user = await getUser('user-123');
    expect(user).not.toBeNull();
    expect(user?.name).toBe('テストユーザー');
    expect(user?.vibeTags).toContain('カフェ好き');
  });

  it('updateUserProfile: プロフィールを更新する', async () => {
    const { updateDoc } = require('firebase/firestore');
    await updateUserProfile('user-123', { vibeTags: ['朝活', 'カフェ好き'] });
    expect(updateDoc).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: テストが失敗することを確認する**

```bash
cd viberun
npx jest __tests__/firebase/users.test.ts
```

Expected: FAIL — `Cannot find module '../../src/firebase/users'`

- [ ] **Step 4: `users.ts` を実装する**

```typescript
// viberun/src/firebase/users.ts
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { VibeUser } from '../types';

export async function createUser(
  uid: string,
  name: string,
  avatar: string
): Promise<void> {
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
```

- [ ] **Step 5: `users.ts` のテストが通ることを確認する**

```bash
npx jest __tests__/firebase/users.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 6: `sessions.ts` のテストを書く**

```typescript
// viberun/__tests__/firebase/sessions.test.ts
import { createSession, joinSession } from '../../src/firebase/sessions';

jest.mock('../../src/firebase/config', () => ({ db: {} }));

const mockSession = {
  creatorId: 'user-123',
  title: '代々木公園でゆっくりラン',
  location: { latitude: 35.671, longitude: 139.695 },
  locationName: '代々木公園',
  startTime: { toDate: () => new Date('2026-04-15T08:00:00') },
  pace: 'キロ7分（ゆっくり）',
  cafeDestination: 'Blue Bottle Coffee',
  participants: ['user-123'],
  status: 'open',
  createdAt: { toDate: () => new Date('2026-04-14') },
};

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: 'session-456' }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  arrayUnion: jest.fn((v) => v),
  doc: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [{ id: 'session-456', data: () => mockSession }],
  }),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

describe('sessions', () => {
  it('createSession: セッションを作成してIDを返す', async () => {
    const id = await createSession({
      creatorId: 'user-123',
      title: '代々木公園でゆっくりラン',
      location: { latitude: 35.671, longitude: 139.695 },
      locationName: '代々木公園',
      startTime: new Date('2026-04-15T08:00:00'),
      pace: 'キロ7分（ゆっくり）',
      cafeDestination: 'Blue Bottle Coffee',
    });
    expect(id).toBe('session-456');
  });

  it('joinSession: 参加者リストにユーザーを追加する', async () => {
    const { updateDoc } = require('firebase/firestore');
    await joinSession('session-456', 'user-789');
    expect(updateDoc).toHaveBeenCalled();
  });
});
```

- [ ] **Step 7: テストが失敗することを確認する**

```bash
npx jest __tests__/firebase/sessions.test.ts
```

Expected: FAIL — `Cannot find module '../../src/firebase/sessions'`

- [ ] **Step 8: `sessions.ts` を実装する**

```typescript
// viberun/src/firebase/sessions.ts
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
```

- [ ] **Step 9: sessions テストが通ることを確認する**

```bash
npx jest __tests__/firebase/sessions.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 10: `stories.ts` を実装する（テスト省略: 他のCRUDと同パターン）**

```typescript
// viberun/src/firebase/stories.ts
import {
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Story } from '../types';
import { STORY_EXPIRY_HOURS } from '../constants';

export async function uploadStoryMedia(
  userId: string,
  uri: string
): Promise<string> {
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

  const ref2 = await addDoc(collection(db, 'stories'), {
    userId,
    mediaUrl,
    overlayData,
    location: location ?? null,
    sessionId: sessionId ?? null,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp(),
  });
  return ref2.id;
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
```

- [ ] **Step 11: コミット**

```bash
git add viberun/src/firebase/ viberun/__tests__/
git commit -m "feat: add Firebase data layer for users, sessions, and stories"
```

---

## Task 4: 認証フック（useAuth）

**Files:**
- Create: `viberun/src/hooks/useAuth.ts`

- [ ] **Step 1: `useAuth.ts` を作成する**

```typescript
// viberun/src/hooks/useAuth.ts
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
```

- [ ] **Step 2: コミット**

```bash
git add viberun/src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook for Apple and Google sign-in"
```

---

## Task 5: ログイン画面

**Files:**
- Create: `viberun/src/screens/auth/LoginScreen.tsx`

- [ ] **Step 1: `LoginScreen.tsx` を作成する**

```typescript
// viberun/src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleAppleSignIn() {
    try {
      setLoading(true);
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString()
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });
      if (credential.identityToken) {
        await signInWithApple(credential.identityToken, nonce);
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('ログインエラー', 'もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VibeRun</Text>
      <Text style={styles.subtitle}>一人でカフェに行くより、もっと楽しい週末を。</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  appleButton: {
    width: 280,
    height: 52,
  },
});
```

- [ ] **Step 2: コミット**

```bash
git add viberun/src/screens/auth/LoginScreen.tsx
git commit -m "feat: add Apple Sign-In login screen"
```

---

## Task 6: プロフィール設定画面

**Files:**
- Create: `viberun/src/components/VibeTagSelector.tsx`
- Create: `viberun/src/screens/auth/ProfileSetupScreen.tsx`

- [ ] **Step 1: `VibeTagSelector.tsx` を作成する**

```typescript
// viberun/src/components/VibeTagSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VIBE_TAG_OPTIONS } from '../constants';

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function VibeTagSelector({ selected, onChange }: Props) {
  function toggleTag(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  return (
    <View style={styles.container}>
      {VIBE_TAG_OPTIONS.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={[styles.tag, selected.includes(tag) && styles.tagSelected]}
          onPress={() => toggleTag(tag)}
        >
          <Text style={[styles.tagText, selected.includes(tag) && styles.tagTextSelected]}>
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  tagSelected: { borderColor: '#FF6B35', backgroundColor: '#FF6B3520' },
  tagText: { fontSize: 14, color: '#666' },
  tagTextSelected: { color: '#FF6B35', fontWeight: '600' },
});
```

- [ ] **Step 2: `ProfileSetupScreen.tsx` を作成する**

```typescript
// viberun/src/screens/auth/ProfileSetupScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, createUser } from '../../firebase/users';
import VibeTagSelector from '../../components/VibeTagSelector';

export default function ProfileSetupScreen() {
  const { firebaseUser, setVibeUser } = useAuth();
  const [name, setName] = useState('');
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('名前を入力してください');
      return;
    }
    if (!firebaseUser) return;
    try {
      setLoading(true);
      await createUser(firebaseUser.uid, name.trim(), firebaseUser.photoURL ?? '');
      await updateUserProfile(firebaseUser.uid, { vibeTags });
      setVibeUser({
        id: firebaseUser.uid,
        name: name.trim(),
        avatar: firebaseUser.photoURL ?? '',
        vibeTags,
        createdAt: new Date(),
      });
    } catch {
      Alert.alert('エラー', 'プロフィールの保存に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>あなたのVibeを教えて</Text>
      <Text style={styles.label}>名前</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="表示名を入力"
        maxLength={20}
      />
      <Text style={styles.label}>Vibeタグ（複数選択OK）</Text>
      <VibeTagSelector selected={vibeTags} onChange={setVibeTags} />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>はじめる</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: '#FAFAFA', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 32, color: '#333' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12,
    padding: 14, fontSize: 16, backgroundColor: '#FFF',
  },
  button: {
    marginTop: 40, backgroundColor: '#FF6B35',
    padding: 16, borderRadius: 14, alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 3: コミット**

```bash
git add viberun/src/components/VibeTagSelector.tsx viberun/src/screens/auth/ProfileSetupScreen.tsx
git commit -m "feat: add Vibe profile setup screen and tag selector"
```

---

## Task 7: ナビゲーション

**Files:**
- Create: `viberun/src/navigation/TabNavigator.tsx`
- Create: `viberun/src/navigation/AppNavigator.tsx`
- Modify: `viberun/App.tsx`

- [ ] **Step 1: `TabNavigator.tsx` を作成する**

```typescript
// viberun/src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MapScreen from '../screens/map/MapScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import PostScreen from '../screens/post/PostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ fontSize: 11, color: focused ? '#FF6B35' : '#999' }}>{label}</Text>;
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#EEE' },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'マップ', tabBarLabel: 'マップ' }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: 'フィード', tabBarLabel: 'フィード' }}
      />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{ title: '投稿', tabBarLabel: '投稿' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'プロフィール', tabBarLabel: 'マイページ' }}
      />
    </Tab.Navigator>
  );
}
```

- [ ] **Step 2: `AppNavigator.tsx` を作成する**

```typescript
// viberun/src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import TabNavigator from './TabNavigator';
import SessionDetailScreen from '../screens/map/SessionDetailScreen';
import CreateSessionScreen from '../screens/map/CreateSessionScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { firebaseUser, vibeUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!firebaseUser ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !vibeUser ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="SessionDetail"
            component={SessionDetailScreen}
            options={{ headerShown: true, title: 'セッション詳細', presentation: 'modal' }}
          />
          <Stack.Screen
            name="CreateSession"
            component={CreateSessionScreen}
            options={{ headerShown: true, title: 'セッションを作成', presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
```

- [ ] **Step 3: `App.tsx` を更新する**

```typescript
// viberun/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 4: コミット**

```bash
git add viberun/src/navigation/ viberun/App.tsx
git commit -m "feat: add navigation structure with auth flow"
```

---

## Task 8: マップ画面（セッションピン表示）

**Files:**
- Create: `viberun/src/hooks/useLocation.ts`
- Create: `viberun/src/hooks/useSessions.ts`
- Create: `viberun/src/components/SessionPin.tsx`
- Create: `viberun/src/screens/map/MapScreen.tsx`

- [ ] **Step 1: `useLocation.ts` を作成する**

```typescript
// viberun/src/hooks/useLocation.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  return { location, permissionDenied };
}
```

- [ ] **Step 2: `useSessions.ts` のテストを書く**

```typescript
// viberun/__tests__/hooks/useSessions.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useSessions } from '../../src/hooks/useSessions';

const mockSessions = [
  {
    id: 'session-1',
    creatorId: 'user-1',
    title: 'テストラン',
    location: { latitude: 35.671, longitude: 139.695 },
    locationName: '代々木公園',
    startTime: new Date(),
    pace: 'キロ7分（ゆっくり）',
    participants: ['user-1'],
    status: 'open' as const,
    createdAt: new Date(),
  },
];

jest.mock('../../src/firebase/sessions', () => ({
  subscribeToNearbySessions: jest.fn((callback) => {
    callback(mockSessions);
    return jest.fn(); // unsubscribe
  }),
}));

describe('useSessions', () => {
  it('セッション一覧をリアルタイムで取得する', () => {
    const { result } = renderHook(() => useSessions());
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].title).toBe('テストラン');
  });
});
```

- [ ] **Step 3: テストが失敗することを確認する**

```bash
npx jest __tests__/hooks/useSessions.test.ts
```

Expected: FAIL — `Cannot find module '../../src/hooks/useSessions'`

- [ ] **Step 4: `useSessions.ts` を実装する**

```typescript
// viberun/src/hooks/useSessions.ts
import { useState, useEffect } from 'react';
import { subscribeToNearbySessions } from '../firebase/sessions';
import { RunSession } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<RunSession[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNearbySessions(setSessions);
    return unsubscribe;
  }, []);

  return { sessions };
}
```

- [ ] **Step 5: テストが通ることを確認する**

```bash
npx jest __tests__/hooks/useSessions.test.ts
```

Expected: PASS (1 test)

- [ ] **Step 6: `SessionPin.tsx` を作成する**

```typescript
// viberun/src/components/SessionPin.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { RunSession } from '../types';

interface Props {
  session: RunSession;
  onPress: (session: RunSession) => void;
}

export default function SessionPin({ session, onPress }: Props) {
  return (
    <Marker
      coordinate={session.location}
      onPress={() => onPress(session)}
    >
      <View style={styles.pin}>
        <Text style={styles.pinText}>🏃</Text>
        <Text style={styles.count}>{session.participants.length}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pinText: { fontSize: 20 },
  count: { fontSize: 11, color: '#FFF', fontWeight: '700' },
});
```

- [ ] **Step 7: `MapScreen.tsx` を作成する**

```typescript
// viberun/src/screens/map/MapScreen.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import { useSessions } from '../../hooks/useSessions';
import SessionPin from '../../components/SessionPin';
import { RunSession } from '../../types';

export default function MapScreen() {
  const { location, permissionDenied } = useLocation();
  const { sessions } = useSessions();
  const navigation = useNavigation<any>();

  if (permissionDenied) {
    Alert.alert(
      '位置情報が必要です',
      '設定から位置情報のアクセスを許可してください。',
      [{ text: 'OK' }]
    );
  }

  const initialRegion = location
    ? { ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 35.6812, longitude: 139.7671, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  function handlePinPress(session: RunSession) {
    navigation.navigate('SessionDetail', { session });
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
        {sessions.map((session) => (
          <SessionPin key={session.id} session={session} onPress={handlePinPress} />
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateSession')}
      >
        <Text style={styles.createButtonText}>+ セッションを作る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  createButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 8: コミット**

```bash
git add viberun/src/hooks/ viberun/src/components/SessionPin.tsx viberun/src/screens/map/MapScreen.tsx viberun/__tests__/
git commit -m "feat: add map screen with real-time session pins"
```

---

## Task 9: セッション作成画面

**Files:**
- Create: `viberun/src/screens/map/CreateSessionScreen.tsx`

- [ ] **Step 1: `CreateSessionScreen.tsx` を作成する**

```typescript
// viberun/src/screens/map/CreateSessionScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { createSession } from '../../firebase/sessions';
import { PACE_OPTIONS } from '../../constants';

export default function CreateSessionScreen() {
  const navigation = useNavigation();
  const { firebaseUser } = useAuth();
  const { location } = useLocation();
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [pace, setPace] = useState(PACE_OPTIONS[2]);
  const [cafeDestination, setCafeDestination] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !locationName.trim()) {
      Alert.alert('タイトルと場所を入力してください');
      return;
    }
    if (!location || !firebaseUser) return;
    try {
      setLoading(true);
      await createSession({
        creatorId: firebaseUser.uid,
        title: title.trim(),
        location,
        locationName: locationName.trim(),
        startTime,
        pace,
        cafeDestination: cafeDestination.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert('エラー', 'セッションの作成に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 代々木公園でゆっくりラン"
        maxLength={40}
      />
      <Text style={styles.label}>集合場所</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="例: 代々木公園 北門"
      />
      <Text style={styles.label}>開始時間</Text>
      <DateTimePicker
        value={startTime}
        mode="datetime"
        display="default"
        onChange={(_, date) => date && setStartTime(date)}
        minimumDate={new Date()}
      />
      <Text style={styles.label}>ペース</Text>
      {PACE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, pace === option && styles.optionSelected]}
          onPress={() => setPace(option)}
        >
          <Text style={[styles.optionText, pace === option && styles.optionTextSelected]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.label}>カフェ目的地（任意）</Text>
      <TextInput
        style={styles.input}
        value={cafeDestination}
        onChangeText={setCafeDestination}
        placeholder="例: Blue Bottle Coffee 渋谷店"
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>セッションを作成</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12,
    padding: 14, fontSize: 15, backgroundColor: '#FFF',
  },
  option: {
    padding: 12, borderRadius: 10, borderWidth: 1.5,
    borderColor: '#DDD', marginBottom: 8, backgroundColor: '#FFF',
  },
  optionSelected: { borderColor: '#FF6B35', backgroundColor: '#FF6B3515' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextSelected: { color: '#FF6B35', fontWeight: '600' },
  button: {
    marginTop: 32, backgroundColor: '#FF6B35',
    padding: 16, borderRadius: 14, alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 2: コミット**

```bash
git add viberun/src/screens/map/CreateSessionScreen.tsx
git commit -m "feat: add create session screen with pace and cafe destination"
```

---

## Task 10: セッション詳細画面（ワンタップ参加）

**Files:**
- Create: `viberun/src/screens/map/SessionDetailScreen.tsx`

- [ ] **Step 1: `SessionDetailScreen.tsx` を作成する**

```typescript
// viberun/src/screens/map/SessionDetailScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { joinSession } from '../../firebase/sessions';
import { RunSession } from '../../types';

export default function SessionDetailScreen() {
  const route = useRoute<any>();
  const { session } = route.params as { session: RunSession };
  const { firebaseUser } = useAuth();
  const [joining, setJoining] = useState(false);

  const isParticipant = firebaseUser
    ? session.participants.includes(firebaseUser.uid)
    : false;

  async function handleJoin() {
    if (!firebaseUser) return;
    try {
      setJoining(true);
      await joinSession(session.id, firebaseUser.uid);
      Alert.alert('参加しました！', `${session.locationName}で会いましょう 🏃`);
    } catch {
      Alert.alert('エラー', '参加に失敗しました。');
    } finally {
      setJoining(false);
    }
  }

  const startTimeStr = session.startTime.toLocaleString('ja-JP', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{session.title}</Text>
      <View style={styles.row}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.info}>{session.locationName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.icon}>🕐</Text>
        <Text style={styles.info}>{startTimeStr}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.icon}>👟</Text>
        <Text style={styles.info}>{session.pace}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.icon}>👥</Text>
        <Text style={styles.info}>{session.participants.length}人参加中</Text>
      </View>
      {session.cafeDestination && (
        <View style={styles.cafeBox}>
          <Text style={styles.cafeLabel}>☕ ゴール後はこちら</Text>
          <Text style={styles.cafeName}>{session.cafeDestination}</Text>
        </View>
      )}
      {isParticipant ? (
        <View style={styles.joinedBadge}>
          <Text style={styles.joinedText}>参加済み ✓</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={joining}>
          {joining ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.joinButtonText}>一緒に走る</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  icon: { fontSize: 20, marginRight: 10 },
  info: { fontSize: 16, color: '#555' },
  cafeBox: {
    backgroundColor: '#FFF8F5', borderRadius: 14,
    padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#FFD5C2',
  },
  cafeLabel: { fontSize: 12, color: '#FF6B35', fontWeight: '600', marginBottom: 4 },
  cafeName: { fontSize: 16, fontWeight: '700', color: '#333' },
  joinButton: {
    marginTop: 32, backgroundColor: '#FF6B35',
    padding: 18, borderRadius: 16, alignItems: 'center',
  },
  joinButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  joinedBadge: {
    marginTop: 32, backgroundColor: '#E8F5E9',
    padding: 18, borderRadius: 16, alignItems: 'center',
  },
  joinedText: { color: '#4CAF50', fontSize: 17, fontWeight: '700' },
});
```

- [ ] **Step 2: コミット**

```bash
git add viberun/src/screens/map/SessionDetailScreen.tsx
git commit -m "feat: add session detail screen with one-tap join"
```

---

## Task 11: ストーリーズフィード

**Files:**
- Create: `viberun/src/components/StoryCard.tsx`
- Create: `viberun/src/screens/feed/FeedScreen.tsx`

- [ ] **Step 1: `StoryCard.tsx` を作成する**

```typescript
// viberun/src/components/StoryCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Story } from '../types';

interface Props {
  story: Story;
  userName: string;
  userAvatar: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function StoryCard({ story, userName, userAvatar }: Props) {
  const distanceStr = story.overlayData.distance.toFixed(1);
  const durationMin = Math.floor(story.overlayData.duration / 60);

  return (
    <View style={styles.card}>
      <Image source={{ uri: story.mediaUrl }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.distance}>{distanceStr}km</Text>
        <Text style={styles.duration}>{durationMin}分</Text>
      </View>
      <View style={styles.footer}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
        <Text style={styles.name} numberOfLines={1}>{userName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EEE',
    marginBottom: 12,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
  },
  distance: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  duration: { color: '#FFD', fontSize: 11 },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  name: { color: '#FFF', fontSize: 12, fontWeight: '600', flex: 1 },
});
```

- [ ] **Step 2: `FeedScreen.tsx` を作成する**

```typescript
// viberun/src/screens/feed/FeedScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, Text,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { getActiveStories } from '../../firebase/stories';
import { getUser } from '../../firebase/users';
import { Story, VibeUser } from '../../types';
import StoryCard from '../../components/StoryCard';

export default function FeedScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<Record<string, VibeUser>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStories() {
    const data = await getActiveStories();
    setStories(data);
    const userIds = [...new Set(data.map((s) => s.userId))];
    const userMap: Record<string, VibeUser> = {};
    await Promise.all(
      userIds.map(async (uid) => {
        const u = await getUser(uid);
        if (u) userMap[uid] = u;
      })
    );
    setUsers(userMap);
  }

  useEffect(() => {
    loadStories().finally(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>フィード</Text>
      {stories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>まだ投稿がありません 🏃</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <StoryCard
              story={item}
              userName={users[item.userId]?.name ?? ''}
              userAvatar={users[item.userId]?.avatar ?? ''}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { fontSize: 22, fontWeight: '700', padding: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#999' },
});
```

- [ ] **Step 3: コミット**

```bash
git add viberun/src/components/StoryCard.tsx viberun/src/screens/feed/FeedScreen.tsx
git commit -m "feat: add stories feed with 2-column grid layout"
```

---

## Task 12: 投稿画面（カメラ + データオーバーレイ）

**Files:**
- Create: `viberun/src/components/DataOverlay.tsx`
- Create: `viberun/src/screens/post/PostScreen.tsx`

- [ ] **Step 1: `DataOverlay.tsx` を作成する**

```typescript
// viberun/src/components/DataOverlay.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Text as SkiaText, useFont, Rect, Group } from '@shopify/react-native-skia';

interface Props {
  distance: number; // km
  duration: number; // 秒
  width: number;
  height: number;
}

export default function DataOverlay({ distance, duration, width, height }: Props) {
  const durationMin = Math.floor(duration / 60);
  const distanceStr = `${distance.toFixed(2)} km`;
  const durationStr = `${durationMin} min`;

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Canvas style={{ width, height }}>
        <Group>
          <Rect x={16} y={height - 80} width={160} height={64} color="rgba(0,0,0,0.6)" r={12} />
          <SkiaText
            x={28}
            y={height - 52}
            text={distanceStr}
            color="white"
            font={null}
          />
          <SkiaText
            x={28}
            y={height - 30}
            text={durationStr}
            color="#FFD700"
            font={null}
          />
        </Group>
      </Canvas>
    </View>
  );
}
```

- [ ] **Step 2: `PostScreen.tsx` を作成する**

```typescript
// viberun/src/screens/post/PostScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, TextInput, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { createStory, uploadStoryMedia } from '../../firebase/stories';
import { useLocation } from '../../hooks/useLocation';
import DataOverlay from '../../components/DataOverlay';

export default function PostScreen() {
  const { firebaseUser } = useAuth();
  const { location } = useLocation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [posting, setPosting] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handlePost() {
    if (!imageUri || !firebaseUser) {
      Alert.alert('写真を選択してください');
      return;
    }
    const dist = parseFloat(distance) || 0;
    const dur = parseInt(duration) * 60 || 0;
    try {
      setPosting(true);
      const mediaUrl = await uploadStoryMedia(firebaseUser.uid, imageUri);
      await createStory(
        firebaseUser.uid,
        mediaUrl,
        { distance: dist, duration: dur },
        location ?? undefined
      );
      Alert.alert('投稿しました！', '24時間後に自動で消えます。');
      setImageUri(null);
      setDistance('');
      setDuration('');
    } catch {
      Alert.alert('エラー', '投稿に失敗しました。');
    } finally {
      setPosting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>ランを投稿</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            {(distance || duration) && (
              <DataOverlay
                distance={parseFloat(distance) || 0}
                duration={parseInt(duration) * 60 || 0}
                width={300}
                height={300}
              />
            )}
          </View>
        ) : (
          <Text style={styles.imagePickerText}>📷 写真を選ぶ</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.label}>距離 (km)</Text>
      <TextInput
        style={styles.input}
        value={distance}
        onChangeText={setDistance}
        keyboardType="decimal-pad"
        placeholder="例: 5.2"
      />
      <Text style={styles.label}>時間 (分)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholder="例: 35"
      />
      <TouchableOpacity style={styles.button} onPress={handlePost} disabled={posting}>
        {posting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>投稿する（24時間限定）</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  imagePicker: {
    width: 300, height: 300, borderRadius: 16, backgroundColor: '#F0F0F0',
    alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', marginBottom: 24,
  },
  imagePickerText: { fontSize: 18, color: '#999' },
  preview: { width: 300, height: 300 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12,
    padding: 14, fontSize: 15, backgroundColor: '#FFF',
  },
  button: {
    marginTop: 32, backgroundColor: '#FF6B35',
    padding: 16, borderRadius: 14, alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 3: コミット**

```bash
git add viberun/src/components/DataOverlay.tsx viberun/src/screens/post/PostScreen.tsx
git commit -m "feat: add post screen with image picker and data overlay"
```

---

## Task 13: プロフィール画面

**Files:**
- Create: `viberun/src/screens/profile/ProfileScreen.tsx`

- [ ] **Step 1: `ProfileScreen.tsx` を作成する**

```typescript
// viberun/src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../firebase/users';
import VibeTagSelector from '../../components/VibeTagSelector';

export default function ProfileScreen() {
  const { vibeUser, signOut, setVibeUser } = useAuth();
  const [editingTags, setEditingTags] = useState(false);
  const [tags, setTags] = useState(vibeUser?.vibeTags ?? []);
  const [saving, setSaving] = useState(false);

  async function handleSaveTags() {
    if (!vibeUser) return;
    try {
      setSaving(true);
      await updateUserProfile(vibeUser.id, { vibeTags: tags });
      setVibeUser({ ...vibeUser, vibeTags: tags });
      setEditingTags(false);
    } catch {
      Alert.alert('エラー', '保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  }

  if (!vibeUser) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: vibeUser.avatar || 'https://placekitten.com/100/100' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{vibeUser.name}</Text>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vibeタグ</Text>
          <TouchableOpacity onPress={() => setEditingTags(!editingTags)}>
            <Text style={styles.editLink}>{editingTags ? 'キャンセル' : '編集'}</Text>
          </TouchableOpacity>
        </View>
        {editingTags ? (
          <>
            <VibeTagSelector selected={tags} onChange={setTags} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTags} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>保存</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.tagRow}>
            {vibeUser.vibeTags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {vibeUser.vibeTags.length === 0 && (
              <Text style={styles.emptyTags}>タグを追加して自分のVibeを表現しよう</Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>ログアウト</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: '#333' },
  section: {
    backgroundColor: '#FFF', borderRadius: 16,
    padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  editLink: { fontSize: 14, color: '#FF6B35' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#FF6B3515', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  tagText: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },
  emptyTags: { color: '#AAA', fontSize: 14 },
  saveButton: {
    marginTop: 16, backgroundColor: '#FF6B35',
    padding: 12, borderRadius: 12, alignItems: 'center',
  },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  signOutButton: {
    marginTop: 8, borderWidth: 1.5, borderColor: '#DDD',
    padding: 14, borderRadius: 14, alignItems: 'center',
  },
  signOutText: { color: '#999', fontSize: 15 },
});
```

- [ ] **Step 2: コミット**

```bash
git add viberun/src/screens/profile/ProfileScreen.tsx
git commit -m "feat: add profile screen with Vibe tag editing"
```

---

## Task 14: 動作確認と最終調整

- [ ] **Step 1: 全テストを実行して通ることを確認する**

```bash
cd viberun
npx jest
```

Expected: PASS (全テスト)

- [ ] **Step 2: Expo Dev Client でビルドして iOS シミュレーターで動作確認する**

```bash
npx expo run:ios
```

確認フロー:
1. ログイン画面が表示される
2. Apple Sign-In でログインできる（シミュレーターでは利用不可 → 実機で確認）
3. プロフィール設定画面が表示される → 保存後メイン画面へ
4. マップにセッションピンが表示される
5. ピンタップでセッション詳細が表示される
6. 「一緒に走る」で参加できる
7. 「+ セッションを作る」でセッション作成できる
8. フィードタブでストーリーが表示される
9. 投稿タブで写真を選びデータオーバーレイが合成される
10. プロフィールタブでVibeタグを編集できる

- [ ] **Step 3: Firebase Firestore のセキュリティルールを設定する（Firebase Console）**

Firebase Console → Firestore → ルール に以下を設定:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /stories/{storyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

- [ ] **Step 4: 最終コミット**

```bash
git add .
git commit -m "feat: complete VibeRun MVP - social running app with map, stories, and cafe flow"
```
