import React from 'react';

import type { SlateRenderElementProps } from 'platejs/static';

import {
  type PluginConfig,
  type TElement,
  type TListElement,
  createTSlatePlugin,
  isDefined,
  isHtmlBlockElement,
  KEYS,
  postCleanHtml,
  traverseHtmlElements,
} from 'platejs';

import type { GetSiblingListOptions } from './queries/getSiblingList';
import type { ListStyleType } from './types';

import { isOrderedList } from './queries';
import { withList } from './withList';

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

export type BaseListConfig = PluginConfig<
  'list',
  {
    getSiblingListOptions?: GetSiblingListOptions<TElement>;
    /** Map html element to list style type. */
    getListStyleType?: (element: HTMLElement) => ListStyleType;
  }
>;

export const BaseListPlugin = createTSlatePlugin<BaseListConfig>({
  key: KEYS.list,
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
              li: Element;
              nestedLists: Element[];
            }[] = [];

            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                const nestedLists: Element[] = [];
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
                const liChildren: Node[] = [];

                childNodes.forEach((child) => {
                  if (child.nodeType === Node.ELEMENT_NODE) {
                    const childElement = child as Element;
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
    targetPlugins: [KEYS.p],
  },
  options: {
    getListStyleType: (element) => element.style.listStyleType as ListStyleType,
  },
  parsers: {
    html: {
      deserializer: {
        isElement: true,
        rules: [
          {
            validNodeName: 'LI',
          },
        ],
        parse: ({ editor, element, getOptions }) => {
          // Get indent from data-indent or aria-level (gdoc)
          const dataIndent = element.dataset.indent;
          const ariaLevel = element.getAttribute('aria-level');
          const indent = dataIndent ? Number(dataIndent) : Number(ariaLevel);

          // Get list style type from data attribute or use default
          const dataListStyleType = element.dataset.listStyleType;
          const listStyleType =
            dataListStyleType || getOptions().getListStyleType?.(element);

          return {
            indent: indent || undefined,
            listStyleType: listStyleType || undefined,
            type: editor.getType(KEYS.p),
          };
        },
      },
    },
  },
  render: {
    belowNodes: (props) => {
      if (!props.element.listStyleType) return;

      return (props) => <List {...props} />;
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
}).overrideEditor(withList);

function List(props: SlateRenderElementProps) {
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
