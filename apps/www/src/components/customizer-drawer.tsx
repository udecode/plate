'use client';

import { useEffect, useRef } from 'react';

import { useMounted } from '@/hooks/use-mounted';
import { useViewport } from '@/hooks/use-viewport';
import { Button } from '@/registry/default/plate-ui/button';

import { CustomizerTabs } from './customizer-tabs';

import '@/styles/mdx.css';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { ChevronsRight } from 'lucide-react';
import { Drawer } from 'vaul';

import { settingsStore } from './context/settings-store';
import { DrawerContent } from './drawer';
import { Sheet, SheetContent } from './ui/sheet';

export default function CustomizerDrawer() {
  const open = settingsStore.use.showSettings();
  const setOpen = settingsStore.set.showSettings;
  const { width } = useViewport();
  const cancelLoadingRef = useRef<any>('');
  const mounted = useMounted();

  useEffect(() => {
    if (open) {
      settingsStore.set.loadingSettings(true);

      if (cancelLoadingRef.current) {
        clearTimeout(cancelLoadingRef.current);
        cancelLoadingRef.current = '';
      }

      cancelLoadingRef.current = setTimeout(() => {
        settingsStore.set.loadingSettings(false);
      }, 600);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2">
      {width <= 768 && (
        <Drawer.Root
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
          }}
          // modal={false}
        >
          <DrawerContent
            className="h-[85%] p-6 pt-10 md:hidden"
            overlayClassName="md:hidden"
            portalClassName="md:hidden"
          >
            <CustomizerTabs />
          </DrawerContent>
        </Drawer.Root>
      )}

      <div className="hidden md:flex">
        <Sheet
          open={open}
          onOpenChange={(value) => {
            if (value) setOpen(true);
          }}
          modal={false}
        >
          <SheetContent
            className="hidden min-w-[450px] rounded-[0.5rem] bg-background px-6 py-3 md:flex"
            modal={false}
            hideClose
          >
            <SheetPrimitive.Close asChild onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="absolute left-4 top-4 h-8 w-8 p-0 px-1.5"
              >
                <ChevronsRight className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetPrimitive.Close>

            <CustomizerTabs />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
