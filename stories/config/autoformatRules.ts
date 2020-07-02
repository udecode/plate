import {
  AutoformatRule,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  toggleList,
  unwrapList,
} from '@udecode/slate-plugins';
import { nodeTypes } from './initialValues';

export const autoformatRules: AutoformatRule[] = [
  {
    preFormat: (editor) => unwrapList(editor, nodeTypes),
    markupRules: [
      {
        type: nodeTypes.typeH1,
        markup: '#',
      },
      {
        type: nodeTypes.typeH2,
        markup: '##',
      },
      {
        type: nodeTypes.typeH3,
        markup: '###',
      },
      {
        type: nodeTypes.typeH4,
        markup: '####',
      },
      {
        type: nodeTypes.typeH5,
        markup: '#####',
      },
      {
        type: nodeTypes.typeH6,
        markup: '######',
      },
      {
        type: nodeTypes.typeLi,
        markup: ['*', '-', '+'],
        format: (editor) => {
          toggleList(editor, { ...nodeTypes, typeList: nodeTypes.typeUl });
        },
      },
      {
        type: nodeTypes.typeLi,
        markup: ['1.', '1)'],
        format: (editor) => {
          toggleList(editor, { ...nodeTypes, typeList: nodeTypes.typeOl });
        },
      },
      {
        type: nodeTypes.typeBlockquote,
        markup: ['>'],
      },
    ],
  },
  {
    trigger: '*',
    markupRules: [
      {
        type: MARK_ITALIC,
        markup: '*',
        inline: true,
      },
    ],
  },
  {
    trigger: '`',
    markupRules: [
      {
        type: MARK_CODE,
        markup: '`',
        inline: true,
      },
    ],
  },
  {
    trigger: '~',
    markupRules: [
      {
        type: MARK_STRIKETHROUGH,
        markup: '~',
        inline: true,
      },
    ],
  },
  {
    preFormat: (editor) => unwrapList(editor, nodeTypes),
    trigger: '`',
    markupRules: [
      {
        type: nodeTypes.typeCodeBlock,
        markup: '``',
        insert: true,
      },
    ],
  },
];
