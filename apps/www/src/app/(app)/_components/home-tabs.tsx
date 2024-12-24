'use client';

import { useEffect } from 'react';

import { cn } from '@udecode/cn';
import { Settings2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { settingsStore } from '@/components/context/settings-store';
import { PlaygroundPreview } from '@/components/playground-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/registry/default/plate-ui/button';

const i18n = {
  cn: {
    customize: '定制',
    installation: '安装',
    playground: '操场',
  },
  en: {
    customize: 'Customize',
    installation: 'Installation',
    playground: 'Playground',
  },
};

const InstallationTab = dynamic(() => import('./installation-tab'));

export default function HomeTabs() {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

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
        value={homeTab}
        onValueChange={(value) => {
          settingsStore.set.homeTab(value);
        }}
      >
        <TabsList>
          <TabsTrigger value="playground">{content.playground}</TabsTrigger>
          <TabsTrigger value="installation">{content.installation}</TabsTrigger>
        </TabsList>

        <Button
          size="lg"
          variant="outline"
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
        >
          <Settings2 className="size-4" />
          {content.customize}
        </Button>

        <TabsContent className="pt-2" value="playground">
          <PlaygroundPreview className="" />
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
