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
import { siteConfig } from '@/config/site';

import { AnnouncementButton } from './_components/announcement-button';
import { PotionLazyBlock } from './_components/potion-lazy-block';

const i18n = {
  cn: {
    buildYourRichTextEditor: '构建你的富文本编辑器',
    description: '框架 · 插件 · 组件',
    getStarted: '开始使用',
    github: 'GitHub',
    potionDescription: '一个类似 Notion 的 AI 模板。',
  },
  en: {
    buildYourRichTextEditor: 'Build your rich-text editor',
    description: 'Framework · Plugins · Components',
    getStarted: 'Get Started',
    github: 'GitHub',
    potionDescription: 'A Notion-like AI template.',
  },
};

const title = 'Build your rich-text editor';
const description =
  'A set of beautifully-designed, customizable plugins and components to help you build your rich-text editor. Open Source.';

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

// SYNC

export default async function IndexPage() {
  const content = i18n.en;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader>
        <AnnouncementButton />

        <PageHeaderHeading>{content.buildYourRichTextEditor}</PageHeaderHeading>
        <PageHeaderDescription>{content.description}</PageHeaderDescription>
        <PageActions>
          <Button asChild size="sm" className="h-[31px] rounded-lg text-xs">
            <Link href="/docs">{content.getStarted}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="rounded-lg text-xs"
          >
            <Link
              href={siteConfig.links.github}
              rel="noreferrer"
              target="_blank"
            >
              {content.github}
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <div className="container py-6">
        <section className="relative">
          <PlaygroundPreview />
        </section>

        <div className="relative mt-12 scroll-m-16 pb-48 md:mt-24 lg:mt-36">
          <PotionLazyBlock />
        </div>
      </div>
    </div>
  );
}
