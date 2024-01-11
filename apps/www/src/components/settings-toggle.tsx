'use client';

import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';

import { settingsStore } from './context/settings-store';
import { Icons } from './icons';
import { Toggle } from './ui/toggle';

export function SettingsToggle() {
  const showSettings = settingsStore.use.showSettings();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          variant="floating"
          size="circle"
          pressed={showSettings}
          onPressedChange={(pressed) => settingsStore.set.showSettings(pressed)}
        >
          <Icons.plugin className="h-6 w-6" />
        </Toggle>
      </TooltipTrigger>

      <TooltipContent>{showSettings ? 'Hide' : 'Show'} settings</TooltipContent>
    </Tooltip>
  );
}
