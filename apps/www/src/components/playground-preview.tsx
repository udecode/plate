'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import type { PlaygroundPreviewData } from '@/lib/playground-preview-data';

import {
  Check,
  Fullscreen,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  Terminal,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useLocale } from '@/hooks/useLocale';
import {
  getRegistryClipboardInstallCommand,
  getRegistryInstallCommand,
} from '@/lib/registry-install';
import { cn } from '@/lib/utils';

import {
  BlockViewerCodeSlot,
  BlockViewerProvider,
  useBlockViewer,
} from './block-viewer';

const HOME_PREVIEW_HEIGHT = 780;
const HOME_PREVIEW_WIDTHS = {
  '30': '30%',
  '60': '60%',
  '100': '100%',
};

const LazyPlaygroundDemo = dynamic(
  () => import('@/registry/examples/playground-demo'),
  {
    loading: () => (
      <div
        aria-hidden
        className="pointer-events-none size-full select-none bg-background"
        data-home-playground-placeholder
      />
    ),
    ssr: false,
  }
);

const i18n = {
  cn: {
    description: 'AI 编辑器',
  },
  en: {
    description: 'An AI editor',
  },
};

function HomePlaygroundToolbar({
  previewWidth,
  setPreviewWidth,
}: {
  previewWidth: keyof typeof HOME_PREVIEW_WIDTHS;
  setPreviewWidth: (value: keyof typeof HOME_PREVIEW_WIDTHS) => void;
}) {
  const { item, setIframeKey, setView, view } = useBlockViewer();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const installCommand = getRegistryInstallCommand(item.name);
  const clipboardInstallCommand = getRegistryClipboardInstallCommand(item.name);
  const previewUrl = `/view/${item.name}`;

  return (
    <div className="flex w-full items-center gap-2 px-2">
      <Tabs
        className="hidden sm:flex"
        value={view}
        onValueChange={(value) => setView(value as 'code' | 'preview')}
      >
        <TabsList className="grid h-8! grid-cols-2 items-center rounded-lg p-1 *:data-[slot=tabs-trigger]:h-6 *:data-[slot=tabs-trigger]:rounded-sm *:data-[slot=tabs-trigger]:px-2 *:data-[slot=tabs-trigger]:text-xs">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator orientation="vertical" className="mx-2 hidden h-4! sm:flex" />

      <Link
        className="font-medium text-sm underline-offset-2 hover:underline"
        href={previewUrl}
        target="_blank"
      >
        {item.description}
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden h-8 items-center gap-1.5 rounded-md border p-[3px] shadow-none lg:flex">
          <ToggleGroup
            className="gap-1 *:data-[slot=toggle-group-item]:size-6! *:data-[slot=toggle-group-item]:rounded-sm!"
            value={previewWidth}
            onValueChange={(value) => {
              if (!value) return;

              setView('preview');
              setPreviewWidth(value as keyof typeof HOME_PREVIEW_WIDTHS);
            }}
            type="single"
          >
            <ToggleGroupItem value="100" title="Desktop">
              <Monitor />
            </ToggleGroupItem>
            <ToggleGroupItem value="60" title="Tablet">
              <Tablet />
            </ToggleGroupItem>
            <ToggleGroupItem value="30" title="Mobile">
              <Smartphone />
            </ToggleGroupItem>
            <Separator orientation="vertical" className="h-4!" />
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="size-6 rounded-sm p-0"
              title="Open in New Tab"
            >
              <Link href={previewUrl} target="_blank">
                <span className="sr-only">Open in New Tab</span>
                <Fullscreen />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4!" />
            <Button
              size="icon"
              variant="ghost"
              className="size-6 rounded-sm p-0"
              title="Refresh Preview"
              onClick={() => setIframeKey((key) => key + 1)}
            >
              <RotateCw />
              <span className="sr-only">Refresh Preview</span>
            </Button>
          </ToggleGroup>
        </div>

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-4! lg:flex"
        />

        <Button
          size="sm"
          variant="outline"
          className="w-fit gap-1 px-2 shadow-none"
          onClick={() => {
            copyToClipboard(clipboardInstallCommand);
          }}
        >
          {isCopied ? <Check /> : <Terminal />}
          <span className="hidden lg:inline">{installCommand}</span>
        </Button>
      </div>
    </div>
  );
}

function HomePlaygroundView({
  previewWidth,
}: {
  previewWidth: keyof typeof HOME_PREVIEW_WIDTHS;
}) {
  const { iframeKey, view } = useBlockViewer();

  if (view !== 'preview') {
    return null;
  }

  return (
    <div className="h-(--height)">
      <div className="relative size-full overflow-hidden rounded-lg border bg-background md:rounded-xl">
        <div
          key={iframeKey}
          className="themes-wrapper chunk-mode relative z-20 size-full bg-background transition-[width] duration-300 ease-out"
          style={{ width: HOME_PREVIEW_WIDTHS[previewWidth] }}
        >
          <LazyPlaygroundDemo className="h-full" />
        </div>
      </div>
    </div>
  );
}

export function PlaygroundPreview({
  className,
  dependencies,
  highlightedFiles,
  item,
  tree,
}: ComponentProps<'div'> & PlaygroundPreviewData) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const [previewWidth, setPreviewWidth] =
    React.useState<keyof typeof HOME_PREVIEW_WIDTHS>('100');
  const previewItem = React.useMemo(
    () => ({
      ...item,
      description: content.description,
      meta: {
        ...item.meta,
        iframeHeight: HOME_PREVIEW_HEIGHT,
      },
    }),
    [content.description, item]
  );

  return (
    <div className={cn('relative', className)}>
      <BlockViewerProvider
        dependencies={dependencies}
        highlightedFiles={highlightedFiles as any}
        item={previewItem as any}
        tree={tree}
      >
        <HomePlaygroundToolbar
          previewWidth={previewWidth}
          setPreviewWidth={setPreviewWidth}
        />
        <HomePlaygroundView previewWidth={previewWidth} />
        <BlockViewerCodeSlot />
      </BlockViewerProvider>
    </div>
  );
}
