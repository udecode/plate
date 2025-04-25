import type { ScrollIntoViewOptions } from '@udecode/slate';

import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import type { SlateEditor } from '../../editor';

import {
  type AutoScrollOperationsMap,
  type Mode,
  AUTO_SCROLL,
  ScrollPlugin,
} from './ScrollPlugin';

export interface WithAutoScrollOptions {
  mode?: Mode;
  operations?: AutoScrollOperationsMap;
  scrollOptions?: ScrollIntoViewOptions;
}

export const withScroll = (
  editor: SlateEditor,
  fn: () => void,
  options?: WithAutoScrollOptions
) => {
  const prevOptions = editor.getOptions(ScrollPlugin);
  const prevAutoScroll = AUTO_SCROLL.get(editor) ?? false;

  if (options) {
    const ops = {
      ...prevOptions,
      ...omitBy(options, isUndefined),
    };

    editor.setOptions(ScrollPlugin, ops);
  }
  AUTO_SCROLL.set(editor, true);
  fn();
  // reset
  AUTO_SCROLL.set(editor, prevAutoScroll);
  editor.setOptions(ScrollPlugin, prevOptions);
};
