'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { settingPlugins } from '@/config/setting-plugins';
import { Checkbox } from '@/registry/default/plate-ui/checkbox';
import { Label } from './ui/label';
import { uniqBy, sortBy } from 'lodash';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { P, A, H2, Pre, Steps, Step } from './typography';
import { Button } from '@/registry/default/plate-ui/button';

const allPlugins = settingPlugins.flatMap((group) => group.children);

const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);

// Pre is deeply coupled to Contentlayer, so we need a wrapper to make it work
function WrappedPre({ code }: { code: string }) {
  return (
    <div className="relative">
      <Pre className="text-white p-4" __rawString__={code}>
        {code}
      </Pre>
    </div>
  );
}

interface TreeIconProps {
  isFirst: boolean;
  isLast: boolean;
  className?: string;
}

function TreeIcon({
  isFirst,
  isLast,
  className,
}: TreeIconProps) {
  return (
    <svg
      viewBox={`0 0 12 24`}
      aria-hidden="true"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'fill-none stroke-slate-300 dark:stroke-slate-600 aspect-[1/2] w-5',
        className
      )}
    >
      <path d={`M 2 ${isFirst ? 2 : 0} L 2 12 L 10 12`}/>

      {!isLast && (
        <path d="M 2 12 L 2 24"/>
      )}
    </svg>
  );
}

type TEditorCodeGeneratorState = {
  initialPluginIds: string[];
  checkedPlugins: Record<string, boolean>;
  checkedComponents: Record<string, boolean>;
  setPluginChecked: (id: string) => (checked: boolean) => void;
  setComponentChecked: (id: string) => (checked: boolean) => void;
  setAllPluginsChecked: (checked: boolean) => void;
  setAllComponentsChecked: (checked: boolean) => void;
}

