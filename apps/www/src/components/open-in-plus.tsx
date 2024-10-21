import { cn } from '@udecode/cn';
import Link from 'next/link';

import { Button } from '@/registry/default/plate-ui/button';

import { siteConfig } from '../config/site';

export function OpenInPlus({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border p-4 text-sm',
        className
      )}
    >
      <div className="text-balance text-lg font-semibold leading-tight group-hover:underline">
        Build your editor even faster
      </div>
      <div>Complete, deployable AI-powered template with backend.</div>
      <div>All components included. Customizable and extensible.</div>
      <Button size="sm" className="mt-2 w-fit">
        Get all-access
      </Button>
      <Link
        className="absolute inset-0"
        href={`${siteConfig.links.platePro}`}
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">Get all-access</span>
      </Link>
    </div>
  );
}
