'use client';

import { cn } from '@udecode/cn';

import { siteConfig } from '@/config/site';

export default function ProIframeDemo({ id }: { id: string }) {
  return (
    <iframe
      className={cn(`size-full h-[520px] pr-px`)}
      title={id}
      src={`${siteConfig.links.plateProIframe}/${id}`}
    />
  );
}
