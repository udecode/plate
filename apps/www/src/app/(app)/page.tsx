import * as React from 'react';

import type { Metadata } from 'next';

import Link from 'next/link';

import CustomizerDrawer from '@/components/customizer-drawer';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { PlaygroundPreview } from '@/components/playground-preview';
import { SiteFooter } from '@/components/site-footer';
import { ThemesButton } from '@/components/themes-button';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

import { AnnouncementButton } from './_components/announcement-button';
import { PotionLazyBlock } from './_components/potion-lazy-block';

const i18n = {
  cn: {
    buildYourRichTextEditor: '构建你的富文本编辑器',
    description: '框架 · 插件 · 组件 · 主题',
    getStarted: '开始使用',
    github: 'GitHub',
    potionDescription: '一个类似 Notion 的 AI 模板。',
  },
  en: {
    buildYourRichTextEditor: 'Build your rich-text editor',
    description: 'Framework · Plugins · Components · Themes',
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
    <>
      <div className="relative">
        <div className="flex items-center justify-between">
          <PageHeader className="w-full pb-8">
            <AnnouncementButton />

            <div className="flex w-full items-center justify-between">
              <PageHeaderHeading>
                {content.buildYourRichTextEditor}
              </PageHeaderHeading>
              <ThemesButton />
            </div>
            <PageHeaderDescription>{content.description}</PageHeaderDescription>
            <section className="flex w-full items-center space-x-2 py-2">
              <Button asChild size="sm" className="rounded-md text-xs">
                <Link href="/docs">{content.getStarted}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="rounded-md text-xs"
              >
                <Link
                  href={siteConfig.links.github}
                  rel="noreferrer"
                  target="_blank"
                >
                  {content.github}
                </Link>
              </Button>
            </section>
          </PageHeader>
        </div>

        <div className="container py-6">
          <section className="relative">
            <PlaygroundPreview />

            <CustomizerDrawer />
          </section>

          <div className="relative mt-12 scroll-m-16 pb-48 md:mt-24 lg:mt-36">
            <PotionLazyBlock />
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
