import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function useGoogleAutocomplete({ setValue, standaloneFields = {} }) {
  const { googleMapApiKey } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!googleMapApiKey) return;

    const scriptId = "google-maps-api";

    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
      if (window.google) delete window.google;
    }

    // Create new script
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsReady(true);
    script.onerror = (err) => setLoadError(err);

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      script.remove();
      if (window.google) delete window.google;
    };
  }, [googleMapApiKey]);

  useEffect(() => {
    if (!isReady || !window.google) return;

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
          Object.entries(standaloneFields).forEach(([key, selector]) => {
            if (selector) setValue(key, selector.value || "", { shouldValidate: true });
          });
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
