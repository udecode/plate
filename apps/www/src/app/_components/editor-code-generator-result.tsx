import { ReactNode, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { uniqBy } from 'lodash';

import { allPlugins, orderedPluginKeys } from '@/config/setting-plugins';
import { settingsStore } from '@/components/context/settings-store';
import { Link } from '@/components/link';
import * as Typography from '@/components/typography';
import { H2, Pre, Step, Steps } from '@/components/typography';

// Pre is deeply coupled to Contentlayer, so we need a wrapper to make it work
function WrappedPre({
  code,
  children,
}: {
  code: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative">
      {!!children && <Typography.P className="mt-6">{children}</Typography.P>}
      <Pre className="p-4 text-white" __rawString__={code}>
        {code}
      </Pre>
    </div>
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

export function useEditorCodeGeneratorState() {
  const searchParams = useSearchParams();
  const pluginsString = searchParams?.get('plugins');

  const initialPluginIds = useMemo(
    () => pluginsString?.split(',') ?? [],
    [pluginsString]
  );

  // const [checkedPlugins, setCheckedPlugins] = useState(() => {
  //   return Object.fromEntries(
  //     allPlugins.map((plugin) => [
  //       plugin.id,
  //       initialPluginIds.includes(plugin.id),
  //     ])
  //   );
  // });

  /**
   * All components are checked by default, including those that are not
   * used by any checked plugin. Only a subset of these components will
   * be installed.
   */
  // const [checkedComponents, setCheckedComponents] = useState(() =>
  //   Object.fromEntries(allComponents.map((component) => [component.id, true]))
  // );

  // const setPluginChecked = useCallback(
  //   (id: string) => (checked: boolean) => {
  //     setCheckedPlugins((prev) => ({ ...prev, [id]: checked }));
  //   },
  //   []
  // );
  //
  // const setComponentChecked = useCallback(
  //   (id: string) => (checked: boolean) => {
  //     setCheckedComponents((prev) => ({ ...prev, [id]: checked }));
  //   },
  //   []
  // );

  // const setAllPluginsChecked = useCallback((checked: boolean) => {
  //   setCheckedPlugins((prev) =>
  //     Object.fromEntries(Object.entries(prev).map(([id]) => [id, checked]))
  //   );
  // }, []);
  //
  // const setAllComponentsChecked = useCallback((checked: boolean) => {
  //   setCheckedComponents((prev) =>
  //     Object.fromEntries(Object.entries(prev).map(([id]) => [id, checked]))
  //   );
  // }, []);
  //
  // return useMemo(
  //   () => ({
  //     initialPluginIds,
  //     checkedPlugins,
  //     checkedComponents,
  //     setPluginChecked,
  //     setComponentChecked,
  //     setAllPluginsChecked,
  //     setAllComponentsChecked,
  //   }),
  //   [
  //     initialPluginIds,
  //     checkedPlugins,
  //     checkedComponents,
  //     setPluginChecked,
  //     setComponentChecked,
  //     setAllPluginsChecked,
  //     setAllComponentsChecked,
  //   ]
  // );
}

function getEditorCodeGeneratorResult({ checkedPlugins, checkedComponents }) {
  const plugins = allPlugins.filter((plugin) => {
    if (!plugin.pluginFactory) return false;

    return checkedPlugins[plugin.id];
  });

  const components = uniqBy(
    plugins
      .flatMap((plugin) => plugin.components ?? [])
      .filter((component) => checkedComponents[component.id]),
    'id'
  );

  const orderedPlugins = plugins.sort((a, b) => {
    const indexOfA = orderedPluginKeys.indexOf(a.id);
    const indexOfB = orderedPluginKeys.indexOf(b.id);

    if (indexOfA === -1 || indexOfB === -1) {
      throw new Error(
        `plugin key not found in orderedPluginKeys ${indexOfA} ${indexOfB}`
      );
    }

    return indexOfA - indexOfB;
  });

  return {
    plugins: orderedPlugins,
    components,
  };
}

export function EditorCodeGeneratorResult() {
  const checkedPlugins = settingsStore.use.checkedPlugins();
  const checkedComponents = settingsStore.use.checkedComponents();

  const { plugins, components } = useMemo(
    () =>
      getEditorCodeGeneratorResult({
        checkedPlugins,
        checkedComponents,
      }),
    [checkedComponents, checkedPlugins]
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

  const imports = [
    `import { createPlugins, Plate } from '@udecode/plate-common';`,
    ...plugins.map(
      (plugin) =>
        `import { ${plugin.pluginFactory} } from '${plugin.npmPackage}';`
    ),
    ...componentsWithPluginKey.map(
      (component) =>
        `import { ${component.reactComponent} } from './components/plate-ui/${component.id}';`
    ),
  ].join('\n');

  const usage = [
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
  ].join('\n');

  const plate = ['export default () => <Plate plugins={plugins} />;'].join(
    '\n'
  );

  return (
    <>
      <H2>Installation</H2>

      <Typography.P>
        Here is your personalized installation guide based on the plugins and
        components you have selected. For a more general guide, please refer to
        the <Link href="/docs/getting-started">Getting Started</Link> section.
      </Typography.P>

      <Steps>
        <Step>Install Plate</Step>
        <WrappedPre
          code={[
            `npm install react react-dom slate slate-react slate-history slate-hyperscript`,
            `npm install @udecode/plate-common`,
          ].join('\n')}
        >
          Install the peer dependencies and Plate:
        </WrappedPre>
        <Step>Install Plugins</Step>
        <WrappedPre code={installPlugins}>
          Install your selected plugins:
        </WrappedPre>
        <Step>Add Components</Step>
        <WrappedPre code={installComponents}>
          <Link href="/docs/components/installation">
            Install the dependencies for the components
          </Link>{' '}
          and <Link href="/docs/components/cli">configure the CLI</Link>. Then,
          add the components you have selected:
        </WrappedPre>
        <Step>Imports</Step>
        <WrappedPre code={imports}>All the imports you need:</WrappedPre>
        <Step>Create Plugins</Step>
        <WrappedPre code={usage}>
          Create your plugins and link your components into them.
        </WrappedPre>
        <Step>Finally, render the editor</Step>
        <WrappedPre code={plate} />
      </Steps>
    </>
  );
}
