import * as React from 'react';

import type { Metadata } from 'next';

import Link from 'next/link';

import {
  PageHeader,
  PageActions,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { PlaygroundPreview } from '@/components/playground-preview';
import { Button } from '@/components/ui/button';

import { AnnouncementButton } from '../(app)/_components/announcement-button';
import { PotionLazyBlock } from '../(app)/_components/potion-lazy-block';

const content = {
  buildYourRichTextEditor: '构建你的富文本编辑器',
  description: '框架 · 插件 · 组件',
  getStarted: '开始使用',
  potionDescription: '一个类似 Notion 的 AI 模板。',
};

const title = '构建你的富文本编辑器';
const description =
  '一套精心设计的、可定制的插件和组件，帮助您构建富文本编辑器。开源免费。';

export const metadata: Metadata = {
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  title,
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export const dynamic = 'force-static';

export default async function CNIndexPage() {
  return (
    <div className="flex flex-1 flex-col" data-home-page>
      <PageHeader className="md:**:[.container]:pb-8 lg:**:[.container]:pb-12">
        <AnnouncementButton />

        <PageHeaderHeading className="max-w-4xl text-balance font-semibold text-primary xl:text-5xl">
          {content.buildYourRichTextEditor}
        </PageHeaderHeading>
        <PageHeaderDescription className="max-w-4xl font-normal text-base sm:text-lg">
          {content.description}
        </PageHeaderDescription>
        <PageActions className="justify-center **:data-[slot=button]:shadow-none">
          <Button asChild size="sm" className="h-[31px] rounded-lg text-xs">
            <Link href="/cn/docs">{content.getStarted}</Link>
          </Button>
        </PageActions>
      </PageHeader>

      <div className="container-wrapper relative flex-1 overflow-hidden bg-muted pb-6 md:px-0 dark:bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-120 bg-linear-to-b from-background via-muted to-transparent dark:hidden" />
        <div className="container relative z-10 max-w-screen-2xl overflow-hidden md:px-0">
          <section
            className="theme-neutral relative overflow-hidden p-2 pb-0 md:p-6 md:pb-0"
            data-home-preview
          >
            <div className="relative z-10">
              <PlaygroundPreview />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-linear-to-t from-muted via-muted/80 to-transparent lg:h-80 xl:h-64 dark:from-background dark:via-background/80" />
          </section>

          <div className="relative mt-12 scroll-m-16 px-2 pb-48 md:mt-24 md:px-6 lg:mt-36">
            <PotionLazyBlock />
          </div>
        </div>
      </div>
    </div>
  );
}
