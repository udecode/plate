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

import { AnnouncementButton } from '../(app)/_components/announcement-button';
import { HomeShowcase } from '../(app)/_components/home-showcase';

const title = '构建你的富文本编辑器';
const description =
  '一套精心设计的富文本插件和组件，支持自由定制与扩展。从这里开始，打造属于你的编辑器。开源免费。';

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

export default async function CNIndexPage() {
  const playgroundPreviewData = await getPlaygroundPreviewData();

  return (
    <div className="flex flex-1 flex-col" data-home-page>
      <PageHeader className="md:**:[.container]:pb-8 lg:**:[.container]:pb-10">
        <AnnouncementButton label="创建你的 Plate 编辑器" />

        <PageHeaderHeading className="max-w-4xl font-semibold text-balance text-primary xl:text-5xl">
          {title}
        </PageHeaderHeading>
        <PageHeaderDescription className="max-w-2xl text-base font-normal text-muted-foreground sm:text-lg">
          {description}
        </PageHeaderDescription>
        <PageActions className="justify-center **:data-[slot=button]:shadow-none">
          <Button asChild className="h-[31px] rounded-lg text-xs" size="sm">
            <Link href="/create">
              立即构建
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-[31px] rounded-lg text-xs"
            size="sm"
            variant="ghost"
          >
            <Link href={{ pathname: '/cn/docs' }}>开始使用</Link>
          </Button>
        </PageActions>
      </PageHeader>

      <HomeShowcase
        locale="cn"
        playgroundPreviewData={playgroundPreviewData ?? null}
      />
    </div>
  );
}
