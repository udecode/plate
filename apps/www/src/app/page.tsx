import * as React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { BlockPreview } from '@/components/block-preview';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { ThemesButton } from '@/components/themes-button';
import { siteConfig } from '@/config/site';
import { Button } from '@/registry/default/plate-ui/button';

import { AnnouncementButton } from './announcement-button';

import '../../public/r/themes.css';

const HomeTabs = dynamic(() => import('./_components/home-tabs'));
const CustomizerDrawer = dynamic(
  () => import('@/components/customizer-drawer')
);

export default function IndexPage() {
  return (
    <div className="container relative">
      <div className="flex items-center justify-between">
        <PageHeader className="w-full pb-8">
          <AnnouncementButton />

          <div className="flex w-full items-center justify-between">
            <PageHeaderHeading>Build your rich-text editor</PageHeaderHeading>
            <ThemesButton />
          </div>
          <PageHeaderDescription>
            Framework · Plugins · Components
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

      <section className="relative">
        <HomeTabs />

        <CustomizerDrawer />
      </section>

      <div className="relative mt-12 scroll-m-20 md:mt-24 lg:mt-48 ">
        <BlockPreview
          block={{
            description: 'A Notion-like AI template',
            name: 'potion',
            src: 'https://potion.platejs.org/ai-menu/?iframe-blank=true',
          }}
        />
      </div>
    </div>
  );
}
