import React from 'react';

import {
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import {
  isHtmlBlockElement,
  postCleanHtml,
  traverseHtmlElements,
} from '@platejs/core/internal';
import { BaseIndentPlugin } from '@platejs/indent';
import {
  ElementApi,
  property,
  schema,
  target,
  type Element,
} from '@platejs/plite';
import { KEYS, type TListElement } from '@platejs/utils';
import { isDefined } from '@udecode/utils';
import type { PliteRenderElementProps } from '@platejs/core/static';

import type { GetSiblingListOptions } from './queries/getSiblingList';
import type { ListStyleType } from './types';
import type {
  IndentListOptions,
  OutdentListOptions,
  ToggleListOptions,
} from './types';

import { isOrderedList } from './queries/isOrderedList';
import { indentListWithTx } from './transforms/indentList';
import { outdentListWithTx } from './transforms/outdentList';
import { toggleListWithTx } from './transforms/toggleList';
import { withList } from './withList';
import { withNormalizeList } from './withNormalizeList';
import { withInsertBreakList } from './normalizers/withInsertBreakList';

/**
 * All list items are normalized to have a listStart prop indicating their
 * position in the list (unless listStart would be 1, in which case it is
 * omitted).
 *
 * ListRestart causes listStart to restart from the given number, regardless of
 * any previous listStart.
 *
 * ListRestartPolite acts like listRestart, except it only takes effect for list
 * items at the start of a list. When not at the start of a list, this prop is
 * ignored, although it is not removed and may take effect in the future.
 */

export type BaseListPluginOptions = {
  getSiblingListOptions?: GetSiblingListOptions<Element>;
};

type BaseListApi = {
  isActive: (style: ListStyleType | string | readonly string[]) => boolean;
};

type BaseListContract = PluginConfig<
  'list',
  BaseListPluginOptions,
  {},
  {
    list: {
      indent: (options?: IndentListOptions) => void;
      outdent: (options?: OutdentListOptions) => void;
      toggle: (options: ToggleListOptions) => void;
    };
  },
  {},
  {},
  readonly [typeof BaseIndentPlugin],
  readonly [],
  never,
  BaseListApi
>;

const defaultOptions: BaseListPluginOptions = {};
const defaultTargetPluginKeys: readonly string[] = [KEYS.p];
const dependencies: readonly [typeof BaseIndentPlugin] = [BaseIndentPlugin];

export const BaseListPlugin = createBasePlugin({
  dependencies,
  key: KEYS.list,
  options: defaultOptions,
  schema: ({ plugins, targetPluginKeys }) => ({
    properties: [
      schema.elementProperty(KEYS.listChecked, property.boolean(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listRestart, property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listRestartPolite, property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listStart, property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listType, property.string(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          transformData: ({ data }) => {
            const document = new DOMParser().parseFromString(data, 'text/html');
            const { body } = document;

            // First pass: flatten nested UL/OL that are inside LI elements
            // We need to move them to be siblings of their parent LI
            const lisWithNestedLists: {
              li: globalThis.Element;
              nestedLists: globalThis.Element[];
            }[] = [];

            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                const nestedLists: globalThis.Element[] = [];
                // Find nested UL/OL elements
                Array.from(element.children).forEach((child) => {
                  if (child.tagName === 'UL' || child.tagName === 'OL') {
                    nestedLists.push(child);
                  }
                });

                if (nestedLists.length > 0) {
                  lisWithNestedLists.push({ li: element, nestedLists });
                }
              }
              return true;
            });

            // Move nested lists to be after their parent LI
            lisWithNestedLists.forEach(({ li, nestedLists }) => {
              nestedLists.forEach((nestedList) => {
                // Remove the nested list from inside the LI
                nestedList.remove();
                // Insert it after the LI in the parent container
                if (li.parentNode) {
                  li.parentNode.insertBefore(nestedList, li.nextSibling);
                }
              });
            });

            // Second pass: process LI elements (now without nested lists inside them)
            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                const htmlElement = element as HTMLElement;
                const { childNodes } = element;

                // Process li children and flatten block elements
                const liChildren: globalThis.Node[] = [];

                childNodes.forEach((child) => {
                  if (child.nodeType === Node.ELEMENT_NODE) {
                    const childElement = child as globalThis.Element;
                    if (isHtmlBlockElement(childElement)) {
                      // Replace block elements (e.g. p) with their children
                      liChildren.push(...childElement.childNodes);
                      return;
                    }
                  }
                  liChildren.push(child);
                });

                element.replaceChildren(...liChildren);

                // Check for aria-level first (Google Docs uses this)
                const ariaLevel = element.getAttribute('aria-level');

                if (ariaLevel) {
                  // aria-level takes precedence
                  htmlElement.dataset.indent = ariaLevel;
                } else {
                  // Calculate indent level based on nested UL/OL parents
                  let indent = 0;
                  let parent = element.parentElement;
                  while (parent && parent !== body) {
                    if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                      indent++;
                    }
                    parent = parent.parentElement;
                  }

                  // Set indent level as data attribute
                  if (indent > 0) {
                    htmlElement.dataset.indent = String(indent);
                  }
                }

                // Set list style type from inline style or parent list type
                const listStyleType = htmlElement.style.listStyleType;
                if (listStyleType) {
                  htmlElement.dataset.listStyleType = listStyleType;
                } else {
                  // Fallback to parent list type
                  const listParent = element.closest('ul, ol');
                  if (listParent) {
                    const parentListStyleType = (listParent as HTMLElement)
                      .style.listStyleType;
                    if (parentListStyleType) {
                      htmlElement.dataset.listStyleType = parentListStyleType;
                    } else if (listParent.tagName === 'UL') {
                      htmlElement.dataset.listStyleType = 'disc';
                    } else if (listParent.tagName === 'OL') {
                      htmlElement.dataset.listStyleType = 'decimal';
                    }
                  }
                }

                return false;
              }

              return true;
            });

            return postCleanHtml(body.innerHTML);
          },
        },
      },
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'LI',
          },
        ],
        parse: ({ element, registry }) => {
          // Get indent from data-indent or aria-level (gdoc)
          const dataIndent = element.dataset.indent;
          const ariaLevel = element.getAttribute('aria-level');
          const indent = dataIndent ? Number(dataIndent) : Number(ariaLevel);

          // Get list style type from data attribute or use default
          const dataListStyleType = element.dataset.listStyleType;
          const listStyleType =
            dataListStyleType || element.style.listStyleType;

          return {
            indent: indent || undefined,
            listStyleType: listStyleType || undefined,
            type: registry.getType(KEYS.p),
          };
        },
      },
    },
  },
  render: {
    belowNodes: (props) => {
      if (!props.element.listStyleType) return;

      return (props) => <List {...(props as PliteRenderElementProps)} />;
    },
  },
  rules: {
    break: {
      empty: 'reset',
      splitReset: false,
    },
    delete: {
      start: 'reset',
    },
    merge: {
      removeEmpty: false,
    },
    match: ({ node }) => isDefined(node[KEYS.listType]),
  },
  targetPluginKeys: defaultTargetPluginKeys,
})
  .extendApi<BaseListContract['pluginApi']>(({ editor }) => ({
    isActive: (style: ListStyleType | string | readonly string[]) => {
      const selection = editor.read.selection();

      if (!selection) return false;

      const styles = Array.isArray(style) ? style : [style];

      return editor.read.nodes.some({
        match: (node) => {
          if (!ElementApi.isElement(node)) return false;

          const isTodo = Object.hasOwn(node, KEYS.listChecked);

          return (
            styles.includes(node[KEYS.listType] as string) &&
            (styles.includes(KEYS.listTodo) ? isTodo : !isTodo)
          );
        },
      });
    },
  }))
  .extendTx(({ editor }) => (tx) => ({
    indent: (options?: IndentListOptions) => indentListWithTx(tx, options),
    outdent: (options?: OutdentListOptions) => outdentListWithTx(tx, options),
    toggle: (options: ToggleListOptions) =>
      toggleListWithTx(editor, tx, options, options.getSiblingListOptions),
  }))
  .extendExtension('behavior', withList)
  .extendExtension(withNormalizeList)
  .extendExtension(withInsertBreakList);

export type BaseListConfig = InferConfig<typeof BaseListPlugin>;

function List(props: PliteRenderElementProps) {
  const { listStart, listStyleType } = props.element as TListElement;
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  return (
    <List
      style={{ listStyleType, margin: 0, padding: 0, position: 'relative' }}
      start={listStart}
    >
      <li>{props.children}</li>
    </List>
  );
}
