'use client';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

import { siteConfig } from '../config/site';

const i18n = {
  cn: {
    buildYourEditor: '构建你的编辑器',
    getAccess: '获取全部访问权限',
    productionReady: '生产就绪的 AI 模板和可重用的组件。',
  },
  en: {
    buildYourEditor: 'Build your editor',
    getAccess: 'Get all-access',
    productionReady: 'Production-ready AI template and reusable components.',
  },
};

export function OpenInPlus({ className }: { className?: string }) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg bg-surface p-6 text-sm text-surface-foreground',
        className
      )}
    >
      <div className="text-balance font-semibold text-base leading-tight group-hover:underline">
        {content.buildYourEditor}
      </div>
      <div className="text-muted-foreground">{content.productionReady}</div>
      <Button size="sm" className="mt-2 w-fit">
        {content.getAccess}
      </Button>
      <a
        className="absolute inset-0"
        href={`${siteConfig.links.platePro}`}
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">{content.getAccess}</span>
      </a>
    </div>
  );
}
