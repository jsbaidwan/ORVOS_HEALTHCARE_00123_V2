import { useEffect, useState } from "react";

const useBlobUrl = (url, options = {}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    let objectUrl;
    let isMounted = true;

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
      if (objectUrl) URL.revokeObjectURL(objectUrl); // 🔥 cleanup
    };
  }, [url]);

  return { blobUrl, loading, error };
};

export default useBlobUrl;