'use client';

import { Suspense, useEffect, useRef, useState } from 'react';

import type { RegistryItem } from 'shadcn/schema';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { BlockViewer } from '@/components/block-viewer';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

const POTION_LOAD_ROOT_MARGIN = '0px';

const i18n = {
  cn: {
    browseMoreEditors: 'Browse more editors',
    buildYourRichTextEditor: '构建你的富文本编辑器',
    description: '框架 · 插件 · 组件 · 主题',
    getStarted: '开始使用',
    github: 'GitHub',
    potionDescription: '一个类似 Notion 的 AI 模板。',
  },
  en: {
    browseMoreEditors: 'Browse more editors',
    buildYourRichTextEditor: 'Build your rich-text editor',
    description: 'Framework · Plugins · Components · Themes',
    getStarted: 'Get Started',
    github: 'GitHub',
    potionDescription: 'A Notion-like AI template.',
  },
};

function PotionLazyBlockContent() {
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const localeParam = searchParams?.get('locale');
  const locale =
    localeParam && localeParam in i18n
      ? (localeParam as keyof typeof i18n)
      : 'en';

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    const element = ref.current;

    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => {
        setShouldRender(true);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: POTION_LOAD_ROOT_MARGIN }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  const content = i18n[locale];

  const block: RegistryItem = {
    description: content.potionDescription,
    meta: {
      descriptionSrc: siteConfig.links.potionTemplate,
      iframeHeight: 800,
      isPro: true,
      src: siteConfig.links.potionIframe,
    },
    name: 'potion',
    type: 'registry:block',
  };

  return (
    <div ref={ref}>
      {shouldRender && (
        <>
          <BlockViewer
            dependencies={[]}
            highlightedFiles={[]}
            item={block}
            tree={[]}
          />
          <div className="flex justify-center py-6">
            <Button asChild variant="outline">
              <Link href="/editors">{content.browseMoreEditors}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function PotionLazyBlock() {
  return (
    <Suspense fallback={null}>
      <PotionLazyBlockContent />
    </Suspense>
  );
}
