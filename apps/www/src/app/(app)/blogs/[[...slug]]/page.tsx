import { createRelativeLink } from 'fumadocs-ui/mdx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { blogsSource } from '@/lib/blogs-source';

import { getMDXComponents } from '../_components/mdx-components';

// Blog index component
function BlogIndex() {
  const blogPosts = blogsSource.getPages().map((page) => ({
    date: page.data.date,
    description: page.data.description || '',
    slug: page.slugs.join('/'),
    title: page.data.title,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Latest updates, tutorials, and insights about Plate - the rich-text editor framework for React.
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="group relative rounded-lg border p-6 transition-colors hover:bg-muted/50"
          >
            <Link className="absolute inset-0" href={`/blogs/${post.slug}`} />
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight group-hover:underline">
                  {post.title}
                </h2>
                <p className="text-muted-foreground">
                  {post.description}
                </p>
                <time className="text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString('en-US', {
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

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  // If no slug, show the blog index
  if (!params.slug || params.slug.length === 0) {
    return <BlogIndex />;
  }

  const page = blogsSource.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <div className="container max-w-4xl py-12">
      <Link
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        href="/blogs"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Blog
      </Link>

      <article className="prose prose-gray dark:prose-invert max-w-none">
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
              {new Date((page.data as any).date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
        </header>

        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(blogsSource, page),
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
}) {
  const params = await props.params;

  if (!params.slug || params.slug.length === 0) {
    return {
      description: 'Latest updates, tutorials, and insights about Plate - the rich-text editor framework for React.',
      title: 'Blog - Plate',
    };
  }

  const page = blogsSource.getPage(params.slug);
  if (!page) notFound();

  return {
    description: page.data.description,
    title: page.data.title,
  };
}
