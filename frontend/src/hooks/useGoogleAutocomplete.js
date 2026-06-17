import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

let scriptLoadPromise = null;

export function useGoogleAutocomplete({ setValue, standaloneFields = {}, apiKey: externalApiKey }) {
  const { googleMapApiKey: authApiKey } = useAuth();
  const googleMapApiKey = externalApiKey || authApiKey || process.env.REACT_APP_GOOGLE_MAP_API_KEY || '';
  const [isReady, setIsReady] = useState(() => !!window.google?.maps);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!googleMapApiKey || isReady) return;

    if (window.google?.maps) {
      setIsReady(true);
      return;
    }

    if (!scriptLoadPromise) {
      scriptLoadPromise = new Promise((resolve, reject) => {
        const scriptId = "google-maps-api";
        if (document.getElementById(scriptId)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    scriptLoadPromise
      .then(() => setIsReady(true))
      .catch((err) => setLoadError(err));
  }, [googleMapApiKey, isReady]);

  useEffect(() => {
    if (!isReady || !window.google?.maps?.places) return;

    const initAutocomplete = (input) => {
      if (input.dataset.autocompleteInitialized) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        const city =
          place.address_components.find((c) =>
            c.types.includes("locality") || c.types.includes("sublocality")
          )?.long_name || "";

        const state =
          place.address_components.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "";

        const parent = input.closest(".gm-autocomplete-wrapper");
        if (parent) {
          const allWrappers = Array.from(
            document.querySelectorAll(".gm-autocomplete-wrapper")
          );
          const index = allWrappers.indexOf(parent);

          if (index >= 0) {
            setValue(`locations[${index}].address`, place.formatted_address || "", { shouldValidate: true });
            setValue(`locations[${index}].city`, city, { shouldValidate: true });
             
          }
        } else {
          if (standaloneFields.address) setValue(standaloneFields.address, place.formatted_address || "", { shouldValidate: true });
          if (standaloneFields.city) setValue(standaloneFields.city, city, { shouldValidate: true });
          if (standaloneFields.state) setValue(standaloneFields.state, state, { shouldValidate: true });
        }

        input.value = place.formatted_address || "";
        const cityInput = parent ? parent.querySelector(".gm-city") : document.querySelector(".gm-city");
        const stateInput = parent ? parent.querySelector(".gm-state") : document.querySelector(".gm-state");
        if (cityInput) cityInput.value = city;
        if (stateInput) stateInput.value = state;
      });

      input.dataset.autocompleteInitialized = "true";
    };

    document.querySelectorAll(".gmap-autocomplete").forEach(initAutocomplete);

    const observer = new MutationObserver(() => {
      document.querySelectorAll(".gmap-autocomplete").forEach(initAutocomplete);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isReady, setValue, standaloneFields]);

  return { isReady, loadError };
}
