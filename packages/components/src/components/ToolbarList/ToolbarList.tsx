import * as React from 'react';
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  getPreventDefaultHandler,
  KEYS_LIST,
  toggleList,
  useEditorMultiOptions,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../ToolbarElement/ToolbarElement';

export const ToolbarList = ({
  typeList = ELEMENT_UL,
  ...props
}: ToolbarButtonProps) => {
  const options = useEditorMultiOptions([ELEMENT_PARAGRAPH, ...KEYS_LIST]);
  const editor = useSlate();

  return (
    <ToolbarElement
      type={typeList}
      onMouseDown={getPreventDefaultHandler(
        toggleList,
        editor,
        {
          typeList,
        },
        options
      )}
      {...props}
    />
  );
};
