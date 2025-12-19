import { useEffect, useState } from 'react';
import { BackgroundConfig, getBackgrounds } from './apiService';

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useState<BackgroundConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getBackgrounds()
      .then((data) => {
        if (!isMounted) return;
        setBackgrounds(data);
        setError(null);
      })
      .catch((err) => {
        console.warn('Failed to load backgrounds', err);
        if (!isMounted) return;
        setError('Failed to load backgrounds');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { backgrounds, loading, error };
}