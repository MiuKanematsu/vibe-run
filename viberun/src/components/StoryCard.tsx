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
    width: CARD_WIDTH, height: CARD_WIDTH * 1.4,
    borderRadius: 16, overflow: 'hidden', backgroundColor: '#EEE', marginBottom: 12,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, padding: 6, alignItems: 'center',
  },
  distance: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  duration: { color: '#FFD', fontSize: 11 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', padding: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  name: { color: '#FFF', fontSize: 12, fontWeight: '600', flex: 1 },
});
