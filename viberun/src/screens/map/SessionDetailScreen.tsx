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
          {joining ? <ActivityIndicator color="#FFF" /> : <Text style={styles.joinButtonText}>一緒に走る</Text>}
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
  cafeBox: { backgroundColor: '#FFF8F5', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#FFD5C2' },
  cafeLabel: { fontSize: 12, color: '#FF6B35', fontWeight: '600', marginBottom: 4 },
  cafeName: { fontSize: 16, fontWeight: '700', color: '#333' },
  joinButton: { marginTop: 32, backgroundColor: '#FF6B35', padding: 18, borderRadius: 16, alignItems: 'center' },
  joinButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  joinedBadge: { marginTop: 32, backgroundColor: '#E8F5E9', padding: 18, borderRadius: 16, alignItems: 'center' },
  joinedText: { color: '#4CAF50', fontSize: 17, fontWeight: '700' },
});
