//
// export default Playground;
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import PlaygroundPage from '@/components/examples/PlaygroundApp';
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
          href="/docs/forms/react-hook-form"
          className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
        >
          🎉 <Separator className="mx-2 h-4" orientation="vertical" /> Plate is
          now headless
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
        <PageHeaderHeading>Build your rich-text editor.</PageHeaderHeading>
        <PageHeaderDescription>
          Plugin system & unstyled components. CLI for styled components.
          Accessible. Customizable. Open Source.
        </PageHeaderDescription>
        <div className="flex w-full items-center space-x-4 pb-8 pt-4 md:pb-10">
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
        </div>
      </PageHeader>
      {/* <ExamplesNav className="[&>a:first-child]:text-primary" /> */}
      {/* <section className="space-y-8 overflow-hidden rounded-lg border-2 border-primary dark:border-muted md:hidden"> */}
      {/*  <Image */}
      {/*    src="/examples/dashboard-light.png" */}
      {/*    width={1280} */}
      {/*    height={866} */}
      {/*    alt="Dashboard" */}
      {/*    className="block dark:hidden" */}
      {/*  /> */}
      {/*  <Image */}
      {/*    src="/examples/dashboard-dark.png" */}
      {/*    width={1280} */}
      {/*    height={866} */}
      {/*    alt="Dashboard" */}
      {/*    className="hidden dark:block" */}
      {/*  /> */}
      {/* </section> */}
      <section className="relative">
        <div className="border bg-background shadow-xl">
          <PlaygroundPage />
        </div>
      </section>
    </div>
  );
}
