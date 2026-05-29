import { Typography, Paper, Grid, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useContext } from "react";
import { SettingsContext } from "../../providers/SettingsContext";
import { getTurbineLabel } from "../../utils";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export const SettingsSummary = () => {
  const { currentPosition, hubHeight, turbine, customCurves } =
    useContext(SettingsContext);

  const turbineLabel = getTurbineLabel(turbine, customCurves, false);

  const { lat, lng } = currentPosition ?? {};

  const settingOptions = [
    {
      title: "Location",
      data:
        currentPosition && lat && lng
          ? `${lat.toFixed(3)}, ${lng.toFixed(3)}`
          : "Not selected",
    },
    {
      title: "Hub height",
      data: hubHeight ? `${hubHeight} meters` : "Not selected",
    },
    {
      title: "Turbine",
      data: turbineLabel,
    },
  ];

  return (
    <>
      <Divider
        textAlign="center"
        sx={{ my: 2, fontWeight: 600, color: "text.secondary" }}
      >
        Results Based on
      </Divider>
      <Grid
        container
        direction="row"
        spacing={1}
        marginBottom={2}
        sx={{
          justifyContent: "space-between",
          alignItems: "stretch",
        }}
      >
        {settingOptions.map((option, index) => (
          <Item key={"setting_option_" + index} sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {option.title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "1rem" }}>
              {option.data}
            </Typography>
          </Item>
        ))}
      </Grid>
    </>
  );
};
