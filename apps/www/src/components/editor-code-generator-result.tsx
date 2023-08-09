import { useCallback, useMemo, useState } from 'react';
import { sortBy, uniqBy } from 'lodash';

import { settingPlugins } from '@/config/setting-plugins';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/registry/default/plate-ui/checkbox';

import { H2, Pre, Step, Steps } from './typography';
import { Label } from './ui/label';

const allPlugins = settingPlugins.flatMap((group) => group.children);
const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);

// Pre is deeply coupled to Contentlayer, so we need a wrapper to make it work
function WrappedPre({ code }: { code: string }) {
  return (
    <div className="relative">
      <Pre className="p-4 text-white" __rawString__={code}>
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

function TreeIcon({ isFirst, isLast, className }: TreeIconProps) {
  return (
    <svg
      viewBox="0 0 12 24"
      aria-hidden="true"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'aspect-[1/2] w-5 fill-none stroke-slate-300 dark:stroke-slate-600',
        className
      )}
    >
      <path d={`M 2 ${isFirst ? 2 : 0} L 2 12 L 10 12`} />

      {!isLast && <path d="M 2 12 L 2 24" />}
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
};

export function useEditorCodeGeneratorState({
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
  const [checkedComponents, setCheckedComponents] = useState(() =>
    Object.fromEntries(allComponents.map((component) => [component.id, true]))
  );

  const setPluginChecked = useCallback(
    (id: string) => (checked: boolean) => {
      setCheckedPlugins((prev) => ({ ...prev, [id]: checked }));
    },
    []
  );

  const setComponentChecked = useCallback(
    (id: string) => (checked: boolean) => {
      setCheckedComponents((prev) => ({ ...prev, [id]: checked }));
    },
    []
  );

  const setAllPluginsChecked = useCallback((checked: boolean) => {
    setCheckedPlugins((prev) =>
      Object.fromEntries(Object.entries(prev).map(([id]) => [id, checked]))
    );
  }, []);

  const setAllComponentsChecked = useCallback((checked: boolean) => {
    setCheckedComponents((prev) =>
      Object.fromEntries(Object.entries(prev).map(([id]) => [id, checked]))
    );
  }, []);

  return useMemo(
    () => ({
      initialPluginIds,
      checkedPlugins,
      checkedComponents,
      setPluginChecked,
      setComponentChecked,
      setAllPluginsChecked,
      setAllComponentsChecked,
    }),
    [
      initialPluginIds,
      checkedPlugins,
      checkedComponents,
      setPluginChecked,
      setComponentChecked,
      setAllPluginsChecked,
      setAllComponentsChecked,
    ]
  );
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

export function SelectPluginsAndComponents({
  initialPluginIds,
  checkedPlugins,
  checkedComponents,
  setPluginChecked,
  setComponentChecked,
}: TEditorCodeGeneratorState) {
  const allPluginsInitialFirst = useMemo(
    () =>
      sortBy(allPlugins, (plugin) =>
        initialPluginIds.includes(plugin.id) ? 0 : 1
      ),
    [initialPluginIds]
  );

  return (
    <div className="space-y-2 rounded-lg bg-muted p-4">
      {allPluginsInitialFirst.map(
        ({ id: pluginId, label: pluginLabel, components = [] }) => {
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

              {isChecked &&
                components.length > 0 &&
                components.map(
                  (
                    { id: componentId, label: componentLabel },
                    componentIndex
                  ) => {
                    const isFirst = componentIndex === 0;
                    const isLast = componentIndex === components.length - 1;
                    const componentHtmlId = `${pluginHtmlId}-${componentId}`;

                    return (
                      <div key={componentId} className="flex items-center">
                        <TreeIcon
                          isFirst={isFirst}
                          isLast={isLast}
                          className="mx-1"
                        />

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
                  }
                )}
            </div>
          );
        }
      )}
    </div>
  );
}

export function EditorCodeGeneratorResult(state: TEditorCodeGeneratorState) {
  const { plugins, components } = useMemo(
    () => getEditorCodeGeneratorResult(state),
    [state]
  );

  const componentsWithPluginKey = useMemo(
    () => components.filter((component) => component.pluginKey),
    [components]
  );

  const installPlugins = `npm install ${plugins
    .map((plugin) => plugin.npmPackage)
    .join(' ')}`;

  const installComponents = `npx @udecode/plate-ui@latest add ${components
    .map((component) => component.id)
    .join(' ')}`;

  const usage = [
    'import {',
    '  createPlugins,',
    ...plugins.map((plugin) => `  ${plugin.pluginFactory},`),
    '  Plate,',
    "} from '@udecode/plate';",
    ...componentsWithPluginKey.map(
      (component) =>
        `import { ${component.reactComponent} } from './components/plate-ui/${component.id}';`
    ),
    '',
    'const plugins = createPlugins(',
    '  [',
    ...plugins.map((plugin) => `    ${plugin.pluginFactory}(),`),
    '  ],',
    '  {',
    '    components: {',
    ...componentsWithPluginKey.map(
      (component) =>
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
