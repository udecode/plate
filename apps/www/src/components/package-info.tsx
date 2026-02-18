import React from 'react';

import Link from 'next/link';

import { Separator } from '@/components/ui/separator';
import { usePackageInfo } from '@/hooks/use-package-info';

export function PackageInfo({ children }: { children: React.ReactNode }) {
  const [packageInfo] = usePackageInfo();

  return (
    <div className="not-first:mt-12 flex flex-col flex-nowrap items-stretch justify-start md:flex-row md:gap-16">
      <div className="md:flex-1">{children}</div>

      <Separator className="mb-4 md:hidden" />

      <nav className="flex w-fit flex-col gap-3">
        {packageInfo?.gzip && (
          <div className="text-muted-foreground">Size: {packageInfo.gzip}</div>
        )}

        {packageInfo?.source && (
          <div>
            <Link
              className="flex gap-2 font-medium underline underline-offset-4"
              href={packageInfo.source}
              target="_blank"
            >
              View source
            </Link>
          </div>
        )}
        {packageInfo?.npm && (
          <div>
            <Link
              className="flex gap-2 font-medium underline underline-offset-4"
              href={packageInfo.npm}
              target="_blank"
            >
              View on npm
            </Link>
          </div>
        )}
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
