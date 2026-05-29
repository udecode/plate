'use client';

import * as React from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
    <Badge asChild variant="secondary" className="mb-2 bg-muted">
      <a href="https://pro.platejs.org" rel="noreferrer" target="_blank">
        {content.description}
        <ArrowRightIcon />
      </a>
    </Badge>
  );
}
