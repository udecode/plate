import type { ScrollIntoViewOptions } from '@platejs/slate';

import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import type { SlateEditor } from '../../editor';
import type { AutoScrollOperationsMap, ScrollMode } from './DOMPlugin';

import { AUTO_SCROLL, DOMPlugin } from './DOMPlugin';

export type WithAutoScrollOptions = {
  mode?: ScrollMode;
  operations?: AutoScrollOperationsMap;
  scrollOptions?: ScrollIntoViewOptions;
};

export const withScrolling = (
  editor: SlateEditor,
  fn: () => void,
  options?: WithAutoScrollOptions
) => {
  const prevOptions = editor.getOptions(DOMPlugin);
  const prevAutoScroll = AUTO_SCROLL.get(editor) ?? false;

  if (options) {
    const scrollOptions =
      typeof options.scrollOptions === 'object' && options.scrollOptions
        ? {
            ...(typeof prevOptions.scrollOptions === 'object'
              ? prevOptions.scrollOptions
              : {}),
            ...omitBy(options.scrollOptions, isUndefined),
          }
        : (options.scrollOptions ?? prevOptions.scrollOptions);

    const ops = {
      ...prevOptions,
      scrollOperations: {
        ...prevOptions.scrollOperations,
        ...omitBy(options.operations ?? {}, isUndefined),
      },
      scrollOptions,
      ...omitBy(
        {
          scrollMode: options.mode,
        },
        isUndefined
      ),
    };

    editor.setOptions(DOMPlugin, ops);
  }

  AUTO_SCROLL.set(editor, true);

  try {
    fn();
  } finally {
    AUTO_SCROLL.set(editor, prevAutoScroll);
    editor.setOptions(DOMPlugin, prevOptions);
  }
};
