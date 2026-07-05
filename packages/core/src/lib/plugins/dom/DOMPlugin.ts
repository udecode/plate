import type { EditorUpdateTransaction, Operation, Point } from '@platejs/plite';
import {
  type DOMApi,
  type ScrollIntoViewOptions,
  dom as pliteDom,
} from '@platejs/plite-dom';

import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import type { BaseEditor } from '../../editor';
import { type PluginConfig, createBasePlugin } from '../../plugin';

const AUTO_SCROLL = new WeakMap<object, boolean>();

const AUTO_SCROLL_FIRST_TARGET = new WeakMap<object, Point>();

export type AutoScrollOperationsMap = Partial<
  Record<Operation['type'], boolean>
>;

export type ScrollIntoViewTarget = Point;

export type AutoScrollOptions = {
  mode?: ScrollMode;
  operations?: AutoScrollOperationsMap;
  scrollOptions?: ScrollIntoViewOptions;
};

export type PlateDomApi = {
  isAutoScrolling: () => boolean;
};

export type AutoScrollUpdate<TTx extends object = {}> = (
  tx: EditorUpdateTransaction & TTx
) => void;

export type DomConfig = PluginConfig<
  'dom',
  {
    /** Choose the first or last matching operation as the scroll target */
    scrollMode?: ScrollMode;
    /** Operations map; true enables scrolling for that operation type. */
    scrollOperations?: AutoScrollOperationsMap;
    /** Options passed to scrollIntoView */
    scrollOptions?: ScrollIntoViewOptions;
  },
  {
    dom: DOMApi & PlateDomApi;
  },
  {
    dom: {
      autoScroll: (fn: AutoScrollUpdate, options?: AutoScrollOptions) => void;
    };
  },
  {}
>;

/** Mode for picking target op when multiple enabled */
export type ScrollMode = 'first' | 'last';

const beginAutoScroll = (editor: BaseEditor, options?: AutoScrollOptions) => {
  const prevOptions = editor.getOptions(DOMPluginBase);
  const prevAutoScroll = AUTO_SCROLL.get(editor) ?? false;
  const prevFirstTarget = AUTO_SCROLL_FIRST_TARGET.get(editor);

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

    editor.setOptions(DOMPluginBase, {
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
    });
  }

  AUTO_SCROLL.set(editor, true);

  return () => {
    AUTO_SCROLL.set(editor, prevAutoScroll);
    if (prevFirstTarget) {
      AUTO_SCROLL_FIRST_TARGET.set(editor, prevFirstTarget);
    } else {
      AUTO_SCROLL_FIRST_TARGET.delete(editor);
    }
    editor.setOptions(DOMPluginBase, prevOptions);
  };
};

const scrollOperationIntoView = (editor: BaseEditor, operation: Operation) => {
  if (AUTO_SCROLL.get(editor) !== true) return;

  const {
    scrollMode,
    scrollOperations = {},
    scrollOptions,
  } = editor.getOptions(DOMPluginBase);

  if (scrollOperations[operation.type] !== true) return;
  if (!('path' in operation)) return;

  const operationTarget = {
    offset:
      'offset' in operation && typeof operation.offset === 'number'
        ? operation.offset
        : 0,
    path: operation.path,
  };
  const target =
    scrollMode === 'first'
      ? (AUTO_SCROLL_FIRST_TARGET.get(editor) ?? operationTarget)
      : operationTarget;

  if (scrollMode === 'first' && !AUTO_SCROLL_FIRST_TARGET.has(editor)) {
    AUTO_SCROLL_FIRST_TARGET.set(editor, target);
  }

  editor.api.dom.scrollIntoView(target, scrollOptions);
};

export const DOMPluginBase = createBasePlugin<DomConfig>({
  key: 'dom',
  options: {
    scrollMode: 'last',
    scrollOperations: {
      insert_node: true,
      insert_text: true,
    },
    scrollOptions: {
      scrollMode: 'if-needed',
    },
  },
})
  .extendExtension('autoScroll', {
    operations: {
      apply({ editor, next, operation }) {
        next(operation);
        scrollOperationIntoView(editor, operation);
      },
    },
  })
  .extendEditorApi(({ editor }) => ({
    dom: {
      isAutoScrolling: () => AUTO_SCROLL.get(editor) ?? false,
    },
  }))
  .extendTxGroup('dom', ({ editor }) => (tx) => ({
    autoScroll: (fn: AutoScrollUpdate, options?: AutoScrollOptions) => {
      const restore = beginAutoScroll(editor, options);

      try {
        fn(tx);
      } finally {
        restore();
      }
    },
  }));

/**
 * Plate DOM installs the Plite DOM bridge for base editors, then adds
 * Plate-owned auto-scroll state and transaction ergonomics.
 */
export const DOMPlugin = DOMPluginBase.extendExtension(
  pliteDom({ clipboard: false })
);
