import {
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
import { AutoformatRule } from '../../packages/autoformat/src/types';
import { options } from './pluginOptions';

const preFormat: AutoformatRule['preFormat'] = (editor) =>
  unwrapList(editor as SPEditor);

export const optionsAutoformat: WithAutoformatOptions = {
  rules: [
    {
      type: options[ELEMENT_H1].type,
      markup: '#',
      preFormat,
    },
    {
      type: options[ELEMENT_H2].type,
      markup: '##',
      preFormat,
    },
    {
      type: options[ELEMENT_H3].type,
      markup: '###',
      preFormat,
    },
    {
      type: options[ELEMENT_H4].type,
      markup: '####',
      preFormat,
    },
    {
      type: options[ELEMENT_H5].type,
      markup: '#####',
      preFormat,
    },
    {
      type: options[ELEMENT_H6].type,
      markup: '######',
      preFormat,
    },
    {
      type: options[ELEMENT_LI].type,
      markup: ['*', '-'],
      preFormat,
      format: (editor) => {
        if (editor.selection) {
          const [node] = getParent(editor, editor.selection);
          if (
            !isType(editor, node, ELEMENT_CODE_BLOCK) &&
            !isType(editor, node, ELEMENT_CODE_LINE)
          ) {
            toggleList(editor as SPEditor, { type: options[ELEMENT_UL].type });
          }
        }
      },
    },
    {
      type: options[ELEMENT_LI].type,
      markup: ['1.', '1)'],
      preFormat,
      format: (editor) => {
        if (editor.selection) {
          const [node] = getParent(editor, editor.selection);
          if (
            !isType(editor, node, ELEMENT_CODE_BLOCK) &&
            !isType(editor, node, ELEMENT_CODE_LINE)
          ) {
            toggleList(editor as SPEditor, { type: options[ELEMENT_OL].type });
          }
        }
      },
    },
    {
      type: options[ELEMENT_TODO_LI].type,
      markup: ['[]'],
    },
    {
      type: options[ELEMENT_BLOCKQUOTE].type,
      markup: ['>'],
      preFormat,
    },
    {
      type: options[MARK_BOLD].type,
      between: ['**', '**'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: options[MARK_BOLD].type,
      between: ['__', '__'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: options[MARK_ITALIC].type,
      between: ['*', '*'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: options[MARK_ITALIC].type,
      between: ['_', '_'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: options[MARK_CODE].type,
      between: ['`', '`'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: options[MARK_STRIKETHROUGH].type,
      between: ['~~', '~~'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: options[ELEMENT_CODE_BLOCK].type,
      markup: '``',
      trigger: '`',
      triggerAtBlockStart: false,
      preFormat,
      format: (editor) => {
        insertEmptyCodeBlock(editor as SPEditor, {
          defaultType: ELEMENT_DEFAULT,
          insertNodesOptions: { select: true },
        });
      },
    },
  ],
};
