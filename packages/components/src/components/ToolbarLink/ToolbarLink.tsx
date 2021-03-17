import * as React from 'react';
import {
  ELEMENT_LINK,
  getAbove,
  getPluginType,
  isCollapsed,
  someNode,
  unwrapNodes,
  upsertLinkAtSelection,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export const ToolbarLink = (props: ToolbarButtonProps) => {
  const editor = useSlate();
  const type = getPluginType(editor, ELEMENT_LINK);
  const isLink = someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      active={isLink}
      onMouseDown={(event) => {
        event.preventDefault();
        let prevUrl = '';

        const linkNode = getAbove(editor, {
          match: { type },
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
              match: { type: getPluginType(editor, ELEMENT_LINK) },
            });

          return;
        }

        // If our cursor is in middle of a link, then we don't want to inser it inline
        const shouldWrap: boolean =
          linkNode !== undefined && isCollapsed(editor.selection);
        upsertLinkAtSelection(editor, { url, wrap: shouldWrap });
      }}
      {...props}
    />
  );
};
