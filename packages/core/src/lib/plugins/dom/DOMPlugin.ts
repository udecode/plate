import type { Operation, ScrollIntoViewOptions } from '@udecode/slate';

import { bindFirst } from '@udecode/utils';

import type { SlateEditor } from '../../';

import { type PluginConfig, createTSlatePlugin } from '../../plugin';
import { withScrolling } from './withScrolling';

export const AUTO_SCROLL = new WeakMap<SlateEditor, boolean>();

export type AutoScrollOperationsMap = Partial<
  Record<Operation['type'], boolean>
>;

export type DomConfig = PluginConfig<
  'dom',
  {
    /** Choose the first or last matching operation as the scroll target */
    mode?: Mode;
    /**
     * Operations map; false to disable an operation, true or undefined to
     * enable
     */
    operations?: AutoScrollOperationsMap;
    /** Options passed to scrollIntoView */
    scrollOptions?: ScrollIntoViewOptions;
  }
>;

/** Mode for picking target op when multiple enabled */
export type Mode = 'first' | 'last';

/**
 * Placeholder plugin for DOM interaction, that could be replaced with
 * ReactPlugin.
 */
export const DOMPlugin = createTSlatePlugin<DomConfig>({
  key: 'dom',
  options: {
    mode: 'last',
    operations: {
      insert_node: true,
      insert_text: true,
    },
    scrollOptions: {
      scrollMode: 'if-needed',
    },
  },
})
  .extendEditorApi(({ editor }) => ({
    isScrolling: () => {
      return AUTO_SCROLL.get(editor) ?? false;
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    withScrolling: bindFirst(withScrolling, editor),
  }))
  .overrideEditor(({ api, editor, getOption, tf: { apply } }) => ({
    transforms: {
      apply(operation) {
        if (api.isScrolling()) {
          apply(operation);

          // Check if this op type is enabled (default true)
          const operations = getOption('operations')!;

          if (operations[operation.type] === false) return;

          // Gather enabled ops in this batch
          const matched = editor.operations.filter(
            (op) => operations[op.type] !== false
          );

          if (matched.length === 0) return;

          const mode = getOption('mode')!;

          // Pick target
          const targetOp = mode === 'first' ? matched[0] : matched.at(-1);

          if (!targetOp) return;

          const { offset, path } = (targetOp as any).path
            ? (targetOp as any as { path: number[]; offset?: number })
            : {};

          if (!path) return;

          const scrollOptions = getOption('scrollOptions')!;

          const scrollTarget = {
            offset: offset ?? 0,
            path,
          };

          api.scrollIntoView(scrollTarget, scrollOptions);

          return;
        }

        return apply(operation);
      },
    },
  }));
