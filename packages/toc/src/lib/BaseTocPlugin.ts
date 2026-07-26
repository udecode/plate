import {
  type BaseEditor,
  type InferConfig,
  createBasePlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { Heading } from './types';

import { insertToc } from './transforms/insertToc';

export type TocPluginOptions = {
  isScroll: boolean;
  topOffset: number;
  queryHeading?: (editor: BaseEditor) => Heading[];
};

const defaultOptions: TocPluginOptions = {
  isScroll: true,
  topOffset: 80,
};

export const BaseTocPlugin = createBasePlugin({
  key: KEYS.toc,
  schema: {
    element: {
      void: 'block',
    },
  },
  options: defaultOptions,
  update: ({ editor, tx }) => ({
    insert: (options?: Parameters<typeof insertToc>[2]) =>
      insertToc(editor, tx, options),
  }),
});

export type TocConfig = InferConfig<typeof BaseTocPlugin>;
