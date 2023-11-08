import * as React from 'react';

import { settingsStore } from './context/settings-store';
import { PluginsTabContent } from './plugins-tab-content';
import { ThemesTabContent } from './themes-tab-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function CustomizerTabs() {
  const customizerTab = settingsStore.use.customizerTab();

  return (
    <div className="flex w-full flex-col space-y-4 md:space-y-6">
      <Tabs
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

        <TabsContent
          value="plugins"
          className="h-[calc(85vh-90px)] overflow-y-auto overflow-x-hidden overscroll-contain pt-2 md:h-[calc(100vh-64px)]"
        >
          <PluginsTabContent />
        </TabsContent>
        <TabsContent
          value="themes"
          className="h-[calc(85vh-90px)] overflow-y-auto overflow-x-hidden overscroll-contain pt-2 md:h-[calc(100vh-64px)]"
        >
          <ThemesTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
