import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultOrganizationConfig, OrganizationConfig, clientThemePresets } from '../config/organization.config';
import { storageService } from '../services/storageService';

interface OrgContextType {
  config: OrganizationConfig;
  updateConfig: (newConfig: OrganizationConfig) => void;
  applyPreset: (presetName: string) => void;
  formatCurrency: (amount: number) => string;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

// Helper to convert hex color to subtle shades for Tailwind CSS vars
function hexToRGB(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<OrganizationConfig>(() => storageService.getOrgConfig());

  // Dynamically inject CSS variables when brand color changes
  useEffect(() => {
    try {
      const root = document.documentElement;
      const { r, g, b } = hexToRGB(config.primaryColor);

      root.style.setProperty('--brand-50', `rgba(${r}, ${g}, ${b}, 0.06)`);
      root.style.setProperty('--brand-100', `rgba(${r}, ${g}, ${b}, 0.12)`);
      root.style.setProperty('--brand-200', `rgba(${r}, ${g}, ${b}, 0.25)`);
      root.style.setProperty('--brand-500', config.primaryColor);
      root.style.setProperty('--brand-600', config.primaryColor);
      root.style.setProperty('--brand-700', `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 1)`);
      root.style.setProperty('--brand-800', `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 1)`);
    } catch (e) {
      console.error('Error applying theme colors', e);
    }
  }, [config.primaryColor]);

  const updateConfig = (newConfig: OrganizationConfig) => {
    setConfig(newConfig);
    storageService.saveOrgConfig(newConfig);
  };

  const applyPreset = (presetName: string) => {
    const preset = clientThemePresets[presetName];
    if (preset) {
      const merged = { ...config, ...preset };
      updateConfig(merged as OrganizationConfig);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <OrgContext.Provider value={{ config, updateConfig, applyPreset, formatCurrency }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) throw new Error('useOrg must be used within an OrgProvider');
  return context;
};
