import * as React from 'react';

import { settingsStore } from './context/settings-store';
import { PluginsTabContent } from './plugins-tab-content';
import { ThemeCustomizer } from './theme-customizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function CustomizerTabs() {
  const customizerTab = settingsStore.use.customizerTab();

  return (
    <div className="flex size-full flex-col space-y-4 pt-4 md:space-y-6 md:pt-0">
      <Tabs
        className="flex h-full flex-col"
        value={customizerTab}
        onValueChange={(value) => {
          settingsStore.set.customizerTab(value);
        }}
      >
        <div className="flex justify-center">
          <TabsList className="">
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="grow overflow-auto px-6 py-2" value="plugins">
          <PluginsTabContent />
        </TabsContent>
        <TabsContent className="grow overflow-auto py-2" value="themes">
          <ThemeCustomizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
