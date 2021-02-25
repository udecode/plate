import { Editor } from 'slate';
import { options } from '../../../../stories/config/initialValues';
import { insertCodeBlock } from '../elements/code-block';
import { toggleList } from '../elements/list/transforms/toggleList';
import { unwrapList } from '../elements/list/transforms/unwrapList';
import { AutoformatRule } from '../handlers/autoformat/types';
import { MARK_BOLD } from '../marks/bold/defaults';
import { MARK_CODE } from '../marks/code/defaults';
import { MARK_ITALIC } from '../marks/italic/defaults';
import { MARK_STRIKETHROUGH } from '../marks/strikethrough/defaults';

const preFormat = (editor: Editor) => unwrapList(editor, options);

export const autoformatRulesFixtures: AutoformatRule[] = [
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
