import * as React from 'react';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { BalloonToolbarProps } from './BalloonToolbar.types';
import { usePopupPosition } from './useBalloonPosition';

export const BalloonToolbarPosition = (props: BalloonToolbarProps) => {
  const { children } = props;

  const ref = React.useRef<HTMLDivElement>(null);
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const [popperStyles, attributes, hidden] = usePopupPosition({
    editor,
    popupElem: ref.current,
  }) as any;

  return (
    <div
      ref={ref}
      style={{
        ...popperStyles.popper,
        visibility: hidden ? 'hidden' : 'visible',
        opacity: hidden ? 0 : 1,
        minHeight: hidden ? 0 : undefined,
        transition: 'opacity 0.2s, height 0.2s',
      }}
      {...attributes.popper}
    >
      {children}
    </div>
  );
};
