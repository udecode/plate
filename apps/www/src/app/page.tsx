import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import PlaygroundDemo from '@/registry/default/example/playground-demo';
import { buttonVariants } from '@/registry/default/plate-ui/button';
import { Separator } from '@/registry/default/plate-ui/separator';

export default function IndexPage() {
  return (
    <div className="container relative">
      <PageHeader className="pb-8">
        <Link
          // TODO:
          href="/docs/components"
          className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
        >
          🎉 <Separator className="mx-2 h-4" orientation="vertical" />{' '}
          Introducing Plate UI, a new CLI and more.
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
        <div className="max-w-[1336px] rounded-lg border bg-background shadow">
          <PlaygroundDemo />
        </div>
      </section>
    </div>
  );
}
