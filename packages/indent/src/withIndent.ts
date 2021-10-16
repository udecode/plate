import { ELEMENT_DEFAULT, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  getPlatePluginType,
  SPEditor,
  TElement,
  WithOverride,
} from '@udecode/plate-core';
import { defaults } from 'lodash';
import { Transforms } from 'slate';
import { KEY_INDENT } from './defaults';
import { IndentPluginOptions } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent = (
  options?: IndentPluginOptions
): WithOverride<SPEditor> => (editor) => {
  const { normalizeNode } = editor;

  // TODO: extend plate-core to register options
  editor.options[KEY_INDENT] = defaults(options, {
    type: KEY_INDENT,
    types: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
    offset: 24,
    unit: 'px',
  });

  const { types, indentMax } = getPlatePluginOptions<IndentPluginOptions>(
    editor,
    KEY_INDENT
  );

  editor.normalizeNode = ([node, path]) => {
    const element = node as TElement;
    const { type } = element;

    if (type) {
      if (types!.includes(type)) {
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
