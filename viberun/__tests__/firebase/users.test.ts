import { createUser, getUser, updateUserProfile } from '../../src/firebase/users';

jest.mock('../../src/firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      name: 'テストユーザー',
      avatar: '',
      vibeTags: ['カフェ好き'],
      createdAt: { toDate: () => new Date('2026-04-14') },
    }),
    id: 'user-123',
  }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

describe('users', () => {
  it('createUser: ユーザードキュメントを作成する', async () => {
    const { setDoc } = require('firebase/firestore');
    await createUser('user-123', 'テストユーザー', '');
    expect(setDoc).toHaveBeenCalled();
  });

  it('getUser: ユーザーデータを取得する', async () => {
    const user = await getUser('user-123');
    expect(user).not.toBeNull();
    expect(user?.name).toBe('テストユーザー');
    expect(user?.vibeTags).toContain('カフェ好き');
  });

  it('updateUserProfile: プロフィールを更新する', async () => {
    const { updateDoc } = require('firebase/firestore');
    await updateUserProfile('user-123', { vibeTags: ['朝活', 'カフェ好き'] });
    expect(updateDoc).toHaveBeenCalled();
  });
});
