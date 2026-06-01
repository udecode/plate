import { NextResponse } from 'next/server';

import { siteConfig } from '@/config/site';
import releaseIndexData from '@/generated/release-index.json';

export const revalidate = false;

const maxRssItems = 50;
const releasesUrl = `${siteConfig.url}/docs/releases`;

type ReleaseIndexEntry = {
  content: string;
  date: string;
  tag: string;
  title: string;
  url: string;
};

export async function GET() {
  const items = (releaseIndexData as ReleaseIndexEntry[])
    .slice(0, maxRssItems)
    .map((release) => {
      const title = release.title || release.tag;
      const link = release.url || releasesUrl;

      return `    <item>
      <title><![CDATA[${toCdata(title)}]]></title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <description><![CDATA[${toCdata(release.content)}]]></description>
      <pubDate>${toPubDate(release.date)}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} Releases</title>
    <link>${releasesUrl}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function toCdata(value: string) {
  return value.replaceAll(']]>', ']]]]><![CDATA[>');
}

function toPubDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return new Date(0).toUTCString();
  }

  return value.toUTCString();
}
