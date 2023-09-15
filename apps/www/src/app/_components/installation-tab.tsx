'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { KEY_DND } from '@udecode/plate-dnd';
import { uniqBy } from 'lodash';

import { allPlugins, orderedPluginKeys } from '@/config/customizer-list';
import { useMounted } from '@/hooks/use-mounted';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { settingsStore } from '@/components/context/settings-store';
import { Link } from '@/components/link';
import * as Typography from '@/components/typography';
import { H2, Step, Steps } from '@/components/typography';

import { InstallationCode } from './installation-code';

function getEditorCodeGeneratorResult({ checkedPlugins, checkedComponents }) {
  const plugins = allPlugins.filter((plugin) => {
    return checkedPlugins[plugin.id];
  });

  const components = plugins
    .flatMap((plugin) => plugin.components ?? [])
    .filter((component) => checkedComponents[component.id]);

  const componentsById = uniqBy(components, 'id');

  const orderedPlugins = plugins.sort((a, b) => {
    const indexOfA = orderedPluginKeys.indexOf(a.id);
    const indexOfB = orderedPluginKeys.indexOf(b.id);

    if (indexOfA === -1 || indexOfB === -1) {
      return 0;
    }

    return indexOfA - indexOfB;
  });

  return {
    plugins: orderedPlugins,
    components,
    componentsById,
  };
}

