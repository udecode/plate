import * as React from 'react';

import type { RegistryItem } from 'shadcn/registry';

import { ComponentPreviewPro } from '@/components/component-preview-pro';
import { siteConfig } from '@/config/site';
import { getCachedRegistryItem } from '@/lib/registry-cache';
import { getRegistryTitle } from '@/lib/registry-utils';
import { getAllDependencies } from '@/lib/rehype-utils';

import { BlockDisplay } from './block-display';
import { CodeBlock } from './codeblock';
import { ComponentPreview } from './component-preview';
import { H2, H3, Step, Steps } from './typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentInstallationProps {
  name: string;
  __dependencies__?: string;
  __highlightedFiles__?: string;
  __item__?: string;
  __previewDependencies__?: string;
  __previewFiles__?: string;
  __tree__?: string;
  dependencies?: string[];
  examples?: RegistryItem[];
  highlightedFiles?: any;
  inline?: boolean;
  item?: any;
  tree?: any;
  usage?: string[];
}

export async function ComponentInstallation({
  __dependencies__: __registryDependencies__ = '[]',
  __highlightedFiles__: __highlightedFilesProp__ = '[]',
  __item__: __itemProp__ = '[]',
  __previewDependencies__ = '[]',
  __previewFiles__ = '[]',
  __tree__: __treeProp__ = '[]',
  examples,
  inline,
  name,
  usage,
  ...props
}: ComponentInstallationProps) {
  const dependencies =
    props.dependencies ?? getAllDependencies(name) ?? JSON.parse(__registryDependencies__);


  const item =
    props.item ?? await getCachedRegistryItem(name, true) ?? JSON.parse(__itemProp__)


  const dependenciesString = dependencies.join(' ');

  return (
    <div className="mt-4 mb-12">
      {!inline && <H2>Installation</H2>}

      <Tabs className="relative mt-6 w-full" defaultValue="cli">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            className="relative h-9 flex-none rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="cli"
          >
            CLI
          </TabsTrigger>
          <TabsTrigger
            className="relative h-9 flex-none rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="manual"
          >
            Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cli">
          <CodeBlock
            className="mt-6 mb-4"
            value={`npx shadcn@latest add ${siteConfig.registryUrl}${name}`}
            language="bash"
          />
        </TabsContent>
        <TabsContent value="manual">
          <Steps>
            {dependenciesString && (
              <>
                <Step>Install the following dependencies:</Step>
                <CodeBlock value={dependenciesString} language="bash" npm />
              </>
            )}
            <Step>Copy and paste the following code into your project.</Step>


            <BlockDisplay name={name} item={item} codeOnly />

            <Step>Update the import paths to match your project setup.</Step>
          </Steps>
        </TabsContent>
      </Tabs>

      {usage?.length && (
        <>
          <H2>Usage</H2>

          {usage.map((value, index) => (
            <CodeBlock key={index} value={value} language="tsx" />
          ))}
        </>
      )}

      {!!examples?.length && (
        <>
          <H2>Examples</H2>

          <div className="mb-12">
            {examples.map((example) => {
              const isPro = example.name.endsWith('-pro');

              if (isPro) {
                return (
                  <React.Fragment key={example.name}>
                    <H3>Plate Plus</H3>

                    <ComponentPreviewPro
                      id={example.name.replace('-pro', '')}
                      description={example.description}
                    />
                  </React.Fragment>
                );
              }

              return (
                <ComponentPreview
                  // id={example.name.replace('-demo', '')}
                  name={example.name}
                  key={example.name}
                  // dependencies={example.dependencies}
                  // highlightedFiles={(example as any).highlightedFiles}
                  item={{
                    ...(example as any).item,
                    description: getRegistryTitle(example as any),
                  }}
                // tree={(example as any).tree}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
