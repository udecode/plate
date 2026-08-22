'use client';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export default function ProIframeDemo({ id }: { id: string }) {
  return (
    <iframe
      className={cn('size-full h-[520px] pr-px')}
      referrerPolicy="strict-origin-when-cross-origin"
      // oxlint-disable-next-line react/iframe-missing-sandbox -- [P0 behavior-boundary] The fixed cross-origin app needs scripts and its own origin for storage; the remaining sandbox capabilities stay explicit.
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
      title={id}
      src={`${siteConfig.links.plateProIframe}/${id}`}
    />
  );
}
