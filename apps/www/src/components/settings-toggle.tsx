'use client';

import React from 'react';

import { useStoreValue } from '@udecode/plate/react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';

import { SettingsStore } from './context/settings-store';
import { Icons } from './icons';
import { Toggle } from './ui/toggle';

export function SettingsToggle() {
  const showSettings = useStoreValue(SettingsStore, 'showSettings');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="circle"
            variant="floating"
            onPressedChange={(pressed) =>
              SettingsStore.set('showSettings', pressed)
            }
            pressed={showSettings}
          >
            <Icons.plugin className="size-6" />
          </Toggle>
        </TooltipTrigger>

        <TooltipContent>
          {showSettings ? 'Hide' : 'Show'} settings
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
