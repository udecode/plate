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
        Get all-access to Plate Plus for AI and Backend Support
      </div>
      <div>Enhance your editing experience with advanced features.</div>
      <div>
        Plate Plus offers AI-powered assistance and robust backend solutions to
        elevate your content creation.
      </div>
      <Button className="mt-2 w-fit" size="sm">
        Get All-Access Now
      </Button>
      <Link
        className="absolute inset-0"
        href={`${siteConfig.links.platePlus}/docs`}
        rel="noreferrer"
        target="_blank"
      >
        <span className="sr-only">Get all-access to Plate Plus</span>
      </Link>
    </div>
  );
}
