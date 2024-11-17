'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';

import { DndPlugin } from '@udecode/plate-dnd';
import { uniqBy } from 'lodash';

import {
  type SettingsStoreValue,
  settingsStore,
} from '@/components/context/settings-store';
import { Link } from '@/components/link';
import * as Typography from '@/components/typography';
import { H2, Step, Steps } from '@/components/typography';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { customizerItems } from '@/config/customizer-items';
import { allPlugins, orderedPluginKeys } from '@/config/customizer-list';
import { useMounted } from '@/registry/default/hooks/use-mounted';

import { InstallationCode } from './installation-code';

function getEditorCodeGeneratorResult({
  checkedComponents,
  checkedPlugins,
}: Pick<SettingsStoreValue, 'checkedComponents' | 'checkedPlugins'>) {
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
    components,
    componentsById,
    plugins: orderedPlugins,
  };
}

export default function InstallationTab() {
  const checkedPlugins = settingsStore.use.checkedPlugins();
  const checkedComponents = settingsStore.use.checkedComponents();
  const mounted = useMounted();
  const [isManual, setIsManual] = useState(false);
  const [radioValue, setRadioValue] = useState('editor-basic');

  // Assign initial values to plugins and components using useMemo
  const { components, plugins } = useMemo(
    () => getEditorCodeGeneratorResult({ checkedComponents, checkedPlugins }),
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

  // Create cnImports string
  const cnImports = useMemo(() => {
    const combinedArray = [...plugins, ...components];

    const uniqueImports = combinedArray.reduce(
      (acc, { cnImports: _cnImports }) => {
        if (_cnImports) {
          _cnImports.forEach((importItem) => acc.add(importItem));
        }

        return acc;
      },
      new Set<string>()
    );

    return Array.from(uniqueImports).join(', ');
  }, [plugins, components]);

  const installCommands = useMemo(() => {
    return {
      components: `npx shadcx@latest add plate/${Array.from(
        components.reduce(
          (uniqueFilenames, { id, filename, noImport, registry }) => {
            if (noImport) return uniqueFilenames;

            uniqueFilenames.add(registry ?? filename ?? id);

            return uniqueFilenames;
          },
          new Set<string>()
        )
      ).join(' ')}${isManual ? ' tooltip' : ''}`,
      plugins: `npm install ${Array.from(
        plugins.reduce((uniquePackages, { npmPackage }) => {
          if (npmPackage) {
            uniquePackages.add(npmPackage);
          }

          return uniquePackages;
        }, new Set<string>())
      ).join(' ')}`,
    };
  }, [plugins, components, isManual]);

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
    const grouped = {} as Record<string, { imports: Set<string>; plugin: any }>;

    // Add pluginFactory and pluginKey from plugins
    plugins.forEach((plugin) => {
      if (!plugin.npmPackage) return;
      if (!grouped[plugin.npmPackage]) {
        grouped[plugin.npmPackage] = { imports: new Set(), plugin };
      }
      if (plugin.pluginFactory) {
        grouped[plugin.npmPackage].imports.add(plugin.pluginFactory);
      }

      // Handle pluginImports
      plugin.components?.forEach((component) => {
        component.pluginImports?.forEach((importItem) => {
          grouped[plugin.npmPackage!].imports.add(importItem);
        });
      });

      plugin.packageImports?.forEach((packageImport) => {
        grouped[plugin.npmPackage!].imports.add(packageImport);
      });
    });

    return grouped;
  }, [plugins]);

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

  const hasEditor = components.some((comp) => comp.id === 'editor');

  const importsCode = useMemo(() => {
    const importsGroups = Object.entries(groupedImportsByPackage).map(
      ([packageName, { imports, plugin }]) => {
        const importPath = plugin.reactImport
          ? `${packageName}/react`
          : packageName;

        return `import { ${Array.from(imports).join(', ')} } from '${importPath}';`;
      }
    );
    const componentImportsGroup = Object.entries(componentImports).map(
      ([componentId, importValues]) =>
        `import { ${Array.from(importValues).join(
          ', '
        )} } from '@/components/plate-ui/${componentId}';`
    );

    const imports = [
      `${
        cnImports.length > 0
          ? `import { ${cnImports} } from '@udecode/cn';\n`
          : ''
      }import { usePlateEditor, Plate${hasEditor ? '' : ', PlateContent'}${
        plateImports.length > 0 ? ', ' + plateImports : ''
      } } from '@udecode/plate-common/react';`,
      ...importsGroups,
      ...customImports,
      '',
      ...componentImportsGroup,
    ];

    if (someComponents && isManual) {
      imports.push(
        `import { TooltipProvider } from '@/components/plate-ui/tooltip';`
      );
    }

    return imports.join('\n');
  }, [
    cnImports,
    componentImports,
    customImports,
    groupedImportsByPackage,
    hasEditor,
    isManual,
    plateImports,
    someComponents,
  ]);

  const pluginsCode: string[] = [];

  plugins.forEach(({ id, pluginFactory, pluginOptions }) => {
    if (!pluginFactory) return;

    const customizerItem = customizerItems[id];
    let optionsString = '';

    // Use plugin-level options if available
    if (customizerItem?.pluginOptions) {
      optionsString = customizerItem.pluginOptions.join('\n');
    }

    // Add component-level options
    customizerItem?.components?.forEach((component) => {
      if (component.pluginOptions) {
        const componentOptions = component.pluginOptions.join('\n');

        if (!optionsString.includes(componentOptions)) {
          optionsString += (optionsString ? '\n' : '') + componentOptions;
        }
      }
    });

    // If there are additional pluginOptions, append them only if they're different
    if (pluginOptions) {
      const additionalOptions = pluginOptions.filter(
        (option) => !optionsString.includes(option)
      );

      if (additionalOptions.length > 0) {
        optionsString +=
          (optionsString ? '\n' : '') + additionalOptions.join('\n');
      }
    }

    let formattedPlugin = `    ${pluginFactory}`;

    if (optionsString) {
      // Add 3 tabs (6 spaces) to each line inside configure
      const indentedOptions = optionsString
        .split('\n')
        .map((line) => `      ${line}`)
        .join('\n');
      formattedPlugin += `.configure({\n${indentedOptions}\n    })`;
    }

    pluginsCode.push(formattedPlugin + ',');
  });

  const hasDraggable = components.some((comp) => comp.id === 'draggable');
  const hasPlaceholder = components.some((comp) => comp.id === 'placeholder');

  const usageCode = [
    'const editor = usePlateEditor({',
    '  plugins: [',
    pluginsCode.join('\n'),
    '  ],',
    '  override: {',
    `    components: ${hasDraggable ? 'withDraggables(' : ''}${hasPlaceholder ? 'withPlaceholders(' : ''}({`,
    ...componentsWithPluginKey.map(
      ({ pluginKey, usage }) => `      [${pluginKey}]: ${usage},`
    ),
    `    })${hasPlaceholder ? ')' : ''}${hasDraggable ? ')' : ''},`,
    '  },',
    '  value: [',
    '    {',
    '      id: "1",',
    '      type: "p",',
    '      children: [{ text: "Hello, World!" }],',
    '    },',
    '  ],',
    '});',
  ].join('\n');

  const hasDnd = plugins.some((plugin) => plugin.id === DndPlugin.key);

  let indentLevel = 0;

  const addLine = (line: string, opensBlock = false, closesBlock = false) => {
    if (closesBlock && indentLevel > 0) {
      indentLevel--;
    }

    const tabs = Array.from({ length: indentLevel }).fill('  ').join(''); // double spaces for each level
    jsxCode.push(`${tabs}${line}`);

    if (opensBlock) {
      indentLevel++;
    }
  };

  const jsxCode: string[] = [];

  if (hasDnd) {
    addLine(`<DndProvider backend={HTML5Backend}>`, true);
  }

  addLine(`<Plate editor={editor}>`, true);

  if (hasEditor) {
    addLine(`<EditorContainer>`, true);
    addLine(`<Editor />`);
    addLine(`</EditorContainer>`, false, true);
  } else {
    addLine(`<PlateContent />`);
  }

  addLine(`</Plate>`, false, true);

  if (hasDnd) {
    addLine(`</DndProvider>`, false, true);
  }

  const plateCode = [
    `export function PlateEditor() {`,
    `  return (`,
    `    ${jsxCode.join('\n    ')}`,
    `  );`,
    `}`,
  ].join('\n');

  const fullCode = [`'use client';`, importsCode, usageCode, plateCode]
    .filter(Boolean)
    .join('\n\n');

  if (!mounted) return null;

  return (
    <>
      <H2>Installation</H2>

      <Typography.P>
        For a complete guide, refer to the{' '}
        <Link href="/docs/getting-started" target="_blank">
          Getting Started
        </Link>{' '}
        section.
      </Typography.P>

      <Steps>
        <Step>Install</Step>
        <RadioGroup
          value={radioValue}
          onValueChange={(value) => {
            setRadioValue(value);
            setIsManual(value === 'manual');
          }}
        >
          <div className="mt-4 flex items-center space-x-2">
            <RadioGroupItem id="r1" value="editor-basic" />
            <Label htmlFor="r1">Start from Basic Editor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="r2" value="editor-ai" />
            <Label htmlFor="r2">Start from AI Editor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="r3" value="manual" />
            <Label htmlFor="r3">Manual installation</Label>
          </div>
        </RadioGroup>
        {isManual ? (
          <div>
            <InstallationCode
              code={[
                `npm install react react-dom slate slate-dom slate-react slate-history slate-hyperscript`,
                `npm install @udecode/plate-common`,
              ].join('\n')}
              bash
            >
              Install the peer dependencies and Plate:
            </InstallationCode>
            {someComponents && (
              <p className="mt-4">
                Next,{' '}
                <Link href="/docs/components/installation" target="_blank">
                  install Plate UI
                </Link>
                .
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <Typography.P>
              Use the following command to add the AI editor to your project:
            </Typography.P>
            <InstallationCode
              code={`npx shadcx@latest add plate/editor-${
                radioValue === 'editor-ai' ? 'ai' : 'basic'
              }`}
              bash
            ></InstallationCode>
            <Typography.P className="mt-4">
              This will add an <code>/editor</code> page to your project along
              with all necessary components as a starting point.
            </Typography.P>
          </div>
        )}
        {isManual && somePlugins && (
          <>
            <Step>Install Plugins</Step>
            <InstallationCode code={installCommands.plugins} bash>
              Install your selected plugins:
            </InstallationCode>
          </>
        )}
        {isManual && someComponents && (
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

        {(isManual || radioValue === 'editor-basic') && (
          <>
            <Step>Imports</Step>
            <InstallationCode code={importsCode}>
              Here are partial installation steps based on the plugins and
              components you have selected.
              <br />
              For the most reliable setup, we recommend following our{' '}
              <Link href="/docs/components/installation" target="_blank">
                CLI-based installation
              </Link>
              .
              <br />
              All the imports you need:
            </InstallationCode>
            <Step>Create Plugins</Step>
            <InstallationCode code={usageCode}>
              Create your plugins and link your components into them.
            </InstallationCode>

            {radioValue === 'editor-basic' && (
              <>
                <Step>Finally, render the editor</Step>
                <InstallationCode code={plateCode} />
              </>
            )}

            <Accordion
              defaultValue=""
              type="single"
              collapsible
              // onValueChange={setValue}
            >
              <AccordionItem className="" value="1">
                <AccordionTrigger className="justify-start gap-1">
                  Full code
                </AccordionTrigger>
                <AccordionContent>
                  <InstallationCode code={fullCode}></InstallationCode>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </Steps>
    </>
  );
}