function useEditorCodeGeneratorState({
  initialPluginIds = [],
}: {
  initialPluginIds?: string[];
}): TEditorCodeGeneratorState {
  const [checkedPlugins, setCheckedPlugins] = useState(() => {
    return Object.fromEntries(
      allPlugins.map((plugin) => [
        plugin.id,
        initialPluginIds.includes(plugin.id),
      ])
    );
  });

  /**
   * All components are checked by default, including those that are not
   * used by any checked plugin. Only a subset of these components will
   * be installed.
   */
  const [checkedComponents, setCheckedComponents] = useState(() => Object.fromEntries(
    allComponents.map((component) => [component.id, true])
  ));

  const setPluginChecked = useCallback((id: string) => (checked: boolean) => {
    setCheckedPlugins((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const setComponentChecked = useCallback((id: string) => (checked: boolean) => {
    setCheckedComponents((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const setAllPluginsChecked = useCallback((checked: boolean) => {
    setCheckedPlugins((prev) => Object.fromEntries(
      Object.entries(prev).map(([id]) => [id, checked])
    ));
  }, []);

  const setAllComponentsChecked = useCallback((checked: boolean) => {
    setCheckedComponents((prev) => Object.fromEntries(
      Object.entries(prev).map(([id]) => [id, checked])
    ));
  }, []);

  return useMemo(() => ({
    initialPluginIds,
    checkedPlugins,
    checkedComponents,
    setPluginChecked,
    setComponentChecked,
    setAllPluginsChecked,
    setAllComponentsChecked,
  }), [
    initialPluginIds,
    checkedPlugins,
    checkedComponents,
    setPluginChecked,
    setComponentChecked,
    setAllPluginsChecked,
    setAllComponentsChecked,
  ]);
}

function getEditorCodeGeneratorResult({
  checkedPlugins,
  checkedComponents,
}: TEditorCodeGeneratorState) {
  const plugins = allPlugins.filter((plugin) => checkedPlugins[plugin.id]);

  const components = uniqBy(
    plugins
      .flatMap((plugin) => plugin.components ?? [])
      .filter((component) => checkedComponents[component.id]),
    'id'
  );

  return {
    plugins,
    components,
  };
}

function SelectPluginsAndComponents({
  initialPluginIds,
  checkedPlugins,
  checkedComponents,
  setPluginChecked,
  setComponentChecked,
}: TEditorCodeGeneratorState) {
  const allPluginsInitialFirst = useMemo(() => sortBy(
    allPlugins,
    (plugin) => initialPluginIds.includes(plugin.id) ? 0 : 1
  ), [initialPluginIds]);

  return (
    <div className="space-y-2 bg-muted rounded-lg p-4">
      {allPluginsInitialFirst.map(({ id: pluginId, label: pluginLabel, components = [] }) => {
        const isChecked = checkedPlugins[pluginId];
        const pluginHtmlId = `plugin-${pluginId}`;

        return (
          <div key={pluginId}>
            <div className="flex items-center">
              <Checkbox
                id={pluginHtmlId}
                checked={isChecked}
                onCheckedChange={setPluginChecked(pluginId)}
              />

              <Label htmlFor={pluginHtmlId} className="flex p-2">
                {pluginLabel} Plugin
              </Label>
            </div>

            {isChecked && components.length > 0 && (
              components.map(({ id: componentId, label: componentLabel }, componentIndex) => {
                const isFirst = componentIndex === 0;
                const isLast = componentIndex === components.length - 1;
                const componentHtmlId = `${pluginHtmlId}-${componentId}`;

                return (
                  <div key={componentId} className="flex items-center">
                    <TreeIcon isFirst={isFirst} isLast={isLast} className="mx-1" />

                    <Checkbox
                      id={componentHtmlId}
                      checked={checkedComponents[componentId]}
                      onCheckedChange={setComponentChecked(componentId)}
                    />

                    <Label htmlFor={componentHtmlId} className="flex p-2">
                      {componentLabel} Component
                    </Label>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

export function EditorCodeGeneratorResult(state: TEditorCodeGeneratorState) {
  const { plugins, components } = useMemo(
    () => getEditorCodeGeneratorResult(state),
    [state]
  );

  const componentsWithPluginKey = useMemo(() =>
    components.filter((component) => component.pluginKey),
    [components]
  );

  const installPlugins = `npm install ${
    plugins.map((plugin) => plugin.npmPackage).join(' ')
  }`;

  const installComponents = `npx @udecode/plate-ui@latest add ${
    components.map((component) => component.id).join(' ')
  }`;

  const usage = [
    'import {',
    '  createPlugins,',
    ...plugins.map((plugin) => `  ${plugin.pluginFactory},`),
    '  Plate,',
    '} from \'@udecode/plate\';',
    ...componentsWithPluginKey.map((component) =>
      `import { ${component.reactComponent} } from './components/plate-ui/${component.id}';`
    ),
    '',
    'const plugins = createPlugins(',
    '  [',
    ...plugins.map((plugin) => `    ${plugin.pluginFactory}(),`),
    '  ],',
    '  {',
    '    components: {',
    ...componentsWithPluginKey.map((component) =>
      `      [${component.pluginKey}]: ${component.reactComponent},`
    ),
    '    },',
    '  }',
    ');',
    '',
    'export default () => <Plate plugins={plugins} />;',
  ].join('\n');

  return (
    <>
      <H2>Installation</H2>

      <Steps>
        <Step>Install Plugins</Step>
        <WrappedPre code={installPlugins} />

        <Step>Install Components</Step>
        <WrappedPre code={installComponents} />

        <Step>Usage</Step>
        <WrappedPre code={usage} />
      </Steps>
    </>
  );
}

export function EditorCodeGenerator({
  initialPluginIds,
}: {
  initialPluginIds?: string[];
}) {
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

  const [tab, setTab] = useState('select');

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full">
        <TabsTrigger value="select" className="w-full">
          Select Plugins
        </TabsTrigger>

        <TabsTrigger value="result" className="w-full" disabled={!anyPluginChecked}>
          Installation Steps
        </TabsTrigger>
      </TabsList>

      <TabsContent value="select" className="space-y-3">
        <P>
          Select the plugins and components you want to install. The components
          are provided by{' '}
          <A href="/docs/components" target="_blank">Plate UI</A>{' '}
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
              onClick={() => state.setAllComponentsChecked(!anyComponentChecked)}
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
            Confirm Plugins
          </Button>
        </div>

        <SelectPluginsAndComponents {...state} />
      </TabsContent>

      <TabsContent value="result">
        <EditorCodeGeneratorResult {...state} />
      </TabsContent>
    </Tabs>
  );
}
