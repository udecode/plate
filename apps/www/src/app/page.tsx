import * as React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { Icons } from '@/components/icons';
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
            Plugin system & primitive component library. <br />
            CLI for styled components. Customizable. Open Source.
          </PageHeaderDescription>
          <section className="flex w-full items-center space-x-4 py-2">
            <Button asChild size="sm">
              <Link href="/docs">Get Started</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link
                href={siteConfig.links.github}
                rel="noreferrer"
                target="_blank"
              >
                <Icons.gitHub className="mr-2 size-4" />
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
    </div>
  );
}
