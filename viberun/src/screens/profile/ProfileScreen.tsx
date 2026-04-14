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
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  editLink: { fontSize: 14, color: '#FF6B35' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#FF6B3515', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },
  emptyTags: { color: '#AAA', fontSize: 14 },
  saveButton: { marginTop: 16, backgroundColor: '#FF6B35', padding: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  signOutButton: { marginTop: 8, borderWidth: 1.5, borderColor: '#DDD', padding: 14, borderRadius: 14, alignItems: 'center' },
  signOutText: { color: '#999', fontSize: 15 },
});
