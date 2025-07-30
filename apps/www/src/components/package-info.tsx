import React from 'react';

import Link from 'next/link';

import { Separator } from '@/components/ui/separator';

export function PackageInfo({ children }: { children: React.ReactNode }) {


  return (
    <div className="flex flex-col flex-nowrap items-stretch justify-start not-first:mt-12 md:flex-row md:gap-16">
      <div className="md:flex-1">{children}</div>

      <Separator className="mb-4 md:hidden" />

      <nav className="flex w-fit flex-col gap-3">
        <div>
          <Link
            className="flex gap-2 font-medium underline underline-offset-4"
            href="https://github.com/udecode/plate/issues/new/choose"
            target="_blank"
          >
            Report an issue
          </Link>
        </div>
      </nav>
    </div>
  );
}
