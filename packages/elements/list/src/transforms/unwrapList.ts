import {
  ELEMENT_DEFAULT,
  setNodes,
  unwrapNodes,
} from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Path } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const unwrapList = (editor: SPEditor, { at }: { at?: Path } = {}) => {
  unwrapNodes(editor, {
    at,
    match: { type: getSlatePluginType(editor, ELEMENT_LI) },
  });
  unwrapNodes(editor, {
    at,
    match: {
      type: [
        getSlatePluginType(editor, ELEMENT_UL),
        getSlatePluginType(editor, ELEMENT_OL),
      ],
    },
    split: true,
  });
  setNodes(editor, {
    at,
    type: getSlatePluginType(editor, ELEMENT_DEFAULT),
  });
};
