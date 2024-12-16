import {
  type PlateRenderElementStaticProps,
  type PluginConfig,
  type TElement,
  BaseParagraphPlugin,
  HtmlPlugin,
  createTSlatePlugin,
  isHtmlBlockElement,
  postCleanHtml,
  traverseHtmlElements,
} from '@udecode/plate-common';

import type { GetSiblingIndentListOptions } from './queries/getSiblingIndentList';
import type { ListStyleType } from './types';

import { renderIndentListBelowNodes } from './renderIndentListBelowNodes';
import { withIndentList } from './withIndentList';

export const INDENT_LIST_KEYS = {
  checked: 'checked',
  listRestart: 'listRestart',
  listStart: 'listStart',
  todo: 'todo',
} as const;

export type BaseIndentListConfig = PluginConfig<
  'listStyleType',
  {
    listStyleTypes?: Record<
      string,
      {
        type: string;
        markerComponent?: React.FC<
          Omit<PlateRenderElementStaticProps, 'children'>
        >;
        isOrdered?: boolean;
        liComponent?: React.FC<PlateRenderElementStaticProps>;
      }
    >;

    /** Map html element to list style type. */
    getListStyleType?: (element: HTMLElement) => ListStyleType;

    getSiblingIndentListOptions?: GetSiblingIndentListOptions<TElement>;
  }
>;

export const BaseIndentListPlugin = createTSlatePlugin<BaseIndentListConfig>({
  key: 'listStyleType',
  extendEditor: withIndentList,
  inject: {
    plugins: {
      [HtmlPlugin.key]: {
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
  },
  options: {
    getListStyleType: (element) => element.style.listStyleType as ListStyleType,
  },
  parsers: {
    html: {
      deserializer: {
        isElement: true,
        parse: ({ editor, element, getOptions }) => ({
          // gdoc uses aria-level attribute
          indent: Number(element.getAttribute('aria-level')),
          listStyleType: getOptions().getListStyleType?.(element),
          type: editor.getType(BaseParagraphPlugin),
        }),
        rules: [
          {
            validNodeName: 'LI',
          },
        ],
      },
    },
  },
  render: {
    belowNodes: renderIndentListBelowNodes,
  },
});
