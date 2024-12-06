import {
  type PluginConfig,
  getNextRange,
  isSelectionInRange,
} from '@udecode/plate-common';
import { createTPlatePlugin, focusEditor } from '@udecode/plate-common/react';

import type { LintConfigArray, LintToken } from './types';

import { decorateLint } from './decorateLint';

export type LintConfig = PluginConfig<
  'lint',
  {
    activeToken: LintToken | null;
    configs: LintConfigArray;
    tokens: LintToken[];
  },
  {
    lint: {
      getNextMatch: (options?: { reverse: boolean }) => LintToken | undefined;
      reset: () => void;
      run: (configs: LintConfigArray) => void;
      setSelectedActiveToken: () => boolean | undefined;
    };
  },
  {
    lint: {
      focusNextMatch: (options?: { reverse: boolean }) => LintToken | undefined;
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
    activeToken: null,
    configs: [],
    tokens: [],
  },
})
  .extendApi<LintConfig['api']['lint']>((ctx) => {
    const { editor, getOptions, setOption } = ctx;

    return {
      getNextMatch: (options) => {
        const { activeToken, tokens } = getOptions();

        const ranges = tokens.map((token) => token.rangeRef.current!);
        const nextRange = getNextRange(editor, {
          from: activeToken?.rangeRef.current,
          ranges,
          reverse: options?.reverse,
        });

        if (!nextRange) return;

        return tokens[ranges.indexOf(nextRange)];
      },
      reset: () => {
        setOption('configs', []);
        editor.api.redecorate();
      },
      run: (configs) => {
        setOption('configs', configs);
        editor.api.redecorate();
      },
      setSelectedActiveToken: () => {
        if (!editor.selection) return false;

        const activeToken = getOptions().tokens.find((match) =>
          isSelectionInRange(editor, { at: match.rangeRef.current! })
        );

        if (activeToken) {
          setOption('activeToken', activeToken);

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
        setOption('activeToken', match ?? null);

        if (match) {
          focusEditor(editor, match!.rangeRef.current!);
        }

        return match;
      },
    })
  );
