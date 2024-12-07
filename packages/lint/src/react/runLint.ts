import {
  collapseSelection,
  deleteText,
  experimental_parseNode,
  replaceText,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  type PlatePluginContext,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import { Range } from 'slate';

import type {
  LintConfigArray,
  LintConfigPluginRuleContext,
  LintFixer,
} from './types';

import { ExperimentalLintPlugin } from './lint-plugin';
import { resolveLintConfigs } from './utils/resolveLintConfigs';

export const runLint = (editor: PlateEditor, configs: LintConfigArray) => {
  const ctx = getEditorPlugin(editor, ExperimentalLintPlugin);
  const { setOption, tf } = ctx;

  setOption('configs', configs);

  // Create fixer actions once
  const fixerActions: LintFixer = {
    insertTextAfter: ({ range, text }) => {
      const point = Range.end(range);
      editor.insertText(text, { at: point });
    },
    insertTextBefore: ({ range, text }) => {
      const point = Range.start(range);
      editor.insertText(text, { at: point });
    },
    remove: ({ range }) => {
      deleteText(editor, { at: range });
    },
    replaceText: ({ range, text }) => {
      replaceText(editor, {
        at: range,
        text,
      });
    },
  };

  const annotations = editor.children.flatMap((node, index) => {
    const resolvedRules = resolveLintConfigs(configs, {
      id: node.id as string,
    });

    // Process each rule
    return Object.entries(resolvedRules).flatMap(([ruleId, rule]) => {
      const fixer = Object.fromEntries(
        Object.entries(fixerActions).map(([key, fn]) => [
          key,
          (options: any) => {
            fn(options);

            if (options.goNext) {
              setTimeout(() => {
                tf.lint.focusNextMatch();
              }, 0);
            } else {
              collapseSelection(editor);
              setTimeout(() => {
                setOption('activeAnnotations', null);
              }, 0);
            }
          },
        ])
      ) as LintFixer;

      const context: LintConfigPluginRuleContext = {
        ...(ctx as unknown as PlatePluginContext),
        id: ruleId,
        fixer,
        options: rule.options ?? [],
      };

      const parserOptions = rule.options.parserOptions(context);

      const { Annotation } = rule.create(context);
      const { annotations } = experimental_parseNode(editor, {
        at: [index],
        match: parserOptions?.match ?? (() => false),
        maxLength: parserOptions?.maxLength,
        minLength: parserOptions?.minLength,
        splitPattern: parserOptions?.splitPattern,
        transform: Annotation,
      });

      return annotations;
    });
  });

  setOption('annotations', annotations);
  editor.api.redecorate();
};
