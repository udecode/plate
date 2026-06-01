import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

import { Icons } from './icons';

export function GitHubLink() {
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <Link href={siteConfig.links.github} rel="noreferrer" target="_blank">
        <Icons.gitHub />
        <span className="w-fit text-muted-foreground text-xs tabular-nums">
          16k
        </span>
        <span className="sr-only">GitHub</span>
      </Link>
    </Button>
  );
}
