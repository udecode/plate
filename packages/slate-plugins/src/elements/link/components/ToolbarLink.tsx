import * as React from 'react';
import { useSlate } from 'slate-react';
import { isNodeTypeIn } from '../../../common/queries';
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

  return (
    <ToolbarButton
      active={isNodeTypeIn(editor, options.link.type)}
      onMouseDown={(event) => {
        event.preventDefault();

        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        upsertLinkAtSelection(editor, url, options);
      }}
      {...props}
    />
  );
};
