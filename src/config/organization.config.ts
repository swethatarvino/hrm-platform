// White-Label Configuration Engine
// You can edit these values to instantly adapt the platform for ANY client!

export interface OrganizationConfig {
  name: string;
  tagline: string;
  logoText: string;
  currencySymbol: string;
  currencyCode: string;
  primaryColor: string; // Hex color code
  fiscalYearStartMonth: number; // 1 = January, 4 = April
  workHourRecordingMethod: 'clock_in_out' | 'manual_entry';
  supportEmail: string;
}

export const defaultOrganizationConfig: OrganizationConfig = {
  name: "Apex Global Technologies",
  tagline: "Operations, People & Growth Cockpit",
  logoText: "APEX",
  currencySymbol: "$",
  currencyCode: "USD",
  primaryColor: "#d946ef", // Vibrant Pinkish-Purple
  fiscalYearStartMonth: 1,
  workHourRecordingMethod: 'clock_in_out',
  supportEmail: "ops@apextechnologies.io",
};

// Preset client themes for quick 1-click preview
export const clientThemePresets: Record<string, Partial<OrganizationConfig>> = {
  "Tech Startup (Blue)": {
    name: "Nova Dynamics",
    logoText: "NOVA",
    primaryColor: "#2563eb",
    currencySymbol: "$",
  },
  "FinTech & Capital (Emerald)": {
    name: "Verdant Capital Partners",
    logoText: "VERDANT",
    primaryColor: "#059669",
    currencySymbol: "$",
  },
  "Indian IT Services (Indigo & ₹)": {
    name: "VedicSys Solutions",
    logoText: "VEDIC",
    primaryColor: "#4f46e5",
    currencySymbol: "₹",
    currencyCode: "INR",
    fiscalYearStartMonth: 4, // April fiscal year
  },
  "Creative Media & Consulting (Purple)": {
    name: "Aura Creative Agency",
    logoText: "AURA",
    primaryColor: "#7c3aed",
    currencySymbol: "£",
    currencyCode: "GBP",
  },
};
