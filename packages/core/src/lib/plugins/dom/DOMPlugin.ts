import {
  type EditorUpdateTransaction,
  type Path,
  PathApi,
  type Point,
} from '@platejs/plite';
import type {
  DOMApi as PliteDomApi,
  DOMClipboardApi,
  ScrollIntoViewOptions,
} from '@platejs/plite-dom';
import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

import { plateDOMExtension } from '../../../internal/plugin/plateNativeExtensions';
import { defineBasePlugin, type DefinitionOf } from '../../plugin';

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

export type DomPluginState = {
  /** Choose the first or last matching change as the scroll target. */
  scrollMode: ScrollMode;
  /** Change map; true enables scrolling for that canonical change kind. */
  scrollChanges: AutoScrollChangesMap;
  /** Options passed to scrollIntoView. */
  scrollOptions: ScrollIntoViewOptions;
};

export type AutoScrollUpdate<TTx extends object = {}> = (
  tx: EditorUpdateTransaction & TTx
) => void;

type PlateDomPluginUpdate = {
  autoScroll: (fn: AutoScrollUpdate, options?: AutoScrollOptions) => void;
};

export type DomPluginUpdate = PlateDomPluginUpdate &
  Pick<DOMClipboardApi, 'insertData'>;

export type DomApi = PlateDomApi &
  PliteDomApi & {
    clipboard: DOMClipboardApi;
  };

/** Mode for picking a target when multiple enabled changes are present. */
export type ScrollMode = 'first' | 'last';

const initialState: DomPluginState = {
  scrollMode: 'last',
  scrollChanges: {
    structure: true,
    text: true,
  },
  scrollOptions: {
    scrollMode: 'if-needed',
  },
};

export const DOMPluginBase = defineBasePlugin('dom', {
  api: ({ editor }): PlateDomApi => ({
    isAutoScrolling: () => AUTO_SCROLL.get(editor) ?? false,
  }),
  initialState,
  on: {
    transactionChange({ changed, editor, selectionAfterRoot, store, tx }) {
      if (AUTO_SCROLL.get(editor) !== true) return;

      const { scrollMode, scrollChanges = {}, scrollOptions } = store.get();
      const propertiesChanged = changed.has('properties', selectionAfterRoot);
      const structureChanged = changed.has('structure', selectionAfterRoot);
      const textChanged = changed.has('text', selectionAfterRoot);

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
      const changedPaths = changed.paths(selectionAfterRoot);
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
    },
  },
  update: ({ editor, store, tx }): PlateDomPluginUpdate => ({
    autoScroll: (fn, options) => {
      const previousState = store.get();
      const prevAutoScroll = AUTO_SCROLL.get(editor) ?? false;
      const prevFirstTarget = AUTO_SCROLL_FIRST_TARGET.get(editor);

      if (options) {
        const scrollOptions =
          typeof options.scrollOptions === 'object' && options.scrollOptions
            ? {
                ...(typeof previousState.scrollOptions === 'object'
                  ? previousState.scrollOptions
                  : {}),
                ...omitBy(options.scrollOptions, isUndefined),
              }
            : (options.scrollOptions ?? previousState.scrollOptions);

        store.set({
          ...previousState,
          scrollChanges: {
            ...previousState.scrollChanges,
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

      try {
        fn(tx);
      } finally {
        AUTO_SCROLL.set(editor, prevAutoScroll);
        if (prevFirstTarget) {
          AUTO_SCROLL_FIRST_TARGET.set(editor, prevFirstTarget);
        } else {
          AUTO_SCROLL_FIRST_TARGET.delete(editor);
        }
        store.set(previousState);
      }
    },
  }),
});

/**
 * Plate DOM installs the Plite DOM bridge for base editors, then adds
 * Plate-owned auto-scroll state and transaction ergonomics.
 */
export const DOMPlugin = DOMPluginBase.extend(plateDOMExtension);

export type DomDefinition = DefinitionOf<typeof DOMPlugin>;
