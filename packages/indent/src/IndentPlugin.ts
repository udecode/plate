import {
  ParagraphPlugin,
  type PluginConfig,
  createTPlugin,
} from '@udecode/plate-common';

import { onKeyDownIndent } from './onKeyDownIndent';
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

export const IndentPlugin = createTPlugin<IndentConfig>({
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
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
