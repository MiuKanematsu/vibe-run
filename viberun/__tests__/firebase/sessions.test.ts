import { createSession, joinSession } from '../../src/firebase/sessions';

jest.mock('../../src/firebase/config', () => ({ db: {} }));

const mockSession = {
  creatorId: 'user-123',
  title: '代々木公園でゆっくりラン',
  location: { latitude: 35.671, longitude: 139.695 },
  locationName: '代々木公園',
  startTime: { toDate: () => new Date('2026-04-15T08:00:00') },
  pace: 'キロ7分（ゆっくり）',
  cafeDestination: 'Blue Bottle Coffee',
  participants: ['user-123'],
  status: 'open',
  createdAt: { toDate: () => new Date('2026-04-14') },
};

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: 'session-456' }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  arrayUnion: jest.fn((v) => v),
  doc: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [{ id: 'session-456', data: () => mockSession }],
  }),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  onSnapshot: jest.fn(),
}));

describe('sessions', () => {
  it('createSession: セッションを作成してIDを返す', async () => {
    const id = await createSession({
      creatorId: 'user-123',
      title: '代々木公園でゆっくりラン',
      location: { latitude: 35.671, longitude: 139.695 },
      locationName: '代々木公園',
      startTime: new Date('2026-04-15T08:00:00'),
      pace: 'キロ7分（ゆっくり）',
      cafeDestination: 'Blue Bottle Coffee',
    });
    expect(id).toBe('session-456');
  });

  it('joinSession: 参加者リストにユーザーを追加する', async () => {
    const { updateDoc } = require('firebase/firestore');
    await joinSession('session-456', 'user-789');
    expect(updateDoc).toHaveBeenCalled();
  });
});
