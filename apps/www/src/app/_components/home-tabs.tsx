'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaygroundDemo from '@/registry/default/example/playground-demo';

import { EditorCodeGeneratorResult } from './editor-code-generator-result';

export function HomeTabs() {
  return (
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">1. Playground</TabsTrigger>
        <TabsTrigger
          value="2"
          // onClick={() => {
          //   const checkedPluginNames = Object.keys(checkedPlugins).filter(
          //     (id) => checkedPlugins[id]
          //   );
          //
          //   history.replaceState(
          //     {},
          //     '',
          //     '?plugins=' + checkedPluginNames.join(',')
          //   );
          // }}
        >
          2. Pick your plugins
        </TabsTrigger>
        <TabsTrigger value="3">3. Installation</TabsTrigger>
      </TabsList>

      <TabsContent value="1" className="pt-2">
        <div className="max-w-[1336px] rounded-lg border bg-background shadow">
          <PlaygroundDemo />
        </div>
      </TabsContent>
      <TabsContent value="3" className="pt-2">
        <div className="max-w-[1336px] p-4">
          <EditorCodeGeneratorResult />
        </div>
      </TabsContent>
    </Tabs>
  );
}
