export interface TurbineInfo {
  label: string; // Displayed Label
  minHeight: number; // Preferred/ Allowable min height
  maxHeight: number; // Preferred/ Allowable max height
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
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: residential turbines (0 - 20 kW): system size 2.5 kW, rotor diameter 2.2m, allowable hub heights 20, 30, 40 m
  },
  "nlr-reference-100kW": {
    label: "NLR Reference 100kW",
    minHeight: 40,
    maxHeight: 50,
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: commercial turbines (20-100 kW): system size 100 kW, rotor diameter 13.8m, allowable hub heights 40, 50 m
  },
  "nlr-reference-250kW": {
    label: "NLR Reference 250kW",
    minHeight: 50,
    maxHeight: 50,
    // Source: Lantz et al. (2016)
    // Lantz, E., Sigrin, B., Gleason, M., Preus, R., & Baring-Gould, I. (2016). Assessing the Future of Distributed Wind: Opportunities for Behind-the-Meter Projects (NREL/TP--6A20-67337, 1333625; p. NREL/TP--6A20-67337, 1333625). https://doi.org/10.2172/1333625
    // For more information, refer to https://atb.nrel.gov/electricity/2024b/distributed_wind
    // Note: mid-size turbines (100 kW - 1 MW): system size 250 kW, rotor diameter 21.9m, allowable hub heights 50 m
  },
  "nlr-reference-2000kW": {
    label: "NLR Reference 2000kW",
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
    // Source: Wind Turbine Models Database and Bergey Windpower Co. Technical Specifications
    // https://en.wind-turbine-models.com/turbines/2650-bergey-excel-15, accessed 2026-02-08.
    // Bergey Windpower Co. (2018). Excel 15 requirements for customer supplied towers. Retrieved February 9, 2026, from https://www.bergey.com/wp-content/uploads/Excel-15-Tower-Requirements-11-2018.pdf
    // Note: 60 ft (18 m) minimum, 80 ft (24 m) or higher recommended
  },
  "eocycle-25": {
    label: "Eocycle 25kW",
    minHeight: 18,
    maxHeight: 36,
    // Source: Wind Turbine Models Database
    // https://en.wind-turbine-models.com/turbines/1641-eocycle-eo25, accessed 2026-02-08.
    // Note: Standard hub heights 18/ 24/ 30/ 36 m
  },
  "northern-100": {
    label: "Northern Power 100kW",
    minHeight: 22,
    maxHeight: 37,
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
    // Source: Siva Powers America Manufacturer Brochure (2023)
    // Siva Powers America. (2023). Siva 250/50kW Turbine Brochure. https://sivapowersamerica.com/wp-content/uploads/2024/06/Siva-US-2023.pdf, accessed 2026-02-08.
    // Note: Rotor diameter is 30/29m, with typical hub heights of 30, 40, 45 and 50 m.
  },
  siva_250kW_32m_rotor_diameter: {
    label: "Siva 250kW (32m rotor diameter)",
    minHeight: 30,
    maxHeight: 50,
    // Source: Siva Powers America Manufacturer Brochure (2023)
    // Siva Powers America. (2023). Siva 250/50kW Turbine Brochure. https://sivapowersamerica.com/wp-content/uploads/2024/06/Siva-US-2023.pdf, accessed 2026-02-08.
    // Note: Rotor diameter is 30/29m, with typical hub heights of 30, 40, 45 and 50 m. Exact rotor diameter of 32m not specified for 250kW model.
  },
  siva_750_u50: {
    label: "Siva 750kW (50m rotor diameter)",
    minHeight: 50,
    maxHeight: 50,
    // Source: Siva Powers America Manufacturer Website
    // Siva Powers America. (2025). Our Turbines. https://sivapowersamerica.com/our-turbines/, accessed 2026-02-08.
    // Note: Rotor diameters are 50, 54, and 57 m, with typical hub heights of 50, 60, and 68 m respectively.
  },
  siva_750_u57: {
    label: "Siva 750kW (57m rotor diameter)",
    minHeight: 50,
    maxHeight: 68,
    // Source: Siva Powers America Manufacturer Website
    // Siva Powers America. (2025). Our Turbines. https://sivapowersamerica.com/our-turbines/, accessed 2026-02-08.
    // Note: Rotor diameters are 50, 54, and 57 m, with typical hub heights of 50, 60, and 68 m respectively.
  },
};

export const POWER_CURVE_LABEL: Record<string, string> = Object.entries(
  TURBINE_DATA
).reduce(
  (acc, [key, turbine]) => {
    acc[key] = turbine.label;
    return acc;
  },
  {} as Record<string, string>
);

export const VALID_POWER_CURVES = Object.keys(TURBINE_DATA);
