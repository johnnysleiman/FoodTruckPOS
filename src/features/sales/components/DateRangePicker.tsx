// ============================================
// DATE RANGE PICKER COMPONENT
// Compact inline date presets
// ============================================

import { useState } from 'react';

interface DateRangePickerProps {
  onDateRangeChange: (dateFrom: string, dateTo: string) => void;
}

type Preset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth';

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<Preset>('today');

  const getDateRange = (preset: Preset): { from: string; to: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        return {
          from: today.toISOString(),
          to: new Date(today.getTime() + 86400000 - 1).toISOString(),
        };

      case 'yesterday': {
        const yesterday = new Date(today.getTime() - 86400000);
        return {
          from: yesterday.toISOString(),
          to: new Date(yesterday.getTime() + 86400000 - 1).toISOString(),
        };
      }

      case 'last7': {
        const last7 = new Date(today.getTime() - 7 * 86400000);
        return {
          from: last7.toISOString(),
          to: new Date(today.getTime() + 86400000 - 1).toISOString(),
        };
      }

      case 'last30': {
        const last30 = new Date(today.getTime() - 30 * 86400000);
        return {
          from: last30.toISOString(),
          to: new Date(today.getTime() + 86400000 - 1).toISOString(),
        };
      }

      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: firstDay.toISOString(),
          to: new Date(today.getTime() + 86400000 - 1).toISOString(),
        };
      }
    }
  };

  const handlePresetClick = (preset: Preset) => {
    setSelectedPreset(preset);
    const range = getDateRange(preset);
    onDateRangeChange(range.from, range.to);
  };

  const presets = [
    { id: 'today' as Preset, label: 'Today' },
    { id: 'yesterday' as Preset, label: 'Yesterday' },
    { id: 'last7' as Preset, label: 'Last 7 Days' },
    { id: 'last30' as Preset, label: 'Last 30 Days' },
    { id: 'thisMonth' as Preset, label: 'This Month' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => handlePresetClick(preset.id)}
          className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            selectedPreset === preset.id
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
