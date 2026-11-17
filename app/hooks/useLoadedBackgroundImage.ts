import { useEffect, useState } from 'react';

export const useLoadedBackgroundImage = (url?: string): string | undefined => {
  const [loadedUrl, setLoadedUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) {
      setLoadedUrl(undefined);
      return;
    }

    let cancelled = false;
    setLoadedUrl(undefined);

    const img = new Image();
    img.decoding = 'async';

    const commit = () => {
      if (!cancelled) {
        setLoadedUrl(url);
      }
    };

    const fail = () => {
      if (!cancelled) {
        setLoadedUrl(undefined);
      }
    };

    img.onload = commit;
    img.onerror = fail;
    img.src = url;

    if (typeof img.decode === 'function') {
      img.decode().then(commit).catch(() => {
        // Ignore decode errors and allow onload/onerror to settle the result.
      });
    }

    return () => {
      cancelled = true;
    };
  }, [url]);

  return loadedUrl;
};
