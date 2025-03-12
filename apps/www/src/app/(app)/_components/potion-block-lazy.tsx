'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@udecode/cn';
import { useSearchParams } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { buttonVariants } from '@/registry/default/plate-ui/button';

// Create a client-side only component that renders an iframe
function ClientBlockDisplay({
  description,
  isPro,
  meta,
  src,
}: {
  description: string;
  src: string;
  isPro?: boolean;
  meta?: { descriptionSrc?: string; iframeHeight?: number };
}) {
  return (
    <div className="relative rounded-lg bg-background">
      <div className="flex items-center justify-between p-4">
        <a
          className="text-sm font-medium underline-offset-2 hover:underline"
          href={src}
          rel="noopener noreferrer"
          target="_blank"
        >
          {description}
        </a>

        {isPro && (
          <a
            className={cn(
              buttonVariants(),
              'group relative flex justify-start gap-2 overflow-hidden rounded-sm whitespace-pre',
              'dark:bg-muted dark:text-foreground',
              'hover:ring-2 hover:ring-primary hover:ring-offset-2',
              'transition-all duration-300 ease-out',
              'h-[26px] px-2 text-xs'
            )}
            href={meta?.descriptionSrc ?? src}
            rel="noreferrer"
            target="_blank"
          >
            <span
              className={cn(
                'absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12',
                'bg-white opacity-10',
                'transition-all duration-1000 ease-out'
              )}
            />
            Get the code -&gt;
          </a>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <iframe
          className="w-full"
          title={description}
          height={meta?.iframeHeight || 500}
          src={src}
        />
      </div>
    </div>
  );
}

const i18n = {
  cn: {
    buildYourRichTextEditor: '构建你的富文本编辑器',
    description: '框架 · 插件 · 组件 · 主题',
    getStarted: '开始使用',
    github: 'GitHub',
    potionDescription: '一个类似 Notion 的 AI 模板。',
  },
  en: {
    buildYourRichTextEditor: 'Build your rich-text editor',
    description: 'Framework · Plugins · Components · Themes',
    getStarted: 'Get Started',
    github: 'GitHub',
    potionDescription: 'A Notion-like AI template.',
  },
};

export default function PotionBlockLazy() {
  const searchParams = useSearchParams();

  const [locale, setLocale] = useState<keyof typeof i18n>('en');
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const getLocale = async () => {
      const resolvedLocale = (searchParams?.get('locale') ||
        'en') as keyof typeof i18n;
      setLocale(resolvedLocale);
    };

    void getLocale();
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !shouldRender) {
        setShouldRender(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldRender]);

  const content = i18n[locale];

  const block = {
    description: content.potionDescription,
    descriptionSrc: siteConfig.links.potionTemplate,
    isPro: true,
    meta: {
      iframeHeight: 800,
    },
    name: 'potion',
    src: siteConfig.links.potionIframe,
  };

  return (
    <div ref={ref}>
      {shouldRender && (
        <ClientBlockDisplay
          description={block.description}
          isPro={block.isPro}
          meta={block.meta}
          src={block.src}
        />
      )}
    </div>
  );
}
