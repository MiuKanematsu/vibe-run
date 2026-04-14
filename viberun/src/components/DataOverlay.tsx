import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  distance: number;
  duration: number;
  width: number;
  height: number;
}

export default function DataOverlay({ distance, duration, width, height }: Props) {
  const durationMin = Math.floor(duration / 60);
  const distanceStr = `${distance.toFixed(2)} km`;
  const durationStr = `${durationMin} min`;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <View style={styles.badge}>
        <Text style={styles.distanceText}>{distanceStr}</Text>
        <Text style={styles.durationText}>{durationStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0 },
  badge: {
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12, padding: 10,
  },
  distanceText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  durationText: { color: '#FFD700', fontSize: 13 },
});
