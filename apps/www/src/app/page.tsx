import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { CustomizerDrawer } from '@/components/customizer-drawer';
import { ThemesButton } from '@/components/themes-button';

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
import { Separator } from '@/registry/default/plate-ui/separator';

import { HomeTabs } from './_components/home-tabs';

export default function IndexPage() {
  return (
    <ThemeWrapper defaultTheme="slate">
      <div className="container relative">
        <div className="flex items-center justify-between">
          <PageHeader className="w-full pb-8">
            <Link
              // TODO:
              href="/docs/components"
              className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
            >
              🎉 <Separator className="mx-2 h-4" orientation="vertical" />{' '}
              Introducing Plate UI, a new CLI and more.
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
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
            <div className="block md:hidden">
              <ThemesButton />
            </div>
          </PageHeader>
        </div>

        {/* <section className="mb-4 flex w-full justify-between"> */}
        {/*  <h2 className="ml-4 font-bold">Playground</h2> */}
        {/*  <div> */}
        {/*    <ExampleCodeLink /> */}
        {/*  </div> */}
        {/* </section> */}

        <section className="relative">
          <HomeTabs />

          <CustomizerDrawer />
        </section>
      </div>
    </ThemeWrapper>
  );
}
