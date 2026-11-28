'use client';

import { ArrowRightIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import type { RegistryItem } from 'shadcn/schema';

import { BlockViewer } from '@/components/block-viewer';
import { PlaygroundPreview } from '@/components/playground-preview';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import type { PlaygroundPreviewData } from '@/lib/playground-preview-data';
import { cn } from '@/lib/utils';

type ShowcaseTab = 'overview' | 'playground' | 'potion';

const LazyHomeSink = dynamic(
  () => import('./home-sink').then((mod) => mod.HomeSink),
  {
    loading: () => (
      <div
        aria-hidden
        className="mx-auto h-[1360px] max-w-[1520px] rounded-xl border bg-card/50"
      />
    ),
    ssr: false,
  }
);

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_MEDIA_QUERY);

  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function getDesktopServerSnapshot() {
  return false;
}

const COPY = {
  cn: {
    browseMoreEditors: '浏览更多编辑器',
    customizeInCreate: '自定义主题',
    customizeYourEditor: '在 Create 中自定义编辑器',
    overview: '概览',
    playground: '演示',
    potion: 'Potion',
    potionDescription: '一个类似 Notion 的 AI 模板。',
  },
  en: {
    browseMoreEditors: 'Browse more editors',
    customizeInCreate: 'Customize in Create',
    customizeYourEditor: 'Customize your editor',
    overview: 'Overview',
    playground: 'Playground',
    potion: 'Potion',
    potionDescription: 'A Notion-like AI template.',
  },
} as const;

export function HomeShowcase({
  locale = 'en',
  playgroundPreviewData,
}: {
  locale?: 'cn' | 'en';
  playgroundPreviewData: PlaygroundPreviewData | null;
}) {
  const [tab, setTab] = React.useState<ShowcaseTab>('overview');
  const isDesktop = React.useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );
  const copy = COPY[locale];

  const potionBlock = React.useMemo<RegistryItem>(
    () => ({
      description: copy.potionDescription,
      meta: {
        descriptionSrc: siteConfig.links.potionTemplate,
        iframeHeight: 800,
        isPro: true,
        src: siteConfig.links.potionIframe,
      },
      name: 'potion',
      type: 'registry:block',
    }),
    [copy.potionDescription]
  );

  const tabs: ReadonlyArray<{ id: ShowcaseTab; label: string }> = [
    { id: 'overview', label: copy.overview },
    { id: 'playground', label: copy.playground },
    { id: 'potion', label: copy.potion },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="container-wrapper border-b border-border/60 bg-background">
        <div className="container flex max-w-[1600px] items-center justify-between gap-2 px-4 py-2 md:px-6">
          <div
            aria-label="Homepage showcase"
            className="flex items-center gap-1"
            role="tablist"
          >
            {tabs.map((item) => {
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  aria-selected={active}
                  className={cn(
                    'flex h-7 cursor-pointer items-center justify-center rounded-full px-3.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  data-active={active ? 'true' : undefined}
                  onClick={() => setTab(item.id)}
                  role="tab"
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <Link
            className="hidden items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            href="/create"
          >
            {copy.customizeInCreate}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>

      {tab === 'overview' && (
        <div
          className="theme-neutral relative container-wrapper flex-1 overflow-hidden bg-muted p-0 dark:bg-background"
          data-home-preview
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-96 bg-linear-to-b from-background via-muted to-transparent dark:hidden" />

          <section className="relative z-10 -mx-4 w-[140vw] overflow-hidden pt-4 md:hidden">
            <Image
              alt="Plate editor component overview"
              className="block h-auto w-full dark:hidden"
              height={2600}
              src="/images/home-sink-light.png"
              width={2912}
            />
            <Image
              alt="Plate editor component overview"
              className="hidden h-auto w-full dark:block"
              height={2600}
              src="/images/home-sink-dark.png"
              width={2912}
            />
          </section>

          <section className="relative z-10 hidden p-6 pb-24 md:block lg:p-8 lg:pb-28">
            {isDesktop ? (
              <LazyHomeSink />
            ) : (
              <div
                aria-hidden
                className="mx-auto h-[1360px] max-w-[1520px] rounded-xl border bg-card/50"
              />
            )}
          </section>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-44 items-end justify-center bg-linear-to-t from-background via-muted/85 to-transparent pb-8 lg:h-52 dark:via-background/85">
            <Button
              asChild
              className="pointer-events-auto rounded-full shadow-md"
              size="sm"
            >
              <Link href="/create">
                {copy.customizeYourEditor}
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {tab === 'playground' && (
        <div
          className="relative container-wrapper flex-1 bg-muted/40 py-6 pb-16 dark:bg-background"
          data-home-preview
        >
          <div className="container max-w-screen-2xl px-2 md:px-6">
            {playgroundPreviewData && (
              <PlaygroundPreview {...playgroundPreviewData} />
            )}
          </div>
        </div>
      )}

      {tab === 'potion' && (
        <div
          className="relative container-wrapper flex-1 bg-muted/40 py-6 pb-16 dark:bg-background"
          data-home-preview
        >
          <div className="container max-w-screen-2xl px-2 md:px-6">
            <BlockViewer
              dependencies={[]}
              highlightedFiles={[]}
              item={potionBlock}
              tree={[]}
            />
            <div className="flex justify-center pt-6">
              <Button asChild variant="outline">
                <Link href="/editors">{copy.browseMoreEditors}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
