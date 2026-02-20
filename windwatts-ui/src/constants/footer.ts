import { ReactNode } from "react";

// Logo URLs
export const ALLIANCE_LOGO =
  "https://www.nlr.gov/images/libraries/global/alliance-for-energy-innovation-fy26-logo-black.svg";
export const ALLIANCE_URL = "https://www.alliance-for-energy-innovation.org/";
export const DOE_LOGO =
  "https://www.nlr.gov/images/libraries/about-images/u-s-department-of-energy.svg";
export const DOE_URL = "https://www.energy.gov/";

// Main navigation links
export interface FooterLink {
  content: string | ReactNode;
  href: string;
  "aria-label"?: string;
}

export const NAV_LINKS: FooterLink[] = [
  { content: "About", href: "https://www.nlr.gov/about" },
  { content: "Research", href: "https://www.nlr.gov/research" },
  { content: "Partner with Us", href: "https://www.nlr.gov/workingwithus" },
  { content: "News", href: "https://www.nlr.gov/news" },
  { content: "Careers", href: "https://www.nlr.gov/careers" },
];

// Quick links
export const QUICK_LINKS: FooterLink[] = [
  {
    content: "Accessibility",
    href: "https://www.nlr.gov/accessibility",
  },
  { content: "Disclaimer", href: "https://www.nlr.gov/disclaimer" },
  {
    content: "Security and Privacy",
    href: "https://www.nlr.gov/security",
  },
  {
    content: "Site Feedback",
    href: "https://www.nlr.gov/webmaster",
  },
  { content: "Developers", href: "https://developer.nrel.gov" },
  { content: "Employees", href: "https://thesource.nrel.gov" },
];

// Social media links (content will be icons, added in component)
export const SOCIAL_LINKS = [
  {
    name: "facebook",
    href: "https://www.facebook.com/nationallaboratoryoftherockies",
    ariaLabel: "Follow NLR on Facebook",
  },
  {
    name: "instagram",
    href: "https://www.instagram.com/nationalrenewableenergylab",
    ariaLabel: "Follow NLR on Instagram",
  },
  {
    name: "linkedin",
    href: "https://www.linkedin.com/company/national-renewable-energy-laboratory",
    ariaLabel: "Follow NLR on LinkedIn",
  },
  {
    name: "youtube",
    href: "https://www.youtube.com/@nationallaboratoryoftherockies",
    ariaLabel: "Follow NLR on YouTube",
  },
  {
    name: "x",
    href: "https://twitter.com/NatLabRockies",
    ariaLabel: "Follow NLR on X",
  },
  {
    name: "threads",
    href: "https://threads.net/@nationalrenewableenergylab",
    ariaLabel: "Follow NLR on Threads",
  },
];

// Contact information
export const CONTACT_EMAIL = "windwatts@nlr.gov";
export const CONTACT_LINKS: FooterLink[] = [
  { content: "Contact Us", href: `mailto:${CONTACT_EMAIL}` },
  { content: "Visit", href: "https://www.nlr.gov/about/visiting-nlr" },
  {
    content: "Subscribe to NLR",
    href: "https://www.nlr.gov/news/subscribe",
  },
];

// Attribution text
export const ATTRIBUTION_TEXT = {
  labName: "National Laboratory of the Rockies",
  department: "U.S. Department of Energy",
  office: "Office of Critical Minerals and Energy Innovation",
  contract: "Contract No. DE-AC36-08GO28308",
};
