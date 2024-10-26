'use client';

import * as React from 'react';

import { getRegistryTitle } from '@/lib/registry-utils';

import { CodeBlock } from './codeblock';
import { ComponentPreview } from './component-preview';
import { ComponentSource } from './component-source';
import { H2, H3, Step, Steps } from './typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentInstallationProps {
  __dependencies__?: string;
  __files__?: string;
  __previewDependencies__?: string;
  __previewFiles__?: string;
  codeTabs?: boolean;
  dependencies?: string[];
  examples?: any[];
  files?: any[];
  name?: string;
  usage?: string[];
}

export function ComponentInstallation({
  __dependencies__: __registryDependencies__ = '[]',
  __files__ = '[]',
  __previewDependencies__ = '[]',
  __previewFiles__ = '[]',
  codeTabs,
  examples,
  name,
  usage,
  ...props
}: ComponentInstallationProps) {
  const files = React.useMemo(
    () => props.files ?? JSON.parse(__files__) ?? [],
    [__files__, props.files]
  );
  const registryDependencies =
    props.dependencies ?? JSON.parse(__registryDependencies__) ?? [];

  // const previewDependencies =
  //   props.previewDependencies ?? JSON.parse(__previewDependencies__) ?? [];
  // const previewFiles = props.previewFiles ?? JSON.parse(__previewFiles__) ?? [];

  const filesByCategory = React.useMemo(
    () =>
      files.reduce(
        (acc: any, file: any) => {
          acc[file.type] = [...(acc[file.type] || []), file];

          return acc;
        },
        {} as Record<string, typeof files>
      ),
    [files]
  );

  const categories = Object.keys(filesByCategory);
  const showTabs = categories.length >= 2;

  const dependenciesString = registryDependencies.join(' ');

  if (files.length === 0 && !dependenciesString) return null;

  const renderFiles = (files: any[]) => (
    <>
      {files.map((file: any) => (
        <ComponentSource key={file.name} title={file.name}>
          <CodeBlock
            className="[&_.codeblock]:!pb-[100px]"
            value={file.code}
            language={file.language}
          />
        </ComponentSource>
      ))}
    </>
  );

  if (codeTabs) {
    return (
      <Tabs className="relative w-full" defaultValue={files[0].name}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          {files.map((file: any) => (
            <TabsTrigger
              key={file.name}
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              value={file.name}
            >
              {file.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {files.map((file: any) => (
          <TabsContent key={file.name} value={file.name}>
            <CodeBlock
              className="[&_.codeblock]:!pb-[100px]"
              value={file.code}
              language={file.language}
              fixedHeight
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  return (
    <div className="my-4">
      <H2>Installation</H2>

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
            value={`npx shadcx@latest add ${name} -r plate`}
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

            {showTabs ? (
              <Tabs className="relative w-full" defaultValue={categories[0]}>
                <TabsList className="w-full justify-start gap-3 rounded-none bg-transparent p-0">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      className="relative h-8 rounded-md bg-transparent px-4 font-semibold text-muted-foreground shadow-none transition-none hover:bg-muted/70 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                      value={category}
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    {renderFiles(filesByCategory[category])}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              renderFiles(files)
            )}

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
            {examples.map((example) => (
              <React.Fragment key={example.name}>
                <H3>{getRegistryTitle(example)}</H3>
                <ComponentPreview
                  name={example.name}
                  dependencies={example.dependencies}
                  files={example.files}
                  codeTabs
                />
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
