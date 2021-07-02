 import * as React from 'react';
import {
  getAbove,
  isCollapsed,
  someNode,
  unwrapNodes,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/slate-plugins-core';
import {
  ELEMENT_LINK,
  upsertLinkAtSelection,
} from '@udecode/slate-plugins-link';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@udecode/slate-plugins-toolbar';

export interface ToolbarLinkProps extends ToolbarButtonProps {
  /**
   * Default onMouseDown is getting the link url by calling this promise before inserting the image.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}

function doSomethingWhichNeedsPrompt(fnContinue)
{
   var a = "stuff";
   var o = {}
   //other code
   displayPrompt("PleaseInputStuff",o, fnCallback)
   function fnCallback() {
       //continue to use data on o and the variable a after prompt dismissed.
       if (fnContinue) fnContinue();
  }
}

const getLinkFromPrompt = async () => {
  
  return 'https://google.com'
}

export const ToolbarLink = ({ getLinkUrl, ...props }: ToolbarLinkProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  const type = getSlatePluginType(editor, ELEMENT_LINK);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <ToolbarButton
      active={isLink}
      onMouseDown={async (event) => {
        if (!editor) return;

        event.preventDefault();
        let prevUrl = '';

        const linkNode = getAbove(editor, {
          match: { type },
        });
        if (linkNode) {
          prevUrl = linkNode[0].url as string;
        }

        let url;
        if (getLinkUrl) {
          url = await getLinkUrl(prevUrl);
        } else {
          url = await getLinkFromPrompt();
        }

        if (!url) {
          linkNode &&
            editor.selection &&
            unwrapNodes(editor, {
              at: editor.selection,
              match: { type: getSlatePluginType(editor, ELEMENT_LINK) },
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
