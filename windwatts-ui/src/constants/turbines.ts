export interface TurbineInfo {
  label: string; // Displayed Label
  minHeight: number; // Preferred/ Allowable min height
  maxHeight: number; // Preferred/ Allowable max height
  info: string; // Citation and notes for height range
}

/**
 * Hub height ranges for wind turbines
 *
 * IMPORTANT: Specific manufacturer specifications were not available for all models
 * and may have changed since this research (February 2026). These ranges may vary
 * based on site conditions, local regulations, and specific project requirements.
 * For production use, verify with manufacturer specifications and site assessments.
 */
export const TURBINE_DATA: Record<string, TurbineInfo> = {
  "nlr-reference-2.5kW": {
    label: "NLR Reference 2.5kW",
    minHeight: 20,
    maxHeight: 40,
    info: "Residential reference turbines (0-20 kW): system size 2.5 kW, rotor diameter 2.2m, allowable hub heights 20, 30, 40 m (Lantz et al., 2016). Also see https://doi.org/10.2172/1333625",
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: residential turbines (0 - 20 kW): system size 2.5 kW, rotor diameter 2.2m, allowable hub heights 20, 30, 40 m
  },
  "nlr-reference-100kW": {
    label: "NLR Reference 100kW",
    minHeight: 40,
    maxHeight: 50,
    info: "Commercial reference turbines (20-100 kW): system size 100 kW, rotor diameter 13.8m, allowable hub heights 40, 50 m (Lantz et al., 2016). Also see https://doi.org/10.2172/1333625",
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: commercial turbines (20-100 kW): system size 100 kW, rotor diameter 13.8m, allowable hub heights 40, 50 m
  },
  "nlr-reference-250kW": {
    label: "NLR Reference 250kW",
    minHeight: 50,
    maxHeight: 50,
    info: "Mid-size reference turbines (100 kW - 1 MW): system size 250 kW, rotor diameter 21.9m, allowable hub heights 50 m (Lantz et al., 2016). Also see https://doi.org/10.2172/1333625",
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: mid-size turbines (100 kW - 1 MW): system size 250 kW, rotor diameter 21.9m, allowable hub heights 50 m
  },
  "nlr-reference-2000kW": {
    label: "NLR Reference 2000kW",
    info: "Large-size reference turbines (> 1 MW): system size 1 MW, rotor diameter 43.7m, allowable hub heights 50, 80 m (Lantz et al., 2016). Also see https://doi.org/10.2172/1333625",
    minHeight: 50,
    maxHeight: 80,
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: large-size turbines (> 1 MW): system size 1 MW, rotor diameter 43.7m, allowable hub heights 50, 80 m
  },
  "bergey-excel-15": {
    label: "Bergey Excel 15kW",
    minHeight: 18,
    maxHeight: 49,
    info: "Minimum 60 ft (18 m) hub height, 80 ft (24 m) or higher recommended. See https://www.bergey.com/wp-content/uploads/Excel-15-Tower-Requirements-11-2018.pdf",
    // Source: Wind Turbine Models Database and Bergey Windpower Co. Technical Specifications
    // https://en.wind-turbine-models.com/turbines/2650-bergey-excel-15, accessed 2026-02-08.
    // Bergey Windpower Co. (2018). Excel 15 requirements for customer supplied towers. Retrieved February 9, 2026, from https://www.bergey.com/wp-content/uploads/Excel-15-Tower-Requirements-11-2018.pdf
    // Note: 60 ft (18 m) minimum, 80 ft (24 m) or higher recommended
  },
  "eocycle-25": {
    label: "Eocycle 25kW",
    minHeight: 18,
    maxHeight: 36,
    info: "Standard hub heights 18, 24, 30, 36 m. See Wind Turbine Models Database https://en.wind-turbine-models.com/turbines/1641-eocycle-eo25",
    // Source: Wind Turbine Models Database
    // https://en.wind-turbine-models.com/turbines/1641-eocycle-eo25, accessed 2026-02-08.
    // Note: Standard hub heights 18/ 24/ 30/ 36 m
  },
  "northern-100": {
    label: "Northern Power 100kW",
    minHeight: 22,
    maxHeight: 37,
    info: "Standard hub heights for 100C series: 100C-21: 22, 29, 37 m; 100C-24: 30, 37 m; 100C-27: 22, 29, 37 m; 100C-28: 30, 37 m. See Northern Power Systems brochures https://northernpower.com/wp/?page_id=826",
    // Source: Wind Turbine Models Database and manufacturer brochures
    // https://en.wind-turbine-models.com/turbines/365-nps-northern-power-nps-100c-24, accessed 2026-02-08.
    // Northern Power Systems. (2019). NPS 100C-28 Brochure. https://northernpower.com/wp/wp-content/uploads/2024/04/brochure-NPS-100C-28_ed2019_light_ENG.pdf
    // Northern Power Systems. (2020a). NPS 100C-21 Brochure. https://northernpower.com/wp/wp-content/uploads/2024/04/brochure-NPS-100C-21_ed2020_light_ENG.pdf
    // Northern Power Systems. (2020b). NPS 100C-24 Brochure. https://northernpower.com/wp/wp-content/uploads/2024/04/brochure-NPS-100C-24_ed2020_light_ENG.pdf
    // Northern Power Systems. (2020c). NPS 100C-27 Brochure. https://northernpower.com/wp/wp-content/uploads/2024/04/brochure-NPS-100C-27_ed2020_light_ENG.pdf
    // Note: Standard hub heights
    // Northern Power® 100C-21: 22, 29, 37 m
    // Northern Power® 100C-24: 30, 37 m
    // Northern Power® 100C-27: 22, 29, 37 m
    // Northern Power® 100C-28: 30, 37 m
  },
  siva_250kW_30m_rotor_diameter: {
    label: "Siva 250kW (30m rotor diameter)",
    minHeight: 30,
    maxHeight: 50,
    info: "Based on 250kW model with rotor diameter 30/29m, typical hub heights 30, 40, 45, 50 m. See Siva 250/50kW Turbine Brochure https://sivapowersamerica.com/wp-content/uploads/2024/06/Siva-US-2023.pdf",
    // Source: Siva Powers America Manufacturer Brochure (2023)
    // Siva Powers America. (2023). Siva 250/50kW Turbine Brochure. https://sivapowersamerica.com/wp-content/uploads/2024/06/Siva-US-2023.pdf, accessed 2026-02-08.
    // Note: Rotor diameter is 30/29m, with typical hub heights of 30, 40, 45 and 50 m.
  },
  siva_250kW_32m_rotor_diameter: {
    label: "Siva 250kW (32m rotor diameter)",
    minHeight: 30,
    maxHeight: 50,
    info: "Based on 250kW model with rotor diameter 30/29m, typical hub heights 30, 40, 45, 50 m. Note: Exact 32m rotor diameter not specified. See Siva 250/50kW Turbine Brochure https://sivapowersamerica.com/wp-content/uploads/2024/06/Siva-US-2023.pdf",
    // Source: Siva Powers America Manufacturer Brochure (2023)
    // Siva Powers America. (2023). Siva 250/50kW Turbine Brochure. https://sivapowersamerica.com/wp-content/uploads/2024/06/Siva-US-2023.pdf, accessed 2026-02-08.
    // Note: Rotor diameter is 30/29m, with typical hub heights of 30, 40, 45 and 50 m. Exact rotor diameter of 32m not specified for 250kW model.
  },
  siva_750_u50: {
    label: "Siva 750kW (50m rotor diameter)",
    minHeight: 50,
    maxHeight: 50,
    info: "750kW series with rotor diameters 50, 54, 57 m and typical hub heights 50, 60, 68 m respectively. see Siva Powers America https://sivapowersamerica.com/our-turbines/",
    // Source: Siva Powers America Manufacturer Website
    // Siva Powers America. (2025). Our Turbines. https://sivapowersamerica.com/our-turbines/, accessed 2026-02-08.
    // Note: Rotor diameters are 50, 54, and 57 m, with typical hub heights of 50, 60, and 68 m respectively.
  },
  siva_750_u57: {
    label: "Siva 750kW (57m rotor diameter)",
    minHeight: 50,
    maxHeight: 68,
    info: "750kW series with rotor diameters 50, 54, 57 m and typical hub heights 50, 60, 68 m respectively. See Siva Powers America https://sivapowersamerica.com/our-turbines/",
    // Source: Siva Powers America Manufacturer Website
    // Siva Powers America. (2025). Our Turbines. https://sivapowersamerica.com/our-turbines/, accessed 2026-02-08.
    // Note: Rotor diameters are 50, 54, and 57 m, with typical hub heights of 50, 60, and 68 m respectively.
  },
  "ewt-dw52-900kw": {
    label: "EWT DirectWind 52-900kW",
    minHeight: 35,
    maxHeight: 50,
    info: "EWT DirectWind DW 52-900: rotor diameter 52 m, rated power 900 kW, IEC Wind class IIA, cut-in 3 m/s, cut-out 25 m/s, rated wind speed 14 m/s. Typical hub heights 35, 40, 50 m. See Emergya Wind Technologies EWT DW52-900kW Flyer https://ewtdirectwind.com/wp-content/uploads/2018/04/EWT_Flyer-DW52-900kW_HR.pdf",
    // Source: Emergya Wind Technologies Manufacturer Website
    // Emergya Wind Technologies. (2018). EWT DW52-900kW Flyer. https://ewtdirectwind.com/wp-content/uploads/2018/04/EWT_Flyer-DW52-900kW_HR.pdf, accessed 2026-04-25.
    // https://en.wind-turbine-models.com/turbines/1537-ewt-dw-52-900, accessed 2026-04-25.
    // Note: rotor diameter 52 m, typical hub heights 35, 40, 50 m.
  },
  "ewt-dw54-900kw": {
    label: "EWT DirectWind 54-900kW",
    minHeight: 40,
    maxHeight: 75,
    info: "EWT DirectWind DW 54-900: rotor diameter 54 m, rated power 900 kW, IEC Wind class IIIA, cut-in 2.5 m/s, cut-out 25 m/s, rated wind speed 13.5 m/s. Typical hub heights 40, 50, 75 m. See Emergya Wind Technologies EWT DW54-900kW Flyer https://ewtdirectwind.com/wp-content/uploads/2018/04/EWT_Flyer-dw54-900kW.pdf",
    // Source: Emergya Wind Technologies Manufacturer Website
    // Emergya Wind Technologies. (2018). EWT DW54-900kW Flyer. https://ewtdirectwind.com/wp-content/uploads/2018/04/EWT_Flyer-dw54-900kW.pdf, accessed 2026-04-25.
    // https://en.wind-turbine-models.com/turbines/335-ewt-dw-54-900, accessed 2026-04-25.
    // Note: rotor diameter 54 m, typical hub heights 40, 50, 75 m.
  },
  "ewt-dw58-1000kw": {
    label: "EWT DirectWind 58-1000kW",
    minHeight: 46,
    maxHeight: 69,
    info: "EWT DirectWind DW 58-1MW: rotor diameter 58 m, rated power 1000 kW, IEC Wind class IIA, cut-in 3 m/s, cut-out 25 m/s, rated wind speed 14.5 m/s. Typical hub heights 46, 69 m. See Emergya Wind Technologies EWT DW58 brochure https://ewtdirectwind.com/wp-content/uploads/2022/01/EWT_DW58.pdf",
    // Source: Emergya Wind Technologies Manufacturer Website
    // Emergya Wind Technologies. (2022). EWT DW58 Brochure. https://ewtdirectwind.com/wp-content/uploads/2022/01/EWT_DW58.pdf, accessed 2026-04-25.
    // https://en.wind-turbine-models.com/turbines/2629-ewt-dw-58-1mw, accessed 2026-04-25.
    // Note: rotor diameter 58 m, typical hub heights 46, 69 m.
  },
  "ewt-dw61-1000kw": {
    label: "EWT DirectWind 61-1000kW",
    minHeight: 46,
    maxHeight: 69,
    info: "EWT DirectWind DW 61-1MW: rotor diameter 61 m, rated power 1000 kW, IEC Wind class IIIA, cut-in 3 m/s, cut-out 25 m/s, rated wind speed 14.0 m/s. Typical hub heights 46, 69 m. See Emergya Wind Technologies EWT DW61 brochure https://ewtdirectwind.com/wp-content/uploads/2023/11/EWT_DW61.pdf",
    // Source: Emergya Wind Technologies Manufacturer Website
    // Emergya Wind Technologies. (2023). EWT DW61 Brochure. https://ewtdirectwind.com/wp-content/uploads/2023/11/EWT_DW61.pdf, accessed 2026-04-25.
    // https://en.wind-turbine-models.com/turbines/1906-ewt-dw-61-1mw, accessed 2026-04-25.
    // Note: rotor diameter 61 m, typical hub heights 46, 69 m.
  },
};

export const TURBINE_LABEL: Record<string, string> = Object.entries(
  TURBINE_DATA
).reduce(
  (acc, [key, turbine]) => {
    acc[key] = turbine.label;
    return acc;
  },
  {} as Record<string, string>
);

export const VALID_TURBINES = Object.keys(TURBINE_DATA);
