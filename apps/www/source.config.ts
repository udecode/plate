import { getHighlighter } from '@shikijs/compat';
import {
  remarkHeading,
  remarkMdxFiles,
  remarkStructure,
} from 'fumadocs-core/mdx-plugins';
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import { createGenerator, remarkAutoTypeTable } from 'fumadocs-typescript';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { codeImport } from 'remark-code-import';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { z } from 'zod';

import { rehypeComponent } from './src/lib/rehype-component';
import { rehypeNpmCommand } from './src/lib/rehype-npm-command';
import { getCodeTitleIconLabel } from './src/lib/code-title-icon';

import 'dotenv/config';

const typeTableGenerator = createGenerator();

const EVENT_META_REGEX = /event="([^"]*)"/;
const COMMAND_CODE_REGEX = /^(bun|npm|npx|pnpm|yarn)\s/;
const WHITESPACE_REGEX = /\s+/;
const shouldCompileDocsDynamically =
  process.env.PLATE_WWW_DYNAMIC_DOCS === '1';
const shouldLoadDocsAsync = process.env.PLATE_WWW_ASYNC_DOCS === '1';
const shouldHighlightCode = !shouldCompileDocsDynamically;

function addMetaToken(meta: string | undefined, token: string) {
  if (meta?.split(WHITESPACE_REGEX).includes(token)) {
    return meta;
  }

  return [meta, token].filter(Boolean).join(' ');
}

function getCodeMeta(codeEl: any) {
  return typeof codeEl.data?.meta === 'string'
    ? codeEl.data.meta
    : typeof codeEl.properties?.metastring === 'string'
      ? codeEl.properties.metastring
      : undefined;
}

function setCodeMeta(codeEl: any, meta: string | undefined) {
  codeEl.data ??= {};
  codeEl.properties ??= {};

  if (meta) {
    codeEl.data.meta = meta;
    codeEl.properties.metastring = meta;
  } else {
    codeEl.data.meta = undefined;
    codeEl.properties.metastring = undefined;
  }
}

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
    ...(shouldCompileDocsDynamically
      ? { dynamic: true }
      : shouldLoadDocsAsync
        ? { async: true }
        : {
            postprocess: {
              includeProcessedMarkdown: true,
            },
          }),
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
              let codeMeta = getCodeMeta(codeEl);

              if (codeMeta) {
                const match = codeMeta.match(EVENT_META_REGEX);

                if (match) {
                  node.__event__ = match ? match[1] : null;
                  codeMeta = codeMeta.replace(EVENT_META_REGEX, '').trim();
                  setCodeMeta(codeEl, codeMeta);
                }
              }

              const rawString = codeEl.children?.[0].value ?? '';
              const showLineNumbers =
                codeMeta?.split(WHITESPACE_REGEX).includes('showLineNumbers') ||
                (rawString.includes('\n') &&
                  !COMMAND_CODE_REGEX.test(rawString.trimStart()));

              if (showLineNumbers) {
                codeMeta = addMetaToken(codeMeta, 'showLineNumbers');
                setCodeMeta(codeEl, codeMeta);
              }

              node.__showLineNumbers__ = showLineNumbers;
              node.__rawString__ = rawString;
              node.__src__ = node.properties?.__src__;
              node.__style__ = node.properties?.__style__;
              node.properties.__rawString__ = rawString;
              node.properties.__showLineNumbers__ = showLineNumbers;

              if (showLineNumbers) {
                codeEl.properties ??= {};
                codeEl.properties['data-line-numbers'] = '';
              }
            }
          });
        },
        ...(shouldHighlightCode
          ? [
              [
                rehypePrettyCode,
                {
                  getHighlighter,
                  theme: {
                    dark: 'github-dark',
                    light: 'github-light',
                  },
                  onVisitHighlightedLine(node: any) {
                    node.properties.className.push('line--highlighted');
                  },
                  onVisitHighlightedWord(node: any) {
                    node.properties.className = ['word--highlighted'];
                  },
                  onVisitLine(node: any) {
                    node.properties['data-line'] = '';

                    if (node.children.length === 0) {
                      node.children = [{ type: 'text', value: ' ' }];
                    }
                  },
                },
              ],
              () => (tree: any) => {
                visit(tree, (node: any) => {
                  if (node?.type === 'element' && node?.tagName === 'div') {
                    if (
                      !('data-rehype-pretty-code-fragment' in node.properties)
                    ) {
                      return;
                    }

                    const hasMeta = node.children.some(
                      (child: any) => child.tagName === 'div'
                    );

                    for (const titleElement of node.children.filter(
                      (child: any) =>
                        child.tagName === 'div' &&
                        'data-rehype-pretty-code-title' in child.properties
                    )) {
                      const iconLabel = getCodeTitleIconLabel(
                        titleElement.properties?.['data-language']
                      );

                      if (iconLabel) {
                        titleElement.properties['data-file-icon-label'] =
                          iconLabel;
                      }
                    }

                    for (const preElement of node.children.filter(
                      (child: any) => child.tagName === 'pre'
                    )) {
                      preElement.properties.__withMeta__ = hasMeta;
                      preElement.properties.__rawString__ = node.__rawString__;
                      preElement.properties.__showLineNumbers__ =
                        node.__showLineNumbers__;

                      if (node.__showLineNumbers__) {
                        let codeElement: any;

                        for (const child of preElement.children ?? []) {
                          if (child.tagName === 'code') {
                            codeElement = child;
                            break;
                          }
                        }

                        if (codeElement) {
                          codeElement.properties ??= {};
                          codeElement.properties['data-line-numbers'] = '';
                        }
                      }
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
                  }
                });
              },
            ]
          : []),
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
    remarkPlugins: (plugins) =>
      [
        remarkGfm,
        [remarkHeading, { generateToc: false }],
        codeImport,
        remarkMdxFiles,
        [remarkAutoTypeTable, { generator: typeTableGenerator }],
        [remarkStructure, { exportAs: 'structuredData' }],
        ...plugins,
      ] as any,
  },
});
