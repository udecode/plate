'use client';

import type { ReactNode } from 'react';

import { useState } from 'react';
import { IconRss } from '@tabler/icons-react';

import {
  ReleaseIndex,
  type PlateUiReleaseChangesByTag,
} from '@/components/release-index';
import { Button } from '@/components/ui/button';
import type { ReleaseIndexRelease } from '@/lib/releases';

export function ReleasePageContent({
  after,
  description,
  plateUiChangesByTag,
  releases,
  showLatestPlateUiChanges = true,
  showMajorHeadings = false,
  title,
}: {
  after?: ReactNode;
  description?: string;
  plateUiChangesByTag?: PlateUiReleaseChangesByTag;
  releases: ReleaseIndexRelease[];
  showLatestPlateUiChanges?: boolean;
  showMajorHeadings?: boolean;
  title: string;
}) {
  const [showPackageChanges, setShowPackageChanges] = useState(true);
  const [showPlateUiChanges, setShowPlateUiChanges] = useState(true);

  return (
    <div
      className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
      data-slot="docs"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full min-w-0 max-w-[56rem] flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="scroll-m-24 font-semibold text-3xl tracking-tight">
                {title}
              </h1>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  aria-pressed={showPackageChanges}
                  className="shadow-none"
                  onClick={() => setShowPackageChanges((value) => !value)}
                  size="sm"
                  type="button"
                  variant={showPackageChanges ? 'secondary' : 'ghost'}
                >
                  Package changes
                </Button>
                <Button
                  aria-pressed={showPlateUiChanges}
                  className="shadow-none"
                  onClick={() => setShowPlateUiChanges((value) => !value)}
                  size="sm"
                  type="button"
                  variant={showPlateUiChanges ? 'secondary' : 'ghost'}
                >
                  Plate UI
                </Button>
                <Button
                  asChild
                  className="shadow-none"
                  size="sm"
                  variant="secondary"
                >
                  <a href="/rss.xml" rel="noopener noreferrer" target="_blank">
                    <IconRss />
                    RSS
                  </a>
                </Button>
              </div>
            </div>
            {description ? (
              <p className="text-[1.05rem] text-muted-foreground sm:text-balance sm:text-base md:max-w-[80%]">
                {description}
              </p>
            ) : null}
          </div>
          <div className="w-full flex-1 pb-16 sm:pb-0">
            <ReleaseIndex
              plateUiChangesByTag={plateUiChangesByTag}
              releases={releases}
              showPackageChanges={showPackageChanges}
              showMajorHeadings={showMajorHeadings}
              showPlateUiChanges={showPlateUiChanges}
              showLatestPlateUiChanges={showLatestPlateUiChanges}
            />
            {after}
          </div>
        </div>
      </div>
    </div>
  );
}
