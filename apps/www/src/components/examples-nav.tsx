'use client';

import Link from 'next/link';
import { Icons } from './icons';

export function ExampleCodeLink() {
  return (
    <Link
      href="https://github.com/udecode/plate/tree/main/apps/www/src/components/examples/PlaygroundDemo.tsx"
      target="_blank"
      rel="nofollow"
      className="flex items-center rounded-[0.5rem] text-sm font-medium md:flex"
    >
      View code
      <Icons.arrowRight className="ml-1 h-4 w-4" />
    </Link>
  );
}
