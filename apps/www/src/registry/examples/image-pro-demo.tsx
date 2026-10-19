'use client';

import { siteConfig } from '@/config/site';

export default function ImageProDemo() {
  return (
    <iframe
      className="size-full h-[350px]"
      referrerPolicy="strict-origin-when-cross-origin"
      // oxlint-disable-next-line react/iframe-missing-sandbox -- [P0 behavior-boundary] The fixed cross-origin app needs scripts and its own origin for storage; the remaining sandbox capabilities stay explicit.
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
      title="media-controller"
      src={`${siteConfig.links.platePro}/iframe/media-controller`}
    />
  );
}
