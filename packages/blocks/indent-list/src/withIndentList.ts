import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  WithOverride,
} from '@udecode/plate-core';
import { defaults } from 'lodash';
import { KEY_LIST_TYPE } from './defaults';
import { IndentListPluginOptions } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndentList = (
  options?: IndentListPluginOptions
): WithOverride<SPEditor> => (editor) => {
  // TODO: extend plate-core to register options
  editor.options[KEY_LIST_TYPE] = defaults(options, {
    nodeKey: KEY_LIST_TYPE,
    validTypes: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
    styleKey: 'display',
  } as IndentListPluginOptions);

  return editor;
};
