import { ELEMENT_DEFAULT, createPlugin } from '@udecode/plate-common/server';

import type { IndentPluginOptions } from './types';

import { onKeyDownIndent } from './onKeyDownIndent';
import { withIndent } from './withIndent';

export const KEY_INDENT = 'indent';

export const IndentPlugin = createPlugin<'indent', IndentPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
  key: KEY_INDENT,
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
        nodeKey: KEY_INDENT,
        styleKey: 'marginLeft',
        transformNodeValue: ({ nodeValue }) => nodeValue * offset! + unit!,
        validPlugins: [ELEMENT_DEFAULT],
      },
    },
  })
);
