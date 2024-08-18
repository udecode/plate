import { createPrimitiveComponent } from '@udecode/plate-common/react';

export interface BlockStartAreaState {
  placement?: 'bottom' | 'left' | 'right' | 'top';
  size?: number | string;
}

export const useBlockStartArea = ({
  placement = 'left',
  size = 'auto',
}: BlockStartAreaState) => {
  return {
    props: {
      className: `slate-start-area slate-start-area-${placement}`,
      onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
      },
      style: {
        bottom: ['bottom'].includes(placement) ? 0 : undefined,
        cursor: 'text',
        height: ['bottom', 'top'].includes(placement) ? size : '100%',
        left: ['bottom', 'left', 'top'].includes(placement) ? 0 : undefined,
        position: 'absolute',
        right: ['right'].includes(placement) ? 0 : undefined,
        top: ['left', 'right', 'top'].includes(placement) ? 0 : undefined,
        userSelect: 'none',
        width: ['left', 'right'].includes(placement) ? size : '100%',
        zIndex: 1,
      },
    },
  };
};

export const BlockStartArea = createPrimitiveComponent('div')({
  propsHook: useBlockStartArea,
});
