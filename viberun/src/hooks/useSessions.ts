import { useState, useEffect } from 'react';
import { subscribeToNearbySessions } from '../firebase/sessions';
import { RunSession } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<RunSession[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNearbySessions(setSessions);
    return unsubscribe;
  }, []);

  return { sessions };
}
