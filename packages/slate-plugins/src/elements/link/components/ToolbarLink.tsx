import * as React from 'react';
import {
  getAbove,
  isCollapsed,
  setDefaults,
  someNode,
  unwrapNodes,
} from '@udecode/slate-plugins-common';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../../../components/ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import { DEFAULTS_LINK } from '../defaults';
import { upsertLinkAtSelection } from '../transforms/upsertLinkAtSelection';
import { LinkOptions } from '../types';

export const ToolbarLink = ({
  link,
  ...props
}: ToolbarButtonProps & LinkOptions) => {
  const options = setDefaults({ link }, DEFAULTS_LINK);
  const editor = useSlate();
  const isLink = someNode(editor, { match: { type: options.link.type } });

  return (
    <ToolbarButton
      active={isLink}
      onMouseDown={(event) => {
        event.preventDefault();
        let prevUrl = '';

        const linkNode = getAbove(editor, {
          match: { type: options.link.type },
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
              match: { type: options.link.type },
            });

          return;
        }

        // If our cursor is in middle of a link, then we don't want to inser it inline
        const shouldWrap: boolean =
          linkNode !== undefined && isCollapsed(editor.selection);
        upsertLinkAtSelection(editor, url, { wrap: shouldWrap, ...options });
      }}
      {...props}
    />
  );
};
