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
import { nodeTypes } from './initialValues';

const preFormat = (editor: Editor) => unwrapList(editor, nodeTypes);

export const autoformatRules: AutoformatRule[] = [
  {
    type: nodeTypes.typeH1,
    markup: '#',
    preFormat,
  },
  {
    type: nodeTypes.typeH2,
    markup: '##',
    preFormat,
  },
  {
    type: nodeTypes.typeH3,
    markup: '###',
    preFormat,
  },
  {
    type: nodeTypes.typeH4,
    markup: '####',
    preFormat,
  },
  {
    type: nodeTypes.typeH5,
    markup: '#####',
    preFormat,
  },
  {
    type: nodeTypes.typeH6,
    markup: '######',
    preFormat,
  },
  {
    type: nodeTypes.typeLi,
    markup: ['*', '-', '+'],
    preFormat,
    format: (editor) => {
      toggleList(editor, { ...nodeTypes, typeList: nodeTypes.typeUl });
    },
  },
  {
    type: nodeTypes.typeLi,
    markup: ['1.', '1)'],
    preFormat,
    format: (editor) => {
      toggleList(editor, { ...nodeTypes, typeList: nodeTypes.typeOl });
    },
  },
  {
    type: nodeTypes.typeBlockquote,
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
    type: nodeTypes.typeCodeBlock,
    markup: '``',
    mode: 'inline-block',
    preFormat: (editor) => unwrapList(editor, nodeTypes),
  },
];
