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
import { preFormat } from './_utils';

export const basicElements: AutoformatRule[] = [
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
    type: ELEMENT_BLOCKQUOTE,
    markup: '>',
    preFormat,
  },
  // nested blockquote
  // {
  //  type: ELEMENT_BLOCKQUOTE,
  //  markup: '> >',
  //  preFormat,
  // },
  {
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
