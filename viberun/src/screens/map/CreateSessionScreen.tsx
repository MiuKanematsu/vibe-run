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
  const [pace, setPace] = useState<string>(PACE_OPTIONS[2]);
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
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>セッションを作成</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 20, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FFF' },
  option: { padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#DDD', marginBottom: 8, backgroundColor: '#FFF' },
  optionSelected: { borderColor: '#FF6B35', backgroundColor: '#FF6B3515' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextSelected: { color: '#FF6B35', fontWeight: '600' },
  button: { marginTop: 32, backgroundColor: '#FF6B35', padding: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
