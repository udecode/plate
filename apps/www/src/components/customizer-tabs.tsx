import * as React from 'react';

import { settingsStore } from './context/settings-store';
import { PluginsTabContent } from './plugins-tab-content';
import { ThemesTabContent } from './themes-tab-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function CustomizerTabs() {
  const customizerTab = settingsStore.use.customizerTab();

  return (
    <div className="flex w-full flex-col space-y-4 pt-4 md:space-y-6 md:pt-0">
      <Tabs
        onValueChange={(value) => {
          settingsStore.set.customizerTab(value);
        }}
        value={customizerTab}
      >
        <div className="flex justify-center">
          <TabsList className="">
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          className="h-[calc(85vh-90px)] overflow-y-auto overflow-x-hidden overscroll-contain pt-2 md:h-[calc(100vh-64px)]"
          value="plugins"
        >
          <PluginsTabContent />
        </TabsContent>
        <TabsContent
          className="h-[calc(85vh-90px)] overflow-y-auto overflow-x-hidden overscroll-contain pt-2 md:h-[calc(100vh-64px)]"
          value="themes"
        >
          <ThemesTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
