import {
  AutoformatRule,
  insertCodeBlock,
  toggleList,
  unwrapList,
} from '@udecode/slate-plugins';
import { Editor } from 'slate';
import { options } from './initialValues';

const preFormat = (editor: Editor) => unwrapList(editor, options);

export const autoformatRules: AutoformatRule[] = [
  {
    type: options.h1.type,
    markup: '#',
    preFormat,
  },
  {
    type: options.h2.type,
    markup: '##',
    preFormat,
  },
  {
    type: options.h3.type,
    markup: '###',
    preFormat,
  },
  {
    type: options.h4.type,
    markup: '####',
    preFormat,
  },
  {
    type: options.h5.type,
    markup: '#####',
    preFormat,
  },
  {
    type: options.h6.type,
    markup: '######',
    preFormat,
  },
  {
    type: options.li.type,
    markup: ['*', '-'],
    preFormat,
    format: (editor) => {
      toggleList(editor, { ...options, typeList: options.ul.type });
    },
  },
  {
    type: options.li.type,
    markup: ['1.', '1)'],
    preFormat,
    format: (editor) => {
      toggleList(editor, { ...options, typeList: options.ol.type });
    },
  },
  {
    type: options.todo_li.type,
    markup: ['[]'],
  },
  {
    type: options.blockquote.type,
    markup: ['>'],
    preFormat,
  },
  {
    type: options.bold.type,
    between: ['**', '**'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: options.bold.type,
    between: ['__', '__'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: options.italic.type,
    between: ['*', '*'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: options.italic.type,
    between: ['_', '_'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: options.code.type,
    between: ['`', '`'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: options.strikethrough.type,
    between: ['~~', '~~'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: options.code_block.type,
    markup: '``',
    trigger: '`',
    triggerAtBlockStart: false,
    preFormat,
    format: (editor) => {
      insertCodeBlock(editor, { select: true }, options);
    },
  },
];
