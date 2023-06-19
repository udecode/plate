import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { PlaygroundDemo } from '@/components/examples/PlaygroundDemo';
import { Icons } from '@/components/icons';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { StyleSwitcher } from '@/components/style-switcher';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export default function IndexPage() {
  return (
    <div className="container relative pb-10">
      <StyleSwitcher />
      <PageHeader>
        <Link
          // TODO:
          href="/docs"
          className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
        >
          🎉 <Separator className="mx-2 h-4" orientation="vertical" /> Plate is
          now headless
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
        <PageHeaderHeading>Build your rich-text editor.</PageHeaderHeading>
        <PageHeaderDescription>
          Plugin system & primitive component library. <br />
          CLI for styled components. Customizable. Open Source.
        </PageHeaderDescription>
        <section className="flex w-full items-center space-x-4 pb-8 pt-4 md:pb-10">
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

      {/* <section className="mb-4 flex w-full justify-between"> */}
      {/*  <h2 className="ml-4 font-bold">Playground</h2> */}
      {/*  <div> */}
      {/*    <ExampleCodeLink /> */}
      {/*  </div> */}
      {/* </section> */}

      <section className="relative">
        <div className="max-w-[1336px] border bg-background shadow-xl">
          <PlaygroundDemo />
        </div>
      </section>
    </div>
  );
}
