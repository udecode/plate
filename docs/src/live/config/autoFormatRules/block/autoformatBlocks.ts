import {
  AutoformatRule,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_DEFAULT,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  insertEmptyCodeBlock,
  SPEditor,
} from '@udecode/plate';
import { getPlatePluginType } from '@udecode/plate-core';
import { preFormat } from '../autoformatUtils';

export const autoformatBlocks: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_H1,
    markup: '#',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H2,
    markup: '##',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    markup: '###',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H4,
    markup: '####',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H5,
    markup: '#####',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H6,
    markup: '######',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_BLOCKQUOTE,
    markup: '>',
    preFormat,
  },
  // nested blockquote
  // {
  //  mode: 'block',
  //  type: ELEMENT_BLOCKQUOTE,
  //  markup: '> >',
  //  preFormat,
  // },
  {
    mode: 'block',
    type: ELEMENT_CODE_BLOCK,
    markup: '``',
    trigger: '`',
    triggerAtBlockStart: false,
    preFormat,
    format: (editor) => {
      insertEmptyCodeBlock(editor as SPEditor, {
        defaultType: getPlatePluginType(editor as SPEditor, ELEMENT_DEFAULT),
        insertNodesOptions: { select: true },
      });
    },
  },
];
