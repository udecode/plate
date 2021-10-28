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
import { KEY_LIST_TYPE } from './defaults';
import { IndentListPluginOptions } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndentList = (
  options?: IndentListPluginOptions
): WithOverride<SPEditor> => (editor) => {
  const { normalizeNode } = editor;

  // TODO: extend plate-core to register options
  editor.options[KEY_LIST_TYPE] = defaults(options, {
    type: KEY_LIST_TYPE,
    types: [getPlatePluginType(editor, ELEMENT_DEFAULT)],

    // The following props will be used by the getOverrideProps
    cssPropName: 'display',
  } as IndentListPluginOptions);

  const { types, indentMax } = getPlatePluginOptions<IndentListPluginOptions>(
    editor,
    KEY_LIST_TYPE
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
