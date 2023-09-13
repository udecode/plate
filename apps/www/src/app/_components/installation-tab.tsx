import * as React from 'react';
import { ReactNode, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { uniqBy } from 'lodash';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { allPlugins, orderedPluginKeys } from '@/config/setting-plugins';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { settingsStore } from '@/components/context/settings-store';
import { CopyButton } from '@/components/copy-button';
import { Link } from '@/components/link';
import * as Typography from '@/components/typography';
import { H2, Step, Steps } from '@/components/typography';

// Pre is deeply coupled to Contentlayer, so we need a wrapper to make it work
function WrappedPre({
  code,
  children,
  bash,
}: {
  code: string;
  children?: ReactNode;
  bash?: boolean;
}) {
  return (
    <div>
      {!!children && <Typography.P className="mt-6">{children}</Typography.P>}

      <div className="relative">
        <SyntaxHighlighter
          language={bash ? 'bash' : 'typescript'}
          style={theme}
          className="rounded-lg border py-4"
          showLineNumbers={!bash}
        >
          {code}
        </SyntaxHighlighter>

        <CopyButton value={code} className={cn('absolute right-4 top-4')} />
      </div>
    </div>
  );
}

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

export function InstallationTab() {
  const checkedPlugins = settingsStore.use.checkedPlugins();
  const checkedComponents = settingsStore.use.checkedComponents();
  const mounted = useMounted();

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

  let plateImports = '';
  plugins.forEach((plugin) => {
    plugin.plateImports?.forEach((item) => {
      plateImports += ', ' + item;
    });
  });

  const installPlugins = `npm install ${plugins
    .map((plugin) => plugin.npmPackage)
    .join(' ')}`;

  const installComponents = `npx @udecode/plate-ui@latest add ${components
    .map((component) => component.id)
    .join(' ')}`;

  const imports = [
    `import { createPlugins, Plate${plateImports} } from '@udecode/plate-common';`,
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

  if (!mounted) return null;

  return (
    <>
      <H2>Installation</H2>

      <Typography.P>
        Here is your personalized installation guide based on the plugins and
        components you have selected. For a more general guide, please refer to
        the{' '}
        <Link href="/docs/getting-started" target="_blank">
          Getting Started
        </Link>{' '}
        section.
      </Typography.P>

      <Steps>
        <Step>Install Plate</Step>
        <WrappedPre
          bash
          code={[
            `npm install react react-dom slate slate-react slate-history slate-hyperscript`,
            `npm install @udecode/plate-common`,
          ].join('\n')}
        >
          Install the peer dependencies and Plate:
        </WrappedPre>
        <Step>Install Plugins</Step>
        <WrappedPre code={installPlugins} bash>
          Install your selected plugins:
        </WrappedPre>
        <Step>Add Components</Step>
        <WrappedPre code={installComponents} bash>
          <Link href="/docs/components/installation" target="_blank">
            Install the dependencies for the components
          </Link>{' '}
          and{' '}
          <Link href="/docs/components/cli" target="_blank">
            configure the CLI
          </Link>
          . Then, add the components you have selected:
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
