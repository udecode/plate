import {
  type PluginConfig,
  type TElement,
  BaseParagraphPlugin,
  createTSlatePlugin,
} from '@udecode/plate';

import { withIndent } from './withIndent';

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

export interface TIndentElement extends TElement {
  indent: number;
}

export const BaseIndentPlugin = createTSlatePlugin<IndentConfig>({
  key: 'indent',
  inject: {
    isBlock: true,
    nodeProps: {
      nodeKey: 'indent',
      styleKey: 'marginLeft',
      transformNodeValue: ({ getOptions, nodeValue }) => {
        const { offset, unit } = getOptions();

        return nodeValue * offset! + unit!;
      },
    },
    targetPlugins: [BaseParagraphPlugin.key],
  },
  options: {
    offset: 24,
    unit: 'px',
  },
}).overrideEditor(withIndent);
