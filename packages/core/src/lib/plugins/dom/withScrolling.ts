import type { ScrollIntoViewOptions } from '@udecode/slate';

import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import type { SlateEditor } from '../../editor';
import type { AutoScrollOperationsMap, ScrollMode } from './DOMPlugin';

import { AUTO_SCROLL, DOMPlugin } from './DOMPlugin';

export interface WithAutoScrollOptions {
  mode?: ScrollMode;
  operations?: AutoScrollOperationsMap;
  scrollOptions?: ScrollIntoViewOptions;
}

export const withScrolling = (
  editor: SlateEditor,
  fn: () => void,
  options?: WithAutoScrollOptions
) => {
  const prevOptions = editor.getOptions(DOMPlugin);
  const prevAutoScroll = AUTO_SCROLL.get(editor) ?? false;

  if (options) {
    const ops = {
      ...prevOptions,
      ...omitBy(options, isUndefined),
    };

    editor.setOptions(DOMPlugin, ops);
  }
  AUTO_SCROLL.set(editor, true);
  fn();
  // reset
  AUTO_SCROLL.set(editor, prevAutoScroll);
  editor.setOptions(DOMPlugin, prevOptions);
};
