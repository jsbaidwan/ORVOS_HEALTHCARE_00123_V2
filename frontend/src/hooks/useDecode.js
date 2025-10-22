import { useState, useEffect } from "react";

export function useDecode(encodedValue, type) {
  const [decodedValue, setDecodedValue] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (encodedValue) {
      try {
        const manualPassword = type === "password" ? "MyPaSsWoRd123!" : "MyPaSsWoRd123!";
        const decoded = atob(encodedValue); // base64 decode
        const [value, encodedPassword] = decoded.split("::");

        if (encodedPassword !== manualPassword) {
          throw new Error("Invalid password for decoding");
        }

        setDecodedValue(value);
      } catch (err) {
        setError(err.message);
      }
    }
  }, [encodedValue, type]);

  return { decodedValue, error };
}
