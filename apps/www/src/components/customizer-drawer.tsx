'use client';

import { useEffect, useRef } from 'react';
import * as React from 'react';

import { useStoreValue } from '@udecode/plate/react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useViewport } from '@/hooks/use-viewport';
import { useMounted } from '@/registry/hooks/use-mounted';

import { SettingsStore } from './context/settings-store';
import { CustomizerTabs } from './customizer-tabs';
import { Sheet, SheetContent } from './ui/sheet';

export default function CustomizerDrawer() {
  const open = useStoreValue(SettingsStore, 'showSettings');
  const cancelLoadingRef = useRef<any>('');
  const mounted = useMounted();
  const { width } = useViewport();

  useEffect(() => {
    if (open) {
      SettingsStore.set('loadingSettings', true);

      if (cancelLoadingRef.current) {
        clearTimeout(cancelLoadingRef.current);
        cancelLoadingRef.current = '';
      }

      cancelLoadingRef.current = setTimeout(() => {
        SettingsStore.set('loadingSettings', false);
      }, 600);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2">
      {width <= 768 && (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            SettingsStore.set('showSettings', value);
          }}
          // shouldScaleBackground={false}
        >
          <DialogContent className="max-h-[80vh] overflow-auto px-0 pt-0 pb-6">
            <CustomizerTabs />
          </DialogContent>
        </Dialog>
      )}

      <div className="hidden md:flex">
        <Sheet
          open={open}
          onOpenChange={(value) => {
            SettingsStore.set('showSettings', value);
          }}
          modal={false}
        >
          <SheetContent className="hidden min-w-[450px] rounded-[0.5rem] bg-background px-0 py-3 md:flex">
            <DialogTitle className="sr-only">Customizer</DialogTitle>

            {/* <SheetPrimitive.Close
              asChild
              onClick={() => SettingsStore.set('showSettings', false)}
            >
              <Button
                size="lg"
                variant="ghost"
                className="absolute top-4 left-4 size-8 p-0 px-1.5"
              >
                <ChevronsRight className="size-5" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetPrimitive.Close> */}

            <CustomizerTabs />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
