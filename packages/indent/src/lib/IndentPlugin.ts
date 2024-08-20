import {
  ParagraphPlugin,
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { withIndent } from './withIndent';

export interface TIndentElement extends TElement {
  indent: number;
}

export type IndentConfig = PluginConfig<
  'indent',
  {
    /** Maximum number of indentation. */
    indentMax?: number;

    /**
     * Indentation offset used in `(offset * element.indent) + unit`.
     *
     * @default 40
     */
    offset?: number;

    /**
     * Indentation unit used in `(offset * element.indent) + unit`.
     *
     * @default 'px'
     */
    unit?: string;
  }
>;

export const IndentPlugin = createTSlatePlugin<IndentConfig>({
  key: 'indent',
  options: {
    offset: 24,
    unit: 'px',
  },
  withOverrides: withIndent,
}).extend(({ options: { offset, unit } }) => ({
  inject: {
    props: {
      nodeKey: 'indent',
      styleKey: 'marginLeft',
      transformNodeValue: ({ nodeValue }) => nodeValue * offset! + unit!,
    },
    targetPlugins: [ParagraphPlugin.key],
  },
}));
