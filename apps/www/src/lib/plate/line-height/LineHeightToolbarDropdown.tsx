import React, { useCallback } from 'react';
import {
  focusEditor,
  getPluginInjectProps,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { KEY_LINE_HEIGHT, setLineHeight } from '@udecode/plate-line-height';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { ToolbarDropdown } from '@/plate/toolbar/ToolbarDropdown';

export function LineHeightToolbarDropdown({
  id,
  ...props
}: ToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));

  const [open, setOpen] = React.useState(false);

  const { validNodeValues } = getPluginInjectProps(editor, KEY_LINE_HEIGHT);

  const onToggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const selectHandler = useCallback(
    (lineHeight) => {
      if (editor) {
        focusEditor(editor);

        setLineHeight(editor, {
          value: lineHeight,
        });
      }
    },
    [editor]
  );

  return (
    <ToolbarDropdown
      control={<ToolbarButton pressed={open} {...props} />}
      open={open}
      onOpen={onToggle}
      onClose={onToggle}
    >
      {validNodeValues &&
        validNodeValues.map((lineHeight) => (
          <div
            style={{ cursor: 'pointer' }}
            key={lineHeight}
            onClick={() => selectHandler(lineHeight)}
          >
            {lineHeight}
          </div>
        ))}
    </ToolbarDropdown>
  );
}
