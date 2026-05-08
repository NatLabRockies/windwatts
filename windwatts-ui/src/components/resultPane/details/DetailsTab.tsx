import { Stack } from "@mui/material";
import { getOutOfBoundsMessage } from "../../../utils";
import { useOutputUnit, useProductionData } from "../../../hooks";
import { ProductionDataTable } from "./ProductionDataTable";
import { WindRose } from "./WindRose";
import { ProductionCard } from "./ProductionCard";

interface DetailsTabProps {
  windRoseToggle?: boolean;
  onWindRoseToggleChange?: (toggle: boolean) => void;
  prodCardOpen?: boolean;
  onProdCardOpenChange?: (open: boolean) => void;
  prodTableOpen?: boolean;
  onProdTableOpenChange?: (open: boolean) => void;
}

export const DetailsTab = ({
  windRoseToggle = true,
  onWindRoseToggleChange,
  prodCardOpen = true,
  onProdCardOpenChange,
  prodTableOpen = true,
  onProdTableOpenChange,
}: DetailsTabProps) => {
  const {
    productionData,
    isLoading: productionLoading,
    error: productionError,
    hasData: productionHasData,
    outOfBounds,
    dataModel,
    lat,
    lng,
  } = useProductionData();

  useOutputUnit(); // auto-switches between kWh and MWh

  const hasMonthlyData =
    productionData && "monthly_avg_energy_production" in productionData;
  const tableData = hasMonthlyData
    ? productionData?.monthly_avg_energy_production
    : productionData?.yearly_avg_energy_production;
  const timeUnit = hasMonthlyData ? "month" : "year";

  const outOfBoundsMessage = outOfBounds
    ? getOutOfBoundsMessage(lat, lng, dataModel)
    : undefined;

  return (
    <Stack spacing={2}>
      <ProductionCard
        expanded={prodCardOpen}
        onExpandedChange={onProdCardOpenChange}
      />
      <WindRose
        toggle={windRoseToggle}
        onToggleChange={onWindRoseToggleChange}
      />

      <ProductionDataTable
        title=""
        dataModel={dataModel}
        data={tableData}
        timeUnit={timeUnit}
        isLoading={productionLoading}
        hasData={productionHasData}
        error={productionError}
        outOfBoundsMessage={outOfBoundsMessage}
        emptyMessage="Select a location and turbine to see production details."
        toggle={prodTableOpen}
        onToggleChange={onProdTableOpenChange}
      />
    </Stack>
  );
};
