import React from 'react';
import { TippyProps } from '@tippyjs/react';
import {
  getPluginType,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  WithPartial,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import {
  BalloonToolbar,
  BalloonToolbarProps,
} from '@/plate/toolbar/BalloonToolbar';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

export const markTooltip: TippyProps = {
  arrow: true,
  delay: 0,
  duration: [200, 0],
  hideOnClick: false,
  offset: [0, 17],
  placement: 'top',
};

export function MarkBalloonToolbar(
  props: WithPartial<BalloonToolbarProps, 'children'>
) {
  const { children, ...balloonToolbarProps } = props;

  const editor = useMyPlateEditorRef();

  const arrow = false;
  const theme = 'dark';

  const boldTooltip: TippyProps = { content: 'Bold (⌘+B)', ...markTooltip };
  const italicTooltip: TippyProps = { content: 'Italic (⌘+I)', ...markTooltip };
  const underlineTooltip: TippyProps = {
    content: 'Underline (⌘+U)',
    ...markTooltip,
  };

  return (
    <BalloonToolbar theme={theme} arrow={arrow} {...balloonToolbarProps}>
      <MarkToolbarButton
        type={getPluginType(editor, MARK_BOLD)}
        icon={<Icons.bold />}
        tooltip={boldTooltip}
        actionHandler="onMouseDown"
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_ITALIC)}
        icon={<Icons.italic />}
        tooltip={italicTooltip}
        actionHandler="onMouseDown"
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_UNDERLINE)}
        icon={<Icons.underline />}
        tooltip={underlineTooltip}
        actionHandler="onMouseDown"
      />
      {children}
    </BalloonToolbar>
  );
}
