import {
  AutoformatRule,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
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
    markup: ['*', '-', '+'],
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
    type: options.blockquote.type,
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
    trigger: '`',
    type: options.code_block.type,
    markup: '``',
    mode: 'inline-block',
    preFormat: (editor) => unwrapList(editor, options),
  },
];
