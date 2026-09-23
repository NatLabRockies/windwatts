export interface Publication {
  id: string;
  authors: string;
  status: string;
  title: string;
  summary: string;
  link?: string;
}

// Placeholder entries
export const PUBLICATIONS: Publication[] = [
  {
    id: "sheridan-1",
    authors: "Sheridan, L. et al.",
    status: "Placeholder year",
    title: "[Title placeholder — Sheridan]",
    summary: "[Short summary placeholder to be provided by the team.]",
  },
  {
    id: "sheridan-2",
    authors: "Sheridan, L. et al.",
    status: "Placeholder year",
    title: "[Title placeholder — Sheridan]",
    summary: "[Short summary placeholder to be provided by the team.]",
  },
  {
    id: "sheridan-3",
    authors: "Sheridan, L. et al.",
    status: "Placeholder year",
    title: "[Title placeholder — Sheridan]",
    summary: "[Short summary placeholder to be provided by the team.]",
  },
  {
    id: "phillips-1",
    authors: "Phillips, C. et al.",
    status: "2024",
    title: "[Title placeholder — Phillips]",
    summary: "[Short summary placeholder to be provided by the team.]",
  },
  {
    id: "menear-1",
    authors: "Menear, K. et al.",
    status: "Under Review",
    title: "[Title placeholder — Menear]",
    summary: "[Short summary placeholder to be provided by the team.]",
  },
];
