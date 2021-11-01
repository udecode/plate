import * as React from 'react';
import { useCallback } from 'react';
import { isCollapsed, someNode } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate-core';
import {
  KEY_LINE_HEIGHT,
  LineHeightPluginOptions,
  setLineHeight,
} from '@udecode/plate-line-height';
import {
  ToolbarButton,
  ToolbarButtonProps,
  ToolbarDropdown,
} from '@udecode/plate-toolbar';
import { ReactEditor } from 'slate-react';

export const ToolbarLineHeight = (props: ToolbarButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const { lineHeights } = getPlatePluginOptions<
    Required<LineHeightPluginOptions>
  >(editor, KEY_LINE_HEIGHT);

  const onToggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const selectHandler = useCallback(
    (lineHeight) => {
      if (editor) {
        ReactEditor.focus(editor);
        setLineHeight(editor, {
          lineHeight,
        });
      }
    },
    [editor]
  );

  return (
    <ToolbarDropdown
      control={
        <ToolbarButton
          active={
            isCollapsed(editor?.selection) &&
            someNode(editor!, { match: (n) => n.lineHeight !== undefined })
          }
          {...props}
        />
      }
      open={open}
      onOpen={onToggle}
      onClose={onToggle}
    >
      {lineHeights &&
        lineHeights.map((lineHeight: number) => (
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
};
