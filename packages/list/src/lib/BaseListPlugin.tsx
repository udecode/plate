import React from 'react';

import {
  type PluginConfig,
  type SlateRenderElementProps,
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

            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                const { childNodes } = element;

                // replace li block children (e.g. p) by their children
                const liChildren: Node[] = [];
                childNodes.forEach((child) => {
                  if (isHtmlBlockElement(child as Element)) {
                    liChildren.push(...child.childNodes);
                  } else {
                    liChildren.push(child);
                  }
                });

                element.replaceChildren(...liChildren);

                // Check for aria-level first (Google Docs uses this)
                const ariaLevel = element.getAttribute('aria-level');
                if (ariaLevel) {
                  // aria-level takes precedence
                  element.setAttribute('data-indent', ariaLevel);
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
                    element.setAttribute('data-indent', String(indent));
                  }
                }
                
                // Set list style type from inline style or parent list type
                const listStyleType = (element as HTMLElement).style.listStyleType;
                if (listStyleType) {
                  element.setAttribute('data-list-style-type', listStyleType);
                } else {
                  // Fallback to parent list type
                  const listParent = element.closest('ul, ol');
                  if (listParent) {
                    const parentListStyleType = (listParent as HTMLElement).style.listStyleType;
                    if (parentListStyleType) {
                      element.setAttribute('data-list-style-type', parentListStyleType);
                    } else if (listParent.tagName === 'UL') {
                      element.setAttribute('data-list-style-type', 'disc');
                    } else if (listParent.tagName === 'OL') {
                      element.setAttribute('data-list-style-type', 'decimal');
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
          const dataIndent = element.getAttribute('data-indent');
          const ariaLevel = element.getAttribute('aria-level');
          const indent = dataIndent ? Number(dataIndent) : Number(ariaLevel);
          
          // Get list style type from data attribute or use default
          const dataListStyleType = element.getAttribute('data-list-style-type');
          const listStyleType = dataListStyleType || getOptions().getListStyleType?.(element);
          
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
    match: ({ node }) => {
      return isDefined(node[KEYS.listType]);
    },
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
