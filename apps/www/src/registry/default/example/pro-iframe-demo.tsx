'use client';

import { siteConfig } from '@/config/site';
import { cn } from '@/registry/default/lib/utils';

export default function ProIframeDemo({ id }: { id: string }) {
  return (
    <iframe
      className={cn(`size-full h-[520px] pr-px`)}
      title={id}
      src={`${siteConfig.links.plateProIframe}/${id}`}
    />
  );
}
