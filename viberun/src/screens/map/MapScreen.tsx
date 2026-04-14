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
