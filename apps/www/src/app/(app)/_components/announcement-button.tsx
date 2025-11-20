'use client';

import * as React from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
const i18n = {
  cn: {
    description: 'MCP, AI, 上传, 以及更多',
  },
  en: {
    description: 'MCP, AI, Upload, and more',
  },
};

export function AnnouncementButton() {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <Button
      variant="link"
      className="group !px-0.5 mb-2 inline-flex h-5 flex-wrap items-center gap-0 rounded-lg font-medium text-sm hover:no-underline"
      onClick={() => {
        window.open('https://pro.platejs.org', '_blank');
      }}
    >
      {/* <SparklesIcon />
      <Separator orientation="vertical" className="mx-2 h-4" /> */}
      <span className="whitespace-break-spaces underline-offset-4 group-hover:underline">
        <span>{content.description}</span>
        {/* <span className="bg-linear-to-r from-[#6EB6F2] via-[#a855f7] to-[#eab308] bg-clip-text text-transparent">
          Plate Plus
        </span> */}
      </span>
      <ArrowRightIcon className="ml-2" />
    </Button>
  );
}
