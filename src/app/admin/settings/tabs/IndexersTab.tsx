/**
 * Component: Indexers Settings Tab
 * Documentation: documentation/settings-pages.md
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IndexerManagement } from '@/components/admin/indexers/IndexerManagement';
import { FlagConfigRow } from '@/components/admin/FlagConfigRow';
import { IndexerFlagConfig } from '@/lib/utils/ranking-algorithm';

interface SavedIndexerConfig {
  id: number;
  name: string;
  priority: number;
  seedingTimeMinutes: number;
  rssEnabled: boolean;
  categories: number[];
}

interface IndexersTabProps {
  settings: {
    prowlarr: {
      url: string;
      apiKey: string;
    };
  };
  originalSettings?: {
    prowlarr: {
      url: string;
      apiKey: string;
    };
  } | null;
  indexers: SavedIndexerConfig[];
  flagConfigs: IndexerFlagConfig[];
  onSettingsChange: (settings: any) => void;
  onIndexersChange: (indexers: SavedIndexerConfig[]) => void;
  onFlagConfigsChange: (configs: IndexerFlagConfig[]) => void;
  onValidationChange: (validated: any) => void;
  validated: { prowlarr?: boolean };
}

export function IndexersTab({
  settings,
  originalSettings,
  indexers,
  flagConfigs,
  onSettingsChange,
  onIndexersChange,
  onFlagConfigsChange,
  onValidationChange,
  validated,
}: IndexersTabProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Indexer Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Configure your Prowlarr connection and manage which indexers to use with priority and seeding time.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prowlarr Server URL
        </label>
        <Input
          type="url"
          value={settings.prowlarr.url}
          onChange={(e) => {
            onSettingsChange({
              ...settings,
              prowlarr: { ...settings.prowlarr, url: e.target.value },
            });
            // Only invalidate if URL actually changed from original
            if (originalSettings && e.target.value !== originalSettings.prowlarr.url) {
              onValidationChange({ ...validated, prowlarr: false });
            }
          }}
          placeholder="http://localhost:9696"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prowlarr API Key
        </label>
        <Input
          type="password"
          value={settings.prowlarr.apiKey}
          onChange={(e) => {
            onSettingsChange({
              ...settings,
              prowlarr: { ...settings.prowlarr, apiKey: e.target.value },
            });
            // Only invalidate if API key actually changed from original
            if (originalSettings && e.target.value !== originalSettings.prowlarr.apiKey) {
              onValidationChange({ ...validated, prowlarr: false });
            }
          }}
          placeholder="Enter API key"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Found in Prowlarr Settings → General → Security → API Key
        </p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <IndexerManagement
          prowlarrUrl={settings.prowlarr.url}
          prowlarrApiKey={settings.prowlarr.apiKey}
          mode="settings"
          initialIndexers={indexers}
          onIndexersChange={onIndexersChange}
        />
      </div>

      {/* Flag Configuration Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Indexer Flag Configuration (Optional)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure score bonuses or penalties for indexer flags like "Freeleech".
            These modifiers apply universally across all indexers and affect final torrent ranking.
          </p>
        </div>

        {flagConfigs.length > 0 && (
          <div className="space-y-3 mb-4">
            {flagConfigs.map((config, index) => (
              <FlagConfigRow
                key={index}
                config={config}
                onChange={(updated) => {
                  const newConfigs = [...flagConfigs];
                  newConfigs[index] = updated;
                  onFlagConfigsChange(newConfigs);
                }}
                onRemove={() => {
                  onFlagConfigsChange(flagConfigs.filter((_, i) => i !== index));
                }}
              />
            ))}
          </div>
        )}

        <Button
          onClick={() => {
            onFlagConfigsChange([...flagConfigs, { name: '', modifier: 0 }]);
          }}
          variant="outline"
          size="sm"
        >
          + Add Flag Rule
        </Button>

        {flagConfigs.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
            No flag rules configured. Flag bonuses/penalties are optional.
          </p>
        )}
      </div>
    </div>
  );
}
