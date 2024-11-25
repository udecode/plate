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

const block = {
  description: 'A Notion-like AI template.',
  descriptionSrc: siteConfig.links.potionTemplate,
  isPro: true,
  meta: {
    iframeHeight: 800,
  },
  name: 'potion',
  src: siteConfig.links.potionIframe,
};

export default function IndexPage() {
  return (
    <>
      <div className="relative">
        <div className="flex items-center justify-between">
          <PageHeader className="w-full pb-8">
            <AnnouncementButton />

            <div className="flex w-full items-center justify-between">
              <PageHeaderHeading>Build your rich-text editor</PageHeaderHeading>
              <ThemesButton />
            </div>
            <PageHeaderDescription>
              Framework · Plugins · Components · Themes
            </PageHeaderDescription>
            <section className="flex w-full items-center space-x-2 py-2">
              <Button asChild size="xs">
                <Link href="/docs">Get Started</Link>
              </Button>
              <Button asChild size="xs" variant="ghost">
                <Link
                  href={siteConfig.links.github}
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub
                </Link>
              </Button>
            </section>
          </PageHeader>
        </div>

        <div className="container py-6">
          <section className="relative">
            <HomeTabs />

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
