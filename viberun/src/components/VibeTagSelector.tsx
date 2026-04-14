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
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF',
  },
  tagSelected: { borderColor: '#FF6B35', backgroundColor: '#FF6B3520' },
  tagText: { fontSize: 14, color: '#666' },
  tagTextSelected: { color: '#FF6B35', fontWeight: '600' },
});
