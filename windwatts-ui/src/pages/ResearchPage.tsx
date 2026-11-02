import {
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { ContentPageLayout } from "../components";
import {
  PageHero,
  PageSection,
  FigureLightbox,
  CitationBlock,
} from "../components/shared";
import { PUBLICATIONS } from "../constants/publications";

const WEM_VERSIONS = [
  {
    version: "Version 1",
    status: "Released",
    description: "[Initial grid.]",
  },
  {
    version: "Version 2",
    status: "Released",
    description: "[Higher-resolution update.]",
  },
  {
    version: "Version 3",
    status: "Upcoming",
    description: "[Extension beyond CONUS (Alaska, Hawaii, others).]",
  },
];

export const ResearchPage = () => (
  <ContentPageLayout>
    <PageHero
      title="Research & Publications"
      subtitle="The science behind WindWatts: peer-reviewed research, technical reports, and ongoing studies that inform the tool."
    />

    <PageSection title="Overview">
      <Typography>
        WindWatts is built on an active body of research into distributed wind
        resource assessment, including national wind resource modeling, obstacle
        flow modeling, and validation against field measurements. This page
        summarizes related papers, reports, and projects.
      </Typography>
    </PageSection>

    <PageSection title="WindWatts Ensemble Model" alt>
      <Stack spacing={2}>
        <Typography>[Model description.]</Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Version history
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {WEM_VERSIONS.map(({ version, status, description }) => (
              <Typography key={version} component="li" sx={{ mb: 0.5 }}>
                <strong>{version}</strong>
                <Chip
                  label={status}
                  size="small"
                  variant="outlined"
                  color={status === "Released" ? "success" : "default"}
                  sx={{ mx: 1, verticalAlign: "middle" }}
                />
                {description}
              </Typography>
            ))}
          </Box>
        </Box>
      </Stack>
    </PageSection>

    <PageSection title="Publications">
      <Stack spacing={3}>
        {PUBLICATIONS.map((pub) => (
          <Card key={pub.id} variant="outlined">
            <CardContent>
              <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                <Typography variant="h6" component="h3">
                  {pub.link ? (
                    <Link
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      color="inherit"
                    >
                      {pub.title}
                    </Link>
                  ) : (
                    pub.title
                  )}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {pub.authors}
                  </Typography>
                  <Chip
                    label={pub.status}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Stack>
              <FigureLightbox src={pub.chartImage} caption={pub.chartCaption} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2.5 }}
              >
                {pub.summary}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                Key takeaways
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {pub.takeaways.map((takeaway) => (
                  <Typography
                    key={takeaway}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    {takeaway}
                  </Typography>
                ))}
              </Box>
              <CitationBlock citation={pub.citation} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageSection>
  </ContentPageLayout>
);
