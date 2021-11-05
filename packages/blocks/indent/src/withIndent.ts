import { ELEMENT_DEFAULT, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  getPlatePluginType,
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
export const withIndent = (options?: IndentPluginOptions): WithOverride => (
  editor
) => {
  const { normalizeNode } = editor;

  // TODO: extend plate-core to register options
  editor.options[KEY_INDENT] = defaults(options, {
    nodeKey: KEY_INDENT,
    validTypes: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
    offset: 24,
    unit: 'px',
    styleKey: 'marginLeft',
    transformNodeValue: (e, { nodeValue }) => {
      const { offset, unit } = getPlatePluginOptions<
        Required<IndentPluginOptions>
      >(e, KEY_INDENT);

      return nodeValue * offset + unit;
    },
  } as IndentPluginOptions);

  const { validTypes, indentMax } = getPlatePluginOptions<IndentPluginOptions>(
    editor,
    KEY_INDENT
  );

  editor.normalizeNode = ([node, path]) => {
    const element = node as TElement;
    const { type } = element;

    if (type) {
      if (validTypes!.includes(type)) {
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