export default function InstallationTab() {
  const checkedPlugins = settingsStore.use.checkedPlugins();
  const checkedComponents = settingsStore.use.checkedComponents();
  const mounted = useMounted();

  // Assign initial values to plugins and components using useMemo
  const { plugins, components } = useMemo(
    () => getEditorCodeGeneratorResult({ checkedPlugins, checkedComponents }),
    [checkedComponents, checkedPlugins]
  );
  const somePlugins = useMemo(() => plugins.length > 0, [plugins]);
  const someComponents = useMemo(() => components.length > 0, [components]);

  // Assign componentsWithPluginKey using useMemo
  const componentsWithPluginKey = useMemo(
    () => components.filter((component) => component.pluginKey),
    [components]
  );

  // Create plateImports string
  const plateImports = useMemo(() => {
    const combinedArray = [...plugins, ...components];

    const uniqueImports = combinedArray.reduce(
      (acc, { plateImports: _plateImports }) => {
        if (_plateImports) {
          _plateImports.forEach((importItem) => acc.add(importItem));
        }
        return acc;
      },
      new Set<string>()
    );

    return Array.from(uniqueImports).join(', ');
  }, [plugins, components]);

  const installCommands = useMemo(() => {
    return {
      plugins: `npm install ${Array.from(
        plugins.reduce((uniquePackages, { npmPackage }) => {
          if (npmPackage) {
            uniquePackages.add(npmPackage);
          }
          return uniquePackages;
        }, new Set<string>())
      ).join(' ')}`,
      components: `npx @udecode/plate-ui@latest add ${Array.from(
        components.reduce(
          (uniqueFilenames, { id, registry, filename, noImport }) => {
            if (noImport) return uniqueFilenames;

            uniqueFilenames.add(registry ?? filename ?? id);
            return uniqueFilenames;
          },
          new Set<string>()
        )
      ).join(' ')}`,
    };
  }, [plugins, components]);

  const componentImports = useMemo(() => {
    return components.reduce(
      (acc, component) => {
        if (component.noImport) return acc;

        const importKey = component.filename ?? component.id;
        const importValue = component.import ?? component.usage;

        if (!acc[importKey]) {
          acc[importKey] = new Set();
        }
        acc[importKey].add(importValue);

        return acc;
      },
      {} as Record<string, Set<string>>
    );
  }, [components]);

  const groupedImportsByPackage = useMemo(() => {
    const grouped = {} as Record<string, Set<string>>;

    // Add pluginFactory and pluginKey from plugins
    plugins.forEach((plugin) => {
      if (!plugin.npmPackage) return;

      if (!grouped[plugin.npmPackage]) {
        grouped[plugin.npmPackage] = new Set();
      }

      if (plugin.pluginFactory) {
        grouped[plugin.npmPackage].add(plugin.pluginFactory);
      }

      plugin.packageImports?.forEach((packageImport) => {
        if (plugin.npmPackage) {
          grouped[plugin.npmPackage].add(packageImport);
        }
      });

      plugin.components?.forEach((component) => {
        if (
          plugin.npmPackage &&
          component.pluginKey &&
          componentsWithPluginKey.includes(component)
        ) {
          grouped[plugin.npmPackage].add(component.pluginKey);
        }
      });
    });

    return grouped;
  }, [componentsWithPluginKey, plugins]);

  const customImports = useMemo(() => {
    const res: string[] = [];

    for (const plugin of plugins) {
      if (plugin.customImports) {
        // add each custom import to the customImportGroups
        for (const importLine of plugin.customImports) {
          res.push(importLine);
        }
      }
    }
    return res;
  }, [plugins]);

  const importsCode = useMemo(() => {
    const importsGroups = Object.entries(groupedImportsByPackage).map(
      ([packageName, imports]) =>
        `import { ${Array.from(imports).join(', ')} } from '${packageName}';`
    );
    const componentImportsGroup = Object.entries(componentImports).map(
      ([componentId, importValues]) =>
        `import { ${Array.from(importValues).join(
          ', '
        )} } from '@/components/plate-ui/${componentId}';`
    );
    return [
      `import { createPlugins, Plate, PlateProvider${
        plateImports.length > 0 ? ', ' + plateImports : ''
      } } from '@udecode/plate-common';`,
      ...importsGroups,
      ...customImports,
      '',
      ...componentImportsGroup,
    ].join('\n');
  }, [componentImports, customImports, groupedImportsByPackage, plateImports]);

  const pluginsCode: string[] = [];

  plugins.forEach(
    ({ pluginFactory, pluginOptions, components: pluginComponents }) => {
      if (!pluginFactory) return;

      let componentOptions = '';
      pluginComponents?.forEach((component) => {
        if (component.pluginOptions && components.includes(component)) {
          componentOptions = [
            `${component.pluginOptions
              .map((option) => `${option}`)
              .join('\n      ')}`,
          ].join('\n');
        }
      });

      let options = '';
      if (pluginOptions) {
        options = pluginOptions.map((option) => `${option}`).join('\n      ');
      }

      let allOptions: string[] = [];
      if (componentOptions || pluginOptions) {
        allOptions = [`{`, `      ${options}${componentOptions}`, `    }`];
      }

      pluginsCode.push(`    ${pluginFactory}(${allOptions.join('\n')}),`);
    }
  );

  const hasDraggable = components.some((comp) => comp.id === 'draggable');
  const hasPlaceholder = components.some((comp) => comp.id === 'placeholder');

  const usageCode = [
    'const plugins = createPlugins(',
    '  [',
    pluginsCode.join('\n'),
    '  ],',
    '  {',
    `    components: ${hasDraggable ? 'withDraggables(' : ''}${
      hasPlaceholder ? 'withPlaceholders(' : ''
    }{`,
    ...componentsWithPluginKey.map(
      ({ pluginKey, usage }) => `      [${pluginKey}]: ${usage},`
    ),
    `    }${hasPlaceholder ? ')' : ''}${hasDraggable ? ')' : ''},`,
    `  }`,
    ');',
  ].join('\n');

  const hasDnd = plugins.some((plugin) => plugin.id === KEY_DND);

  const hasCommentsPopover = components.some(
    (comp) => comp.id === 'comments-popover'
  );
  const hasMentionCombobox = components.some(
    (comp) => comp.id === 'mention-combobox'
  );
  const hasFixedToolbar = components.some(
    (comp) => comp.id === 'fixed-toolbar'
  );
  const hasFixedToolbarButtons = components.some(
    (comp) => comp.id === 'fixed-toolbar-buttons'
  );
  const hasFloatingToolbar = components.some(
    (comp) => comp.id === 'floating-toolbar'
  );
  const hasFloatingToolbarButtons = components.some(
    (comp) => comp.id === 'floating-toolbar-buttons'
  );

  let indentLevel = 0;
  const jsxCode: string[] = [];

  const addLine = (
    line: string,
    opensBlock: boolean = false,
    closesBlock: boolean = false
  ) => {
    if (closesBlock && indentLevel > 0) {
      indentLevel--;
    }

    const tabs = Array.from({ length: indentLevel }).fill('  ').join(''); // double spaces for each level
    jsxCode.push(`${tabs}${line}`);

    if (opensBlock) {
      indentLevel++;
    }
  };

  if (hasDnd) {
    addLine(`<DndProvider backend={HTML5Backend}>`, true);
  }

  if (hasCommentsPopover) {
    addLine(`<CommentsProvider users={{}} myUserId="1">`, true);
  }

  addLine(
    `<PlateProvider plugins={plugins} initialValue={initialValue}>`,
    true
  );

  if (hasFixedToolbar) {
    addLine(`<FixedToolbar>`, true);
  }

  if (hasFixedToolbarButtons) {
    addLine(`<FixedToolbarButtons />`);
  }

  if (hasFixedToolbar) {
    addLine(`</FixedToolbar>`, false, true);
    addLine(``);
  }

  addLine(`<Plate />`);

  if (hasFloatingToolbar) {
    addLine(``);
    addLine(`<FloatingToolbar>`, true);
  }

  if (hasFloatingToolbarButtons) {
    addLine(`<FloatingToolbarButtons />`);
  }

  if (hasFloatingToolbar) {
    addLine(`</FloatingToolbar>`, false, true);
  }

  if (hasMentionCombobox) {
    addLine(`<MentionCombobox items={[]} />`);
  }

  if (hasCommentsPopover) {
    addLine(`<CommentsPopover />`);
  }

  addLine(`</PlateProvider>`, false, true);

  if (hasCommentsPopover) {
    addLine(`</CommentsProvider>`, false, true);
  }

  if (hasDnd) {
    addLine(`</DndProvider>`, false, true);
  }

  const plateCode = [
    `const initialValue = [`,
    `  {`,
    `    id: '1',`,
    `    type: 'p',`,
    `    children: [{ text: 'Hello, World!' }],`,
    `  },`,
    `];`,
    ``,
    `export function PlateEditor() {`,
    `  return (`,
    `    ${jsxCode.join('\n    ')}`,
    `  );`,
    `}`,
  ].join('\n');

  const fullCode = [importsCode, usageCode, plateCode].join('\n\n');

  if (!mounted) return null;

  return (
    <>
      <H2>Installation</H2>

      <Typography.P>
        Here is your <em>personalized</em> installation guide based on the
        plugins and components you have selected. <br />
        For a more general guide, please refer to the{' '}
        <Link href="/docs/getting-started" target="_blank">
          Getting Started
        </Link>{' '}
        section.
      </Typography.P>

      <Steps>
        <Step>Install Plate</Step>
        <InstallationCode
          bash
          code={[
            `npm install react react-dom slate slate-react slate-history slate-hyperscript`,
            `npm install @udecode/plate-common`,
          ].join('\n')}
        >
          Start from our{' '}
          <Link
            href="https://github.com/udecode/plate-template"
            target="_blank"
          >
            template
          </Link>{' '}
          or install the peer dependencies and Plate:
        </InstallationCode>
        {somePlugins && (
          <>
            <Step>Install Plugins</Step>
            <InstallationCode code={installCommands.plugins} bash>
              Install your selected plugins:
            </InstallationCode>
          </>
        )}
        {someComponents && (
          <>
            <Step>Add Components</Step>
            <InstallationCode code={installCommands.components} bash>
              <Link href="/docs/components/installation" target="_blank">
                Install the dependencies for the components
              </Link>{' '}
              and{' '}
              <Link href="/docs/components/cli" target="_blank">
                configure the CLI
              </Link>
              . Then, add the components you have selected:
            </InstallationCode>
          </>
        )}
        <Step>Imports</Step>
        <InstallationCode code={importsCode}>
          All the imports you need:
        </InstallationCode>
        <Step>Create Plugins</Step>
        <InstallationCode code={usageCode}>
          Create your plugins and link your components into them.
        </InstallationCode>
        <Step>Finally, render the editor</Step>
        <InstallationCode code={plateCode} />

        <Accordion
          type="single"
          collapsible
          defaultValue=""
          // onValueChange={setValue}
        >
          <AccordionItem value="1" className="">
            <AccordionTrigger className="justify-start gap-1">
              Full code
            </AccordionTrigger>
            <AccordionContent>
              <InstallationCode code={fullCode}></InstallationCode>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Steps>
    </>
  );
}
