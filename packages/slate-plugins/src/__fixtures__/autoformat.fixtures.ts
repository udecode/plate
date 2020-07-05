import { Editor } from 'slate';
import { toggleList } from '../elements/list/transforms/toggleList';
import { unwrapList } from '../elements/list/transforms/unwrapList';
import { AutoformatRule } from '../handlers/autoformat/types';
import { MARK_BOLD } from '../marks/bold/types';
import { MARK_CODE } from '../marks/code/types';
import { MARK_ITALIC } from '../marks/italic/types';
import { MARK_STRIKETHROUGH } from '../marks/strikethrough/types';
import { nodeTypes } from './initialValues.fixtures';

const preFormat = (editor: Editor) => unwrapList(editor, nodeTypes);

export const autoformatRulesFixtures: AutoformatRule[] = [
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
