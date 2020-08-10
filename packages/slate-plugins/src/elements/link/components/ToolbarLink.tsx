import * as React from 'react';
import { useSlate } from 'slate-react';
import { getAboveByType, isNodeTypeIn } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '../../../components/ToolbarButton';
import { DEFAULTS_LINK } from '../defaults';
import { upsertLinkAtSelection } from '../transforms';
import { LinkOptions } from '../types';

export const ToolbarLink = ({
  link,
  ...props
}: ToolbarButtonProps & LinkOptions) => {
  const options = setDefaults({ link }, DEFAULTS_LINK);
  const editor = useSlate();
  const isLink = isNodeTypeIn(editor, options.link.type);
  return (
    <ToolbarButton
      active={isLink}
      onMouseDown={(event) => {
        event.preventDefault();
        let prevUrl = '';
        const linkNode = getAboveByType(editor, options.link.type);
        if (linkNode) {
          prevUrl = linkNode[0].url as string;
        }
        const url = window.prompt(`Enter the URL of the link:`, prevUrl);
        if (!url) return;
        upsertLinkAtSelection(editor, url, options);
      }}
      {...props}
    />
  );
};
