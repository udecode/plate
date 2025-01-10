'use client';

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/registry/default/plate-ui/button';

const i18n = {
  cn: {
    browseEditors: '浏览编辑器',
    description: '精美设计。复制到你的应用中。开源。',
    title: '为Web构建编辑器',
  },
  en: {
    browseEditors: 'Browse Editors',
    description:
      'Beautifully designed. Copy and paste into your apps. Open Source.',
    title: 'Building Editors for the Web',
  },
};

export function EditorDescription() {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <PageHeader>
      {/* <Announcement /> */}
      <PageHeaderHeading>{content.title}</PageHeaderHeading>
      <PageHeaderDescription>{content.description}</PageHeaderDescription>
      <PageActions>
        <Button asChild size="lg">
          <a href="#blocks">{content.browseEditors}</a>
        </Button>
        {/* <Button asChild size="sm" variant="ghost">
          <a
            href="https://github.com/shadcn-ui/ui/discussions/new?category=blocks-request"
            rel="noreferrer"
            target="_blank"
          >
            Request a block
          </a>
        </Button> */}
      </PageActions>
    </PageHeader>
  );
}
