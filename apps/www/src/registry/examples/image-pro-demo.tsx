'use client';

import { siteConfig } from '@/config/site';

export default function ImageProDemo() {
  return (
    <iframe
      className="size-full h-[350px]"
      title="media-controller"
      src={`${siteConfig.links.platePro}/iframe/media-controller`}
    ></iframe>
  );
}
