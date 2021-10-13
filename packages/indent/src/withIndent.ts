import { ELEMENT_DEFAULT, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  TElement,
  WithOverride,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { WithIndentOptions } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent = ({
  indentMax,
  types: _types,
}: WithIndentOptions = {}): WithOverride<SPEditor> => (editor) => {
  const { normalizeNode } = editor;

  const types = _types ?? getPlatePluginType(editor as any, ELEMENT_DEFAULT);

  editor.normalizeNode = ([node, path]) => {
    const element = node as TElement;
    const { type } = element;

    if (type) {
      if (types.includes(type)) {
        if (indentMax && element.indent && element.indent > indentMax) {
          setNodes(editor, { indent: indentMax }, { at: path });
          return;
        }
      } else if (element.indent) {
        Transforms.unsetNodes(editor, 'indent', { at: path });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};
