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

                // TODO: recursive check on ul parents for indent

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
          return {
            // gdoc uses aria-level attribute
            indent: Number(element.getAttribute('aria-level')),
            listStyleType: getOptions().getListStyleType?.(element),
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
