// Mobile Bottom Sheet Types
export interface MobileBottomSheetProps {
  isLoaded: boolean;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

export interface MobileBottomSheetRef {
  clearSearchInput: () => void;
  expandDrawer: () => void;
}

// Mobile Search Bar Types
export interface MobileSearchBarProps {
  onSearchSuggestions: (
    suggestions: google.maps.places.AutocompleteSuggestion[],
    searching: boolean
  ) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  isSettingFromSelectionRef?: React.MutableRefObject<boolean>;
}

export interface MobileSearchBarRef {
  clearInput: () => void;
}

// Search Results List Types
export interface SearchResultsListProps {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  onPredictionClick: (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => void;
}
