'use client';

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

const i18n = {
  cn: {
    browseEditors: '浏览编辑器',
    description: '精美设计。复制到你的应用中。',
    title: '为Web构建编辑器',
  },
  en: {
    browseEditors: 'Browse Editors',
    description: 'Beautifully designed. Copy and paste into your apps.',
    title: 'Building Editors for the Web',
  },
};

export function EditorDescription() {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <PageHeader>
      <PageHeaderHeading>{content.title}</PageHeaderHeading>
      <PageHeaderDescription>{content.description}</PageHeaderDescription>
      <PageActions className="justify-center **:data-[slot=button]:shadow-none">
        <Button asChild size="sm">
          <a href="#blocks">{content.browseEditors}</a>
        </Button>
      </PageActions>
    </PageHeader>
  );
}
