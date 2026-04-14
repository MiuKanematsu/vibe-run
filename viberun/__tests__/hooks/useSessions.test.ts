import { renderHook } from '@testing-library/react-native';
import { useSessions } from '../../src/hooks/useSessions';

const mockSessions = [
  {
    id: 'session-1',
    creatorId: 'user-1',
    title: 'テストラン',
    location: { latitude: 35.671, longitude: 139.695 },
    locationName: '代々木公園',
    startTime: new Date(),
    pace: 'キロ7分（ゆっくり）',
    participants: ['user-1'],
    status: 'open' as const,
    createdAt: new Date(),
  },
];

jest.mock('../../src/firebase/sessions', () => ({
  subscribeToNearbySessions: jest.fn((callback) => {
    callback(mockSessions);
    return jest.fn();
  }),
}));

describe('useSessions', () => {
  it('セッション一覧をリアルタイムで取得する', () => {
    const { result } = renderHook(() => useSessions());
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].title).toBe('テストラン');
  });
});
