import {
  type PluginConfig,
  bindFirst,
  collapseSelection,
  getNextRange,
  isSelectionInRange,
  setSelection,
} from '@udecode/plate-common';
import { createTPlatePlugin, focusEditor } from '@udecode/plate-common/react';

import type { LintAnnotation, LintConfigArray } from './types';

import { decorateLint } from './decorateLint';
import { runLint } from './runLint';

export type LintConfig = PluginConfig<
  'lint',
  {
    activeAnnotations: LintAnnotation[] | null;
    annotations: LintAnnotation[];
    configs: LintConfigArray;
  },
  {
    lint: {
      getNextMatch: (options?: {
        reverse: boolean;
      }) => LintAnnotation | undefined;
      reset: () => void;
      run: (configs: LintConfigArray) => void;
      setSelectedActiveAnnotations: () => boolean | undefined;
    };
  },
  {
    lint: {
      focusNextMatch: (options?: {
        reverse: boolean;
      }) => LintAnnotation | undefined;
    };
  }
>;

export const ExperimentalLintPlugin = createTPlatePlugin<LintConfig>({
  key: 'lint',
  decorate: decorateLint,
  node: {
    isLeaf: true,
  },
  options: {
    activeAnnotations: null,
    annotations: [],
    configs: [],
  },
  handlers: {
    onChange: ({ api, getOptions }) => {
      const { configs } = getOptions();
      api.lint.run(configs);
    },
  },
})
  .extendApi<LintConfig['api']['lint']>((ctx) => {
    const { editor, getOptions, setOption } = ctx;

    return {
      getNextMatch: (options) => {
        const { activeAnnotations, annotations } = getOptions();

        const ranges = annotations.map(
          (annotation) => annotation.rangeRef.current!
        );
        const nextRange = getNextRange(editor, {
          from: activeAnnotations?.[0]?.rangeRef.current,
          ranges,
          reverse: options?.reverse,
        });

        if (!nextRange) return;

        return annotations[ranges.indexOf(nextRange)];
      },
      reset: () => {
        setOption('configs', []);
        setOption('annotations', []);
        editor.api.redecorate();
      },
      run: bindFirst(runLint, editor),
      setSelectedActiveAnnotations: () => {
        if (!editor.selection) return false;

        const activeAnnotations = getOptions().annotations.filter((match) =>
          isSelectionInRange(editor, { at: match.rangeRef.current! })
        );

        if (activeAnnotations.length > 0) {
          setOption('activeAnnotations', activeAnnotations);

          return true;
        }

        return false;
      },
    };
  })
  .extendTransforms<LintConfig['transforms']['lint']>(
    ({ api, editor, setOption }) => ({
      focusNextMatch: (options) => {
        const match = api.lint.getNextMatch(options);
        // TODO: handle multiple active annotations
        setOption('activeAnnotations', match ? [match] : null);

        if (match) {
          collapseSelection(editor);
          setSelection(editor, match!.rangeRef.current!);
          focusEditor(editor);
        }

        return match;
      },
    })
  );
