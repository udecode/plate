import { getHighlighter } from '@shikijs/compat';
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { codeImport } from 'remark-code-import';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { z } from 'zod/v4';

import { rehypeComponent } from './src/lib/rehype-component';
import { rehypeNpmCommand } from './src/lib/rehype-npm-command';

import 'dotenv/config';

const EVENT_META_REGEX = /event="([^"]*)"/;

const docPropertiesSchema = z.object({
  route: z.string().optional(),
  title: z.string().optional(),
});

const linksPropertiesSchema = z.object({
  api: z.string().optional(),
  doc: z.string().optional(),
});

export const docs = defineDocs({
  dir: '../../content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      component: z.boolean().default(false),
      docs: z.array(docPropertiesSchema).optional(),
      featured: z.boolean().default(false),
      links: linksPropertiesSchema.optional(),
      published: z.boolean().default(true),
      toc: z.boolean().default(true),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: false,
    rehypePlugins: (plugins) =>
      [
        rehypeSlug,
        rehypeComponent,
        () => (tree: any) => {
          visit(tree, (node: any) => {
            if (node?.type === 'element' && node?.tagName === 'pre') {
              const codeEl = node.children?.[0];

              if (codeEl?.tagName !== 'code') {
                return;
              }
              if (codeEl.data?.meta) {
                const match = codeEl.data?.meta.match(EVENT_META_REGEX);

                if (match) {
                  node.__event__ = match ? match[1] : null;
                  codeEl.data.meta = codeEl.data.meta.replace(
                    EVENT_META_REGEX,
                    ''
                  );
                }
              }

              node.__rawString__ = codeEl.children?.[0].value;
              node.__src__ = node.properties?.__src__;
              node.__style__ = node.properties?.__style__;
            }
          });
        },
        [
          rehypePrettyCode,
          {
            getHighlighter,
            theme: 'github-dark',
            onVisitHighlightedLine(node: any) {
              node.properties.className.push('line--highlighted');
            },
            onVisitHighlightedWord(node: any) {
              node.properties.className = ['word--highlighted'];
            },
            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: 'text', value: ' ' }];
              }
            },
          },
        ],
        () => (tree: any) => {
          visit(tree, (node: any) => {
            if (node?.type === 'element' && node?.tagName === 'div') {
              if (!('data-rehype-pretty-code-fragment' in node.properties)) {
                return;
              }

              const preElement = node.children.at(-1);

              if (preElement?.tagName !== 'pre') {
                return;
              }

              preElement.properties.__withMeta__ =
                node.children.at(0).tagName === 'div';
              preElement.properties.__rawString__ = node.__rawString__;

              if (node.__src__) {
                preElement.properties.__src__ = node.__src__;
              }
              if (node.__event__) {
                preElement.properties.__event__ = node.__event__;
              }
              if (node.__style__) {
                preElement.properties.__style__ = node.__style__;
              }
            }
          });
        },
        rehypeNpmCommand,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              ariaLabel: 'Link to section',
              className: ['subheading-anchor group/subheading'],
              'data-empty': 'true',
            },
          },
        ],
        ...plugins,
      ] as any,
    remarkNpmOptions: false,
    remarkPlugins: (plugins) => [remarkGfm, codeImport, ...plugins] as any,
  },
});
