'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';

import { Index } from '@/__registry__';
import { useConfig } from '@/hooks/use-config';
import { useMounted } from '@/registry/default/hooks/use-mounted';
import { styles } from '@/registry/registry-styles';

import { ComponentInstallation } from './component-installation';
import { CopyButton } from './copy-button';
import { Icons } from './icons';
import { StyleSwitcher } from './style-switcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  __dependencies__?: any;
  __files__?: any;
  align?: 'center' | 'end' | 'start';
  codeTabs?: boolean;
  dependencies?: any;
  description?: string;
  extractClassname?: boolean;
  extractedClassNames?: string;
  files?: any;
  hideCode?: boolean;
  padding?: 'md';
  type?: 'block' | 'component' | 'example';
}

export function ComponentPreview({
  __dependencies__,
  __files__,
  align = 'start',
  children,
  className,
  codeTabs = true,
  dependencies,
  description,
  extractClassname,
  extractedClassNames,
  files,
  hideCode = false,
  name,
  padding,
  type,
  ...props
}: ComponentPreviewProps) {
  const [config] = useConfig();
  const index = styles.findIndex((style) => style.name === config.style);
  const [activeTab, setActiveTab] = React.useState<'code' | 'preview'>(
    'preview'
  );
  const [isCodeLoaded, setIsCodeLoaded] = React.useState(false);

  const Codes = React.Children.toArray(children) as React.ReactElement[];
  const Code = Codes[index];
  const Children = (children as any)?.[0];

  const Preview = React.useMemo(() => {
    const Component = Index[config.style][name]?.component;

    if (!Component) {
      return (
        <p className="text-sm text-muted-foreground">
          Component{' '}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{' '}
          not found in registry.
        </p>
      );
    }

    // DIFF
    return <Component {...props} id={props.id ?? name.replace('-demo', '')} />;
  }, [config.style, name, props]);

  const codeString = React.useMemo(() => {
    if (Code?.props['data-rehype-pretty-code-fragment'] !== undefined) {
      const [Button] = React.Children.toArray(
        Code.props.children
      ) as React.ReactElement[];

      return Button?.props?.value || Button?.props?.__rawString__ || null;
    }
  }, [Code]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'code' | 'preview');

    if (value === 'code' && !isCodeLoaded) {
      // Delay loading of code content
      setTimeout(() => setIsCodeLoaded(true), 0);
    }
    if (value === 'preview') {
      setIsCodeLoaded(false);
    }
  };

  const mounted = useMounted();

  const loadingPreview = (
    <div className="preview flex min-h-[350px] w-full items-center justify-center p-0 text-sm text-muted-foreground">
      <Icons.spinner className="mr-2 size-4 animate-spin" />
      Loading...
    </div>
  );

  return (
    <div
      className={cn('relative my-4 flex flex-col space-y-2', className)}
      {...props}
    >
      <Tabs
        className="relative mr-auto w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <div className="flex items-center justify-between pb-3">
          {!hideCode && (
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                value="preview"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                value="code"
              >
                Code
              </TabsTrigger>
            </TabsList>
          )}
        </div>
        <TabsContent className="relative rounded-md border" value="preview">
          {styles.length > 1 && (
            <div className="flex items-center justify-between p-4">
              <StyleSwitcher />

              <div className="flex items-center gap-2">
                {/* {config.style === "default" && description ? ( */}
                {/*  <V0Button */}
                {/*    block={{ */}
                {/*      code: codeString, */}
                {/*      name, */}
                {/*      style: config.style, */}
                {/*      description, */}
                {/*    }} */}
                {/*  /> */}
                {/* ) : null} */}
                <CopyButton
                  variant="outline"
                  className="size-7 text-foreground opacity-100 hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
                  value={codeString}
                />
              </div>
            </div>
          )}
          <React.Suspense fallback={loadingPreview}>
            {mounted ? (
              <div
                className={cn(
                  'preview relative flex size-full min-h-[350px] flex-col p-0',
                  padding === 'md' && 'p-4',
                  {
                    'items-center': align === 'center',
                    'items-end': align === 'end',
                    'items-start': align === 'start',
                  }
                )}
              >
                <div className="size-full grow">{Preview}</div>
              </div>
            ) : (
              loadingPreview
            )}
          </React.Suspense>
        </TabsContent>
        <TabsContent value="code">
          {isCodeLoaded ? (
            <div className="flex flex-col space-y-4">
              <div className="w-full rounded-md [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto">
                {Children ?? Code}

                <ComponentInstallation
                  __dependencies__={__dependencies__}
                  __files__={__files__}
                  codeTabs={codeTabs}
                  dependencies={dependencies}
                  files={files}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              <p>Loading code...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
