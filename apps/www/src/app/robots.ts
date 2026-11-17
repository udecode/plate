import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: '/',
      userAgent: '*',
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
