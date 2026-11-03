export interface Publication {
  id: string;
  authors: string;
  status: string;
  title: string;
  summary: string;
  takeaways: string[];
  citation: string;
  link?: string;
  chartImage?: string;
  chartCaption?: string;
  chartCrop?: boolean;
}

// Images: in public/assets/publications/, named {publication id}-{figure description}.{ext}.
// Ordered by year (newest first), then first author's last name, then title.
export const PUBLICATIONS: Publication[] = [
  {
    id: "menear-high-accuracy-2026",
    authors: "Menear et al.",
    status: "Preprint · In review · 2026",
    title:
      "Methods for high-accuracy wind resource assessment to support distributed wind turbine siting",
    summary: "[One- to two-sentence summary to be provided by the team.]",
    takeaways: [
      "[Key takeaway 1 to be provided by the team.]",
      "[Key takeaway 2 to be provided by the team.]",
      "[Key takeaway 3 to be provided by the team.]",
    ],
    citation:
      "Kevin Menear, Sameer Shaik, Lindsay Sheridan, Dmitry Duplyakin, and Caleb Phillips. Methods for high-accuracy wind resource assessment to support distributed wind turbine siting. Wind Energy Science Discussions [preprint], in review. 2026. https://doi.org/10.5194/wes-2026-75",
    link: "https://doi.org/10.5194/wes-2026-75",
  },
  {
    id: "sheridan-loss-factors-2026",
    authors: "Sheridan et al.",
    status: "Journal article · 2026",
    title:
      "Loss Factors for Small Distributed Wind Turbines Based on Field Data in the United States",
    summary:
      "This study uses generation observations from operating distributed wind projects to characterize energy losses and their year-to-year variability. The findings highlight how uncertain loss assumptions can affect small-wind project economics.",
    takeaways: [
      "Across 72 projects, median annual loss factors ranged from 2% to 66%; the median across projects was 17%.",
      "Year-to-year loss variability was substantial, with a median per-project range of 44 percentage points.",
      "Tools use default loss factors of 7%–18%; in the WINDVALT webtool, raising the assumed loss from 7% to 18% reduces estimated net present value by 60%.",
    ],
    citation:
      "Lindsay M. Sheridan, Suprajha Nagaraja Sudhakar, Sarah E. Barrows, Caleb Phillips, Kevin Menear, Roy Li, Sameer Shaik, Shawn Petros, Raj K. Rai, Larry K. Berg, and Julia E. Flaherty. Loss Factors for Small Distributed Wind Turbines Based on Field Data in the United States. J Sustain Res. 2026;8(1):e260002. 5 January 2026. https://doi.org/10.20900/jsr20260002",
    link: "https://doi.org/10.20900/jsr20260002",
    chartImage:
      "/assets/publications/sheridan-loss-factors-2026-annual-loss-factors.png",
    chartCaption:
      "Annual loss factors across a sample of 72 small distributed wind projects in the United States.",
  },
  {
    id: "sheridan-short-term-correction-2025",
    authors: "Sheridan et al.",
    status: "Journal article · 2025",
    title:
      "Evaluating the potential of short-term instrument deployment to improve distributed wind resource assessment",
    summary:
      "This study tests how short observational campaigns can improve long-term, model-based wind estimates. Three correction methods are evaluated using observations from 66 U.S. locations and ERA5 data.",
    takeaways: [
      "Multivariable linear regression, adaptive regression splines, and regression trees were compared for correcting long-term ERA5 wind speed estimates.",
      "On average, even one month of observations significantly improved baseline ERA5 estimates, with median bias magnitude and relative error within 0.22 m/s and 4 percentage points of those using the standard 12 months.",
      "Summer observations tended to produce the weakest long-term corrections at the evaluated sites.",
    ],
    citation:
      "Lindsay M. Sheridan, Dmitry Duplyakin, Caleb Phillips, Heidi Tinnesand, Raj K. Rai, Julia E. Flaherty, and Larry K. Berg. Evaluating the potential of short-term instrument deployment to improve distributed wind resource assessment. Wind Energy Science (WES). 22 July 2025. https://doi.org/10.5194/wes-10-1451-2025",
    link: "https://doi.org/10.5194/wes-10-1451-2025",
    chartImage:
      "/assets/publications/sheridan-short-term-correction-2025-bias-by-training-length.png",
    chartCaption:
      "Average long-term bias magnitude for 66 sites comparing observations with ERA5 and measure-correlate-predict techniques using varying training period lengths.",
    chartCrop: true,
  },
  {
    id: "sheridan-coastal-datasets-2025",
    authors: "Sheridan et al.",
    status: "Journal article · 2025",
    title:
      "Performance of wind assessment datasets in United States coastal areas",
    summary:
      "This study evaluates three wind datasets at coastal locations in the United States: Global Wind Atlas 3, NOW-23, and WTK-LED Climate. It compares how well each represents observed wind speeds and their temporal patterns at distributed-wind heights.",
    takeaways: [
      "Across 23 coastal sites, all three datasets tended to overestimate observed wind resource, and performed better where winds predominantly came from the water.",
      "GWA3 had the smallest annual-average wind-speed relative errors; WTK-LED Climate best represented diurnal cycles; NOW-23 best represented seasonal and interannual trends.",
      "Selected output height had little effect for GWA3 and WTK-LED Climate at 20–60 m, while NOW-23 showed notable differences related to wind shear.",
    ],
    citation:
      "Lindsay M. Sheridan, Jiali Wang, Caroline Draxl, Nicola Bodini, Caleb Phillips, Dmitry Duplyakin, Heidi Tinnesand, Raj K. Rai, Julia E. Flaherty, Larry K. Berg, Chunyong Jung, and Ethan Young. Performance of wind assessment datasets in United States coastal areas. Wind Energy Science (WES). 4 August 2025. https://doi.org/10.5194/wes-10-1551-2025",
    link: "https://doi.org/10.5194/wes-10-1551-2025",
    chartImage:
      "/assets/publications/sheridan-coastal-datasets-2025-bias-relative-error.png",
    chartCaption:
      "Wind speed (a) bias and (b) relative error according to locations with land-dominant and water-dominant wind flow.",
    chartCrop: true,
  },
  {
    id: "phillips-torque-2024",
    authors: "Phillips et al.",
    status: "Conference proceedings · 2024",
    title:
      "Resource Assessment for Distributed Wind Energy: An Evaluation of Best-Practice Methods in the Continental US",
    summary:
      "This paper evaluates historical and commonly used methods for accounting for obstacle effects on distributed-wind resources alongside new lower-order obstacle models derived from CFD simulations and measurement-based bias correction. It examines whether detailed obstacle modeling improves estimates at ten sites.",
    takeaways: [
      "Preliminary results emphasize choosing and applying mesoscale models carefully and show the value of bias correction using nearby meteorological-tower measurements.",
      "Detailed obstacle modeling provided only modest additional improvement and sometimes added error, particularly at sites already selected to avoid major upwind obstacles.",
      "These findings reinforce the importance of in situ measurements and suggest obstacle models may be better applied to automated or computer-aided siting than to economic wind resource assessments.",
    ],
    citation:
      "Caleb Phillips, Dmitry Duplyakin, Lindsay Sheridan, Jenna Ruzekowicz, Matthew Nelson, Dimitrios Fytanidis, Rod Linn, Rao Kotamarthi, and Heidi Tinnesand. Resource Assessment for Distributed Wind Energy: An Evaluation of Best-Practice Methods in the Continental US. Torque 2024, European Academy of Wind Energy. In Proceedings, 29–31 May 2024, Florence, Italy. https://doi.org/10.1088/1742-6596/2767/9/092005",
    link: "https://doi.org/10.1088/1742-6596/2767/9/092005",
    chartImage:
      "/assets/publications/phillips-torque-2024-obstacle-model-performance.png",
    chartCaption:
      "Applying the QUIC (obstacle) flow model to the 10 sites studied in this paper did not show meaningful improvements to the accuracy of wind speeds as compared to uncorrected atmospheric model data (here, the Wind Toolkit or WTK). This may be a result of these sites already being optimized to avoid the impact of obstacles, but also demonstrates that modeling obstacles may not meaningfully improve resource estimates in practice.",
  },
  // {
  //   id: "sheridan-leveraging-observations-2024",
  //   authors: "Sheridan et al.",
  //   status: "To appear · 2024",
  //   title:
  //     "Leveraging months-long observations for distributed wind resource assessment",
  //   summary: "[One- to two-sentence summary to be provided by the team.]",
  //   takeaways: [
  //     "[Key takeaway 1 to be provided by the team.]",
  //     "[Key takeaway 2 to be provided by the team.]",
  //     "[Key takeaway 3 to be provided by the team.]",
  //   ],
  //   citation: "[Full citation to be provided by the team.]",
  // },
  {
    id: "phillips-obstacle-modeling-2022",
    authors: "Phillips et al.",
    status: "Journal article · 2022",
    title:
      "Evaluation of Obstacle Modelling Approaches for Resource Assessment and Small Wind Turbine Siting: Case Study in the Northern Netherlands",
    summary:
      "This study compares established obstacle-correction methods with data-driven approaches and lower-order models derived from CFD and machine-learning methods. The evaluation uses measurements from operational wind turbines in the northern Netherlands to assess how well the methods predict wind resource and energy production.",
    takeaways: [
      "Data-driven methods performed best at real sites, with an average annual energy production error of 2.5%.",
      "When site data is limited, models based on high-fidelity simulations show promise and outperform classic methods.",
      "The newer methods had 6.3%–11.5% average error, compared with 26% for classic methods and 27% for uncorrected reanalysis; performance depends on obstacle descriptions and reanalysis inputs.",
    ],
    citation:
      "Caleb Phillips, Lindsay M. Sheridan, Patrick Conry, Dimitrios K. Fytanidis, Dmitry Duplyakin, Sagi Zisman, Nicolas Duboc, Matt Nelson, Rao Kotamarthi, Rod Linn, Marc Broersma, Timo Spijkerboer, and Heidi Tinnesand. Evaluation of Obstacle Modelling Approaches for Resource Assessment and Small Wind Turbine Siting: Case Study in the Northern Netherlands. Wind Energy Science (WES), 7, 1153–1169. 2022. https://doi.org/10.5194/wes-7-1153-2022",
    link: "https://doi.org/10.5194/wes-7-1153-2022",
    chartImage:
      "/assets/publications/phillips-obstacle-modeling-2022-study-sites.jpeg",
    chartCaption:
      "Example study sites in the northern Netherlands showing two wind turbines (125 and 126) nearby to obstacles. In the top figure, buildings have been identified as potential obstacles. In the bottom figure, buildings and vegetation have been identified.",
  },
  {
    id: "sheridan-wind-validation-2022",
    authors: "Sheridan et al.",
    status: "Journal article · 2022",
    title:
      "Validation of wind resource and energy production simulations for small wind turbines in the United States",
    summary:
      "This study validates modeled wind speeds and energy estimates against observations from meteorological towers, sodars, and small wind turbines across the United States. It quantifies where common datasets and energy tools align with observations and where errors can be larger.",
    takeaways: [
      "Average wind-speed biases at small-turbine hub heights were within ±0.5 m/s for WIND Toolkit, ERA5, and MERRA-2 estimates.",
      "At sites with complex terrain or coastal conditions, wind-speed bias magnitudes and mean absolute errors could reach 5 m/s.",
      "SAM, Wind Report, MyWindTurbine.com, and GWA3 overestimated observed annual capacity factors by 3, 4, 12, and 7 percentage points, respectively.",
    ],
    citation:
      "Lindsay M. Sheridan, Caleb Phillips, Alice C. Orrell, Larry K. Berg, Heidi Tinnesand, Raj K. Rai, Sagi Zisman, Dmitry Duplyakin, and Julia E. Flaherty. Validation of wind resource and energy production simulations for small wind turbines in the United States. Wind Energy Science (WES), 7, 659–676. 24 March 2022. https://doi.org/10.5194/wes-7-659-2022",
    link: "https://doi.org/10.5194/wes-7-659-2022",
    chartImage:
      "/assets/publications/sheridan-wind-validation-2022-annual-wind-speed-bias.png",
    chartCaption:
      "Annual average wind speed biases calculated using each model’s nearest neighbor (NN) grid point and via inverse distance weighted interpolation (Int).",
    chartCrop: true,
  },
  {
    id: "duplyakin-bias-interpolation-2021",
    authors: "Duplyakin et al.",
    status: "NLR technical report · 2021",
    title:
      "Bias Characterization, Vertical Interpolation, and Horizontal Interpolation for Distributed Wind Siting Using Mesoscale Wind Resource Estimates",
    summary:
      "This report characterizes wind-speed bias and evaluates vertical and horizontal interpolation techniques using Wind Toolkit data and the NREL Wind Resource Meteorological Database. It compares method tradeoffs and estimates lower bounds for validation error, with techniques applicable to other wind datasets as well.",
    takeaways: [
      "For vertical interpolation, the report recommends Neutral Log or Power Law methods when terrain and stability data are available, and Nearest Neighbor when they are not.",
      "Horizontal interpolation methods performed similarly; inverse-distance weighting with 16 points was the strongest overall choice across the tested sites and heights.",
      "Estimated lower bounds were approximately 2.4 m/s MAE, 3.3 m/s RMSE, and 0.4 m/s mean error.",
    ],
    citation:
      "Dmitry Duplyakin, Sagi Zisman, Caleb Phillips, and Heidi Tinnesand. Bias Characterization, Vertical Interpolation, and Horizontal Interpolation for Distributed Wind Siting Using Mesoscale Wind Resource Estimates. National Renewable Energy Laboratory. January 2021. NREL/TP-2C00-78412. https://doi.org/10.2172/1760659",
    link: "https://doi.org/10.2172/1760659",
    chartImage:
      "/assets/publications/duplyakin-bias-interpolation-2021-vertical-interpolation-mae.png",
    chartCaption:
      "A violin plot of mean absolute error (MAE) for each of seven studied vertical interpolation methods shows largely similar performance irrespective of choice of method. Neutral log or Power Law perform best in this analysis, when terrain and stability data are available.",
  },
];
