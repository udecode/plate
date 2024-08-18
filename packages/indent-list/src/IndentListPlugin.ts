import {
  DeserializeHtmlPlugin,
  ParagraphPlugin,
  type PlateRenderElementProps,
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
  isHtmlBlockElement,
  postCleanHtml,
  traverseHtmlElements,
} from '@udecode/plate-common';

import type { GetSiblingIndentListOptions } from './queries/getSiblingIndentList';
import type { ListStyleType } from './types';

import { injectIndentListComponent } from './injectIndentListComponent';
import { onKeyDownIndentList } from './onKeyDownIndentList';
import { withIndentList } from './withIndentList';

export const INDENT_LIST_KEYS = {
  checked: 'checked',
  listRestart: 'listRestart',
  listStart: 'listStart',
  todo: 'todo',
} as const;

export type IndentListConfig = PluginConfig<
  'listStyleType',
  {
    /** X Map html element to list style type. */
    getListStyleType?: (element: HTMLElement) => ListStyleType;

    getSiblingIndentListOptions?: GetSiblingIndentListOptions<TElement>;

    listStyleTypes?: Record<
      string,
      {
        isOrdered?: boolean;
        liComponent?: React.FC<PlateRenderElementProps>;
        markerComponent?: React.FC<Omit<PlateRenderElementProps, 'children'>>;
        type: string;
      }
    >;
  }
>;

export const IndentListPlugin = createTSlatePlugin<IndentListConfig>({
  handlers: {
    onKeyDown: onKeyDownIndentList,
  },
  inject: {
    belowComponent: injectIndentListComponent,
  },
  key: 'listStyleType',
  options: {
    getListStyleType: (element) => element.style.listStyleType as ListStyleType,
  },
  withOverrides: withIndentList,
}).extend(({ editor, options }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({
      // gdoc uses aria-level attribute
      indent: Number(element.getAttribute('aria-level')),
      listStyleType: options.getListStyleType?.(element),
      type: editor.getType(ParagraphPlugin),
    }),
    isElement: true,
    rules: [
      {
        validNodeName: 'LI',
      },
    ],
  },
  inject: {
    plugins: {
      [DeserializeHtmlPlugin.key]: {
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
