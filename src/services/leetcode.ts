import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const fetchLeetCodeData = async (requests: { query: string, variables: any } | { query: string, variables: any }[]) => {
  if (Array.isArray(requests)) {
    // Batch request
    const uncachedRequests = requests.filter(req => !cache.has(JSON.stringify(req)));
    if (uncachedRequests.length === 0) {
      return requests.map(req => cache.get(JSON.stringify(req)));
    }

    const res = await fetch("/.netlify/functions/leetcode", {
      method: "POST",
      body: JSON.stringify(uncachedRequests),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from LeetCode API');
    }

    const data = await res.json();
    data.forEach((item: any, index: number) => {
      const key = JSON.stringify(uncachedRequests[index]);
      cache.set(key, item);
    });

    return requests.map(req => {
      const key = JSON.stringify(req);
      if (cache.has(key)) {
        return cache.get(key);
      }
      // This should not happen if the logic is correct
      return null;
    });
  } else {
    // Single request
    const key = JSON.stringify(requests);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const res = await fetch("/.netlify/functions/leetcode", {
      method: "POST",
      body: JSON.stringify(requests),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from LeetCode API');
    }

    const data = await res.json();
    cache.set(key, data);
    return data;
  }
};
