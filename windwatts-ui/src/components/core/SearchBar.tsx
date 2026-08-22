import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  TextField,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from "@mui/material";
import { LocationOn, Clear, Settings } from "@mui/icons-material";
import { useGoogleMaps } from "../../hooks";

interface SearchBarProps {
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  useGoogleAutocomplete?: boolean;
  onSettingsClick?: () => void;
}

export interface SearchBarRef {
  clearInput: () => void;
}

export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  (
    { onPlaceSelected, useGoogleAutocomplete = false, onSettingsClick },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [predictions, setPredictions] = useState<
      google.maps.places.AutocompleteSuggestion[]
    >([]);
    const [showPredictions, setShowPredictions] = useState(false);

    // Ref container for the Google Place Autocomplete widget/ element
    const autocompleteContainerRef = useRef<HTMLDivElement>(null);
    // Ref for the Google Place Autocomplete widget instance
    const placeAutocompleteRef =
      useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
    // Ref for the custom (useGoogleAutocomplete=false) TextField's input
    const textFieldInputRef = useRef<HTMLInputElement>(null);

    // Load Google Maps API
    const { isLoaded: isGoogleMapsReady } = useGoogleMaps();

    // Clear input state only (no side effects)
    const clearInput = () => {
      setInputValue("");
      setShowPredictions(false);
      if (placeAutocompleteRef.current) {
        placeAutocompleteRef.current.value = "";
      }
    };

    // Expose clearInput method to parent
    useImperativeHandle(ref, () => ({
      clearInput,
    }));

    // Google Place Autocomplete widget (useGoogleAutocomplete=true)
    useEffect(() => {
      if (
        useGoogleAutocomplete &&
        isGoogleMapsReady &&
        autocompleteContainerRef.current &&
        window.google
      ) {
        const placeAutocomplete =
          new window.google.maps.places.PlaceAutocompleteElement({});
        placeAutocomplete.placeholder = "Enter a city, address, or landmark";
        // Hide the widget's built-in icon/clear button; we render our own overlay controls.
        placeAutocomplete.noInputIcon = true;
        placeAutocomplete.noClearButton = true;
        placeAutocomplete.style.width = "100%";
        placeAutocomplete.style.padding = "12px 88px 12px 16px";
        placeAutocomplete.style.setProperty("border", "none", "important");
        placeAutocomplete.style.setProperty("box-shadow", "none", "important");
        placeAutocomplete.style.setProperty("outline", "none", "important");
        placeAutocomplete.style.backgroundColor = "transparent";

        // Append the Google Place Autocomplete widget to the container div
        autocompleteContainerRef.current.appendChild(placeAutocomplete);
        // Store the reference to the widget for later use (e.g., clearing input)
        placeAutocompleteRef.current = placeAutocomplete;

        // Input EventListener to update inputValue state
        // No onChange event <input> + attached google.maps.places.Autocomplete
        const handleInput = () => setInputValue(placeAutocomplete.value);
        placeAutocomplete.addEventListener("input", handleInput);

        // Selection EventListener for prediction selection via `gmp-select` event
        // async fetches place.fetchFields()
        const handleSelect = async (event: Event) => {
          const { placePrediction } =
            event as google.maps.places.PlacePredictionSelectEvent;
          const place = placePrediction.toPlace();
          try {
            await place.fetchFields({
              fields: ["location", "formattedAddress", "displayName"],
            });
          } catch (error) {
            console.error("Failed to fetch place details:", error);
            return;
          }
          if (place.location) {
            // Requires onPlaceSelected func to be a stable (memoized) reference -
            // otherwise this effect reruns on every render and recreates the widget.
            onPlaceSelected?.({
              place_id: place.id,
              name: place.displayName ?? undefined,
              formatted_address: place.formattedAddress ?? undefined,
              geometry: { location: place.location },
            });
            // Update the input value to the selected place's formatted address
            placeAutocomplete.value = place.formattedAddress || "";
            setInputValue(place.formattedAddress || "");
            setShowPredictions(false);
          }
        };
        placeAutocomplete.addEventListener("gmp-select", handleSelect);

        return () => {
          placeAutocomplete.removeEventListener("input", handleInput);
          placeAutocomplete.removeEventListener("gmp-select", handleSelect);
          placeAutocomplete.remove(); // Remove the widget from the DOM
          placeAutocompleteRef.current = null;
        };
      }
    }, [useGoogleAutocomplete, isGoogleMapsReady, onPlaceSelected]);

    // Custom prediction search (useGoogleAutocomplete=false)
    // Plain TextField input + Google Maps Places Autocomplete API fetch
    useEffect(() => {
      if (
        !useGoogleAutocomplete &&
        isGoogleMapsReady &&
        inputValue.length >= 2
      ) {
        let cancelled = false;

        window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
          { input: inputValue }
        )
          .then(({ suggestions }) => {
            if (cancelled) return;
            setPredictions(suggestions);
            setShowPredictions(true);
          })
          .catch(() => {
            if (cancelled) return;
            setPredictions([]);
            setShowPredictions(false);
          });

        return () => {
          cancelled = true;
        };
      } else if (!useGoogleAutocomplete) {
        setPredictions([]);
        setShowPredictions(false);
      }
    }, [inputValue, isGoogleMapsReady, useGoogleAutocomplete]);

    // Handle input change for custom search (useGoogleAutocomplete=false)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    };

    // Handle prediction click for custom search (useGoogleAutocomplete=false)
    const handlePredictionClick = async (
      suggestion: google.maps.places.AutocompleteSuggestion
    ) => {
      const placePrediction = suggestion.placePrediction;
      if (!placePrediction || !onPlaceSelected) return;

      const place = placePrediction.toPlace();
      try {
        await place.fetchFields({
          fields: ["location", "formattedAddress", "displayName"],
        });
      } catch (error) {
        console.error("Failed to fetch place details:", error);
        return;
      }

      if (place.location) {
        onPlaceSelected({
          place_id: place.id,
          name: place.displayName ?? undefined,
          formatted_address: place.formattedAddress ?? undefined,
          geometry: { location: place.location },
        });
        setInputValue(place.formattedAddress || placePrediction.text.text);
        setShowPredictions(false);
      }
    };

    const handleClear = () => {
      clearInput();
      if (useGoogleAutocomplete) {
        placeAutocompleteRef.current?.focus();
      } else {
        textFieldInputRef.current?.focus();
      }
    };

    if (useGoogleAutocomplete) {
      return (
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            ref={autocompleteContainerRef}
            id="search-bar-input"
            sx={{
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              "&:focus-within": {
                borderColor: "#1976d2",
                boxShadow:
                  "0 0 0 3px rgba(25, 118, 210, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
              },
              // Hide the widget's own inner focus indicator (a shadow-DOM
              // element exposed as `::part(focus-ring)`); the glow above replaces it.
              "& gmp-place-autocomplete::part(focus-ring)": {
                display: "none",
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              gap: 1,
            }}
          >
            {inputValue && (
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  color: "#666",
                  p: 1,
                  minWidth: "auto",
                  width: "32px",
                  height: "32px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "#333",
                  },
                }}
              >
                <Clear sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            {onSettingsClick && (
              <IconButton
                size="small"
                onClick={onSettingsClick}
                sx={{
                  color: "#666",
                  p: 1,
                  minWidth: "auto",
                  width: "32px",
                  height: "32px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "#333",
                  },
                }}
              >
                <Settings sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ position: "relative", width: "100%" }}>
        <TextField
          fullWidth
          placeholder="Enter a city, address, or landmark"
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          inputRef={textFieldInputRef}
          InputProps={{
            endAdornment: inputValue && (
              <IconButton size="small" onClick={handleClear}>
                <Clear />
              </IconButton>
            ),
          }}
        />
        {showPredictions && predictions.length > 0 && (
          <Paper
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: 300,
              overflow: "auto",
              mt: 1,
            }}
          >
            <List>
              {predictions.map((suggestion) => {
                const placePrediction = suggestion.placePrediction;
                if (!placePrediction) return null; // null guard
                return (
                  <ListItem
                    key={placePrediction.placeId}
                    component="button"
                    onClick={() => handlePredictionClick(suggestion)}
                    sx={{ py: 1, textAlign: "left", width: "100%" }}
                  >
                    <ListItemIcon>
                      <LocationOn color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        placePrediction.mainText?.text ||
                        placePrediction.text.text
                      }
                      secondary={placePrediction.secondaryText?.text}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}
      </Box>
    );
  }
);

SearchBar.displayName = "SearchBar";
