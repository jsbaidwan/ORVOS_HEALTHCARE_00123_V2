import { useEffect, useState } from "react";

// 🔥 global cache (shared across app)
const blobCache = new Map();

const useBlobUrl = (url, options = {}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    let objectUrl;
    let isMounted = true;

    // ✅ 1. Check cache first
    if (blobCache.has(url)) {
      setBlobUrl(blobCache.get(url)); // ⚡ instant
      return;
    }

    setLoading(true);
    setError(null);

    fetch(url, {
      headers: options.headers || {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);

        // ✅ 2. Save in cache
        blobCache.set(url, objectUrl);

        if (isMounted) {
          setBlobUrl(objectUrl);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;

      // ❌ DO NOT revoke cached URLs
      // only revoke if not cached
      if (objectUrl && !blobCache.has(url)) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url,options.headers]);

  return { blobUrl, loading, error };
};

export default useBlobUrl;