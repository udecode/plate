import dynamic from 'next/dynamic';
import Link from 'next/link';

import { ThemesButton } from '@/components/themes-button';

import { AnnouncementButton } from './announcement-button';

import '../../public/registry/themes.css';

import * as React from 'react';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { ThemeWrapper } from '@/components/theme-wrapper';
import { buttonVariants } from '@/registry/default/plate-ui/button';

const HomeTabs = dynamic(() => import('./_components/home-tabs'));
const CustomizerDrawer = dynamic(
  () => import('@/components/customizer-drawer')
);

export default function IndexPage() {
  return (
    <ThemeWrapper defaultTheme="slate">
      <div className="container relative">
        <div className="flex items-center justify-between">
          <PageHeader className="w-full pb-8">
            <AnnouncementButton />

            <div className="flex w-full items-center justify-between">
              <PageHeaderHeading>
                Build your rich-text editor.
              </PageHeaderHeading>
              <div className="hidden md:block">
                <ThemesButton />
              </div>
            </div>
            <PageHeaderDescription>
              Plugin system & primitive component library. <br />
              CLI for styled components. Customizable. Open Source.
            </PageHeaderDescription>
            <section className="flex w-full items-center space-x-4 py-4 md:pb-10">
              <Link href="/docs" className={cn(buttonVariants())}>
                Get Started
              </Link>
              <Link
                target="_blank"
                rel="noreferrer"
                href={siteConfig.links.github}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                GitHub
              </Link>
            </section>
          </PageHeader>
        </div>

        <section className="relative">
          <HomeTabs />

          <CustomizerDrawer />
        </section>
      </div>
    </ThemeWrapper>
  );
}
