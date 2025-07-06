import type { Metadata } from 'next';

import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';

import { Mdx } from '@/components/mdx-components';
import { SiteFooter } from '@/components/site-footer';
import { absoluteUrl } from '@/lib/absoluteUrl';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    locale?: string;
  }>;
}

async function getBlogPostFromParams({ params, searchParams }: BlogPostPageProps) {
  const slug = (await params).slug;
  const locale = (await searchParams).locale;

  let post;

  // For Chinese locale, look for .cn.mdx files
  if (locale === 'cn') {
    post = allDocs.find(
      (doc) =>
        doc._raw.sourceFilePath.startsWith('docs/blog/') &&
        doc.slugAsParams === `docs/blog/${slug}.cn` &&
        doc._raw.sourceFileName?.endsWith('.cn.mdx')
    );
  }

  // Default behavior for non-Chinese or fallback
  if (!post) {
    post = allDocs.find(
      (doc) =>
        doc._raw.sourceFilePath.startsWith('docs/blog/') &&
        doc.slugAsParams === `docs/blog/${slug}` &&
        !doc._raw.sourceFileName?.endsWith('.cn.mdx')
    );
  }

  if (!post || post.published === false) {
    return null;
  }

  return post;
}

export async function generateMetadata({
  params,
  searchParams,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostFromParams({ params, searchParams });

  if (!post) {
    return {};
  }

  const url = absoluteUrl(`/blog/${(await params).slug}`);

  return {
    description: post.description,
    openGraph: {
      description: post.description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(
            post.description ?? ''
          )}`,
        },
      ],
      title: post.title,
      type: 'article',
      url,
    },
    title: post.title,
    twitter: {
      card: 'summary_large_image',
      creator: '@udecode',
      description: post.description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(
            post.description ?? ''
          )}`,
        },
      ],
      title: post.title,
    },
  };
}

export async function generateStaticParams() {
  return allDocs
    .filter((doc) => doc._raw.sourceFilePath.startsWith('docs/blog/'))
    .filter((doc) => !doc._raw.sourceFileName?.endsWith('.cn.mdx'))
    .map((doc) => ({
      slug: doc.slugAsParams.replace('docs/blog/', ''),
    }));
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const post = await getBlogPostFromParams({ params, searchParams });
  const locale = (await searchParams).locale || 'en';
  if (!post) {
    notFound();
  }

  return (
    <>
      <article className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.date && (
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(locale === 'cn' ? 'zh-CN' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              )}
              {post.author && (
                <>
                  <span>•</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>

            {/* {post.description && (
              <p className="text-xl text-muted-foreground">{post.description}</p>
            )} */}
          </div>

          <div className="w-full">
            <Mdx code={post.body.code} />
          </div>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}