'use client';

import * as React from 'react';

import { useStoreValue } from 'platejs/react';

import { ThemeCustomizer } from '@/components/theme-customizer';
import { SettingsStore } from '@/components/themes-button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useViewport } from '@/hooks/use-viewport';
import { useMounted } from '@/registry/hooks/use-mounted';

import { Sheet, SheetContent } from './ui/sheet';

export default function CustomizerDrawer() {
  const open = useStoreValue(SettingsStore, 'open');
  const mounted = useMounted();
  const { width } = useViewport();

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2">
      {width <= 768 && (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            SettingsStore.set('open', value);
          }}
          // shouldScaleBackground={false}
        >
          <DialogContent className="max-h-[80vh] overflow-auto px-0 pt-0 pb-6">
            <div className="flex size-full flex-col space-y-4 pt-4 md:space-y-6 md:pt-0">
              <div className="overflow-auto py-2">
                <ThemeCustomizer />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="hidden md:flex">
        <Sheet
          open={open}
          onOpenChange={(value) => {
            SettingsStore.set('open', value);
          }}
          modal={false}
        >
          <SheetContent className="hidden min-w-[450px] rounded-[0.5rem] bg-background px-0 py-3 md:flex">
            <DialogTitle className="sr-only">Customizer</DialogTitle>

            <div className="flex size-full flex-col space-y-4 pt-4 md:space-y-6 md:pt-0">
              <div className="overflow-auto py-2">
                <ThemeCustomizer />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
