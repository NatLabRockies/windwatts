import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import TuneIcon from "@mui/icons-material/Tune";
import InsightsIcon from "@mui/icons-material/Insights";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { PageHero } from "../components/shared/PageHero";
import { PageSection } from "../components/shared/PageSection";
import { CONTACT_EMAIL } from "../constants/footer";

const HOW_TO_STEPS = [
  {
    icon: <PlaceIcon fontSize="large" color="primary" />,
    title: "Choose a location",
    description:
      "Search an address or drop a pin anywhere in the coverage area to select your site of interest.",
  },
  {
    icon: <TuneIcon fontSize="large" color="primary" />,
    title: "Adjust site settings",
    description:
      "Set the turbine, hub height, and other assumptions to match the system you want to evaluate.",
  },
  {
    icon: <InsightsIcon fontSize="large" color="primary" />,
    title: "Review the results",
    description:
      "See wind resource summaries, wind rose plots, and estimated energy production for the site.",
  },
  {
    icon: <DownloadIcon fontSize="large" color="primary" />,
    title: "Export or share",
    description:
      "Download the raw data files or share a link to the site view with collaborators.",
  },
];

export const AboutPage = () => (
  <ContentPageLayout>
    <PageHero
      title="About WindWatts"
      subtitle="A tool for assessing distributed wind resource and energy production potential in the United States."
    />

    <PageSection title="What is WindWatts?">
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography component="p">
          WindWatts is a public tool that showcases best-practice siting methods
          developed as part of the WindWatts project. Drop a pin anywhere you
          like to quickly and easily assess the wind resource and estimated
          energy generation potential at that site.
        </Typography>
        <Typography component="p">
          {/* Placeholder — team to confirm final wording */}
          Estimates draw on multiple wind datasets, including the ERA5 global
          reanalysis, the Wind Toolkit, and ensemble models that combine several
          sources for improved accuracy. Quantile-based summaries power fast,
          on-the-spot estimates, while detailed hourly time series are available
          to download for deeper analysis. The wind resource data is combined
          with a turbine's power curve to estimate energy production for the
          selected site.
        </Typography>
      </Stack>
      <Button
        variant="outlined"
        href="https://www.nlr.gov/wind/windwatts"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn more about the WindWatts project
      </Button>
    </PageSection>

    <PageSection title="How to use the tool" alt>
      <Grid container spacing={3}>
        {HOW_TO_STEPS.map((step, index) => (
          <Grid key={step.title} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box>{step.icon}</Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Step {index + 1}
                    </Typography>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageSection>

    <PageSection title="Support">
      <Typography paragraph>
        {/* Placeholder — confirm preferred support channel/copy with the team */}
        Have a question, found an issue, or want to share feedback about the
        tool? We'd like to hear from you.
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <EmailIcon color="primary" />
        <Link href={`mailto:${CONTACT_EMAIL}`} underline="hover">
          {CONTACT_EMAIL}
        </Link>
      </Stack>
    </PageSection>
  </ContentPageLayout>
);
