import { ParagraphPlugin, createPlugin } from '@udecode/plate-common';

import type { IndentPluginOptions } from './types';

import { onKeyDownIndent } from './onKeyDownIndent';
import { withIndent } from './withIndent';

export const IndentPlugin = createPlugin<'indent', IndentPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
  key: 'indent',
  options: {
    offset: 24,
    unit: 'px',
  },
  withOverrides: withIndent,
}).extend(
  ({
    plugin: {
      options: { offset, unit },
    },
  }) => ({
    inject: {
      props: {
        nodeKey: 'indent',
        styleKey: 'marginLeft',
        transformNodeValue: ({ nodeValue }) => nodeValue * offset! + unit!,
        validPlugins: [ParagraphPlugin.key],
      },
    },
  })
);
