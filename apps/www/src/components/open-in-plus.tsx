import { cn } from '@udecode/cn';
import Link from 'next/link';

import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/registry/default/plate-ui/button';

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
        'group relative flex flex-col gap-2 rounded-lg border bg-card p-4 text-sm',
        className
      )}
    >
      <div className="text-lg leading-tight font-semibold text-balance group-hover:underline">
        {content.buildYourEditor}
      </div>
      <div>{content.productionReady}</div>
      <Button size="sm" className="mt-2 w-fit shrink-0">
        {content.getAccess}
      </Button>
      <Link
        className="absolute inset-0"
        href={`${siteConfig.links.platePro}`}
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">{content.getAccess}</span>
      </Link>
    </div>
  );
}
