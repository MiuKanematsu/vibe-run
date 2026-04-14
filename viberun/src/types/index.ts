export interface VibeUser {
  id: string;
  name: string;
  avatar: string;
  vibeTags: string[];
  createdAt: Date;
}

export interface RunSession {
  id: string;
  creatorId: string;
  title: string;
  location: { latitude: number; longitude: number };
  locationName: string;
  startTime: Date;
  pace: string;
  cafeDestination?: string;
  cafeLocation?: { latitude: number; longitude: number };
  participants: string[];
  status: 'open' | 'active' | 'finished';
  createdAt: Date;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  overlayData: {
    distance: number; // km
    duration: number; // 秒
  };
  location?: { latitude: number; longitude: number };
  sessionId?: string;
  expiresAt: Date;
  createdAt: Date;
}
