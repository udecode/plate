import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import type {
  AutoScrollOperationsMap,
  DomConfig,
  ScrollIntoViewOptions,
  ScrollMode,
} from './DOMPlugin';

import { AUTO_SCROLL } from './DOMPlugin';

type DomPluginOptions = DomConfig['options'];

const DOM_PLUGIN = { key: 'dom' } as const;

type DomScrollingEditor = {
  getOptions: (plugin: typeof DOM_PLUGIN) => DomPluginOptions;
  setOptions: (plugin: typeof DOM_PLUGIN, options: DomPluginOptions) => void;
};

export type WithAutoScrollOptions = {
  mode?: ScrollMode;
  operations?: AutoScrollOperationsMap;
  scrollOptions?: ScrollIntoViewOptions;
};

export const withScrolling = (
  editor: DomScrollingEditor,
  fn: () => void,
  options?: WithAutoScrollOptions
) => {
  const prevOptions = editor.getOptions(DOM_PLUGIN);
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

    editor.setOptions(DOM_PLUGIN, ops);
  }

  AUTO_SCROLL.set(editor, true);

  try {
    fn();
  } finally {
    AUTO_SCROLL.set(editor, prevAutoScroll);
    editor.setOptions(DOM_PLUGIN, prevOptions);
  }
};
