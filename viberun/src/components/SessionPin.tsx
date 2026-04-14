import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
