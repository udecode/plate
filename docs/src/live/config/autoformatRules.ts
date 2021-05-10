import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_DEFAULT,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  getParent,
  insertEmptyCodeBlock,
  isElement,
  isType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  SPEditor,
  toggleList,
  unwrapList,
  WithAutoformatOptions,
} from '@udecode/slate-plugins';
import { getSlatePluginType } from '@udecode/slate-plugins-core';

const preFormat: AutoformatRule['preFormat'] = (editor) =>
  unwrapList(editor as SPEditor);

export const optionsAutoformat: WithAutoformatOptions = {
  rules: [
    {
      type: ELEMENT_H1,
      markup: '#',
      preFormat,
    },
    {
      type: ELEMENT_H2,
      markup: '##',
      preFormat,
    },
    {
      type: ELEMENT_H3,
      markup: '###',
      preFormat,
    },
    {
      type: ELEMENT_H4,
      markup: '####',
      preFormat,
    },
    {
      type: ELEMENT_H5,
      markup: '#####',
      preFormat,
    },
    {
      type: ELEMENT_H6,
      markup: '######',
      preFormat,
    },
    {
      type: ELEMENT_LI,
      markup: ['*', '-'],
      preFormat,
      format: (editor) => {
        if (editor.selection) {
          const parentEntry = getParent(editor, editor.selection);
          if (!parentEntry) return;
          const [node] = parentEntry;
          if (
            isElement(node) &&
            !isType((editor as any) as SPEditor, node, ELEMENT_CODE_BLOCK) &&
            !isType((editor as any) as SPEditor, node, ELEMENT_CODE_LINE)
          ) {
            toggleList((editor as any) as SPEditor, {
              type: ELEMENT_UL,
            });
          }
        }
      },
    },
    {
      type: ELEMENT_LI,
      markup: ['1.', '1)'],
      preFormat,
      format: (editor) => {
        if (editor.selection) {
          const parentEntry = getParent(editor, editor.selection);
          if (!parentEntry) return;
          const [node] = parentEntry;
          if (
            isElement(node) &&
            !isType((editor as any) as SPEditor, node, ELEMENT_CODE_BLOCK) &&
            !isType((editor as any) as SPEditor, node, ELEMENT_CODE_LINE)
          ) {
            toggleList((editor as any) as SPEditor, {
              type: ELEMENT_OL,
            });
          }
        }
      },
    },
    {
      type: ELEMENT_TODO_LI,
      markup: ['[]'],
    },
    {
      type: ELEMENT_BLOCKQUOTE,
      markup: ['>'],
      preFormat,
    },
    {
      type: MARK_BOLD,
      between: ['**', '**'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_BOLD,
      between: ['__', '__'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_ITALIC,
      between: ['*', '*'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_ITALIC,
      between: ['_', '_'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_CODE,
      between: ['`', '`'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: MARK_STRIKETHROUGH,
      between: ['~~', '~~'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: ELEMENT_CODE_BLOCK,
      markup: '``',
      trigger: '`',
      triggerAtBlockStart: false,
      preFormat,
      format: (editor) => {
        insertEmptyCodeBlock(editor as SPEditor, {
          defaultType: getSlatePluginType(editor as SPEditor, ELEMENT_DEFAULT),
          insertNodesOptions: { select: true },
        });
      },
    },
  ],
};
