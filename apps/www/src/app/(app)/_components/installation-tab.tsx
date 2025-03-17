'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';

import { DndPlugin } from '@udecode/plate-dnd';
import { useStoreValue } from '@udecode/plate/react';
import { uniqBy } from 'lodash';

import {
  type SettingsStoreValue,
  SettingsStore,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  allPlugins,
  customizerItems,
  orderedPluginKeys,
} from '@/config/customizer-items';
import { useLocale } from '@/hooks/useLocale';
import { useMounted } from '@/registry/default/hooks/use-mounted';
import { Label } from '@/registry/default/plate-ui/label';

import { InstallationCode } from './installation-code';

const i18n = {
  cn: {
    addComponents: '添加组件',
    addEditorPage:
      '这将在你的项目中添加一个 `/editor` 页面，并包含所有必要的组件作为起点。',
    allImports: '所有需要的导入：',
    and: '和',
    cliBased: 'CLI 安装',
    configureCLI: '配置 CLI',
    createPlugins: '创建插件',
    createPluginsDesc: '创建你的插件并将组件链接到它们。',
    forReliableSetup: '为了最可靠的设置，我们建议遵循我们的',
    fullCode: '完整代码',
    gettingStarted: '开始使用',
    gettingStartedGuide: '完整指南，请参考',
    imports: '导入',
    install: '安装',
    installation: '安装',
    installDepsForComponents: '安装组件的依赖项',
    installPeerDeps: '安装依赖项和 Plate：',
    installPlateUI: '安装 Plate UI',
    installPlugins: '安装插件',
    installSelectedPlugins: '安装你选择的插件：',
    manualInstallation: '手动安装',
    next: '接下来，',
    partialInstallation: '这里是基于你选择的插件和组件的部分安装步骤。',
    renderEditor: '最后，渲染编辑器',
    section: '部分。',
    startFromAIEditor: '从 AI 编辑器开始',
    startFromBasicEditor: '从基础编辑器开始',
    thenAddComponents: '。然后，添加你选择的组件：',
    useCommand: '使用以下命令将 AI 编辑器添加到你的项目：',
  },
  en: {
    addComponents: 'Add Components',
    addEditorPage:
      'This will add an `/editor` page to your project along with all necessary components as a starting point.',
    allImports: 'All the imports you need:',
    and: 'and',
    cliBased: 'CLI-based installation',
    configureCLI: 'configure the CLI',
    createPlugins: 'Create Plugins',
    createPluginsDesc:
      'Create your plugins and link your components into them.',
    forReliableSetup: 'For the most reliable setup, we recommend following our',
    fullCode: 'Full code',
    gettingStarted: 'Getting Started',
    gettingStartedGuide: 'For a complete guide, refer to the',
    imports: 'Imports',
    install: 'Install',
    installation: 'Installation',
    installDepsForComponents: 'Install the dependencies for the components',
    installPeerDeps: 'Install the peer dependencies and Plate:',
    installPlateUI: 'install Plate UI',
    installPlugins: 'Install Plugins',
    installSelectedPlugins: 'Install your selected plugins:',
    manualInstallation: 'Manual installation',
    next: 'Next,',
    partialInstallation:
      'Here are partial installation steps based on the plugins and components you have selected.',
    renderEditor: 'Finally, render the editor',
    section: 'section.',
    startFromAIEditor: 'Start from AI Editor',
    startFromBasicEditor: 'Start from Basic Editor',
    thenAddComponents: '. Then, add the components you have selected:',
    useCommand:
      'Use the following command to add the AI editor to your project:',
  },
};

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
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const checkedPlugins = useStoreValue(SettingsStore, 'checkedPlugins');
  const checkedComponents = useStoreValue(SettingsStore, 'checkedComponents');
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
      } } from '@udecode/plate/react';`,
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

  const hasPlaceholder = components.some((comp) => comp.id === 'placeholder');

  const usageCode = [
    'const editor = usePlateEditor({',
    '  plugins: [',
    pluginsCode.join('\n'),
    '  ],',
    '  override: {',
    `    components: ${hasPlaceholder ? 'withPlaceholders(' : ''}({`,
    ...componentsWithPluginKey.map(
      ({ pluginKey, usage }) => `      [${pluginKey}]: ${usage},`
    ),
    `    })${hasPlaceholder ? ')' : ''},`,
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
      <H2>{content.installation}</H2>

      <Typography.P>
        {content.gettingStartedGuide}{' '}
        <Link href="/docs/getting-started" target="_blank">
          {content.gettingStarted}
        </Link>{' '}
        {content.section}
      </Typography.P>

      <Steps>
        <Step>{content.install}</Step>
        <RadioGroup
          value={radioValue}
          onValueChange={(value) => {
            setRadioValue(value);
            setIsManual(value === 'manual');
          }}
        >
          <div className="mt-4 flex items-center space-x-2">
            <RadioGroupItem id="r1" value="editor-basic" />
            <Label htmlFor="r1">{content.startFromBasicEditor}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="r2" value="editor-ai" />
            <Label htmlFor="r2">{content.startFromAIEditor}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="r3" value="manual" />
            <Label htmlFor="r3">{content.manualInstallation}</Label>
          </div>
        </RadioGroup>
        {isManual ? (
          <div>
            <InstallationCode
              code={[
                `npm install react react-dom`,
                `npm install @udecode/plate`,
              ].join('\n')}
              bash
            >
              {content.installPeerDeps}
            </InstallationCode>
            {someComponents && (
              <p className="mt-4">
                {content.next}{' '}
                <Link href="/docs/components/installation" target="_blank">
                  {content.installPlateUI}
                </Link>
                .
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <Typography.P>{content.useCommand}</Typography.P>
            <InstallationCode
              code={`npx shadcx@latest add plate/editor-${
                radioValue === 'editor-ai' ? 'ai' : 'basic'
              }`}
              bash
            ></InstallationCode>
            <Typography.P className="mt-4">
              {content.addEditorPage}
            </Typography.P>
          </div>
        )}
        {isManual && somePlugins && (
          <>
            <Step>{content.installPlugins}</Step>
            <InstallationCode code={installCommands.plugins} bash>
              {content.installSelectedPlugins}
            </InstallationCode>
          </>
        )}
        {isManual && someComponents && (
          <>
            <Step>{content.addComponents}</Step>
            <InstallationCode code={installCommands.components} bash>
              <Link href="/docs/components/installation" target="_blank">
                {content.installDepsForComponents}
              </Link>{' '}
              {content.and}{' '}
              <Link href="/docs/components/cli" target="_blank">
                {content.configureCLI}
              </Link>
              . {content.thenAddComponents}
            </InstallationCode>
          </>
        )}

        {(isManual || radioValue === 'editor-basic') && (
          <>
            <Step>{content.imports}</Step>
            <InstallationCode code={importsCode}>
              {content.partialInstallation}
              <br />
              {content.forReliableSetup}
              <Link href="/docs/components/installation" target="_blank">
                {content.cliBased}
              </Link>
              .
              <br />
              {content.allImports}
            </InstallationCode>
            <Step>{content.createPlugins}</Step>
            <InstallationCode code={usageCode}>
              {content.createPluginsDesc}
            </InstallationCode>

            {radioValue === 'editor-basic' && (
              <>
                <Step>{content.renderEditor}</Step>
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
                  {content.fullCode}
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
