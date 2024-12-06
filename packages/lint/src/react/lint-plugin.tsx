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
    activeAnnotation: LintAnnotation | null;
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
      setSelectedactiveAnnotation: () => boolean | undefined;
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
    activeAnnotation: null,
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
        const { activeAnnotation, annotations } = getOptions();

        const ranges = annotations.map(
          (annotation) => annotation.rangeRef.current!
        );
        const nextRange = getNextRange(editor, {
          from: activeAnnotation?.rangeRef.current,
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
      setSelectedactiveAnnotation: () => {
        if (!editor.selection) return false;

        const activeAnnotation = getOptions().annotations.find((match) =>
          isSelectionInRange(editor, { at: match.rangeRef.current! })
        );

        if (activeAnnotation) {
          setOption('activeAnnotation', activeAnnotation);

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
        setOption('activeAnnotation', match ?? null);

        if (match) {
          collapseSelection(editor);
          setSelection(editor, match!.rangeRef.current!);
          focusEditor(editor);
        }

        return match;
      },
    })
  );
