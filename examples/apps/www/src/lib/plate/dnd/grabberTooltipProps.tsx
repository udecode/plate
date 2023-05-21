import React from 'react';
import { TippyProps } from '@tippyjs/react';

function GrabberTooltipContent() {
  return (
    <div style={{ fontSize: 12 }}>
      <div>
        Drag <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>to move</span>
      </div>
    </div>
  );
}

export const grabberTooltipProps: TippyProps = {
  content: <GrabberTooltipContent />,
  placement: 'bottom',
  arrow: false,
  offset: [0, 0],
  delay: [300, 0],
  duration: [0, 0],
  hideOnClick: true,
  theme: 'small',
};
