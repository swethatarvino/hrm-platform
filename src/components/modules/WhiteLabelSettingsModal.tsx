import React, { useState } from 'react';
import { useOrg } from '../../context/OrgContext';
import { clientThemePresets, OrganizationConfig } from '../../config/organization.config';
import { X, Check, Sparkles, Building, DollarSign, Palette } from 'lucide-react';

interface WhiteLabelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhiteLabelSettingsModal: React.FC<WhiteLabelSettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, applyPreset } = useOrg();
  const [formData, setFormData] = useState<OrganizationConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (presetName: string) => {
    applyPreset(presetName);
    const preset = clientThemePresets[presetName];
    if (preset) {
      setFormData((prev) => ({ ...prev, ...preset }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-100 text-brand-700">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">White-Label Client Customizer</h2>
              <p className="text-xs text-slate-500">Rebrand this platform for any client organization in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* 1-Click Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Client Theme Presets
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.keys(clientThemePresets).map((presetName) => (
                <button
                  type="button"
                  key={presetName}
                  onClick={() => handlePresetSelect(presetName)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-xs font-medium text-slate-700 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{presetName}</span>
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-xs shrink-0 ml-2"
                    style={{ backgroundColor: clientThemePresets[presetName].primaryColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-4">
            {/* Org Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Client Organization Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                placeholder="e.g. Acme Corp Technologies"
                required
              />
            </div>

            {/* Tagline & Logo Text */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                  placeholder="e.g. Operations & People"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo Badge Text (Max 4 letters)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.logoText}
                  onChange={(e) => setFormData({ ...formData, logoText: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 font-mono uppercase"
                  placeholder="ACME"
                />
              </div>
            </div>

            {/* Currency & Primary Theme Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Currency Symbol
                </label>
                <select
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
                >
                  <option value="₹">INR (₹) - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Applied Live!
                </>
              ) : (
                'Save & Apply Theme'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
