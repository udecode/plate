'use client';

import { useEffect } from 'react';

import { cn } from '@udecode/cn';
import { Settings2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { settingsStore } from '@/components/context/settings-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaygroundDemo from '@/registry/default/example/playground-demo';
import { Button } from '@/registry/default/plate-ui/button';

const InstallationTab = dynamic(() => import('./installation-tab'));

export default function HomeTabs() {
  const active = settingsStore.use.showSettings();
  const homeTab = settingsStore.use.homeTab();
  const [builder, setBuilder] = useQueryState(
    'builder',
    parseAsBoolean.withDefault(false)
  );

  useEffect(() => {
    if (builder) {
      settingsStore.set.showSettings(true);
    }
  }, [builder]);

  useEffect(() => {
    if (active) {
      void setBuilder(true);
    } else {
      void setBuilder(null);
    }
  }, [active, setBuilder]);

  return (
    <div>
      <Tabs
        onValueChange={(value) => {
          settingsStore.set.homeTab(value);
        }}
        value={homeTab}
      >
        <TabsList>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
        </TabsList>

        <Button
          className={cn(
            'ml-2 translate-y-[3px]',
            active && 'border-2 border-primary'
          )}
          onClick={() => {
            if (active) {
              settingsStore.set.showSettings(false);
            } else {
              settingsStore.set.customizerTab('plugins');
              settingsStore.set.showSettings(true);
            }
          }}
          variant="outline"
        >
          <Settings2 className="mr-2 size-4" /> Customize
        </Button>

        <TabsContent className="pt-2" value="playground">
          <div className="max-w-[1336px] rounded-lg border bg-background shadow">
            <PlaygroundDemo />
          </div>
        </TabsContent>
        <TabsContent className="pt-2" value="installation">
          <div className="max-w-[1136px] p-4">
            <InstallationTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
