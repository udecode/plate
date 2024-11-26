'use client';

import * as React from 'react';

import type { RegistryEntry } from '@/registry/schema';

import { BlockCode } from '@/components/block-viewer';
import { ComponentPreviewPro } from '@/components/component-preview-pro';
import { getRegistryTitle } from '@/lib/registry-utils';

import { CodeBlock } from './codeblock';
import { ComponentPreview } from './component-preview';
import { H2, H3, Step, Steps } from './typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentInstallationProps {
  __dependencies__?: string;
  __highlightedFiles__?: string;
  __item__?: string;
  __previewDependencies__?: string;
  __previewFiles__?: string;
  __tree__?: string;
  dependencies?: string[];
  examples?: RegistryEntry[];
  highlightedFiles?: any;
  inline?: boolean;
  item?: any;
  name?: string;
  tree?: any;
  usage?: string[];
}

export function ComponentInstallation({
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
    props.dependencies ?? JSON.parse(__registryDependencies__) ?? [];

  const item = React.useMemo(
    () => props.item ?? JSON.parse(__itemProp__),
    [__itemProp__, props.item]
  );
  const highlightedFiles = React.useMemo(
    () => props.highlightedFiles ?? JSON.parse(__highlightedFilesProp__),
    [__highlightedFilesProp__, props.highlightedFiles]
  );
  const tree = React.useMemo(
    () => props.tree ?? JSON.parse(__treeProp__),
    [__treeProp__, props.tree]
  );

  const dependenciesString = dependencies.join(' ');

  return (
    <div className="my-4">
      {!inline && <H2>Installation</H2>}

      <Tabs className="relative mt-6 w-full" defaultValue="cli">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="cli"
          >
            CLI
          </TabsTrigger>
          <TabsTrigger
            className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            value="manual"
          >
            Manual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cli">
          <CodeBlock
            className="mb-4 mt-6"
            value={`npx shadcx@latest add plate/${name}`}
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

            <BlockCode
              dependencies={dependencies}
              highlightedFiles={highlightedFiles}
              item={item}
              tree={tree}
            />

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
                      description={example.doc?.description}
                    />
                  </React.Fragment>
                );
              }

              return (
                <React.Fragment key={example.name}>
                  <H3>{getRegistryTitle(example as any)}</H3>

                  <ComponentPreview
                    id={example.name.replace('-demo', '')}
                    name={example.name}
                    dependencies={example.dependencies}
                    highlightedFiles={(example as any).highlightedFiles}
                    item={(example as any).item}
                    tree={(example as any).tree}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
