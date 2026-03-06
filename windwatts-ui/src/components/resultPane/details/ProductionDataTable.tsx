import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Stack,
} from "@mui/material";
import { useContext, useState } from "react";
import { ExpandMore } from "@mui/icons-material";
import { UnitsContext } from "../../../providers/UnitsContext";
import { convertOutput, convertWindspeed } from "../../../utils";
import {
  KEY_AVG_WIND_SPEED,
  KEY_KWH_PRODUCED,
  MONTH_NAMES,
} from "../../../constants";
import { OutOfBoundsWarning } from "../../shared";

interface ProductionDataTableProps {
  title?: string;
  data?: Record<string, Record<string, string | number | null>>;
  timeUnit?: "month" | "year";
  showAccordion?: boolean;
  accordionTitle?: string;
  defaultExpanded?: boolean;
  isLoading?: boolean;
  error?: boolean;
  hasData?: boolean;
  outOfBoundsMessage?: string;
  emptyMessage?: string;
}

const ProductionDisplay = ({
  data,
  timeUnit = "month",
}: {
  data: Record<string, Record<string, string | number | null>>;
  timeUnit: "month" | "year";
}) => {
  const { units } = useContext(UnitsContext);

  // Define order based on time unit
  const timeOrder =
    timeUnit === "month"
      ? MONTH_NAMES
      : Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b));

  const sortedData = timeOrder
    .map((time) => ({ time, values: data[time] }))
    .filter(({ values }) => values);

  // Calculate min/max for better wind speed bar scaling
  const windSpeeds = sortedData.map(({ values }) =>
    Number(values[KEY_AVG_WIND_SPEED])
  );
  const minWindSpeed = Math.min(...windSpeeds);
  const maxWindSpeed = Math.max(...windSpeeds);
  const windSpeedRange = maxWindSpeed - minWindSpeed;

  // Calculate max production for energy bar scaling
  const productions = sortedData.map(({ values }) =>
    Number(values[KEY_KWH_PRODUCED])
  );
  const maxProduction = Math.max(...productions);

  return (
    <TableContainer
      component={Box}
      sx={{
        width: "100%",
        overflowX: { xs: "auto", md: "visible" }, // Only scroll on small screens (below 900px)
      }}
    >
      <Table size="small" sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
              {timeUnit === "month" ? "Month" : "Year"}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", width: "50%" }}>
              Wind Speed ({units.windspeed})
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", width: "40%" }}>
              Energy ({units.output})
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map(({ time, values }) => {
            const windSpeed = Number(values[KEY_AVG_WIND_SPEED]);
            const production = Number(values[KEY_KWH_PRODUCED]);

            // Min/max scaling: smallest bar = 30%, largest bar = 100%, interpolate between
            const windSpeedPercentage =
              windSpeedRange > 0
                ? 30 + ((windSpeed - minWindSpeed) / windSpeedRange) * 70
                : 75; // fallback to 75% if all speeds are the same

            // Energy bar scaling: 30% to 100% based on max production
            const energyPercentage = 30 + (production / maxProduction) * 70;

            return (
              <TableRow key={time} hover>
                <TableCell sx={{ fontWeight: "medium", whiteSpace: "nowrap" }}>
                  {time}
                </TableCell>

                {/* Wind Speed Cell - Responsive within available space */}
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        minWidth: 0,
                        maxWidth: { xs: 60, sm: 80, md: 100, lg: 120, xl: 150 },
                      }}
                    >
                      <Box
                        sx={{
                          width: `${windSpeedPercentage}%`,
                          height: 6,
                          bgcolor: "primary.light",
                          borderRadius: 1,
                          minWidth: 8,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        minWidth: { xs: 40, sm: 45, md: 50 },
                        textAlign: "right",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.8rem",
                          md: "0.875rem",
                        },
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {convertWindspeed(windSpeed, units.windspeed).replace(
                        /\s\w+\/?\w*$/,
                        ""
                      )}
                    </Box>
                  </Box>
                </TableCell>

                {/* Energy Cell - Responsive within available space */}
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        minWidth: 0,
                        maxWidth: { xs: 60, sm: 80, md: 100, lg: 120, xl: 150 },
                      }}
                    >
                      <Box
                        sx={{
                          width: `${energyPercentage}%`,
                          height: 6,
                          bgcolor: "success.light",
                          borderRadius: 1,
                          minWidth: 8,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        minWidth: { xs: 45, sm: 50, md: 55 },
                        textAlign: "right",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.8rem",
                          md: "0.875rem",
                        },
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {convertOutput(production, units.output).replace(
                        /\s\w+$/,
                        ""
                      )}
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const ProductionDataTable = ({
  title,
  data,
  timeUnit = "month",
  showAccordion = true,
  accordionTitle = "Production Data Table",
  defaultExpanded = true,
  isLoading = false,
  error = false,
  hasData = true,
  outOfBoundsMessage,
  emptyMessage = "No data available",
}: ProductionDataTableProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const showTitle = title && title.trim().length > 0;
  const isEmpty =
    !data || typeof data !== "object" || Object.keys(data).length === 0;

  const content = outOfBoundsMessage ? (
    <OutOfBoundsWarning message={outOfBoundsMessage} />
  ) : isLoading ? (
    <Stack spacing={1}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rectangular" height={24} />
      ))}
    </Stack>
  ) : error ? (
    <Typography color="error" variant="body2">
      Unable to load production data. Please check your settings.
    </Typography>
  ) : !hasData || isEmpty ? (
    <Typography variant="body2" color="text.secondary">
      {emptyMessage}
    </Typography>
  ) : (
    <ProductionDisplay data={data} timeUnit={timeUnit} />
  );

  const body = (
    <>
      {showTitle ? (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
      ) : null}
      {content}
    </>
  );

  if (!showAccordion) {
    return body;
  }

  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
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
            {accordionTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expanded ? "Hide" : "Show"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{body}</AccordionDetails>
    </Accordion>
  );
};
