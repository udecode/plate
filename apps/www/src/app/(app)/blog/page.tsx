import type { Metadata } from 'next';

import { allDocs } from 'contentlayer/generated';
import Link from 'next/link';


const i18n = {
  cn: {
    description: 'Plate 编辑器博客和更新。',
    noPosts: '暂无博客文章。',
    readMore: '阅读更多',
    title: '博客',
  },
  en: {
    description: 'Plate editor blog posts and updates.',
    noPosts: 'No blog posts yet.',
    readMore: 'Read more',
    title: 'Blog',
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    locale?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = (await searchParams).locale || 'en';
  const content = i18n[locale as keyof typeof i18n] || i18n.en;

  // Filter for blog posts based on locale
  const blogPosts = allDocs
    .filter((doc) => doc._raw.sourceFilePath.startsWith('docs/blog/'))
    .filter((doc) => {
      // For Chinese locale, only show .cn.mdx files
      if (locale === 'cn') {
        return doc._raw.sourceFileName?.endsWith('.cn.mdx');
      }
      // For default locale, exclude .cn.mdx files
      return !doc._raw.sourceFileName?.endsWith('.cn.mdx');
    })
    .filter((doc) => doc.published !== false)
    .sort((a, b) => {
      // Sort by date if available, otherwise by title
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  return (
    <>
      <div className="container min-h-[calc(100vh-10rem)] mx-auto px-4 h-24 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">{content.title}</h1>
            <p className="text-lg text-muted-foreground">
              {content.description}
            </p>
          </div>

          <div className="space-y-8">
            {blogPosts.length === 0 ? (
              <p className="text-muted-foreground">{content.noPosts}</p>
            ) : (
              blogPosts.map((post) => (
                <article
                  key={post._id}
                  className="group relative rounded-lg border p-6 transition-all hover:shadow-md"
                >
                  <Link
                    className="absolute inset-0"
                    href={`/blog/${post.slugAsParams.replace('docs/blog/', '').replace('.cn', '')}${locale === 'cn' ? '?locale=cn' : ''}`}
                  >
                    <span className="sr-only">View {post.title}</span>
                  </Link>

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight group-hover:underline">
                        {post.title}
                      </h2>
                      {post.date && (
                        <time
                          className="text-sm text-muted-foreground"
                          dateTime={post.date}
                        >
                          {new Date(post.date).toLocaleDateString(locale === 'cn' ? 'zh-CN' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </time>
                      )}
                    </div>

                    {post.description && (
                      <p className="text-muted-foreground">
                        {post.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-primary">
                      {content.readMore}
                      <svg
                        className="ml-1 size-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  description: 'Plate editor blog posts and updates.',
  title: 'Blog',
};