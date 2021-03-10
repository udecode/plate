import * as React from 'react';
import {
  ELEMENT_LINK,
  getAbove,
  isCollapsed,
  someNode,
  unwrapNodes,
  upsertLinkAtSelection,
  useEditorOptions,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export const ToolbarLink = (props: ToolbarButtonProps) => {
  const link = useEditorOptions(ELEMENT_LINK);
  const editor = useSlate();
  const isLink = someNode(editor, { match: { type: link.type } });

  return (
    <ToolbarButton
      active={isLink}
      onMouseDown={(event) => {
        event.preventDefault();
        let prevUrl = '';

        const linkNode = getAbove(editor, {
          match: { type: link.type },
        });
        if (linkNode) {
          prevUrl = linkNode[0].url as string;
        }
        const url = window.prompt(`Enter the URL of the link:`, prevUrl);
        if (!url) {
          linkNode &&
            editor.selection &&
            unwrapNodes(editor, {
              at: editor.selection,
              match: { type: link.type },
            });

          return;
        }

        // If our cursor is in middle of a link, then we don't want to inser it inline
        const shouldWrap: boolean =
          linkNode !== undefined && isCollapsed(editor.selection);
        upsertLinkAtSelection(editor, { url, wrap: shouldWrap }, { link });
      }}
      {...props}
    />
  );
};
