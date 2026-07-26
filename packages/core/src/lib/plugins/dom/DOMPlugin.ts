import {
  type EditorTransactionChanged,
  type EditorUpdateTransaction,
  type Path,
  PathApi,
  type Point,
} from '@platejs/plite';
import {
  type DOMApi,
  type DOMClipboardApi,
  type ScrollIntoViewOptions,
  dom as pliteDom,
} from '@platejs/plite-dom';

import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import { type PluginConfig, createBasePlugin } from '../../plugin';
import type { BaseEditor } from '../../editor';

const AUTO_SCROLL = new WeakMap<object, boolean>();

const AUTO_SCROLL_FIRST_TARGET = new WeakMap<object, ScrollIntoViewTarget>();

export type AutoScrollChangeKind = 'properties' | 'structure' | 'text';

export type AutoScrollChangesMap = Partial<
  Record<AutoScrollChangeKind, boolean>
>;

export type ScrollIntoViewTarget = Path | Point;

export type AutoScrollOptions = {
  mode?: ScrollMode;
  changes?: AutoScrollChangesMap;
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
    /** Choose the first or last matching change as the scroll target. */
    scrollMode?: ScrollMode;
    /** Change map; true enables scrolling for that canonical change kind. */
    scrollChanges?: AutoScrollChangesMap;
    /** Options passed to scrollIntoView */
    scrollOptions?: ScrollIntoViewOptions;
  },
  {
    clipboard: DOMClipboardApi;
    dom: DOMApi & PlateDomApi;
  },
  {
    dom: {
      autoScroll: (fn: AutoScrollUpdate, options?: AutoScrollOptions) => void;
    };
  },
  {}
>;

/** Mode for picking a target when multiple enabled changes are present. */
export type ScrollMode = 'first' | 'last';

const beginAutoScroll = (editor: BaseEditor, options?: AutoScrollOptions) => {
  const prevOptions = editor.plugin(DOMPluginBase).getOptions();
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

    editor.plugin(DOMPluginBase).setOptions({
      ...prevOptions,
      scrollChanges: {
        ...prevOptions.scrollChanges,
        ...omitBy(options.changes ?? {}, isUndefined),
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
    editor.plugin(DOMPluginBase).setOptions(prevOptions);
  };
};

const scrollChangeIntoView = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  changed: EditorTransactionChanged,
  root: string | undefined
) => {
  if (AUTO_SCROLL.get(editor) !== true) return;

  const {
    scrollMode,
    scrollChanges = {},
    scrollOptions,
  } = editor.plugin(DOMPluginBase).getOptions();

  const propertiesChanged = changed.has('properties', root);
  const structureChanged = changed.has('structure', root);
  const textChanged = changed.has('text', root);

  if (
    !(
      (structureChanged && scrollChanges.structure) ||
      (textChanged && scrollChanges.text) ||
      (propertiesChanged && scrollChanges.properties)
    )
  ) {
    return;
  }

  const shouldScrollNode =
    (structureChanged && scrollChanges.structure) ||
    (propertiesChanged && scrollChanges.properties);
  const changedPaths = changed.paths(root);

  const shallowPaths = shouldScrollNode
    ? changedPaths.filter(
        (path, index, paths) =>
          !paths.some(
            (candidate, candidateIndex) =>
              candidateIndex !== index &&
              candidate.length < path.length &&
              candidate.every((part, partIndex) => part === path[partIndex])
          )
      )
    : [];
  const changedPath =
    scrollMode === 'first' ? shallowPaths[0] : shallowPaths.at(-1);
  const selectionTarget = tx.selection()?.focus;
  const selectionTouchesChange =
    selectionTarget &&
    changedPaths.some((path) => PathApi.equals(path, selectionTarget.path));
  const deepestPaths = textChanged
    ? changedPaths.filter(
        (path, index, paths) =>
          !paths.some(
            (candidate, candidateIndex) =>
              candidateIndex !== index &&
              candidate.length > path.length &&
              path.every((part, partIndex) => part === candidate[partIndex])
          )
      )
    : [];
  const changedTextPath =
    scrollMode === 'first' ? deepestPaths[0] : deepestPaths.at(-1);

  const changeTarget: ScrollIntoViewTarget | undefined = changedPath
    ? [...changedPath]
    : selectionTouchesChange
      ? selectionTarget
      : changedTextPath
        ? [...changedTextPath]
        : selectionTarget;

  if (!changeTarget) return;

  const target =
    scrollMode === 'first'
      ? (AUTO_SCROLL_FIRST_TARGET.get(editor) ?? changeTarget)
      : changeTarget;

  if (scrollMode === 'first' && !AUTO_SCROLL_FIRST_TARGET.has(editor)) {
    AUTO_SCROLL_FIRST_TARGET.set(editor, target);
  }

  editor.api.dom.scrollIntoView(target, scrollOptions);
};

export const DOMPluginBase = createBasePlugin<DomConfig>({
  extension: ({ editor }) => ({
    api: {
      dom: {
        isAutoScrolling: () => AUTO_SCROLL.get(editor) ?? false,
      },
    },
    key: 'autoScroll',
    onTransactionChange({ changed, selectionAfterRoot, tx }) {
      scrollChangeIntoView(editor, tx, changed, selectionAfterRoot);
    },
  }),
  key: 'dom',
  options: {
    scrollMode: 'last',
    scrollChanges: {
      structure: true,
      text: true,
    },
    scrollOptions: {
      scrollMode: 'if-needed',
    },
  },
  update: ({ editor, tx }) => ({
    autoScroll: (fn, options) => {
      const restore = beginAutoScroll(editor, options);

      try {
        fn(tx);
      } finally {
        restore();
      }
    },
  }),
});

/**
 * Plate DOM installs the Plite DOM bridge for base editors, then adds
 * Plate-owned auto-scroll state and transaction ergonomics.
 */
export const DOMPlugin = DOMPluginBase.extend<{
  extension: ReturnType<typeof pliteDom>;
}>(() => ({
  extension: pliteDom(),
}));
