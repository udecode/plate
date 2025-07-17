import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import * as Typography from '@/components/typography';
import { blogsSource } from '@/lib/blogs-source';
import { hrefWithLocale } from '@/lib/withLocale';

import { getMDXComponents } from '../_components/mdx-components';

const i18n = {
  cn: {
    backToBlog: '返回博客',
    blog: '博客',
    blogDescription: '关于 Plate - React 富文本编辑器框架的最新更新、教程和见解。',
  },
  en: {
    backToBlog: 'Back to Blog',
    blog: 'Blog',
    blogDescription: 'Latest updates, tutorials, and insights about Plate - the rich-text editor framework for React.',
  },
};

// Blog index component
function BlogIndex({ locale }: { locale: keyof typeof i18n }) {
  const content = i18n[locale];

  const blogPosts = blogsSource.getPages()
    .filter((page) => {
      // Filter based on locale
      const isChinese = page.path.endsWith('.cn.mdx');
      return locale === 'cn' ? isChinese : !isChinese;
    })
    .map((page) => ({
      date: page.data.date,
      description: page.data.description || '',
      path: page.path,
      slug: page.slugs.join('/').replace(/\.cn$/, ''),  // Remove .cn suffix from slug
      title: page.data.title,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const dateLocale = locale === 'cn' ? 'zh-CN' : 'en-US';

  return (
    <div className="container max-w-(--breakpoint-md) py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{content.blog}</h1>
        <p className="text-lg text-muted-foreground">
          {content.blogDescription}
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="group relative rounded-lg border p-6 transition-colors hover:bg-muted/50"
          >
            <Link className="absolute inset-0" href={hrefWithLocale(`/blogs/${post.slug}`, locale)} />
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight group-hover:underline">
                  {post.title}
                </h2>
                <p className="text-muted-foreground">
                  {post.description}
                </p>
                <time className="text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString(dateLocale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export type SearchParams = Promise<{
  locale?: string;
}>;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const locale = ((await props.searchParams).locale || 'en') as keyof typeof i18n;
  const content = i18n[locale];
  const dateLocale = locale === 'cn' ? 'zh-CN' : 'en-US';

  // If no slug, show the blog index
  if (!params.slug || params.slug.length === 0) {
    return <BlogIndex locale={locale} />;
  }

  // Try to get language-specific blog post
  let page = null;
  const baseSlug = params.slug.join('/');

  if (locale === 'cn') {
    // Try to find Chinese version first
    const cnSlug = baseSlug.endsWith('.cn') ? baseSlug : `${baseSlug}.cn`;
    page = blogsSource.getPage(cnSlug.split('/'));

    // If no Chinese version, fall back to English
    if (!page) {
      const enSlug = baseSlug.replace(/\.cn$/, '');
      page = blogsSource.getPage(enSlug.split('/'));
    }
  } else {
    // For English, ensure we're not loading the Chinese version
    const enSlug = baseSlug.replace(/\.cn$/, '');
    page = blogsSource.getPage(enSlug.split('/'));
  }

  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <div className="container max-w-4xl py-12">
      <Link
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        href={hrefWithLocale('/blogs', locale)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {content.backToBlog}
      </Link>

      <article className="prose prose-gray dark:prose-invert prose-blog max-w-(--breakpoint-md)!">
        <header className="mb-8 not-prose">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {page.data.title}
          </h1>
          {page.data.description && (
            <p className="text-lg text-muted-foreground">
              {page.data.description}
            </p>
          )}
          {(page.data as any).date && (
            <time className="text-sm text-muted-foreground">
              {new Date((page.data as any).date).toLocaleDateString(dateLocale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
        </header>

        <MDXContent
          components={getMDXComponents({
            h1: Typography.H1,
            h2: Typography.H2,
            h3: Typography.H3,
            h4: Typography.H4,
            h5: Typography.H5,
            h6: Typography.H6,
            hr: Typography.HR,
          })}
        />
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { slug: [] }, // For the index page
    ...blogsSource.generateParams(),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const locale = ((await props.searchParams).locale || 'en') as keyof typeof i18n;
  const content = i18n[locale];

  if (!params.slug || params.slug.length === 0) {
    return {
      description: content.blogDescription,
      title: `${content.blog} - Plate`,
    };
  }

  // Try to get language-specific blog post
  let page = null;
  const baseSlug = params.slug.join('/');

  if (locale === 'cn') {
    // Try to find Chinese version first
    const cnSlug = baseSlug.endsWith('.cn') ? baseSlug : `${baseSlug}.cn`;
    page = blogsSource.getPage(cnSlug.split('/'));

    // If no Chinese version, fall back to English
    if (!page) {
      const enSlug = baseSlug.replace(/\.cn$/, '');
      page = blogsSource.getPage(enSlug.split('/'));
    }
  } else {
    // For English, ensure we're not loading the Chinese version
    const enSlug = baseSlug.replace(/\.cn$/, '');
    page = blogsSource.getPage(enSlug.split('/'));
  }

  if (!page) notFound();

  return {
    description: page.data.description,
    title: page.data.title,
  };
}
