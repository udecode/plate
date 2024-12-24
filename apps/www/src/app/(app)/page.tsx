import * as React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import HomeTabs from '@/app/(app)/_components/home-tabs';
import { BlockDisplay } from '@/components/block-display';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { SiteFooter } from '@/components/site-footer';
import { ThemesButton } from '@/components/themes-button';
import { siteConfig } from '@/config/site';
import { Button } from '@/registry/default/plate-ui/button';

import { AnnouncementButton } from './_components/announcement-button';

import '../../../public/r/themes.css';

const CustomizerDrawer = dynamic(
  () => import('@/components/customizer-drawer')
);

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

export type SearchParams = Promise<{
  locale: string;
}>;

export default async function IndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = ((await searchParams).locale || 'en') as keyof typeof i18n;
  const content = i18n[locale];

  const block = {
    description: content.potionDescription,
    descriptionSrc: siteConfig.links.potionTemplate,
    isPro: true,
    meta: {
      iframeHeight: 800,
    },
    name: 'potion',
    src: siteConfig.links.potionIframe,
  };

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
              <Button asChild size="xs">
                <Link href="/docs">{content.getStarted}</Link>
              </Button>
              <Button asChild size="xs" variant="ghost">
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
            <React.Suspense fallback={null}>
              <HomeTabs />
            </React.Suspense>

            <CustomizerDrawer />
          </section>

          <div className="relative mt-12 scroll-m-16 pb-48 md:mt-24 lg:mt-36 ">
            <BlockDisplay {...block} />
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
