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

  return (
    <BalloonToolbar {...balloonToolbarProps}>
      <MarkToolbarButton
        nodeType={getPluginType(editor, MARK_BOLD)}
        tooltip="Bold (⌘+B)"
      >
        <Icons.bold />
      </MarkToolbarButton>
      <MarkToolbarButton
        nodeType={getPluginType(editor, MARK_ITALIC)}
        tooltip="Italic (⌘+I)"
      >
        <Icons.italic />
      </MarkToolbarButton>
      <MarkToolbarButton
        nodeType={getPluginType(editor, MARK_UNDERLINE)}
        tooltip="Underline (⌘+U)"
      >
        <Icons.underline />
      </MarkToolbarButton>
      {children}
    </BalloonToolbar>
  );
}
