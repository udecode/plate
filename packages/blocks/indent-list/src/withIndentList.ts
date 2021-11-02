import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  WithOverride,
} from '@udecode/plate-core';
import { defaults } from 'lodash';
import { KEY_LIST_STYLE_TYPE } from './defaults';
import { IndentListPluginOptions } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndentList = (
  options?: IndentListPluginOptions
): WithOverride<SPEditor> => (editor) => {
  // TODO: extend plate-core to register options
  editor.options[KEY_LIST_STYLE_TYPE] = defaults(options, {
    nodeKey: KEY_LIST_STYLE_TYPE,
    validTypes: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
    transformStyle: (e, { style, nodeValue }) => ({
      ...style,
      display: 'list-item',
      listStyleType: nodeValue,
    }),
  } as IndentListPluginOptions);

  return editor;
};
