import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Settings } from "../settings";
import { useContext } from "react";
import { SettingsContext } from "../../providers/SettingsContext";
import { MobileBottomSheet } from "./";
import {
  MobileBottomSheetProvider,
  useMobileBottomSheet,
} from "../../providers/MobileBottomSheetProvider";
import { useGoogleMaps } from "../../hooks";
import { AppHeader } from "../AppHeader";

const LayoutMobileContent = () => {
  const { setCurrentPosition } = useContext(SettingsContext);
  const { setBottomSheetRef } = useMobileBottomSheet();

  // Load Google Maps API for SearchBar
  const { isLoaded } = useGoogleMaps();

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    if (lat === undefined || lng === undefined) {
      console.error("Selected place does not have valid coordinates.");
      return;
    }
    setCurrentPosition({ lat, lng });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ flexGrow: 0 }}>
        <AppHeader logoHeight={32} titleVariant="h6" />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Outlet />
        </Box>

        {/* Show mobile bottom sheet on mobile */}
        <MobileBottomSheet
          ref={setBottomSheetRef}
          isLoaded={isLoaded}
          onPlaceSelected={handlePlaceSelected}
        />
      </Box>
      <Settings />
    </Box>
  );
};

export const LayoutMobile = () => {
  return (
    <MobileBottomSheetProvider>
      <LayoutMobileContent />
    </MobileBottomSheetProvider>
  );
};
