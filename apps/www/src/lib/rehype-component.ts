import type { UnistNode, UnistTree } from '@/types/unist';

import path from 'node:path';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';

import { Index } from '../__registry__';
import { examples } from '../registry/registry-examples';
import { styles } from '../registry/registry-styles';
import {
  getAllDependencies,
  getAllFiles,
  getComponentSourceFileContent,
  getNodeAttributeByName,
} from './rehype-utils';

// NOTE: shadcn fork
export function rehypeComponent() {
  return (tree: UnistTree) => {
    visit(tree as any, (node: UnistNode) => {
      if (
        node.name === 'ComponentSource' ||
        node.name === 'ComponentPreview' ||
        node.name === 'ComponentPreviewPro' ||
        node.name === 'ComponentInstallation'
      ) {
        const name = getNodeAttributeByName(node, 'name')?.value as string;

        if (name) {
          if (node.name === 'ComponentInstallation') {
            try {
              const allDependencies = getAllDependencies(name);
              const processedFiles = getAllFiles(name);

              node.attributes = [
                ...(node.attributes || []),
                {
                  name: 'name',
                  type: 'mdxJsxAttribute',
                  value: name,
                },
                {
                  name: '__files__',
                  type: 'mdxJsxAttribute',
                  value: JSON.stringify(processedFiles),
                },
                {
                  name: '__dependencies__',
                  type: 'mdxJsxAttribute',
                  value: JSON.stringify(allDependencies),
                },
              ];

              const component = Index[styles[0].name][name];

              if (component.doc?.preview) {
                const example = examples.find((ex) => ex.name === name);

                if (example) {
                  node.attributes.push(
                    {
                      name: '__previewFiles__',
                      type: 'mdxJsxAttribute',
                      value: JSON.stringify(example.dependencies),
                    },
                    {
                      name: '__previewDependencies__',
                      type: 'mdxJsxAttribute',
                      value: JSON.stringify(example.files),
                    }
                  );
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
          if (node.name === 'ComponentSource') {
            try {
              for (const style of styles) {
                const component = Index[style.name][name];

                if (!component) {
                  throw new Error(
                    `Component ${name} not found in ${style.name}`
                  );
                }

                const file = component.files[0];

                const source = getComponentSourceFileContent(file)!;

                // Add code as children so that rehype can take over at build time.
                node.children?.push(
                  u('element', {
                    attributes: [
                      {
                        name: 'styleName',
                        type: 'mdxJsxAttribute',
                        value: style.name,
                      },
                      {
                        name: 'title',
                        type: 'mdxJsxAttribute',
                        value: path.basename(file),
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
                      __src__: file,
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
              const allDependencies = getAllDependencies(name);
              const processedFiles = getAllFiles(name);

              node.attributes = [
                ...(node.attributes || []),
                {
                  name: '__files__',
                  type: 'mdxJsxAttribute',
                  value: JSON.stringify(processedFiles),
                },
                {
                  name: '__dependencies__',
                  type: 'mdxJsxAttribute',
                  value: JSON.stringify(allDependencies),
                },
              ];

              // for (const style of styles) {
              //   const component = Index[style.name][name];

              //   if (!component) {
              //     throw new Error(
              //       `Component ${name} not found in ${style.name}`
              //     );
              //   }

              //   const src = component.files[0];

              //   // Read the source file.
              //   const filePath = path.join(process.cwd(), 'src', src);
              //   let source = fs.readFileSync(filePath, 'utf8');

              //   // Replace imports.
              //   // For now a simple regex should do.
              //   source = source.replaceAll(
              //     `@/registry/${style.name}/`,
              //     '@/components/'
              //   );
              //   source = source.replaceAll('export default', 'export');

              //   // Add code as children so that rehype can take over at build time.
              //   node.children?.push(
              //     u('element', {
              //       children: [
              //         u('element', {
              //           children: [
              //             {
              //               type: 'text',
              //               value: source,
              //             },
              //           ],
              //           properties: {
              //             className: ['language-tsx'],
              //           },
              //           tagName: 'code',
              //         }),
              //       ],
              //       properties: {
              //         __src__: src,
              //         __style__: style.name,
              //       },
              //       tagName: 'pre',
              //     })
              //   );
              // }
            } catch (error) {
              console.error(error);
            }
          }
        }

        const source = getComponentSourceFileContent(node);

        if (source) {
          const { value: src } = getNodeAttributeByName(node, 'src') || {};

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
