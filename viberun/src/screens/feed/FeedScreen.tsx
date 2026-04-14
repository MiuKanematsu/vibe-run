import React, { useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, Text,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { getActiveStories } from '../../firebase/stories';
import { getUser } from '../../firebase/users';
import { Story, VibeUser } from '../../types';
import StoryCard from '../../components/StoryCard';

export default function FeedScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<Record<string, VibeUser>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStories() {
    const data = await getActiveStories();
    setStories(data);
    const userIds = [...new Set(data.map((s) => s.userId))];
    const userMap: Record<string, VibeUser> = {};
    await Promise.all(
      userIds.map(async (uid) => {
        const u = await getUser(uid);
        if (u) userMap[uid] = u;
      })
    );
    setUsers(userMap);
  }

  useEffect(() => {
    loadStories().finally(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>フィード</Text>
      {stories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>まだ投稿がありません 🏃</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <StoryCard
              story={item}
              userName={users[item.userId]?.name ?? ''}
              userAvatar={users[item.userId]?.avatar ?? ''}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { fontSize: 22, fontWeight: '700', padding: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#999' },
});
