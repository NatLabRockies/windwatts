import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { PageHero } from "../components/shared/PageHero";
import { PageSection } from "../components/shared/PageSection";
import { PUBLICATIONS } from "../constants/publications";

export const ResearchPage = () => (
  <ContentPageLayout>
    <PageHero
      title="Research & Publications"
      subtitle="The science behind WindWatts: peer-reviewed research, technical reports, and ongoing studies that inform the tool."
    />

    <PageSection title="Overview">
      <Typography paragraph>
        {/* Placeholder — team to provide final summary of the research program */}
        WindWatts is built on an active body of research into distributed wind
        resource assessment, including national wind resource modeling, obstacle
        flow modeling, and validation against field measurements. This page
        summarizes related papers, reports, and projects.
      </Typography>
    </PageSection>

    <PageSection title="Publications" alt>
      <Grid container spacing={3}>
        {PUBLICATIONS.map((pub) => (
          <Grid key={pub.id} size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ sm: "center" }}
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="h6" component="h3">
                        {pub.title}
                      </Typography>
                      <Chip
                        label={pub.status}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {pub.authors}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pub.summary}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    {pub.chartImage ? (
                      <Box
                        component="img"
                        src={pub.chartImage}
                        alt={`Supporting chart for ${pub.title}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      // Placeholder until the team provides a chart image (see Publication.chartImage)
                      <Box
                        sx={{
                          height: "100%",
                          minHeight: 140,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 1,
                          color: "text.disabled",
                          bgcolor: "action.hover",
                        }}
                      >
                        <InsertChartOutlinedIcon fontSize="large" />
                        <Typography variant="caption">
                          Chart placeholder
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageSection>
  </ContentPageLayout>
);
