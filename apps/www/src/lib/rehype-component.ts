/* eslint-disable @dword-design/import-alias/prefer-alias */
import type { UnistNode, UnistTree } from '@/types/unist';

import fs from 'node:fs';
import path from 'node:path';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';

import { Index } from '../__registry__';
import { styles } from '../registry/registry-styles';

// NOTE: shadcn fork
export function rehypeComponent() {
  return (tree: UnistTree) => {
    visit(tree as any, (node: UnistNode) => {
      if (node.name === 'ComponentSource' || node.name === 'ComponentPreview') {
        const name = getNodeAttributeByName(node, 'name')?.value as
          | string
          | undefined;
        const src = getNodeAttributeByName(node, 'src')?.value as
          | string
          | undefined;

        if (name && !src) {
          if (node.name === 'ComponentSource' && !src) {
            try {
              for (const style of styles) {
                const component = Index[style.name][name];

                if (!component && !src) {
                  throw new Error(
                    `Component ${name} not found in ${style.name}`
                  );
                }

                const src = component.files[0];

                // Read the source file.
                const filePath = path.join(process.cwd(), 'src', src);
                let source = fs.readFileSync(filePath, 'utf8');

                // Replace imports.
                // For now a simple regex should do.
                source = source.replaceAll(
                  `@/registry/${style.name}/`,
                  '@/components/'
                );
                source = source.replaceAll('export default', 'export');

                // Add code as children so that rehype can take over at build time.
                node.children?.push(
                  u('element', {
                    attributes: [
                      {
                        name: 'styleName',
                        type: 'mdxJsxAttribute',
                        value: style.name,
                      },
                    ],
                    children: [
                      u('element', {
                        children: [
                          {
                            type: 'text',
                            value: source,
                          },
                        ],
                        properties: {
                          className: ['language-tsx'],
                        },
                        tagName: 'code',
                      }),
                    ],
                    properties: {
                      __src__: src,
                      __style__: style.name,
                    },
                    tagName: 'pre',
                  })
                );
              }
            } catch (error) {
              console.error(error);
            }
          }
          if (node.name === 'ComponentPreview') {
            try {
              for (const style of styles) {
                const component = Index[style.name][name];

                if (!component) {
                  throw new Error(
                    `Component ${name} not found in ${style.name}`
                  );
                }

                const src = component.files[0];

                // Read the source file.
                const filePath = path.join(process.cwd(), 'src', src);
                let source = fs.readFileSync(filePath, 'utf8');

                // Replace imports.
                // For now a simple regex should do.
                source = source.replaceAll(
                  `@/registry/${style.name}/`,
                  '@/components/'
                );
                source = source.replaceAll('export default', 'export');

                // Add code as children so that rehype can take over at build time.
                node.children?.push(
                  u('element', {
                    children: [
                      u('element', {
                        children: [
                          {
                            type: 'text',
                            value: source,
                          },
                        ],
                        properties: {
                          className: ['language-tsx'],
                        },
                        tagName: 'code',
                      }),
                    ],
                    properties: {
                      __src__: src,
                    },
                    tagName: 'pre',
                  })
                );
              }
            } catch (error) {
              console.error(error);
            }
          }
        }

        const source = getComponentSourceFileContent(node);

        if (source) {
          if (node.name === 'ComponentPreview') {
            // Replace the Example component with a pre element.
            node.children?.push(
              u('element', {
                children: [
                  u('element', {
                    children: [
                      {
                        type: 'text',
                        value: source,
                      },
                    ],
                    properties: {
                      className: ['language-tsx'],
                    },
                    tagName: 'code',
                  }),
                ],
                properties: {
                  __src__: src,
                },
                tagName: 'pre',
              })
            );

            const extractClassname = getNodeAttributeByName(
              node,
              'extractClassname'
            );

            if (
              extractClassname &&
              extractClassname.value !== undefined &&
              extractClassname.value !== 'false'
            ) {
              // Extract className from string
              // For now, a simple regex should do.
              const values = /className="(.*)"/.exec(source);
              const className = values ? values[1] : '';

              // Add the className as a jsx prop so we can pass it to the copy button.
              node.attributes?.push({
                name: 'extractedClassNames',
                type: 'mdxJsxAttribute',
                value: className,
              });

              // Add a pre element with the className only.
              node.children?.push(
                u('element', {
                  children: [
                    u('element', {
                      children: [
                        {
                          type: 'text',
                          value: className,
                        },
                      ],
                      properties: {
                        className: ['language-tsx'],
                      },
                      tagName: 'code',
                    }),
                  ],
                  properties: {},
                  tagName: 'pre',
                })
              );
            }
          }
          if (node.name === 'ComponentSource') {
            // Replace the Source component with a pre element.
            node.children?.push(
              u('element', {
                children: [
                  u('element', {
                    children: [
                      {
                        type: 'text',
                        value: source,
                      },
                    ],
                    properties: {
                      className: ['language-tsx'],
                    },
                    tagName: 'code',
                  }),
                ],
                properties: {
                  __src__: src,
                },
                tagName: 'pre',
              })
            );
          }
        }
      }
    });
  };
}

function getNodeAttributeByName(node: UnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name);
}

function getComponentSourceFileContent(node: UnistNode) {
  const src = getNodeAttributeByName(node, 'src')?.value as string;

  if (!src) {
    return null;
  }

  // Read the source file.
  const filePath = path.join(process.cwd(), src);
  const source = fs.readFileSync(filePath, 'utf8');

  return source;
}
