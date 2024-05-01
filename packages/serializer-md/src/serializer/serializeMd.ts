import {
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-common/server';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { serialize } from './serialize';
import { getRemarkNodeTypesMap } from './types';

const isEditorValueEmpty = <V extends Value>(
  editor: PlateEditor<V>,
  value: Value
) => {
  return (
    !value ||
    value.length === 0 ||
    (value.length === 1 &&
      value[0].type === getPluginType(editor, ELEMENT_PARAGRAPH) &&
      value[0].children[0].text === '')
  );
};

export const serializeMd = <V extends Value>(
  editor: PlateEditor<V>,
  {
    nodes,
  }: {
    /**
     * Slate nodes to convert to HTML.
     */
    nodes: Value;
  }
) => {
  if (isEditorValueEmpty(editor, nodes)) {
    return '';
  }

  return nodes
    ?.map((v) =>
      serialize(editor, v, { nodeTypes: getRemarkNodeTypesMap(editor) })
    )
    .join('');
};
