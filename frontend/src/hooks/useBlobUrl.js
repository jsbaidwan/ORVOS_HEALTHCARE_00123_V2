import { useEffect, useState, useRef, useMemo } from "react";

// 🔥 global cache for blobs
const blobCache = new Map();

/**
 * useBlobUrl - Returns a blob URL for a given file URL
 * If the URL was already fetched, it instantly returns cached blob URL
 */
const useBlobUrl = (url, options = {}) => {
  const [blobUrl, setBlobUrl] = useState(() => blobCache.get(url) || null);
  const [loading, setLoading] = useState(!blobCache.has(url));
  const [error, setError] = useState(null);
  const allowBlobUrl = process.env.REACT_APP_ALLOW_BLOB_URL;
  
  const prevUrlRef = useRef(null);

  // ✅ stable headers object for dependency
  const headers = useMemo(() => options.headers || {}, [options.headers]);

  useEffect(() => {
    if (!url) return;
    
    if(!allowBlobUrl){
      setBlobUrl(url);
      setLoading(false);
      prevUrlRef.current = url; // track current url
      return;
    }
    
    // 🔹 If same as previous URL, skip fetch
    if (prevUrlRef.current === url) return;
    
    // 🔹 If already cached, use instantly
    if (blobCache.has(url)) {
      setBlobUrl(blobCache.get(url));
      setLoading(false);
      prevUrlRef.current = url; // track current url
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(url, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;

        const objectUrl = URL.createObjectURL(blob);

        // 🔥 Save to cache
        blobCache.set(url, objectUrl);
        setBlobUrl(objectUrl);

        prevUrlRef.current = url; // update previous URL
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, headers,allowBlobUrl]);

  return { blobUrl, loading, error };
};

export default useBlobUrl;