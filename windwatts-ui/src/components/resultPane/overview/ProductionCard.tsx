import { useContext, memo, useState, type SyntheticEvent } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Skeleton,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import { WindPower, ExpandMore, InfoOutlined } from "@mui/icons-material";
import { UnitsContext } from "../../../providers/UnitsContext";
import {
  KEY_AVERAGE_YEAR,
  KEY_HIGHEST_YEAR,
  KEY_KWH_PRODUCED,
  KEY_LOWEST_YEAR,
  DATA_MODEL_INFO,
} from "../../../constants";
import { convertOutput, getOutOfBoundsMessage } from "../../../utils";
import { OutOfBoundsWarning } from "../../shared";
import { useProductionData } from "../../../hooks";

export const ProductionCard = memo(() => {
  const { units } = useContext(UnitsContext);
  const [expanded, setExpanded] = useState(true);
  const {
    productionData,
    isLoading,
    error,
    hasData,
    outOfBounds,
    dataModel,
    lat,
    lng,
  } = useProductionData();

  const handleExpandChange = (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const productionModelDisplay = dataModel.split("-")[0].toUpperCase();
  const subheader = (
    <>
      Estimated Annual Production Potential from{" "}
      <Link
        href={
          DATA_MODEL_INFO[dataModel]?.source_href ||
          DATA_MODEL_INFO["era5-quantiles"].source_href
        }
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        {productionModelDisplay} Model
      </Link>
    </>
  );
  const productionNote =
    "Wind energy production can vary significantly from year to year. Understanding both the average resource and its variability is key to setting realistic expectations.";

  let content: React.ReactNode;

  if (outOfBounds) {
    content = (
      <OutOfBoundsWarning
        message={getOutOfBoundsMessage(lat, lng, dataModel)}
      />
    );
  } else if (isLoading) {
    content = (
      <>
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1.5 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {[1, 2, 3].map((index) => (
            <Box key={index}>
              <Skeleton variant="text" width="55%" height={20} />
              <Skeleton
                variant="text"
                width="30%"
                height={14}
                sx={{ mb: 0.25 }}
              />
              <Skeleton
                variant="text"
                width="85%"
                height={28}
                sx={{ mb: 0.75 }}
              />
              <Skeleton variant="rounded" width="100%" height={7} />
            </Box>
          ))}
        </Box>
      </>
    );
  } else if (error) {
    content = (
      <Box sx={{ py: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Production Data
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Unable to load production analysis. Please check your settings and try
          again.
        </Typography>
      </Box>
    );
  } else if (!hasData) {
    content = (
      <Box sx={{ py: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {subheader}
        </Typography>
        <Typography color="text.secondary" variant="h6" gutterBottom>
          No Production Data Available
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Please set your location and turbine settings to see production
          analysis.
        </Typography>
      </Box>
    );
  } else {
    const summaryData = productionData?.summary_avg_energy_production;
    const avgProduction = Number(
      summaryData?.[KEY_AVERAGE_YEAR]?.[KEY_KWH_PRODUCED] || 0
    );
    const lowProduction = Number(
      summaryData?.[KEY_LOWEST_YEAR]?.[KEY_KWH_PRODUCED] || 0
    );
    const highProduction = Number(
      summaryData?.[KEY_HIGHEST_YEAR]?.[KEY_KWH_PRODUCED] || 0
    );

    const summaryValues = [avgProduction, highProduction, lowProduction];
    const maxSummaryValue = Math.max(...summaryValues, 1);
    const lowestYear = summaryData?.[KEY_LOWEST_YEAR]?.["year"];
    const highestYear = summaryData?.[KEY_HIGHEST_YEAR]?.["year"];
    const yearRange = DATA_MODEL_INFO[dataModel]?.year_range || undefined;

    const summaryMetrics = [
      {
        label: "Annual Average",
        value: avgProduction,
        color: "primary.main",
        yearLabel: yearRange,
      },
      {
        label: "Highest Year",
        value: highProduction,
        color: "success.main",
        yearLabel: highestYear != null ? String(highestYear) : undefined,
      },
      {
        label: "Lowest Year",
        value: lowProduction,
        color: "warning.main",
        yearLabel: lowestYear != null ? String(lowestYear) : undefined,
      },
    ];

    content = (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 0.25,
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {subheader}
          </Typography>
          <Tooltip title={productionNote} arrow>
            <IconButton
              size="small"
              aria-label="production summary info"
              sx={{ p: 0.25 }}
            >
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {summaryMetrics.map((metric) => {
            const barPercent =
              (Math.max(metric.value, 0) / maxSummaryValue) * 100;

            return (
              <Box key={metric.label} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.25,
                  }}
                >
                  <WindPower
                    sx={{ color: metric.color, fontSize: 16, flexShrink: 0 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "text.secondary" }}
                  >
                    {metric.label}
                  </Typography>
                </Box>

                {metric.yearLabel && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mb: 0.5, pl: "16px" }}
                  >
                    {metric.yearLabel}
                  </Typography>
                )}

                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1.05rem", md: "1.15rem" },
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mb: 0.75,
                  }}
                >
                  {convertOutput(metric.value, units.output)}
                </Typography>

                <Box
                  sx={{
                    width: "100%",
                    height: 7,
                    borderRadius: 99,
                    bgcolor: "action.selected",
                  }}
                >
                  <Box
                    sx={{
                      width: `${barPercent}%`,
                      height: "100%",
                      borderRadius: 99,
                      bgcolor: metric.color,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </>
    );
  }

  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      onChange={handleExpandChange}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Production Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expanded ? "Hide" : "Show"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0.5 }}>{content}</AccordionDetails>
    </Accordion>
  );
});
