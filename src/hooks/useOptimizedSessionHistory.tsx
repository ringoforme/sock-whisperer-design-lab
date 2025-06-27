
import { useState, useCallback, useRef } from 'react';
import { optimizedSessionService, OptimizedDesignSession } from '@/services/optimizedSessionService';
import { cacheService } from '@/services/cacheService';
import { useAuth } from '@/contexts/AuthContext';

export const useOptimizedSessionHistory = () => {
  const [sessions, setSessions] = useState<OptimizedDesignSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return user ? cacheService.getUserCacheKey(user.id, 'sessions') : null;
  }, [user]);

  const loadSessions = useCallback(async (useCache = true, offset = 0, limit = 50) => {
    if (!user) {
      setSessions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      setLoading(true);

      const cacheKey = getCacheKey();
      
      // Try cache first for initial load
      if (useCache && cacheKey && offset === 0) {
        const cachedData = await cacheService.get<OptimizedDesignSession[]>(cacheKey);
        if (cachedData) {
          setSessions(cachedData);
          setLoading(false);
          return;
        }
      }

      console.log('加载会话历史...');
      
      // Use optimized query
      const newSessions = await optimizedSessionService.getUserSessionsOptimized(limit, offset);
      
      // Filter sessions with user messages
      const validSessions = newSessions.filter(session => 
        session.user_message_count && session.user_message_count > 0
      );

      if (offset === 0) {
        setSessions(validSessions);
        
        // Cache the result
        if (cacheKey) {
          await cacheService.set(cacheKey, validSessions, { ttl: 2 * 60 * 1000 }); // 2 minutes
        }
      } else {
        setSessions(prev => [...prev, ...validSessions]);
      }

      setHasMore(newSessions.length === limit);

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('加载会话历史失败:', error);
      setError(error.message || '加载会话历史失败');
    } finally {
      setLoading(false);
    }
  }, [user, getCacheKey]);

  const refresh = useCallback(() => {
    const cacheKey = getCacheKey();
    if (cacheKey) {
      cacheService.delete(cacheKey);
    }
    setHasMore(true);
    return loadSessions(false);
  }, [getCacheKey, loadSessions]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      return loadSessions(false, sessions.length);
    }
  }, [loading, hasMore, sessions.length, loadSessions]);

  return {
    sessions,
    loading,
    error,
    hasMore,
    loadSessions,
    loadMore,
    refresh
  };
};
