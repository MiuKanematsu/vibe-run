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
    if (!name.trim()) { Alert.alert('名前を入力してください'); return; }
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
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>はじめる</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: '#FAFAFA', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 32, color: '#333' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#FFF' },
  button: { marginTop: 40, backgroundColor: '#FF6B35', padding: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
