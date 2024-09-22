'use client';

import * as React from 'react';

import { Paintbrush } from 'lucide-react';

import { THEME_LIST } from '@/lib/themes';
import { Button } from '@/registry/default/plate-ui/button';

import { settingsStore } from './context/settings-store';
import { ThemesSwitcher } from './themes-selector-mini';

export function ThemesButton() {
  return (
    <div className="flex items-center">
      <div className="mr-2 flex items-center space-x-0.5">
        <ThemesSwitcher
          className="fixed inset-x-0 bottom-0 z-40 flex bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:sticky lg:bottom-auto lg:top-20"
          themes={THEME_LIST}
        />
      </div>

      <Button
        variant="outline"
        className="hidden md:flex"
        onClick={() => {
          settingsStore.set.customizerTab('themes');
          settingsStore.set.showSettings(true);
        }}
      >
        <Paintbrush className="mr-2 size-4" />
        Themes
      </Button>
    </div>
  );
}
