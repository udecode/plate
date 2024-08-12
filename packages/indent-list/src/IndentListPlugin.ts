import {
  ELEMENT_DEFAULT,
  KEY_DESERIALIZE_HTML,
  type PlateRenderElementProps,
  type TElement,
  createPlugin,
  getPluginType,
  isHtmlBlockElement,
  postCleanHtml,
  traverseHtmlElements,
} from '@udecode/plate-common';

import type { GetSiblingIndentListOptions } from './queries/getSiblingIndentList';
import type { ListStyleType } from './types';

import { injectIndentListComponent } from './injectIndentListComponent';
import { onKeyDownIndentList } from './onKeyDownIndentList';
import { withIndentList } from './withIndentList';

export const KEY_LIST_STYLE_TYPE = 'listStyleType';

export const KEY_LIST_START = 'listStart';

export const KEY_LIST_RESTART = 'listRestart';

export const KEY_LIST_CHECKED = 'checked';

export const KEY_TODO_STYLE_TYPE = 'todo';

export type MarkerFC = React.FC<Omit<PlateRenderElementProps, 'children'>>;

export type LiFC = React.FC<PlateRenderElementProps>;

export interface IndentListPluginOptions {
  /** X Map html element to list style type. */
  getListStyleType?: (element: HTMLElement) => ListStyleType;

  getSiblingIndentListOptions?: GetSiblingIndentListOptions<TElement>;

  listStyleTypes?: Record<
    string,
    {
      isOrdered?: boolean;
      liComponent?: LiFC;
      markerComponent?: MarkerFC;
      type: string;
    }
  >;
}

export const IndentListPlugin = createPlugin<
  'listStyleType',
  IndentListPluginOptions
>({
  handlers: {
    onKeyDown: onKeyDownIndentList,
  },
  inject: {
    belowComponent: injectIndentListComponent,
  },
  key: KEY_LIST_STYLE_TYPE,
  options: {
    getListStyleType: (element) => element.style.listStyleType as ListStyleType,
  },
  withOverrides: withIndentList,
}).extend(({ editor, plugin: { options } }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({
      // gdoc uses aria-level attribute
      indent: Number(element.getAttribute('aria-level')),
      listStyleType: options.getListStyleType?.(element),
      type: getPluginType(editor, ELEMENT_DEFAULT),
    }),
    isElement: true,
    rules: [
      {
        validNodeName: 'LI',
      },
    ],
  },
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            transformData: ({ data }) => {
              const document = new DOMParser().parseFromString(
                data,
                'text/html'
              );
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
    },
  },
}));
