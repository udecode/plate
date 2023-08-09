'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { settingsStore } from '@/components/context/settings-store';
import {
  EditorCodeGeneratorResult,
  SelectPluginsAndComponents,
  useEditorCodeGeneratorState,
} from '@/components/editor-code-generator-result';
import { A, P } from '@/components/typography';
import PlaygroundDemo from '@/registry/default/example/playground-demo';
import { Button } from '@/registry/default/plate-ui/button';

export function HomeTabs() {
  const checkedPlugins = settingsStore.use.checkedPlugins();
  const [tab, setTab] = useState('1');

  const searchParams = useSearchParams();
  const pluginsString = searchParams?.get('plugins');
  const initialPluginIds = useMemo(
    () => pluginsString?.split(',') ?? [],
    [pluginsString]
  );

  const state = useEditorCodeGeneratorState({
    initialPluginIds,
  });

  const anyPluginChecked = useMemo(
    () => Object.values(state.checkedPlugins).some(Boolean),
    [state.checkedPlugins]
  );

  const anyComponentChecked = useMemo(
    () => Object.values(state.checkedComponents).some(Boolean),
    [state.checkedComponents]
  );

  return (
    <Tabs defaultValue="1">
      <TabsList>
        <TabsTrigger value="1">1. Playground</TabsTrigger>
        <TabsTrigger
          value="2"
          onClick={() => {
            const checkedPluginNames = Object.keys(checkedPlugins).filter(
              (id) => checkedPlugins[id]
            );

            history.replaceState(
              {},
              '',
              '?plugins=' + checkedPluginNames.join(',')
            );
          }}
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
      <TabsContent value="2" className="pt-2">
        <div className="max-w-[1336px] rounded-lg border bg-background px-4 py-6 shadow">
          <div className="flex justify-between">
            <P>
              Select the plugins and components you want to install. The
              components are provided by{' '}
              <A href="/docs/components" target="_blank">
                Plate UI
              </A>{' '}
              and should be{' '}
              <Button
                variant="inlineLink"
                size="none"
                onClick={() => state.setAllComponentsChecked(false)}
              >
                disabled
              </Button>{' '}
              if you want to use your own components.
            </P>
          </div>

          <div className="flex flex-wrap">
            <div className="-ml-4">
              <Button
                variant="link"
                onClick={() => state.setAllPluginsChecked(!anyPluginChecked)}
              >
                {anyPluginChecked ? 'Disable' : 'Enable'} All Plugins
              </Button>

              <Button
                variant="link"
                onClick={() =>
                  state.setAllComponentsChecked(!anyComponentChecked)
                }
                disabled={!anyPluginChecked}
              >
                {anyComponentChecked ? 'Disable' : 'Enable'} All Components
              </Button>
            </div>

            <div className="grow" />

            <Button
              onClick={() => setTab('result')}
              disabled={!anyPluginChecked}
            >
              Done
            </Button>
          </div>

          <SelectPluginsAndComponents {...state} />
        </div>
      </TabsContent>
      <TabsContent value="3" className="pt-2">
        <div className="max-w-[1336px] rounded-lg border bg-background shadow">
          <EditorCodeGeneratorResult {...state} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
