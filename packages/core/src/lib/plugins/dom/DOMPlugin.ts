import type { EditorUpdateTransaction, Operation } from '@platejs/plite';
import type { StandardBehaviorOptions } from 'scroll-into-view-if-needed';

import { type PluginConfig, createEditorPlugin } from '../../plugin';
import { beginScrolling, type WithAutoScrollOptions } from './withScrolling';

export const AUTO_SCROLL = new WeakMap<object, boolean>();

export type AutoScrollOperationsMap = Partial<
  Record<Operation['type'], boolean>
>;

export type ScrollIntoViewOptions = StandardBehaviorOptions | boolean;

export type DomConfig = PluginConfig<
  'dom',
  {
    /** Choose the first or last matching operation as the scroll target */
    scrollMode?: ScrollMode;
    /**
     * Operations map; false to disable an operation, true or undefined to
     * enable
     */
    scrollOperations?: AutoScrollOperationsMap;
    /** Options passed to scrollIntoView */
    scrollOptions?: ScrollIntoViewOptions;
  },
  {},
  {},
  {},
  {
    dom: {
      withScrolling: (
        fn: (tx: EditorUpdateTransaction) => void,
        options?: WithAutoScrollOptions
      ) => void;
    };
  }
>;

/** Mode for picking target op when multiple enabled */
export type ScrollMode = 'first' | 'last';

/**
 * Placeholder plugin for DOM interaction, that could be replaced with
 * ReactPlugin.
 */
export const DOMPlugin = Object.assign(
  createEditorPlugin<DomConfig>({
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
    .extendEditorApi(({ editor }) => ({
      isScrolling: () => AUTO_SCROLL.get(editor) ?? false,
    }))
    .extendTxGroup('dom', ({ editor }) => (tx, _editor, context) => ({
      withScrolling: (
        fn: (tx: EditorUpdateTransaction) => void,
        options?: WithAutoScrollOptions
      ) => {
        const restore = beginScrolling(editor, options);

        context.afterCommit(() => {
          restore();
        });

        try {
          fn(tx);
        } catch (error) {
          restore();
          throw error;
        }
      },
    })),
  { runtimeDomOperations: true }
);
