'use client';

import React from 'react';
import { settingsStore } from './context/settings-store';
import { Toggle } from './ui/toggle';
import { Icons } from './icons';

export function SettingsToggle() {
  const showSettings = settingsStore.use.showSettings();

  return (
    <Toggle
      className="h-9 w-9 p-0"
      pressed={showSettings}
      onPressedChange={(pressed) => settingsStore.set.showSettings(pressed)}
    >
      <Icons.plugin className="h-6 w-6" />
    </Toggle>
  );
}
