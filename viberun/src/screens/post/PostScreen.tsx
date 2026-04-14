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
          <View style={{ width: 300, height: 300 }}>
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
        {posting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>投稿する（24時間限定）</Text>}
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
  input: { borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FFF' },
  button: { marginTop: 32, backgroundColor: '#FF6B35', padding: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
