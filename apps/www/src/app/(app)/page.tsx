import { ArrowRightIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { getPlaygroundPreviewData } from '@/lib/playground-preview-data';

import { AnnouncementButton } from './_components/announcement-button';
import { HomeShowcase } from './_components/home-showcase';

const title = 'Build your rich-text editor';
const description =
  'A set of beautifully designed rich-text plugins and components you can customize, extend, and build on. Start here, then make it your own. Open Source. Open Code.';

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

export default async function IndexPage() {
  const playgroundPreviewData = await getPlaygroundPreviewData();

  return (
    <div className="flex flex-1 flex-col" data-home-page>
      <PageHeader className="md:**:[.container]:pb-8 lg:**:[.container]:pb-10">
        <AnnouncementButton />

        <PageHeaderHeading className="max-w-4xl font-semibold text-balance text-primary xl:text-5xl">
          {title}
        </PageHeaderHeading>
        <PageHeaderDescription className="max-w-2xl text-base font-normal text-muted-foreground sm:text-lg">
          {description}
        </PageHeaderDescription>
        <PageActions className="justify-center **:data-[slot=button]:shadow-none">
          <Button asChild className="h-[31px] rounded-lg text-xs" size="sm">
            <Link href="/create">
              Build Your Own
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-[31px] rounded-lg text-xs"
            size="sm"
            variant="ghost"
          >
            <Link href={{ pathname: '/docs' }}>Get Started</Link>
          </Button>
        </PageActions>
      </PageHeader>

      <HomeShowcase
        locale="en"
        playgroundPreviewData={playgroundPreviewData ?? null}
      />
    </div>
  );
}
