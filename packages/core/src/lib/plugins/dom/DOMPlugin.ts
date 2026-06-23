import type { Operation, Range } from '@platejs/plite';
import type { StandardBehaviorOptions } from 'scroll-into-view-if-needed';

import { bindFirst } from '@udecode/utils';

import { withLegacyTransformOverride } from '../../../internal/plugin/withLegacyTransformOverride';
import { type PluginConfig, createEditorPlugin } from '../../plugin';
import { withScrolling } from './withScrolling';

export const AUTO_SCROLL = new WeakMap<object, boolean>();

export type AutoScrollOperationsMap = Partial<
  Record<Operation['type'], boolean>
>;

export type ScrollIntoViewOptions = StandardBehaviorOptions | boolean;

const getOperationScrollTarget = (operation: Operation) => {
  const candidate = operation as Operation & {
    offset?: unknown;
    path?: unknown;
  };

  if (!Array.isArray(candidate.path)) return null;

  return {
    offset: typeof candidate.offset === 'number' ? candidate.offset : 0,
    path: candidate.path,
  };
};

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
  }
>;

/** Mode for picking target op when multiple enabled */
export type ScrollMode = 'first' | 'last';

/**
 * Placeholder plugin for DOM interaction, that could be replaced with
 * ReactPlugin.
 */
const BaseDOMPlugin = createEditorPlugin<DomConfig>({
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
}).extendEditorApi(({ editor }) => ({
  isScrolling: () => AUTO_SCROLL.get(editor) ?? false,
}));

const DOMPluginWithScrolling = withLegacyTransformOverride(
  BaseDOMPlugin,
  ({ api, editor, getOption, tf: { apply } }) => ({
    tf: {
      withScrolling: bindFirst(withScrolling, editor),
      apply(operation: unknown) {
        const slateOperation = operation as Operation;

        if (api.isScrolling()) {
          apply(slateOperation as never);

          // Check if this op type is enabled (default true)
          const scrollOperations = getOption(
            'scrollOperations'
          ) as AutoScrollOperationsMap;

          if (!scrollOperations[slateOperation.type]) return;

          // Gather enabled ops in this batch
          const matched = editor.operations.filter(
            (op) => !!scrollOperations[op.type]
          );

          if (matched.length === 0) return;

          const mode = getOption('scrollMode') as ScrollMode;

          // Pick target
          const targetOp = mode === 'first' ? matched[0] : matched.at(-1);

          if (!targetOp) return;

          const target = getOperationScrollTarget(targetOp);

          if (!target) return;

          const scrollOptions = getOption(
            'scrollOptions'
          ) as ScrollIntoViewOptions;

          api.scrollIntoView(target, scrollOptions);

          return;
        }

        return apply(slateOperation as never);
      },
    },
  })
);

export const DOMPlugin = withLegacyTransformOverride(
  DOMPluginWithScrolling,
  ({ editor, tf: { apply } }) => ({
    tf: {
      apply(operation: unknown) {
        const slateOperation = operation as Operation;

        if (slateOperation.type === 'set_selection') {
          const { properties } = slateOperation;
          editor.dom.prevSelection = properties as Range | null;
          apply(slateOperation as never);
          editor.dom.currentKeyboardEvent = null;
          return;
        }

        apply(slateOperation as never);
      },
    },
  })
);
